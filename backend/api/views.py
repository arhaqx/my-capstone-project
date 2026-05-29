from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import History

import requests
import json

# =========================
# TRANSLATE FUNCTION
# =========================

def translate_text(text):
    try:
        res = requests.post(
            "https://libretranslate.de/translate",
            data={
                "q": text,
                "source": "en",
                "target": "id",
                "format": "text"
            },
            timeout=5
        )

        return res.json().get("translatedText", text)

    except:
        return text


# =========================
# OPENROUTER API
# =========================

import google.generativeai as genai

def predict_multiple(answers):
    system_prompt = """You are a mental health analysis assistant. You will be given a list of answers. Each answer has a 'score' (0-3) and a 'text' (user's input).
You must analyze the inputs and return a strictly formatted JSON object with the following structure, without any markdown formatting or extra text:
{
    "total_score": int,
    "average_score": float,
    "category": string (one of "Minimal", "Mild", "Moderate", "Severe"),
    "interpretation": string,
    "details": [
        {
            "question_index": int,
            "score": int,
            "text": string,
            "nlp": {
                "phq_score": int (0-3),
                "probabilities": { "negative": float, "neutral": float, "positive": float }
            }
        }
    ]
}

Rules for scoring:
1. sum the 'score' of all answers to get `total_score`.
2. `average_score` is `total_score` / number of answers.
3. `category` is determined by `total_score`: <= 4 is "Minimal", <= 9 is "Mild", <= 14 is "Moderate", > 14 is "Severe".
4. `interpretation`: "Minimal": "Kondisi mental dalam batas normal.", "Mild": "Terdapat gejala ringan, disarankan menjaga pola hidup sehat.", "Moderate": "Perlu perhatian lebih terhadap kesehatan mental.", "Severe": "Segera cari bantuan profesional."
5. For each answer, fill the `details` array. Synthesize an `nlp` analysis where you estimate sentiment probabilities (sum to 1.0) and a `phq_score` (0-3) based on the text provided.
"""


    try:
        if not settings.OPENROUTER_API_KEY:
            raise Exception("OPENROUTER_API_KEY is not set in settings")
        # Prepare OpenRouter request
        openrouter_url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "anthropic/claude-3-haiku",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(answers)}
            ]
        }
        response = requests.post(openrouter_url, headers=headers, json=payload, timeout=20)
        response.raise_for_status()
        result_json = response.json()
        # Extract content
        content = result_json["choices"][0]["message"]["content"]
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            # clean possible markdown fences
            content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
    except Exception as e:
        error_details = str(e)
        return {
            "total_score": 0,
            "category": "Error",
            "details": [],
            "error": error_details
        }


# =========================
# HOME
# =========================

class HomeView(APIView):

    def get(self, request):
        return Response({
            "message": "Welcome to Mental Health API"
        })


# =========================
# PREDICT
# =========================

class PredictMultiView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            answers = request.data.get("answers")

            if not answers or not isinstance(answers, list):
                return Response(
                    {"error": "answers harus berupa list"},
                    status=400
                )

            # PREDICT VIA HF API / GEMINI
            result = predict_multiple(answers)

            if result.get("category") == "Error":
                return Response(
                    {"error": result.get("error", "Gagal memproses dengan AI")},
                    status=500
                )

            # SAVE HISTORY
            History.objects.create(
                user=request.user,
                answers=answers,
                total_score=result.get("total_score"),
                category=result.get("category"),
                result_detail=result.get("details")
            )

            return Response(result)
        except Exception as e:
            return Response({"error": f"Internal Server Error: {str(e)}"}, status=500)


# =========================
# HISTORY
# =========================

class HistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, id=None):

        data = History.objects.filter(
            user=request.user
        ).order_by('-created_at')

        result = []

        for item in data:

            result.append({
                "id": item.id,
                "answers": item.answers,
                "score": item.total_score,
                "category": item.category,
                "created_at": item.created_at
            })

        return Response(result)

    def delete(self, request, id=None):
        if id:
            History.objects.filter(id=id, user=request.user).delete()
            return Response({"message": "Riwayat berhasil dihapus"})
        return Response({"error": "ID tidak valid"}, status=400)


# =========================
# NEWS
# =========================

class NewsView(APIView):

    def get_fallback_articles(self, category):
        fallbacks = {
            "minimal": [
                {
                    "title": "10 Kebiasaan Sehari-hari untuk Kesehatan Mental yang Lebih Baik",
                    "description": "Temukan kebiasaan sehari-hari sederhana yang dapat secara signifikan meningkatkan suasana hati dan kesejahteraan mental Anda.",
                    "url": "https://www.mentalhealth.org.uk/explore-mental-health/publications/our-best-mental-health-tips",
                    "image": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=600&auto=format&fit=crop"
                },
                {
                    "title": "Kekuatan Mindfulness dalam Aktivitas Sehari-hari",
                    "description": "Pelajari bagaimana melatih mindfulness dapat membantu Anda tetap tenang dan mengurangi stres.",
                    "url": "https://www.mindful.org/meditation/mindfulness-getting-started/",
                    "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop"
                }
            ],
            "mild": [
                {
                    "title": "Cara Efektif Mengelola Stres dan Kecemasan Ringan",
                    "description": "Teknik-teknik efektif untuk mengatasi stres dan kecemasan ringan dalam kehidupan sehari-hari.",
                    "url": "https://www.apa.org/topics/stress/tips",
                    "image": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=600&auto=format&fit=crop"
                },
                {
                    "title": "Teknik Relaksasi Sederhana untuk Pereda Stres",
                    "description": "Jelajahi berbagai metode relaksasi termasuk pernapasan dalam dan relaksasi otot progresif.",
                    "url": "https://www.helpguide.org/articles/stress/relaxation-techniques-for-stress-relief.htm",
                    "image": "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600&auto=format&fit=crop"
                }
            ],
            "moderate": [
                {
                    "title": "Strategi Bertahan Menghadapi Gejala Depresi Menengah",
                    "description": "Mekanisme koping yang praktis untuk menghadapi kecemasan sedang dan gejala depresi.",
                    "url": "https://adaa.org/tips",
                    "image": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=600&auto=format&fit=crop"
                },
                {
                    "title": "Kapan Waktu yang Tepat untuk Mencari Bantuan Profesional?",
                    "description": "Memahami tanda-tanda yang mengindikasikan bahwa sudah saatnya untuk menghubungi profesional.",
                    "url": "https://www.nami.org/About-Mental-Illness/Warning-Signs-and-Symptoms",
                    "image": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600&auto=format&fit=crop"
                }
            ],
            "severe": [
                {
                    "title": "Bantuan Segera untuk Krisis Kesehatan Mental",
                    "description": "Sumber daya dan langkah-langkah yang harus diambil jika Anda mengalami keadaan darurat kesehatan mental.",
                    "url": "https://www.samhsa.gov/find-help/national-helpline",
                    "image": "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?q=80&w=600&auto=format&fit=crop"
                },
                {
                    "title": "Memahami dan Mengatasi Depresi Berat",
                    "description": "Panduan komprehensif untuk memahami depresi berat dan menemukan jalur perawatan yang tepat.",
                    "url": "https://www.psychiatry.org/patients-families/depression/what-is-depression",
                    "image": "https://images.unsplash.com/photo-1493836512294-502baa1986e2?q=80&w=600&auto=format&fit=crop"
                }
            ]
        }
        return fallbacks.get(category, fallbacks["minimal"])

    def get(self, request):

        category = request.GET.get(
            "category",
            ""
        ).lower()

        # CATEGORY MAPPING
        if category == "minimal":
            query = "mental wellness tips OR self care habits"
        elif category == "mild":
            query = "stress management tips OR relaxation techniques"
        elif category == "moderate":
            query = "anxiety coping strategies OR mental health help"
        elif category == "severe":
            query = "depression help therapy support mental health recovery"
        else:
            query = "mental health tips"

        url = "https://newsapi.org/v2/everything"
        params = {
            "q": query,
            "language": "en",
            "sortBy": "relevancy",
            "pageSize": 15,
            "apiKey": settings.NEWS_API_KEY
        }

        try:
            if not settings.NEWS_API_KEY:
                raise Exception("Missing API Key")
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            if data.get("status") == "error":
                raise Exception("NewsAPI Error")
        except:
            return Response({"articles": self.get_fallback_articles(category)})

        raw_articles = data.get("articles", [])
        
        # 1. RULE-BASED FILTERING
        filtered_articles = []
        for article in raw_articles:
            title = article.get("title")
            desc = article.get("description")
            url_link = article.get("url")
            
            if not title or not desc or not url_link:
                continue
                
            if title == "[Removed]" or desc == "[Removed]":
                continue
                
            if len(desc) < 30:
                continue
                
            # Filter out negative keywords just in case
            content = (title + " " + desc).lower()
            if any(bad in content for bad in ["trump", "court", "law", "government", "celebrity"]):
                continue
                
            filtered_articles.append(article)
            
        if not filtered_articles:
            return Response({"articles": self.get_fallback_articles(category)})

        # Limit to top 10 for LLM processing to save cost and time
        articles_to_evaluate = filtered_articles[:10]
        
        # 2. LLM SEMANTIC FILTERING
        llm_prompt = ""
        for idx, article in enumerate(articles_to_evaluate):
            llm_prompt += f"ID: {idx}\nTitle: {article.get('title')}\nDescription: {article.get('description')}\n\n"

        system_prompt = (
            "You are a mental health news curator for a university student self-check app. "
            "Evaluate the semantic relevance of the following articles. "
            "Select ONLY the articles that are genuinely relevant, supportive, and safe for mental health. "
            "Reject clickbait, celebrity gossip, or overly generic news. "
            "Return ONLY a JSON array of the IDs of the relevant articles, e.g., [0, 2, 3]. "
            "If none are relevant, return []."
        )

        openrouter_key = getattr(settings, "OPENROUTER_API_KEY", None)
        
        headers = {
            "Authorization": f"Bearer {openrouter_key}",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Mental Health App",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "anthropic/claude-3-haiku",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": llm_prompt}
            ]
        }
        
        selected_indices = []
        
        try:
            llm_res = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=20)
            if llm_res.status_code == 200:
                llm_data = llm_res.json()
                llm_text = llm_data["choices"][0]["message"]["content"]
                
                # Extract JSON array from text
                import re
                match = re.search(r'\[.*?\]', llm_text, re.DOTALL)
                if match:
                    selected_indices = json.loads(match.group())
        except Exception as e:
            print("LLM Filtering Error:", e)
            pass

        # 3. APPLY SELECTION & FALLBACK
        final_articles = []
        if isinstance(selected_indices, list) and len(selected_indices) > 0:
            for idx in selected_indices:
                if isinstance(idx, int) and 0 <= idx < len(articles_to_evaluate):
                    final_articles.append(articles_to_evaluate[idx])
        else:
            # Fallback to top 5 if LLM fails or returns empty
            final_articles = articles_to_evaluate[:5]
            
        # Limit to 5 max
        final_articles = final_articles[:5]

        # TRANSLATE
        result_articles = []
        for article in final_articles:
            title_id = translate_text(article.get("title") or "")
            desc_id = translate_text(article.get("description") or "")
            
            result_articles.append({
                "title": title_id,
                "description": desc_id,
                "url": article.get("url"),
                "image": article.get("urlToImage")
            })

        return Response({
            "articles": result_articles
        })


# =========================
# CHATBOT / AI COMPANION
# =========================

class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        messages = request.data.get("messages", [])
        
        if not messages or not isinstance(messages, list):
            return Response({"error": "Format pesan tidak valid"}, status=400)

        try:
            if not settings.GEMINI_API_KEY:
                raise Exception("GEMINI_API_KEY is not set in settings")

            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            language = request.data.get("language", "id")
            communication_style = "Indonesian" if language == "id" else "English"
            
            system_prompt = f"""You are 'HealSpace AI', an empathetic, non-judgmental mental health companion and virtual listener. 
Your goal is to provide emotional support, listen actively, and use light Cognitive Behavioral Therapy (CBT) techniques.
You communicate in friendly, comforting {communication_style}.
CRITICAL RULE: If the user indicates severe depression, self-harm, or suicidal thoughts, you MUST gently but firmly advise them to seek professional medical help immediately and mention that they can use the Panic/Emergency Button in this app to contact 'Layanan Sejiwa (119 ext 8)'. Keep your responses relatively short, conversational, and warm."""

            model = genai.GenerativeModel(
                model_name='gemini-2.5-flash',
                system_instruction=system_prompt
            )

            # Convert frontend messages format to Gemini contents format
            contents = []
            for msg in messages:
                role = "user" if msg.get("role") == "user" else "model"
                contents.append({
                    "role": role,
                    "parts": [msg.get("text", "")]
                })
                
            # Gemini strictly requires the first message in the history to be from 'user'
            if contents and contents[0]["role"] == "model":
                contents.pop(0)

            response = model.generate_content(contents)
            
            return Response({
                "role": "model",
                "text": response.text
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)

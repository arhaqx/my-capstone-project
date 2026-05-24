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

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

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
3. `category` is determined by `total_score`: <= 3 is "Minimal", <= 6 is "Mild", <= 9 is "Moderate", > 9 is "Severe".
4. `interpretation`: "Minimal": "Kondisi mental dalam batas normal.", "Mild": "Terdapat gejala ringan, disarankan menjaga pola hidup sehat.", "Moderate": "Perlu perhatian lebih terhadap kesehatan mental.", "Severe": "Segera cari bantuan profesional."
5. For each answer, fill the `details` array. Synthesize an `nlp` analysis where you estimate sentiment probabilities (sum to 1.0) and a `phq_score` (0-3) based on the text provided.
"""

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

    try:
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        res_json = response.json()
        content = res_json['choices'][0]['message']['content']
        
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
            
    except Exception as e:
        error_details = str(e)
        try:
            if 'response' in locals() and hasattr(response, 'text'):
                error_details += f" | {response.text}"
        except:
            pass
            
        print(f"========== OPENROUTER ERROR ==========\n{error_details}\n======================================")
        
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

        answers = request.data.get("answers")

        if not answers or not isinstance(answers, list):
            return Response(
                {"error": "answers harus berupa list"},
                status=400
            )

        # PREDICT VIA HF API
        result = predict_multiple(answers)

        # SAVE HISTORY
        History.objects.create(
            user=request.user,
            answers=answers,
            total_score=result.get("total_score"),
            category=result.get("category"),
            result_detail=result.get("details")
        )

        return Response(result)


# =========================
# HISTORY
# =========================

class HistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = History.objects.filter(
            user=request.user
        ).order_by('-created_at')

        result = []

        for item in data:

            result.append({
                "answers": item.answers,
                "score": item.total_score,
                "category": item.category,
                "created_at": item.created_at
            })

        return Response(result)


# =========================
# NEWS
# =========================

class NewsView(APIView):

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
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
        except:
            return Response({"articles": []})

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
            return Response({"articles": []})

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

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
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
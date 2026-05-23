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
        "model": "anthropic/claude-3.7-sonnet",
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
        return {
            "total_score": 0,
            "category": "Error",
            "details": [],
            "error": str(e)
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
            "pageSize": 10,
            "apiKey": settings.NEWS_API_KEY
        }

        response = requests.get(url, params=params)

        data = response.json()

        keywords = [
            "tips",
            "how",
            "guide",
            "therapy",
            "coping",
            "help",
            "mental",
            "health",
            "stress",
            "anxiety"
        ]

        articles = []

        for article in data.get("articles", []):

            title = (
                article.get("title") or ""
            ).lower()

            desc = (
                article.get("description") or ""
            ).lower()

            content = title + " " + desc

            # FILTER
            if any(k in content for k in keywords):

                if any(
                    bad in content
                    for bad in [
                        "trump",
                        "court",
                        "law",
                        "government"
                    ]
                ):
                    continue

                # TRANSLATE
                title_id = translate_text(
                    article.get("title") or ""
                )

                desc_id = translate_text(
                    article.get("description") or ""
                )

                articles.append({
                    "title": title_id,
                    "description": desc_id,
                    "url": article.get("url"),
                    "image": article.get("urlToImage")
                })

        # FALLBACK
        if len(articles) == 0:

            for article in data.get("articles", [])[:5]:

                articles.append({
                    "title": article.get("title"),
                    "description": article.get("description"),
                    "url": article.get("url"),
                    "image": article.get("urlToImage")
                })

        return Response({
            "articles": articles[:5]
        })
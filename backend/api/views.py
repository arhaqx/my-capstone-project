from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import History

import requests


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
# HUGGINGFACE API
# =========================

HF_API_URL = "https://murera-mental-health-nlp.hf.space/run/predict"


def predict_multiple(answers):

    response = requests.post(
        HF_API_URL,
        json={
            "data": [answers]
        },
        timeout=60
    )

    result = response.json()

    # ambil output gradio
    return result["data"][0]


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
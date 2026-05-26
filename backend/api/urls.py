from django.urls import path
from .views import HomeView, PredictMultiView, HistoryView, NewsView, ChatView


urlpatterns = [
    path('', HomeView.as_view()),
    path('predict-multi/', PredictMultiView.as_view()),
    path('history/', HistoryView.as_view()),
    path('history/<int:id>/', HistoryView.as_view()),
    path('news/', NewsView.as_view()),
    path('chat/', ChatView.as_view()),

]


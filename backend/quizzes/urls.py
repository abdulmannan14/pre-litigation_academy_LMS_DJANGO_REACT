from django.urls import path
from .views import (
    QuizDetailView, QuizSubmitView, MyQuizAttemptsView,
    QuizCreateView, QuizUpdateView, QuizDeleteView,
    QuestionCreateView, QuestionUpdateView, QuestionDeleteView,
)

urlpatterns = [
    # Student
    path('quiz/<int:lesson_id>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('quiz/submit/', QuizSubmitView.as_view(), name='quiz-submit'),
    path('quiz/attempts/', MyQuizAttemptsView.as_view(), name='quiz-attempts'),

    # Admin CRUD
    path('quiz/create/', QuizCreateView.as_view(), name='quiz-create'),
    path('quiz/<int:pk>/update/', QuizUpdateView.as_view(), name='quiz-update'),
    path('quiz/<int:pk>/delete/', QuizDeleteView.as_view(), name='quiz-delete'),
    path('questions/create/', QuestionCreateView.as_view(), name='question-create'),
    path('questions/<int:pk>/update/', QuestionUpdateView.as_view(), name='question-update'),
    path('questions/<int:pk>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
]

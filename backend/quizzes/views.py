from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Quiz, Question, QuizAttempt
from .serializers import (
    QuizSerializer, QuizWriteSerializer, QuizAdminSerializer,
    QuestionWriteSerializer, QuestionWithAnswerSerializer,
    QuizSubmitSerializer, QuizAttemptSerializer,
)


class QuizDetailView(generics.RetrieveAPIView):
    """GET /api/quiz/<lesson_id>/ — get quiz for a lesson. Returns full data for staff."""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return QuizAdminSerializer
        return QuizSerializer

    def get_object(self):
        lesson_id = self.kwargs['lesson_id']
        try:
            return Quiz.objects.get(lesson_id=lesson_id)
        except Quiz.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('No quiz found for this lesson.')


class QuizSubmitView(APIView):
    """POST /api/quiz/submit/ — submit answers, get score + feedback."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = QuizSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        quiz_id = serializer.validated_data['quiz_id']
        answers = serializer.validated_data['answers']  # {str(question_id): 'A'/'B'/'C'/'D'}

        try:
            quiz = Quiz.objects.prefetch_related('questions').get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found.'}, status=status.HTTP_404_NOT_FOUND)

        questions = list(quiz.questions.all())
        total = len(questions)
        score = 0
        results = []

        for question in questions:
            chosen = answers.get(str(question.id), '').upper()
            is_correct = chosen == question.correct_answer
            if is_correct:
                score += 1
            results.append({
                'question_id': question.id,
                'question_text': question.text,
                'chosen_answer': chosen,
                'correct_answer': question.correct_answer,
                'is_correct': is_correct,
                'explanation': question.explanation,
            })

        passed = total > 0 and (score / total) >= 0.6

        # Save the attempt
        QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=score,
            total_questions=total,
            passed=passed,
        )

        return Response(
            {
                'quiz_id': quiz_id,
                'score': score,
                'total_questions': total,
                'percentage': round((score / total) * 100) if total else 0,
                'passed': passed,
                'results': results,
            },
            status=status.HTTP_200_OK,
        )


class MyQuizAttemptsView(generics.ListAPIView):
    """GET /api/quiz/attempts/ — current user's quiz history."""
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user).select_related('quiz')


# ─── Admin CRUD ───────────────────────────────────────────────────────────────

class QuizCreateView(generics.CreateAPIView):
    serializer_class = QuizWriteSerializer
    permission_classes = [permissions.IsAdminUser]


class QuizUpdateView(generics.UpdateAPIView):
    serializer_class = QuizWriteSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Quiz.objects.all()


class QuizDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = Quiz.objects.all()


class QuestionCreateView(generics.CreateAPIView):
    serializer_class = QuestionWriteSerializer
    permission_classes = [permissions.IsAdminUser]


class QuestionUpdateView(generics.UpdateAPIView):
    serializer_class = QuestionWriteSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Question.objects.all()


class QuestionDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = Question.objects.all()

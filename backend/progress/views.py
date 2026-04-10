from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics

from courses.models import Lesson, Course
from .models import LessonProgress, CourseEnrollment
from .serializers import (
    LessonProgressSerializer, CourseEnrollmentSerializer,
    MarkCompleteSerializer, SavePositionSerializer,
)


class EnrollView(APIView):
    """POST /api/progress/enroll/ — enroll in a course."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        course_id = request.data.get('course_id')
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        enrollment, created = CourseEnrollment.objects.get_or_create(
            user=request.user, course=course
        )
        return Response(
            {
                'enrolled': True,
                'created': created,
                'enrollment': CourseEnrollmentSerializer(enrollment).data,
            },
            status=status.HTTP_200_OK,
        )


class CourseProgressView(APIView):
    """GET /api/progress/<course_id>/ — progress summary for a course."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        try:
            enrollment = CourseEnrollment.objects.get(user=request.user, course_id=course_id)
        except CourseEnrollment.DoesNotExist:
            return Response({'error': 'Not enrolled in this course.'}, status=status.HTTP_404_NOT_FOUND)

        completed_lessons = LessonProgress.objects.filter(
            user=request.user,
            lesson__module__course_id=course_id,
            is_completed=True,
        ).values_list('lesson_id', flat=True)

        return Response({
            'course_id': course_id,
            'progress_percentage': enrollment.progress_percentage,
            'last_lesson_id': enrollment.last_lesson_id,
            'completed_lesson_ids': list(completed_lessons),
        })


class MarkLessonCompleteView(APIView):
    """POST /api/progress/complete/ — mark a lesson as complete."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MarkCompleteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        lesson_id = serializer.validated_data['lesson_id']
        video_position = serializer.validated_data['video_position']

        try:
            lesson = Lesson.objects.select_related('module__course').get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({'error': 'Lesson not found.'}, status=status.HTTP_404_NOT_FOUND)

        lesson_progress, _ = LessonProgress.objects.update_or_create(
            user=request.user,
            lesson=lesson,
            defaults={
                'is_completed': True,
                'video_position': video_position,
                'completed_at': timezone.now(),
            },
        )

        # Update enrollment last_lesson
        CourseEnrollment.objects.update_or_create(
            user=request.user,
            course=lesson.module.course,
            defaults={'last_lesson': lesson},
        )

        return Response(
            {
                'message': 'Lesson marked as complete.',
                'lesson_id': lesson_id,
                'progress': LessonProgressSerializer(lesson_progress).data,
            },
            status=status.HTTP_200_OK,
        )


class SaveVideoPositionView(APIView):
    """POST /api/progress/position/ — save video watch position."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SavePositionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        lesson_id = serializer.validated_data['lesson_id']
        position = serializer.validated_data['video_position']

        try:
            lesson = Lesson.objects.select_related('module__course').get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({'error': 'Lesson not found.'}, status=status.HTTP_404_NOT_FOUND)

        lesson_progress, _ = LessonProgress.objects.update_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'video_position': position},
        )

        # Keep enrollment last_lesson up to date
        CourseEnrollment.objects.update_or_create(
            user=request.user,
            course=lesson.module.course,
            defaults={'last_lesson': lesson},
        )

        return Response({'message': 'Position saved.', 'video_position': position})


class MyProgressView(generics.ListAPIView):
    """GET /api/progress/ — all enrollments for current user."""
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CourseEnrollment.objects.filter(user=self.request.user).select_related('course', 'last_lesson')

from django.utils import timezone
from django.contrib.auth.models import User
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


# ─── Admin Enrollment Views ───────────────────────────────────────────────────

class AdminEnrollView(APIView):
    """
    GET  /api/admin/enrollments/?student_id=<id>  — list courses a student is enrolled in.
    POST /api/admin/enrollments/                  — enroll a student in a course.
    DELETE /api/admin/enrollments/                — unenroll a student from a course.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response({'error': 'student_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            student = User.objects.get(id=student_id, is_staff=False)
        except User.DoesNotExist:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        enrollments = CourseEnrollment.objects.filter(user=student).select_related('course')
        data = [
            {
                'course_id': e.course_id,
                'course_title': e.course.title,
                'enrolled_at': e.enrolled_at,
                'progress_percentage': e.progress_percentage,
            }
            for e in enrollments
        ]
        return Response(data)

    def post(self, request):
        student_id = request.data.get('student_id')
        course_id = request.data.get('course_id')
        if not student_id or not course_id:
            return Response({'error': 'student_id and course_id are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            student = User.objects.get(id=student_id, is_staff=False)
        except User.DoesNotExist:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        enrollment, created = CourseEnrollment.objects.get_or_create(user=student, course=course)
        return Response(
            {'enrolled': True, 'created': created, 'course_id': course_id, 'student_id': student_id},
            status=status.HTTP_200_OK,
        )

    def delete(self, request):
        student_id = request.data.get('student_id')
        course_id = request.data.get('course_id')
        if not student_id or not course_id:
            return Response({'error': 'student_id and course_id are required.'}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = CourseEnrollment.objects.filter(user_id=student_id, course_id=course_id).delete()
        if not deleted:
            return Response({'error': 'Enrollment not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'unenrolled': True}, status=status.HTTP_200_OK)


# ─── Admin Views ──────────────────────────────────────────────────────────────

class AdminStatsView(APIView):
    """GET /api/admin/stats/ — dashboard stats for admin."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from quizzes.models import QuizAttempt

        total_students = User.objects.filter(is_staff=False).count()
        total_courses = Course.objects.count()
        total_lessons = Lesson.objects.count()
        total_enrollments = CourseEnrollment.objects.count()

        attempts = QuizAttempt.objects.all()
        total_attempts = attempts.count()
        passed_attempts = attempts.filter(passed=True).count()
        quiz_pass_rate = round((passed_attempts / total_attempts) * 100) if total_attempts else 0

        return Response({
            'total_students': total_students,
            'total_courses': total_courses,
            'total_lessons': total_lessons,
            'total_enrollments': total_enrollments,
            'total_quiz_attempts': total_attempts,
            'quiz_pass_rate': quiz_pass_rate,
        })


class AdminStudentsView(APIView):
    """GET /api/admin/students/ — all students with progress for admin.
       POST /api/admin/students/ — create a new student account."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        students = User.objects.filter(is_staff=False).order_by('-date_joined')
        data = []
        for student in students:
            enrollments = CourseEnrollment.objects.filter(user=student).select_related('course')
            progress_values = [e.progress_percentage for e in enrollments]
            avg_progress = round(sum(progress_values) / len(progress_values)) if progress_values else 0
            data.append({
                'id': student.id,
                'username': student.username,
                'email': student.email,
                'full_name': f"{student.first_name} {student.last_name}".strip() or '',
                'date_joined': student.date_joined,
                'enrolled_courses': enrollments.count(),
                'avg_progress': avg_progress,
            })
        return Response(data)

    def post(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        full_name = request.data.get('full_name', '').strip()
        password = request.data.get('password', '').strip()

        if not username:
            return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': full_name,
            'date_joined': user.date_joined,
            'enrolled_courses': 0,
            'avg_progress': 0,
        }, status=status.HTTP_201_CREATED)


class AdminStudentDetailView(APIView):
    """PATCH /api/admin/students/<id>/ — update a student.
       DELETE /api/admin/students/<id>/ — delete a student."""
    permission_classes = [permissions.IsAdminUser]

    def _get_student(self, pk):
        try:
            return User.objects.get(id=pk, is_staff=False)
        except User.DoesNotExist:
            return None

    def patch(self, request, pk):
        student = self._get_student(pk)
        if not student:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)

        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        full_name = request.data.get('full_name', '').strip()
        password = request.data.get('password', '').strip()

        if username and username != student.username:
            if User.objects.filter(username=username).exists():
                return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)
            student.username = username

        if email and email != student.email:
            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email already taken.'}, status=status.HTTP_400_BAD_REQUEST)
            student.email = email

        if full_name is not None:
            name_parts = full_name.split(' ', 1)
            student.first_name = name_parts[0] if name_parts else ''
            student.last_name = name_parts[1] if len(name_parts) > 1 else ''

        if password:
            student.set_password(password)

        student.save()
        return Response({
            'id': student.id,
            'username': student.username,
            'email': student.email,
            'full_name': f"{student.first_name} {student.last_name}".strip() or '',
        })

    def delete(self, request, pk):
        student = self._get_student(pk)
        if not student:
            return Response({'error': 'Student not found.'}, status=status.HTTP_404_NOT_FOUND)
        student.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

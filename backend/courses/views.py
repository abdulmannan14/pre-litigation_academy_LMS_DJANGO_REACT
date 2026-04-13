from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Course, Module, Lesson
from .serializers import (
    CourseSerializer, CourseListSerializer, CourseWriteSerializer,
    ModuleSerializer, ModuleWriteSerializer,
    LessonSerializer, LessonWriteSerializer,
)


# ─── Course Views ─────────────────────────────────────────────────────────────

class CourseListView(generics.ListAPIView):
    """GET /api/courses/ — list all published courses."""
    serializer_class = CourseListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Course.objects.all()
        return Course.objects.filter(is_published=True)


class CourseDetailView(generics.RetrieveAPIView):
    """GET /api/courses/<id>/ — full course with nested modules & lessons."""
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.all()


class CourseCreateView(generics.CreateAPIView):
    """POST /api/courses/create/ — admin only."""
    serializer_class = CourseWriteSerializer
    permission_classes = [permissions.IsAdminUser]


class CourseUpdateView(generics.UpdateAPIView):
    """PUT/PATCH /api/courses/<id>/update/ — admin only."""
    serializer_class = CourseWriteSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Course.objects.all()


class CourseDeleteView(generics.DestroyAPIView):
    """DELETE /api/courses/<id>/delete/ — admin only."""
    permission_classes = [permissions.IsAdminUser]
    queryset = Course.objects.all()


# ─── Module Views ─────────────────────────────────────────────────────────────

class ModuleListView(generics.ListAPIView):
    """GET /api/modules/<course_id>/ — modules for a course."""
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Module.objects.filter(course_id=self.kwargs['course_id'])


class ModuleCreateView(generics.CreateAPIView):
    serializer_class = ModuleWriteSerializer
    permission_classes = [permissions.IsAdminUser]


class ModuleUpdateView(generics.UpdateAPIView):
    serializer_class = ModuleWriteSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Module.objects.all()


class ModuleDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = Module.objects.all()


# ─── Lesson Views ─────────────────────────────────────────────────────────────

class LessonListView(generics.ListAPIView):
    """GET /api/lessons/<module_id>/ — lessons for a module."""
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Lesson.objects.filter(module_id=self.kwargs['module_id'])


class LessonDetailView(generics.RetrieveAPIView):
    """GET /api/lesson/<id>/ — single lesson detail."""
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Lesson.objects.all()


class LessonCreateView(generics.CreateAPIView):
    serializer_class = LessonWriteSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]


class LessonUpdateView(generics.UpdateAPIView):
    serializer_class = LessonWriteSerializer
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Lesson.objects.all()


class LessonDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = Lesson.objects.all()

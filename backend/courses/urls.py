from django.urls import path
from .views import (
    CourseListView, CourseDetailView, CourseCreateView, CourseUpdateView, CourseDeleteView,
    ModuleListView, ModuleCreateView, ModuleUpdateView, ModuleDeleteView,
    LessonListView, LessonDetailView, LessonCreateView, LessonUpdateView, LessonDeleteView,
)

urlpatterns = [
    # Courses
    path('courses/', CourseListView.as_view(), name='course-list'),
    path('courses/<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('courses/create/', CourseCreateView.as_view(), name='course-create'),
    path('courses/<int:pk>/update/', CourseUpdateView.as_view(), name='course-update'),
    path('courses/<int:pk>/delete/', CourseDeleteView.as_view(), name='course-delete'),

    # Modules
    path('modules/<int:course_id>/', ModuleListView.as_view(), name='module-list'),
    path('modules/create/', ModuleCreateView.as_view(), name='module-create'),
    path('modules/<int:pk>/update/', ModuleUpdateView.as_view(), name='module-update'),
    path('modules/<int:pk>/delete/', ModuleDeleteView.as_view(), name='module-delete'),

    # Lessons
    path('lessons/<int:module_id>/', LessonListView.as_view(), name='lesson-list'),
    path('lesson/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('lessons/create/', LessonCreateView.as_view(), name='lesson-create'),
    path('lessons/<int:pk>/update/', LessonUpdateView.as_view(), name='lesson-update'),
    path('lessons/<int:pk>/delete/', LessonDeleteView.as_view(), name='lesson-delete'),
]

from django.contrib import admin
from .models import LessonProgress, CourseEnrollment


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'is_completed', 'video_position', 'completed_at')
    list_filter = ('is_completed',)
    search_fields = ('user__username', 'lesson__title')
    readonly_fields = ('completed_at', 'updated_at')


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'progress_percentage', 'last_lesson', 'enrolled_at')
    list_filter = ('course',)
    search_fields = ('user__username', 'course__title')
    readonly_fields = ('enrolled_at', 'updated_at')

from django.contrib import admin
from .models import Course, Module, Lesson


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1
    fields = ('title', 'order')
    ordering = ('order',)


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    fields = ('title', 'video_url', 'duration', 'order')
    ordering = ('order',)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published', 'total_lessons', 'created_at')
    list_filter = ('is_published',)
    search_fields = ('title', 'description')
    list_editable = ('is_published',)
    inlines = [ModuleInline]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'created_at')
    list_filter = ('course',)
    search_fields = ('title',)
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'duration', 'order', 'created_at')
    list_filter = ('module__course',)
    search_fields = ('title', 'description')

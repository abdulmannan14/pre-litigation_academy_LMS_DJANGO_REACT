from rest_framework import serializers
from .models import Course, Module, Lesson


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ('id', 'title', 'description', 'video_url', 'duration', 'order')


class LessonListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing lessons inside a module."""
    class Meta:
        model = Lesson
        fields = ('id', 'title', 'duration', 'order')


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonListSerializer(many=True, read_only=True)
    lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ('id', 'title', 'order', 'lesson_count', 'lessons')

    def get_lesson_count(self, obj):
        return obj.lessons.count()


class ModuleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing modules inside a course."""
    lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ('id', 'title', 'order', 'lesson_count')

    def get_lesson_count(self, obj):
        return obj.lessons.count()


class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'thumbnail', 'is_published', 'total_lessons', 'modules', 'created_at')


class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for course listing."""
    total_lessons = serializers.IntegerField(read_only=True)
    module_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'thumbnail', 'is_published', 'total_lessons', 'module_count', 'created_at')

    def get_module_count(self, obj):
        return obj.modules.count()


class CourseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'thumbnail', 'is_published')


class ModuleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ('id', 'course', 'title', 'order')


class LessonWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ('id', 'module', 'title', 'description', 'video_url', 'duration', 'order')

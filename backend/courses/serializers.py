from rest_framework import serializers
from .models import Course, Module, Lesson


class LessonModuleSerializer(serializers.ModelSerializer):
    """Minimal module info embedded in a lesson — gives the frontend the course ID."""
    class Meta:
        model = Module
        fields = ('id', 'course')


class LessonSerializer(serializers.ModelSerializer):
    module = LessonModuleSerializer(read_only=True)
    video = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ('id', 'title', 'description', 'video_file', 'video_url', 'video', 'duration', 'order', 'module')

    def get_video(self, obj):
        """Return the absolute URL of the uploaded file, or fall back to the external URL."""
        request = self.context.get('request')
        if obj.video_file:
            url = obj.video_file.url
            return request.build_absolute_uri(url) if request else url
        return obj.video_url or None


class LessonListSerializer(serializers.ModelSerializer):
    """Serializer for listing lessons inside a module — includes full fields for admin editing."""
    video = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ('id', 'title', 'description', 'video_file', 'video_url', 'video', 'duration', 'order')

    def get_video(self, obj):
        request = self.context.get('request')
        if obj.video_file:
            url = obj.video_file.url
            return request.build_absolute_uri(url) if request else url
        return obj.video_url or None


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
    video_file = serializers.FileField(required=False, allow_null=True)
    video_url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = Lesson
        fields = ('id', 'module', 'title', 'description', 'video_file', 'video_url', 'duration', 'order')

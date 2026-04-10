from rest_framework import serializers
from .models import LessonProgress, CourseEnrollment
from courses.serializers import LessonListSerializer


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = LessonProgress
        fields = ('id', 'lesson', 'lesson_title', 'is_completed', 'video_position', 'completed_at', 'updated_at')
        read_only_fields = ('id', 'completed_at', 'updated_at')


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    last_lesson_title = serializers.CharField(source='last_lesson.title', read_only=True, default=None)

    class Meta:
        model = CourseEnrollment
        fields = (
            'id', 'course', 'course_title',
            'last_lesson', 'last_lesson_title',
            'progress_percentage', 'enrolled_at', 'updated_at',
        )
        read_only_fields = ('id', 'enrolled_at', 'updated_at')


class MarkCompleteSerializer(serializers.Serializer):
    lesson_id = serializers.IntegerField()
    video_position = serializers.FloatField(required=False, default=0.0)


class SavePositionSerializer(serializers.Serializer):
    lesson_id = serializers.IntegerField()
    video_position = serializers.FloatField()

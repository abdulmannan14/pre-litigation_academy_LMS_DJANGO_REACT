from django.db import models
from django.contrib.auth.models import User
from courses.models import Course, Lesson


class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    video_position = models.FloatField(default=0.0)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'lesson')
        ordering = ['-updated_at']

    def __str__(self):
        status = 'done' if self.is_completed else 'in-progress'
        return f"{self.user.username} — {self.lesson.title} [{status}]"


class CourseEnrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    last_lesson = models.ForeignKey(
        Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name='last_viewed_by'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"

    @property
    def progress_percentage(self):
        total = Lesson.objects.filter(module__course=self.course).count()
        if total == 0:
            return 0
        completed = LessonProgress.objects.filter(
            user=self.user,
            lesson__module__course=self.course,
            is_completed=True,
        ).count()
        return round((completed / total) * 100)

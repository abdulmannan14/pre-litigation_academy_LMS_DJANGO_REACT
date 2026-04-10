from django.contrib import admin
from .models import Quiz, Question, QuizAttempt


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ('text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'order')
    ordering = ('order',)


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'title', 'question_count', 'created_at')
    search_fields = ('lesson__title', 'title')
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text_preview', 'quiz', 'correct_answer', 'order')
    list_filter = ('quiz__lesson__module__course', 'correct_answer')
    search_fields = ('text',)

    def text_preview(self, obj):
        return obj.text[:80]
    text_preview.short_description = 'Question'


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'score', 'total_questions', 'passed', 'attempted_at')
    list_filter = ('passed',)
    readonly_fields = ('user', 'quiz', 'score', 'total_questions', 'passed', 'attempted_at')

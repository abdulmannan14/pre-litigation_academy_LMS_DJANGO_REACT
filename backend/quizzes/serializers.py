from rest_framework import serializers
from .models import Quiz, Question, QuizAttempt


class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ('id', 'text', 'options', 'order')

    def get_options(self, obj):
        return [
            {'key': 'A', 'text': obj.option_a},
            {'key': 'B', 'text': obj.option_b},
            {'key': 'C', 'text': obj.option_c},
            {'key': 'D', 'text': obj.option_d},
        ]


class QuestionWithAnswerSerializer(serializers.ModelSerializer):
    """Used after submission — includes correct answer and explanation."""
    options = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ('id', 'text', 'options', 'correct_answer', 'explanation', 'order')

    def get_options(self, obj):
        return [
            {'key': 'A', 'text': obj.option_a},
            {'key': 'B', 'text': obj.option_b},
            {'key': 'C', 'text': obj.option_c},
            {'key': 'D', 'text': obj.option_d},
        ]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.IntegerField(source='question_count', read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'lesson', 'question_count', 'questions')


class QuizSubmitSerializer(serializers.Serializer):
    """Validates quiz submission payload."""
    quiz_id = serializers.IntegerField()
    answers = serializers.DictField(
        child=serializers.CharField(max_length=1),
        help_text='Map of question_id (str) → chosen option key (A/B/C/D)',
    )

    def validate_answers(self, value):
        for k, v in value.items():
            if v.upper() not in ('A', 'B', 'C', 'D'):
                raise serializers.ValidationError(
                    f'Invalid answer "{v}" for question {k}. Must be A, B, C, or D.'
                )
        return {k: v.upper() for k, v in value.items()}


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ('id', 'quiz', 'score', 'total_questions', 'passed', 'attempted_at')


class QuestionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = (
            'id', 'quiz', 'text',
            'option_a', 'option_b', 'option_c', 'option_d',
            'correct_answer', 'explanation', 'order',
        )


class QuizWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ('id', 'lesson', 'title')


class QuizAdminSerializer(serializers.ModelSerializer):
    """Used for admin — includes correct answers and explanations."""
    questions = QuestionWithAnswerSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'lesson', 'question_count', 'questions')

    def get_question_count(self, obj):
        return obj.questions.count()

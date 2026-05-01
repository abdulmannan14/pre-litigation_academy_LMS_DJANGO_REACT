from rest_framework import serializers
from .models import JobPosting


class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = ('id', 'firm', 'title', 'location', 'description', 'created_at')


class JobPostingWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = ('id', 'firm', 'title', 'location', 'description', 'is_published')

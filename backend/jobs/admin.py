from django.contrib import admin
from .models import JobPosting

@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'firm', 'location', 'is_published', 'created_at')
    list_filter = ('is_published',)
    search_fields = ('title', 'firm')

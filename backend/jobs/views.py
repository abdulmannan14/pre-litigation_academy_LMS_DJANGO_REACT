from rest_framework import generics, permissions
from .models import JobPosting
from .serializers import JobPostingSerializer, JobPostingWriteSerializer


class JobListView(generics.ListAPIView):
    """GET /api/jobs/ — public list of published job postings."""
    serializer_class = JobPostingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return JobPosting.objects.filter(is_published=True)


class JobAdminListView(generics.ListAPIView):
    """GET /api/admin/jobs/ — all jobs including unpublished (admin only)."""
    serializer_class = JobPostingWriteSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return JobPosting.objects.all()


class JobCreateView(generics.CreateAPIView):
    """POST /api/admin/jobs/create/ — admin only."""
    serializer_class = JobPostingWriteSerializer
    permission_classes = [permissions.IsAdminUser]


class JobUpdateView(generics.UpdateAPIView):
    """PUT/PATCH /api/admin/jobs/<id>/update/ — admin only."""
    serializer_class = JobPostingWriteSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = JobPosting.objects.all()


class JobDeleteView(generics.DestroyAPIView):
    """DELETE /api/admin/jobs/<id>/delete/ — admin only."""
    permission_classes = [permissions.IsAdminUser]
    queryset = JobPosting.objects.all()

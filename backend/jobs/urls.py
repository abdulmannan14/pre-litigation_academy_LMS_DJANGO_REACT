from django.urls import path
from .views import JobListView, JobAdminListView, JobCreateView, JobUpdateView, JobDeleteView

urlpatterns = [
    path('jobs/', JobListView.as_view(), name='job-list'),
    path('admin/jobs/', JobAdminListView.as_view(), name='admin-job-list'),
    path('admin/jobs/create/', JobCreateView.as_view(), name='job-create'),
    path('admin/jobs/<int:pk>/update/', JobUpdateView.as_view(), name='job-update'),
    path('admin/jobs/<int:pk>/delete/', JobDeleteView.as_view(), name='job-delete'),
]

from django.urls import path
from .views import (
    EnrollView,
    CourseProgressView,
    MarkLessonCompleteView,
    SaveVideoPositionView,
    MyProgressView,
)

urlpatterns = [
    path('progress/', MyProgressView.as_view(), name='progress-list'),
    path('progress/enroll/', EnrollView.as_view(), name='progress-enroll'),
    path('progress/complete/', MarkLessonCompleteView.as_view(), name='progress-complete'),
    path('progress/position/', SaveVideoPositionView.as_view(), name='progress-position'),
    path('progress/<int:course_id>/', CourseProgressView.as_view(), name='progress-detail'),
]

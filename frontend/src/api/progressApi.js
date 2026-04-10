import api from './axiosInstance';

export const getMyProgress = () =>
  api.get('/progress/');

export const getCourseProgress = (courseId) =>
  api.get(`/progress/${courseId}/`);

export const enrollInCourse = (courseId) =>
  api.post('/progress/enroll/', { course_id: courseId });

export const markLessonComplete = (lessonId, videoPosition = 0) =>
  api.post('/progress/complete/', { lesson_id: lessonId, video_position: videoPosition });

export const saveVideoPosition = (lessonId, videoPosition) =>
  api.post('/progress/position/', { lesson_id: lessonId, video_position: videoPosition });

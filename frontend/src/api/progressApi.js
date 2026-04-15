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

// Admin
export const getAdminStats = () =>
  api.get('/admin/stats/');

export const getAdminStudents = () =>
  api.get('/admin/students/');

export const createAdminStudent = (data) =>
  api.post('/admin/students/', data);

export const updateAdminStudent = (id, data) =>
  api.patch(`/admin/students/${id}/`, data);

export const deleteAdminStudent = (id) =>
  api.delete(`/admin/students/${id}/`);

export const getStudentEnrollments = (studentId) =>
  api.get(`/admin/enrollments/?student_id=${studentId}`);

export const adminEnrollStudent = (studentId, courseId) =>
  api.post('/admin/enrollments/', { student_id: studentId, course_id: courseId });

export const adminUnenrollStudent = (studentId, courseId) =>
  api.delete('/admin/enrollments/', { data: { student_id: studentId, course_id: courseId } });

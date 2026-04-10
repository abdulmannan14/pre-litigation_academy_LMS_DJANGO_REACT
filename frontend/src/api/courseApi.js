import api from './axiosInstance';

export const getCourses = () =>
  api.get('/courses/');

export const getCourse = (id) =>
  api.get(`/courses/${id}/`);

export const getModules = (courseId) =>
  api.get(`/modules/${courseId}/`);

export const getLessons = (moduleId) =>
  api.get(`/lessons/${moduleId}/`);

export const getLesson = (id) =>
  api.get(`/lesson/${id}/`);

// Admin
export const createCourse = (data) =>
  api.post('/courses/create/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateCourse = (id, data) =>
  api.patch(`/courses/${id}/update/`, data);

export const deleteCourse = (id) =>
  api.delete(`/courses/${id}/delete/`);

export const createModule = (data) =>
  api.post('/modules/create/', data);

export const updateModule = (id, data) =>
  api.patch(`/modules/${id}/update/`, data);

export const deleteModule = (id) =>
  api.delete(`/modules/${id}/delete/`);

export const createLesson = (data) =>
  api.post('/lessons/create/', data);

export const updateLesson = (id, data) =>
  api.patch(`/lessons/${id}/update/`, data);

export const deleteLesson = (id) =>
  api.delete(`/lessons/${id}/delete/`);

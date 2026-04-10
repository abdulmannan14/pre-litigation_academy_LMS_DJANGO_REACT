import api from './axiosInstance';

export const getQuiz = (lessonId) =>
  api.get(`/quiz/${lessonId}/`);

export const submitQuiz = (quizId, answers) =>
  api.post('/quiz/submit/', { quiz_id: quizId, answers });

export const getMyAttempts = () =>
  api.get('/quiz/attempts/');

// Admin
export const createQuiz = (data) =>
  api.post('/quiz/create/', data);

export const createQuestion = (data) =>
  api.post('/questions/create/', data);

export const updateQuestion = (id, data) =>
  api.patch(`/questions/${id}/update/`, data);

export const deleteQuestion = (id) =>
  api.delete(`/questions/${id}/delete/`);

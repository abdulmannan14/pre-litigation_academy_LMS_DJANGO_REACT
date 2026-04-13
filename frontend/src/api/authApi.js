import api from './axiosInstance';

export const register = (data) =>
  api.post('/auth/register/', data);

export const login = (data) =>
  api.post('/auth/login/', data);

export const logout = (refresh) =>
  api.post('/auth/logout/', { refresh });

export const getMe = () =>
  api.get('/auth/me/');

export const refreshToken = (refresh) =>
  api.post('/auth/token/refresh/', { refresh });

export const updateProfile = (data) =>
  api.patch('/auth/me/', data);

export const changePassword = (data) =>
  api.post('/auth/change-password/', data);

export const checkEmail = (email) =>
  api.get('/auth/check-email/', { params: { email } });

export const checkUsername = (username) =>
  api.get('/auth/check-username/', { params: { username } });

import api from './axiosInstance';

export const getPublishedJobs = () => api.get('/jobs/');
export const getAdminJobs     = () => api.get('/admin/jobs/');
export const createJob        = (data) => api.post('/admin/jobs/create/', data);
export const updateJob        = (id, data) => api.patch(`/admin/jobs/${id}/update/`, data);
export const deleteJob        = (id) => api.delete(`/admin/jobs/${id}/delete/`);

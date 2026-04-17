import axiosInstance from './axiosInstance';

export const startAttempt = (examId) => axiosInstance.post('/attempts/start', { examId });
export const getAttemptStatus = (id) => axiosInstance.get(`/attempts/${id}/status`);
export const submitAttempt = (id) => axiosInstance.post(`/attempts/${id}/submit`);
export const getMyAttempts = () => axiosInstance.get('/attempts/mine');
export const getResult = (id) => axiosInstance.get(`/attempts/${id}/result`);

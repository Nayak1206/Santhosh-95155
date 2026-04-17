import axiosInstance from './axiosInstance';

export const getExams = (params = {}) => axiosInstance.get('/exams', { params });
export const getExamById = (id) => axiosInstance.get(`/exams/${id}`);
export const createExam = (data) => axiosInstance.post('/exams', data);
export const updateExam = (id, data) => axiosInstance.put(`/exams/${id}`, data);
export const deleteExam = (id) => axiosInstance.delete(`/exams/${id}`);
export const togglePublish = (id) => axiosInstance.patch(`/exams/${id}/publish`);
export const getExamResults = (id) => axiosInstance.get(`/exams/${id}/results`);
export const getExamStats = (id) => axiosInstance.get(`/exams/${id}/stats`);
export const importQuestions = (id, formData) => axiosInstance.post(`/exams/${id}/import`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

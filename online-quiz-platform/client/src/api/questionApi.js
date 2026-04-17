import axiosInstance from './axiosInstance';

export const getQuestions = (examId) => axiosInstance.get(`/questions/${examId}`);
export const addQuestion = (examId, data) => axiosInstance.post(`/questions/${examId}`, data);
export const updateQuestion = (id, data) => axiosInstance.put(`/questions/${id}`, data);
export const deleteQuestion = (id) => axiosInstance.delete(`/questions/${id}`);

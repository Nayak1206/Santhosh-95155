import axiosInstance from './axiosInstance';

export const saveAnswer = (data) => axiosInstance.post('/answers/save', data);
export const getSavedAnswers = (attemptId) => axiosInstance.get(`/answers/${attemptId}`);
export const saveBulkAnswers = (data) => axiosInstance.post('/answers/save-bulk', data);

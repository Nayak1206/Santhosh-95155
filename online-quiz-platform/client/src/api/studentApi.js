import axiosInstance from './axiosInstance';

export const getAllStudents = () => axiosInstance.get('/students');
export const getStudentDetails = (id) => axiosInstance.get(`/students/${id}`);
export const grantRetake = (id, examId) => axiosInstance.post(`/students/${id}/retake`, { examId });
export const exportStudents = () => axiosInstance.get('/students/export', { responseType: 'blob' });

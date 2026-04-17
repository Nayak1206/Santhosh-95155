import axiosInstance from './axiosInstance';

export const getExamSubmissions = (examId) => axiosInstance.get(`/admin/exams/${examId}/submissions`);
export const grantRetake = (examId, studentId) => axiosInstance.post('/admin/grant-retake', { examId, studentId });
export const getAdminStats = () => axiosInstance.get('/admin/stats');
export const getSubmissionActivity = () => axiosInstance.get('/admin/activity');
export const getUpcomingExams = () => axiosInstance.get('/admin/upcoming-exams');
export const getRecentSubmissions = () => axiosInstance.get('/admin/recent-submissions');

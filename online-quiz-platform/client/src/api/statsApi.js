import axiosInstance from './axiosInstance';

export const getAdminStats = () => axiosInstance.get('/stats/admin');
export const getStudentActivityData = () => axiosInstance.get('/stats/activity');
export const getUpcomingExams = () => axiosInstance.get('/stats/upcoming');
export const getRecentSubmissions = () => axiosInstance.get('/stats/recent');

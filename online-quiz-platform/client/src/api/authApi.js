import axiosInstance from './axiosInstance';

export const register = (data) => axiosInstance.post('/auth/register', data);
export const login = (data) => axiosInstance.post('/auth/login', data);
export const logout = () => axiosInstance.post('/auth/logout');
export const refresh = () => axiosInstance.post('/auth/refresh');
export const getMe = () => axiosInstance.get('/auth/me');
export const changePassword = (data) => axiosInstance.put('/auth/change-password', data);

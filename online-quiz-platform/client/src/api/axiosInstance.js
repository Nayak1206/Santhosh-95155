import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Response interceptor to handle token refresh automatically
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the HttpOnly cookie
        const res = await axios.post(
          `${axiosInstance.defaults.baseURL}/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        const { token } = res.data;

        // Update the global authorization header for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update the original request's authorization header
        originalRequest.headers['Authorization'] = `Bearer ${token}`;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear headers and potentially redirect (handled by AuthContext state)
        delete axiosInstance.defaults.headers.common['Authorization'];
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

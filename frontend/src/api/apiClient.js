import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to handle token expiration or other auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export const getAlerts = () => {
    const token = localStorage.getItem('token');
    return apiClient.get('/alerts', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export default apiClient;
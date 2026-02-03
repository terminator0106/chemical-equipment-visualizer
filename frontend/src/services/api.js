import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API Methods
export const authAPI = {
    login: async (emailOrUsername, password) => {
        const value = (emailOrUsername || '').trim();
        const isEmail = value.includes('@');
        const payload = isEmail ? { email: value, password } : { username: value, password };
        const response = await api.post('/login/', payload);
        return response.data;
    },
    signup: async ({ name, email, password, confirm_password }) => {
        const response = await api.post('/signup/', { name, email, password, confirm_password });
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('authToken');
    },
    isAuthenticated: () => {
        return !!localStorage.getItem('authToken');
    },
};

export const datasetAPI = {
    upload: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    getSummary: async (datasetId, limit = null) => {
        const url = limit
            ? `/summary/${datasetId}/?limit=${limit}`
            : `/summary/${datasetId}/`;
        const response = await api.get(url);
        return response.data;
    },
    getCSVData: async (datasetId, limit = null) => {
        const url = limit
            ? `/csv-data/${datasetId}/?limit=${limit}`
            : `/csv-data/${datasetId}/`;
        const response = await api.get(url);
        return response.data;
    },
    getHistory: async () => {
        const response = await api.get('/history/');
        return response.data;
    },
    downloadReport: async (datasetId) => {
        const response = await api.get(`/report/${datasetId}/`, {
            responseType: 'blob',
        });

        // Extract filename from Content-Disposition header
        let filename = `Report ${datasetId}.pdf`;
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"\.pdf/);
            if (filenameMatch && filenameMatch[1]) {
                filename = `${filenameMatch[1]}.pdf`;
            } else {
                const simpleMatch = contentDisposition.match(/filename="(.+)"/);
                if (simpleMatch && simpleMatch[1]) {
                    filename = simpleMatch[1];
                }
            }
        }

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};

export default api;

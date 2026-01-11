import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth Interceptor
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('sentinel_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const systemApi = {
    getStatus: () => apiClient.get('/system/status'),
    getEvents: () => apiClient.get('/system/events'),
    getTrend: () => apiClient.get('/metrics/anomaly-trend'),
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (data) => apiClient.post('/auth/register', data),
    getMe: () => apiClient.get('/auth/me'),
    getTenders: () => apiClient.get('/tenders'),
    chat: (data) => apiClient.post('/ai/chat', data),
    getMessages: (role) => apiClient.get('/messages', { params: { role } }),
    getFinanceDashboard: () => apiClient.get('/finance/dashboard'),
};

export const vendorApi = {
    list: () => apiClient.get('/vendors'),
    freeze: (id) => apiClient.post(`/vendors/${id}/freeze`),
};

export const alertApi = {
    list: (filters = {}) => apiClient.get('/alerts', { params: filters }),
    get: (id) => apiClient.get(`/alerts/${id}`),
    acknowledge: (id) => apiClient.post(`/alerts/${id}/acknowledge`),
    resolve: (id, payload) => apiClient.post(`/alerts/${id}/resolve`, payload), // {note, outcome}
    exportBrief: (id) => apiClient.get(`/alerts/${id}/export-brief`, { responseType: 'blob' }),
};

export const transactionApi = {
    release: (id, payload) => apiClient.post(`/transactions/${id}/release`, payload), // {note}
    block: (id) => apiClient.post(`/transactions/${id}/block`),
};

export const caseApi = {
    list: () => apiClient.get('/cases'),
    create: (data) => apiClient.post('/cases', data),
};

export const ingestApi = {
    upload: (formData) => apiClient.post('/ingest/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
};

export default apiClient;

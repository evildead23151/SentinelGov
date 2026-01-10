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
    trainModel: () => apiClient.post('/model/train'),
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (data) => apiClient.post('/auth/register', data),
    getMe: () => apiClient.get('/auth/me'),
};

export const vendorApi = {
    list: () => apiClient.get('/vendors'),
    freeze: (id) => apiClient.post(`/vendors/${id}/freeze`),
};

export const alertApi = {
    list: (filters = {}) => apiClient.get('/alerts', { params: filters }),
    get: (id) => apiClient.get(`/alerts/${id}`),
    takeAction: (id, action, note) => apiClient.post(`/alerts/${id}/action`, { action, note }),
    acknowledge: (id) => apiClient.post(`/alerts/${id}/acknowledge`),
    assignCommittee: (id, members, note) => apiClient.post(`/alerts/${id}/assign-committee`, { committee_members: members, note }),
    escalate: (id) => apiClient.post(`/alerts/${id}/escalate`),
    exportBrief: (id) => apiClient.get(`/alerts/${id}/export-brief`, { responseType: 'blob' }),
    resolve: (id, resolution, findings) => apiClient.post(`/alerts/${id}/resolve`, { resolution, findings })
};

export const caseApi = {
    list: () => apiClient.get('/cases'),
    create: (data) => apiClient.post('/cases', data),
    escalate: (id) => apiClient.post(`/cases/${id}/escalate`),
};

export const analyticsApi = {
    getBaseline: (vendorId, department) => apiClient.get(`/analytics/expenditure-baseline`, { params: { vendor_id: vendorId, department } })
};

export const ingestApi = {
    upload: (formData) => apiClient.post('/ingest/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    simulate: () => apiClient.post('/ingest/simulate'),
};

export default apiClient;

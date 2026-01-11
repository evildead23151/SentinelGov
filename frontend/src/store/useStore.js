import { create } from 'zustand';
import { systemApi, alertApi, caseApi, vendorApi, transactionApi } from '../api/client';
import Fuse from 'fuse.js';

const useStore = create((set, get) => ({
    user: null,
    authStatus: 'UNAUTHENTICATED', // Start unauthenticated to trigger auto-login in App
    token: localStorage.getItem('sentinel_token') || null,
    systemStats: {
        status: "OPERATIONAL",
        secure_layer: true,
        total_transactions: 0,
        funds_monitored: 0,
        risk_exposure: 0,
        active_cases: 0,
        ai_confidence: 98.4,
        model_version: "v3.0.0"
    },
    trendData: [],
    isSidebarOpen: true,
    notifications: [],
    unreadNotifications: 0,
    alerts: [],
    cases: [],
    vendors: [],
    tenders: [],
    searchResults: [],
    isSearching: false,
    institutionalMessages: [],

    // Auth Actions
    login: async (username, password) => {
        try {
            const res = await systemApi.login({ username, password });
            const { access_token, user } = res.data;
            localStorage.setItem('sentinel_token', access_token);
            set({ user, token: access_token, authStatus: 'AUTHENTICATED' });
            return true;
        } catch (err) {
            set({ authStatus: 'UNAUTHENTICATED' });
            // Don't throw for auto-login transparency
            console.error("Auto-login failed:", err);
            return false;
        }
    },

    switchRole: async (role) => {
        const { login } = get();
        if (role === 'INVESTIGATOR') {
            await login('investigator', 'police123');
        } else if (role === 'FINANCE_OFFICER') {
            await login('treasury', 'finance123');
        }
    },

    register: async (userData) => {
        try {
            const res = await systemApi.register(userData);
            const { access_token, user } = res.data;
            localStorage.setItem('sentinel_token', access_token);
            set({ user, token: access_token, authStatus: 'AUTHENTICATED' });
            return true;
        } catch (err) {
            throw new Error(err.response?.data?.detail || "Registration Failed");
        }
    },

    logout: () => {
        localStorage.removeItem('sentinel_token');
        set({ user: null, token: null, authStatus: 'UNAUTHENTICATED' });
        window.location.href = '/login';
    },

    validateIdentity: async () => {
        const token = localStorage.getItem('sentinel_token');
        if (!token) {
            set({ authStatus: 'UNAUTHENTICATED', user: null });
            return;
        }
        try {
            const res = await systemApi.getMe();
            set({ user: res.data, authStatus: 'AUTHENTICATED' });
        } catch (err) {
            localStorage.removeItem('sentinel_token');
            set({ user: null, authStatus: 'UNAUTHENTICATED' });
        }
    },

    // Data Actions
    fetchStatus: async () => {
        try {
            const res = await systemApi.getStatus();
            set({ systemStats: res.data });
        } catch (err) {
            console.error("Failed to fetch system status", err);
        }
    },

    fetchAlerts: async () => {
        try {
            const res = await alertApi.list();
            set({ alerts: res.data });
        } catch (err) {
            console.error("Failed to fetch alerts", err);
        }
    },

    fetchCases: async () => {
        try {
            const res = await caseApi.list();
            set({ cases: res.data || [] });
        } catch (err) {
            console.error("Failed to fetch cases", err);
        }
    },

    fetchTrend: async () => {
        try {
            // Use systemApi to fetch trend data
            const res = await systemApi.getTrend();
            set({ trendData: res.data });
        } catch (err) {
            console.error("Failed to fetch trend", err);
        }
    },

    fetchInstitutionalMessages: async () => {
        const { user } = get();
        if (!user) return;
        try {
            const res = await systemApi.getMessages(user.role);
            set({ institutionalMessages: res.data || [] });
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    },

    // Procedural/Enforcement Actions
    acknowledgeAlert: async (id) => {
        try {
            await alertApi.acknowledge(id);
            await get().invalidateState();
            return true;
        } catch (err) {
            console.error("Failed to acknowledge alert", err);
            throw err;
        }
    },

    resolveAlert: async (id, note, outcome) => {
        try {
            await alertApi.resolve(id, { note, outcome });
            await get().invalidateState();
            return true;
        } catch (err) {
            console.error("Failed to resolve alert", err);
            throw err;
        }
    },

    releasePayment: async (id, note) => {
        try {
            await transactionApi.release(id, { note });
            await get().invalidateState();
            return true;
        } catch (err) {
            console.error("Failed to release payment", err);
            throw err;
        }
    },

    // State Invalidation (Enforces Consistency)
    invalidateState: async () => {
        try {
            const { fetchStatus, fetchAlerts, fetchCases, fetchInstitutionalMessages } = get();
            await Promise.all([
                fetchStatus(),
                fetchAlerts(),
                fetchCases(),
                fetchInstitutionalMessages()
            ]);
        } catch (err) {
            console.error("State invalidation failed", err);
        }
    },

    performSearch: (query) => {
        const { alerts, vendors, tenders } = get();
        if (!query || query.trim() === '') {
            set({ searchResults: [], isSearching: false });
            return;
        }

        set({ isSearching: true });

        // Configuration for Fuse
        const options = {
            keys: ['id', 'vendor_id', 'department', 'description', 'title'],
            threshold: 0.4
        };

        // Combine data sources
        const allData = [
            ...alerts.map(a => ({ ...a, type: 'ALERT', title: `Alert ${a.id}: ${a.vendor_id}` })),
            ...vendors.map(v => ({ ...v, type: 'VENDOR', title: `Vendor: ${v.name}` })),
            // Add other entities as needed
        ];

        const fuse = new Fuse(allData, options);
        const results = fuse.search(query).map(result => result.item);

        set({ searchResults: results, isSearching: false });
    },

    // UI Actions
    pollEvents: async () => {
        try {
            const res = await systemApi.getEvents();
            const newEvents = res.data;
            if (newEvents && newEvents.length > 0) {
                set((state) => ({
                    notifications: [...newEvents, ...state.notifications].slice(0, 50), // Keep last 50
                    unreadNotifications: state.unreadNotifications + newEvents.length
                }));
            }
        } catch (err) {
            // Passive polling, ignore errors to avoid noise
        }
    },

    clearUnread: () => set({ unreadNotifications: 0 }),

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

export default useStore;

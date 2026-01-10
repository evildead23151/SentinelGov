import { create } from 'zustand';
import { systemApi, alertApi, caseApi, vendorApi } from '../api/client';
import Fuse from 'fuse.js';

const useStore = create((set, get) => ({
    user: null,
    authStatus: 'AUTH_LOADING', // AUTH_LOADING, AUTHENTICATED, UNAUTHENTICATED
    token: localStorage.getItem('sentinel_token') || null,
    systemStats: {
        status: "OPERATIONAL",
        secure_layer: true,
        total_transactions: 0,
        funds_monitored: 0,
        risk_exposure: 0,
        active_cases: 0,
        ai_confidence: 98.4,
        model_version: "v1.0"
    },
    trendData: [],
    isSidebarOpen: true,
    notifications: [],
    unreadNotifications: 0,
    alerts: [],
    cases: [],
    vendors: [],
    searchResults: [],
    isSearching: false,

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
            throw new Error(err.response?.data?.detail || "Login Failed");
        }
    },

    register: async (data) => {
        try {
            const res = await systemApi.register(data);
            const { access_token, user } = res.data;
            localStorage.setItem('sentinel_token', access_token);
            set({ user, token: access_token, authStatus: 'AUTHENTICATED' });
            return true;
        } catch (err) {
            set({ authStatus: 'UNAUTHENTICATED' });
            throw new Error(err.response?.data?.detail || "Registration Failed");
        }
    },

    logout: () => {
        localStorage.removeItem('sentinel_token');
        set({ user: null, token: null, authStatus: 'UNAUTHENTICATED' });
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

    // Actions
    fetchStatus: async () => {
        try {
            const res = await systemApi.getStatus();
            set({ systemStats: res.data });
        } catch (err) {
            console.error("Failed to fetch system status", err);
        }
    },

    fetchAlerts: async (severity) => {
        try {
            const res = await alertApi.list(severity);
            set({ alerts: res.data });
        } catch (err) {
            console.error("Failed to fetch alerts", err);
        }
    },

    fetchCases: async () => {
        try {
            const res = await caseApi.list();
            set({ cases: res.data });
        } catch (err) {
            console.error("Failed to fetch cases", err);
        }
    },

    fetchVendors: async () => {
        try {
            const res = await vendorApi.list();
            set({ vendors: res.data });
        } catch (err) {
            console.error("Failed to fetch vendors", err);
        }
    },

    fetchTrend: async () => {
        try {
            const res = await systemApi.getTrend();
            set({ trendData: res.data });
        } catch (err) {
            console.error("Failed to fetch trend", err);
        }
    },

    pollEvents: async () => {
        try {
            const res = await systemApi.getEvents();
            const newEvents = res.data;
            if (newEvents.length > 0) {
                const currentNotifs = get().notifications;
                const latestId = currentNotifs.length > 0 ? currentNotifs[0].id : 0;

                // Filter only new events that we haven't seen in the list
                const filtered = newEvents.filter(e => e.id > latestId);

                if (filtered.length > 0) {
                    const formatted = newEvents.slice(0, 15).map(e => ({
                        id: e.id,
                        type: e.type,
                        title: e.message,
                        time: new Date(e.timestamp).toLocaleTimeString(),
                        isRead: false
                    }));

                    set((state) => ({
                        notifications: formatted,
                        unreadNotifications: state.unreadNotifications + filtered.length
                    }));
                }
            }
        } catch (err) {
            console.error("Polling failed", err);
        }
    },

    clearUnread: () => {
        set({ unreadNotifications: 0 });
    },

    performSearch: (query) => {
        if (!query) {
            set({ searchResults: [], isSearching: false });
            return;
        }

        const { alerts, cases, vendors } = get();
        const data = [
            ...alerts.map(a => ({ ...a, searchType: 'ALERT', display: `Alert: ${a.description || a.invoice_id}` })),
            ...cases.map(c => ({ ...c, searchType: 'CASE', display: `Case: ${c.case_id} - ${c.entity_name}` })),
            ...vendors.map(v => ({ ...v, searchType: 'VENDOR', display: `Vendor: ${v.name} (${v.vendor_id})` }))
        ];

        const fuse = new Fuse(data, {
            keys: ['display', 'vendor_id', 'case_id', 'invoice_id', 'entity_name', 'name'],
            threshold: 0.3
        });

        const results = fuse.search(query).map(r => r.item);
        set({ searchResults: results, isSearching: true });
    },

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    addNotification: (notif) => set((state) => ({
        notifications: [notif, ...state.notifications].slice(0, 5)
    })),
}));

export default useStore;

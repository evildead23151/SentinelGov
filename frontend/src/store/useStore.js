import { create } from 'zustand';

const useStore = create((set) => ({
    user: {
        name: "Agent J. Reynolds",
        clearance: 4,
        badgeId: "CLR-L4-8821"
    },
    systemStatus: "OPERATIONAL",
    isSidebarOpen: true,
    activeBatch: null,
    notifications: [
        { id: 1, type: 'CRITICAL', title: 'Conflict of Interest', time: '2m ago' },
        { id: 2, type: 'WARNING', title: 'Watchlist Activity', time: '14m ago' },
    ],

    setUser: (user) => set({ user }),
    setSystemStatus: (status) => set({ systemStatus: status }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setActiveBatch: (batch) => set({ activeBatch: batch }),
    addNotification: (notif) => set((state) => ({
        notifications: [notif, ...state.notifications].slice(0, 5)
    })),
}));

export default useStore;

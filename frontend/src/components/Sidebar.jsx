import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Database,
    Search,
    Bell,
    FileText,
    Share2,
    ClipboardList,
    Settings,
    Shield,
    Users,
    Building,
    Briefcase,
    List
} from 'lucide-react';
import useStore from '../store/useStore';

const Sidebar = () => {
    const { user, logout } = useStore();

    // STRICT IDENTITY: Filter links based on Role
    const links = [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Data Ingestion', path: '/ingestion', icon: Database },
        { name: 'Governance Center', path: '/governance/detection', icon: Shield },
        { name: 'Detection Center', path: '/detection', icon: Search },
        { name: 'Active Alerts', path: '/alerts', icon: Bell },
        { name: 'Investigations', path: '/cases', icon: Briefcase },
        { name: 'Entity Graph', path: '/graph', icon: Share2 },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Procurement', path: '/procurement', icon: Building },
        { name: 'Transparency', path: '/transparency', icon: List },
        { name: 'Audit Logs', path: '/audit', icon: ClipboardList },
        { name: 'Treasury Dashboard', path: '/finance/dashboard', icon: Building }, // Only visible to Finance
        { name: 'System Status', path: '/settings', icon: Settings },
    ];

    const filteredLinks = links.filter(link => {
        if (!user) return false;

        // Treasury Only
        if (link.path === '/finance/dashboard') {
            return user.role === 'FINANCE_OFFICER' || user.role === 'OVERSIGHT';
        }

        // Investigator Only
        if (['/detection', '/alerts', '/cases', '/graph'].includes(link.path)) {
            return user.role === 'INVESTIGATOR' || user.role === 'OVERSIGHT' || user.role === 'DATA_OFFICER';
        }

        return true; // Common links
    });

    return (
        <div className="w-64 h-screen bg-[#11141b] border-r border-[#1e2530] flex flex-col">
            <div className="p-6 flex items-center space-x-3">
                <Shield className="text-blue-500 w-8 h-8" />
                <span className="font-bold text-xl tracking-tight">GovIntel SOC</span>
            </div>

            <div className="px-4 py-2">
                {user && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg mb-6 border border-white/5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg ${user.role === 'FINANCE_OFFICER' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                            {user.full_name?.[0] || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-[11px] font-black uppercase tracking-tight truncate text-white">{user.full_name || 'Officer'}</div>
                            <div className="text-[9px] font-mono text-slate-500 uppercase truncate">{user.role} // {user.rank}</div>
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-2 space-y-1">
                {filteredLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        <span>{link.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-[#1e2530] space-y-3">

                {/* ROLE TOGGLE FOR DEMO */}
                <div className="bg-[#0a0c10] rounded-lg p-2 border border-[#1e2530]">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Identity</span>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${user?.role === 'FINANCE_OFFICER' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                    </div>
                    <div className="flex bg-[#11141b] rounded p-1 border border-[#1e2530]">
                        <button
                            onClick={() => useStore.getState().switchRole('INVESTIGATOR')}
                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wide rounded transition-all ${user?.role !== 'FINANCE_OFFICER' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            Investigator
                        </button>
                        <button
                            onClick={() => useStore.getState().switchRole('FINANCE_OFFICER')}
                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wide rounded transition-all ${user?.role === 'FINANCE_OFFICER' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            Finance
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span className="font-mono text-[9px]">SECURE_LINK_ESTABLISHED</span>
                    <Shield className="w-3 h-3 text-green-500" />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

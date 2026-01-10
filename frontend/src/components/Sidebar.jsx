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
    Briefcase,
    Users
} from 'lucide-react';
import useStore from '../store/useStore';

const Sidebar = () => {
    const { user } = useStore();

    const links = [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Data Ingestion', path: '/ingestion', icon: Database },
        { name: 'Governance Center', path: '/governance/detection', icon: Shield },
        { name: 'Detection Center', path: '/detection', icon: Search },
        { name: 'Active Alerts', path: '/alerts', icon: Bell },
        { name: 'Investigations', path: '/cases', icon: Briefcase },
        { name: 'Entity Graph', path: '/graph', icon: Share2 },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Procurement', path: '/procurement', icon: Building }, // New link
        { name: 'Transparency', path: '/transparency', icon: List }, // New link
        { name: 'Audit Logs', path: '/audit', icon: ClipboardList },
        { name: 'System Status', path: '/settings', icon: Settings },
    ];

    return (
        <div className="w-64 h-screen bg-[#11141b] border-r border-[#1e2530] flex flex-col">
            <div className="p-6 flex items-center space-x-3">
                <Shield className="text-blue-500 w-8 h-8" />
                <span className="font-bold text-xl tracking-tight">GovIntel SOC</span>
            </div>

            <div className="px-4 py-2">
                {user && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg mb-6 border border-white/5">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                            {user.full_name?.[0] || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-[11px] font-black uppercase tracking-tight truncate text-white">{user.full_name || 'Unknown Officer'}</div>
                            <div className="text-[9px] font-mono text-slate-500 uppercase truncate">{user.rank || 'N/A'} // {user.gov_id || 'PENDING'}</div>
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-2 space-y-1">
                {links.map((link) => (
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

            <div className="p-4 border-t border-[#1e2530]">
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>SECURED CONNECTION</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

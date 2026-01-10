import React from 'react';
import { Shield, Bell, User, Search, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';
import { useLocation } from 'react-router-dom';

const Header = () => {
    const { user } = useStore();
    const location = useLocation();

    // Map path to breadcrumb label
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbBase = pathSegments[0] || 'Overview';

    return (
        <header className="h-16 bg-[#0a0a0a] border-b border-white/10 flex justify-between items-center px-8 z-10 sticky top-0">
            {/* Left: Breadcrumbs / Page Context */}
            <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-amber-500" />
                <div className="h-4 w-[1px] bg-white/20 mx-1"></div>
                <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <span className="hover:text-white cursor-pointer transition-colors">GovIntel SOC</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white">{breadcrumbBase.replace('-', ' ')}</span>
                </div>
            </div>

            {/* Right: Search + Notifications + Profile */}
            <div className="flex items-center space-x-6">
                {/* Visual Search Bar (Mock) */}
                <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5 group focus-within:border-amber-500/50 transition-all">
                    <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Fuzzy search entities..."
                        className="bg-transparent border-none outline-none text-xs text-slate-300 w-48 placeholder:text-slate-600"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-black animate-pulse"></span>
                </button>

                {/* Profile Widget */}
                <div className="flex items-center space-x-3 pl-6 border-l border-white/10">
                    <div className="text-right">
                        <div className="text-xs font-black text-white uppercase tracking-tighter">
                            {user?.full_name || 'Guest User'}
                        </div>
                        <div className="text-[9px] font-bold text-amber-500 uppercase tracking-widest opacity-80">
                            {user?.rank || 'Level 1'} // {user?.department || 'Internal'}
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 shadow-inner">
                        <User className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

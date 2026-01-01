import React from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, ShieldCheck } from 'lucide-react';
import useStore from '../store/useStore';

const Layout = ({ children }) => {
    const { systemStatus } = useStore();

    return (
        <div className="flex bg-[#0a0c10] text-slate-200 min-h-screen font-inter">
            <Sidebar />

            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-[#1e2530] bg-[#11141b]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-bold tracking-tight">National Procurement Integrity Shield</h2>
                        <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] uppercase font-bold text-green-500 tracking-widest leading-none mt-[1px]">
                                {systemStatus}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search entity, hash, or case..."
                                className="bg-[#1e2530] border border-[#334155] rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64 transition-all"
                            />
                            <Search className="absolute left-3 top-2 w-4 h-4 text-slate-500" />
                        </div>

                        <button className="relative text-slate-400 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#11141b] rounded-full"></span>
                        </button>

                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded text-blue-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tighter">Secured</span>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto p-8 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;

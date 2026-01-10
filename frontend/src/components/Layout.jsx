import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import {
    Bell, Search, ShieldCheck, CornerDownRight, ExternalLink,
    X, AlertTriangle, Briefcase, Database, Info, Activity, FileText, ChevronRight
} from 'lucide-react';
import useStore from '../store/useStore';
import { useNavigate, Link } from 'react-router-dom';
import GovAIChat from './GovAIChat';

const Layout = ({ children }) => {
    const {
        systemStats,
        notifications,
        unreadNotifications,
        clearUnread,
        searchResults,
        isSearching,
        performSearch,
        pollEvents,
        fetchStatus,
        logout
    } = useStore();

    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const searchRef = useRef(null);

    // Initial Fetch & Polling
    useEffect(() => {
        fetchStatus();
        const poll = setInterval(() => {
            pollEvents();
            fetchStatus();
        }, 10000); // Spec v2.0 Poll every 10-15s
        return () => clearInterval(poll);
    }, [fetchStatus, pollEvents]);

    // Search Logic
    useEffect(() => {
        performSearch(searchQuery);
    }, [searchQuery, performSearch]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (result) => {
        setShowResults(false);
        setSearchQuery("");
        if (result.searchType === 'VENDOR') navigate(`/detection?vendor=${result.id || result.vendor_id}`);
        else if (result.searchType === 'ALERT') navigate(`/detection?id=${result.id}`);
        else if (result.searchType === 'CASE') navigate(`/case/${result.id}`);
    };

    const toggleNotif = () => {
        if (!isNotifOpen) clearUnread();
        setIsNotifOpen(!isNotifOpen);
    };

    return (
        <div className="flex bg-[#0a0c10] text-slate-200 min-h-screen font-inter relative overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-[#1e2530] bg-[#11141b]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center space-x-4">
                        <Link to="/dashboard" className="flex items-center space-x-3 group outline-none">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-black group-hover:scale-110 transition-transform">S</div>
                            <h2 className="text-xl font-bold tracking-tight group-hover:text-blue-400 transition-colors">GovIntel SOC</h2>
                        </Link>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${systemStats.status === 'OPERATIONAL'
                            ? 'bg-green-500/10 border-green-500/20 text-green-500'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                            }`}>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${systemStats.status === 'OPERATIONAL' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                            <span className="text-[10px] uppercase font-bold tracking-widest">{systemStats.status}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* SEARCH BAR (Spec v2.0 - Non-blanking overlay) */}
                        <div className="relative" ref={searchRef}>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowResults(true);
                                    }}
                                    onFocus={() => setShowResults(true)}
                                    placeholder="Fuzzy search entities, cases..."
                                    className="bg-[#1e2530] border border-[#334155] rounded-xl py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-64 transition-all focus:w-80"
                                />
                                <Search className="absolute left-3 top-2 w-4 h-4 text-slate-500" />
                            </div>

                            {showResults && searchQuery && (
                                <div className="absolute top-12 right-0 w-[450px] bg-[#11141b] border border-[#1e2530] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-3 py-2 border-b border-[#1e2530] flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intelligence Index Lookup</span>
                                        <span className="text-[9px] text-blue-500 font-mono italic">Fuse.js Algorithm Active</span>
                                    </div>
                                    <div className="max-h-[400px] overflow-auto custom-scrollbar mt-1">
                                        {searchResults.length === 0 ? (
                                            <div className="p-12 text-center">
                                                <div className="bg-slate-800/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Info className="w-6 h-6 text-slate-600" />
                                                </div>
                                                <p className="text-xs text-slate-500">No matching entities found in current records.</p>
                                            </div>
                                        ) : (
                                            searchResults.map((result, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleResultClick(result)}
                                                    className="w-full text-left p-3 hover:bg-white/5 rounded-lg flex items-center space-x-4 group transition-colors border border-transparent hover:border-white/10"
                                                >
                                                    <div className={`p-2 rounded bg-opacity-10 shrink-0 ${result.searchType === 'ALERT' ? 'bg-red-500 text-red-500' :
                                                        result.searchType === 'CASE' ? 'bg-amber-500 text-amber-500' :
                                                            'bg-blue-500 text-blue-500'
                                                        }`}>
                                                        {result.searchType === 'ALERT' ? <AlertTriangle className="w-4 h-4" /> :
                                                            result.searchType === 'CASE' ? <Briefcase className="w-4 h-4" /> :
                                                                <Database className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs font-bold text-slate-200 truncate group-hover:text-blue-400">{result.display}</span>
                                                            <div className="flex items-center px-1.5 py-0.5 rounded bg-white/5 border border-white/10 shrink-0">
                                                                <span className="text-[8px] font-black uppercase text-slate-400">{result.searchType}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 mt-1 flex items-center">
                                                            <span className="font-mono text-[9px] bg-slate-800/50 px-1 rounded mr-2">ID: {result.vendor_id || result.case_id || result.invoice_id}</span>
                                                            <ChevronRight className="w-2 h-2 mr-1" />
                                                            <span>Navigate to record</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notification Bell (Spec v2.0 Slide Panel) */}
                        <button
                            onClick={toggleNotif}
                            className={`relative p-2 rounded-lg transition-all ${isNotifOpen ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                        >
                            <Bell className={`w-5 h-5 ${unreadNotifications > 0 ? 'animate-bounce' : ''}`} />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-600 text-white text-[10px] font-black border-2 border-[#11141b] rounded-full px-0.5">
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </span>
                            )}
                        </button>

                        <div className={`flex items-center space-x-2 px-3 py-1.5 border rounded transition-colors ${systemStats.secure_layer
                            ? 'bg-blue-600/10 border-blue-600/20 text-blue-400'
                            : 'bg-red-600/10 border-red-600/20 text-red-500'
                            }`}>
                            <ShieldCheck className="w-4 h-4 mb-0.5" />
                            <span className="text-[11px] font-black uppercase tracking-tight">Secured Layer active</span>
                            {!systemStats.secure_layer && (
                                <div className="absolute top-14 right-8 bg-red-900 border border-red-500 p-2 rounded text-[10px] z-50">
                                    CRITICAL: Integrity layer offline!
                                </div>
                            )}
                        </div>

                        <button
                            onClick={logout}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                            title="Terminate Secure Session"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto p-8 custom-scrollbar">
                    {children}
                </main>
            </div>

            {/* NOTIFICATION SLIDE PANEL (Spec v2.0) */}
            <div className={`fixed top-0 right-0 h-full w-96 bg-[#11141b] border-l border-[#1e2530] shadow-2xl transition-transform duration-500 ease-in-out z-50 ${isNotifOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="h-16 flex items-center justify-between px-6 border-b border-[#1e2530] bg-[#1a1f28]">
                        <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Intelligence Feed</h3>
                        </div>
                        <button onClick={toggleNotif} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600 p-8 text-center">
                                <ShieldCheck className="w-12 h-12 mb-4 opacity-10" />
                                <p className="text-sm">No signals detected on secure channel.</p>
                                <p className="text-[10px] mt-2 font-mono uppercase tracking-tighter">System Integrity: 100%</p>
                            </div>
                        ) : (
                            notifications.map((n, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-xl border transition-all animate-in slide-in-from-right-4 duration-300 flex space-x-3 ${n.type === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' :
                                        n.type === 'ANOMALY' ? 'bg-amber-500/5 border-amber-500/20' :
                                            n.type === 'INGEST' ? 'bg-blue-500/5 border-blue-500/20' :
                                                'bg-slate-800/30 border-slate-700/50'
                                        }`}
                                >
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.type === 'CRITICAL' ? 'bg-red-500' :
                                        n.type === 'ANOMALY' ? 'bg-amber-500' :
                                            n.type === 'INGEST' ? 'bg-blue-500' :
                                                'bg-green-500'
                                        }`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${n.type === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                                n.type === 'ANOMALY' ? 'bg-amber-500/20 text-amber-400' :
                                                    n.type === 'INGEST' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-green-500/20 text-green-400'
                                                }`}>
                                                {n.type} SIGNAL
                                            </span>
                                            <span className="text-[9px] font-mono text-slate-600">{n.time}</span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                                            {n.title}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-[#1e2530] bg-[#1a1f28]">
                        <button
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors uppercase tracking-widest flex items-center justify-center space-x-2"
                        >
                            <FileText className="w-3 h-3" />
                            <span>Export Session Logs</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Backdrop for Notif Panel */}
            {isNotifOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                    onClick={toggleNotif}
                ></div>
            )}
            <GovAIChat />
        </div>
    );
};

export default Layout;

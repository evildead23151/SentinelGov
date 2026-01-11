import React, { useEffect, useState } from 'react';
import {
    LayoutDashboard, DollarSign, Lock, AlertTriangle, CheckCircle,
    XCircle, Clock, FileText, ArrowRight, RefreshCcw, Bell,
    TrendingUp, Activity, ShieldCheck, Banknote, Unlock, HelpCircle
} from 'lucide-react';
import useStore from '../store/useStore';
import { systemApi, transactionApi } from '../api/client';

const FinanceDashboard = () => {
    const { user, fetchInstitutionalMessages, institutionalMessages, releasePayment } = useStore();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [releaseNote, setReleaseNote] = useState('');
    const [selectedTx, setSelectedTx] = useState(null);
    const [isReleaseModalOpen, setReleaseModalOpen] = useState(false);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const res = await systemApi.getFinanceDashboard();
            setDashboardData(res.data);
            await fetchInstitutionalMessages();
            setLoading(false);
        } catch (err) {
            console.error("Failed to load Finance Dashboard", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRelease = async () => {
        try {
            await releasePayment(selectedTx.id, releaseNote);
            setReleaseModalOpen(false);
            setReleaseNote('');
            setSelectedTx(null);
            loadData();
            alert("DISBURSEMENT AUTHORIZED: Payment successfully released to vendor.");
        } catch (err) {
            alert("Procedural Block: " + (err.response?.data?.detail || "Action Failed"));
        }
    };

    const handleBlock = async (id) => {
        if (!confirm("Permanent Block: Are you sure you want to blacklist this disbursement reference?")) return;
        try {
            await transactionApi.block(id);
            loadData();
        } catch (err) {
            alert("Error: " + (err.response?.data?.detail || "Action Failed"));
        }
    };

    if (loading || !dashboardData) return (
        <div className="flex h-screen items-center justify-center bg-[#050505]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
    );

    return (
        <div className="p-8 space-y-8 bg-[#050505] min-h-screen text-slate-300 font-sans border-t-4 border-amber-600 animate-in fade-in duration-700">

            {/* Release Modal */}
            {isReleaseModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
                    <div className="bg-[#111827] border-2 border-amber-500 p-8 rounded-lg max-w-lg w-full shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Banknote className="text-amber-500" />
                            Disbursement Authorization
                        </h2>

                        <div className="bg-black/40 p-4 rounded border border-gray-800 mb-6 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 uppercase">Vendor Reference</span>
                                <span className="text-white font-mono">{selectedTx.vendor_id}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500 uppercase">Amount</span>
                                <span className="text-amber-500 font-bold">₹{selectedTx.amount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Treasury Release Note</label>
                            <textarea
                                value={releaseNote}
                                onChange={(e) => setReleaseNote(e.target.value)}
                                placeholder="State reason for disbursement release..."
                                className="w-full bg-black border border-gray-800 rounded p-3 text-white h-32 outline-none focus:border-amber-500 resize-none font-sans"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => setReleaseModalOpen(false)} className="py-3 bg-gray-900 text-white font-bold rounded">CANCEL</button>
                            <button onClick={handleRelease} className="py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded uppercase tracking-widest text-xs">Confirm Disbursement</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center border-b border-amber-900/30 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center space-x-3">
                        <Banknote className="w-8 h-8 text-amber-500" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">Treasury Control Plane</span>
                    </h1>
                    <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-0.5 bg-amber-900/30 border border-amber-700/50 rounded text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                            Auth: {user?.gov_id}
                        </span>
                        <p className="text-xs font-mono text-slate-500 uppercase">
                            State: Operational | Mode: Secured_Disbursement
                        </p>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#0a0a0a] p-6 rounded-xl border border-amber-900/20 relative overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-amber-700 tracking-widest mb-1">Total Liability frozen</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter">
                        ₹{(dashboardData.kpis.payments_on_hold / 10000000).toFixed(2)} Cr
                    </h3>
                    <div className="mt-4 text-[10px] text-slate-500 font-mono">
                        Awaiting investigative clearance
                    </div>
                </div>

                <div className="bg-[#0a0a0a] p-6 rounded-xl border border-amber-900/20">
                    <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-widest mb-1">Actions Required</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter">
                        {dashboardData.kpis.pending_actions}
                    </h3>
                    <div className="mt-4 text-[10px] text-slate-500 font-mono italic">
                        Manual review mandatory
                    </div>
                </div>

                <div className="bg-[#0a0a0a] p-6 rounded-xl border border-amber-900/20 col-span-2 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest mb-2">Institutional Communications</p>
                        <div className="flex items-center space-x-2">
                            <Bell className="w-5 h-5 text-amber-500" />
                            <span className="text-xl font-bold text-white">{institutionalMessages.length} Messages</span>
                        </div>
                    </div>
                    <div className="h-10 w-[1px] bg-white/5 mx-6" />
                    <div className="flex-1">
                        <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                            {institutionalMessages[0]?.message || "No directive from Investigation SOC."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-500" />
                            Frozen Disbursements Queue
                        </h3>
                    </div>

                    <div className="bg-[#0a0a0a] rounded-xl border border-amber-900/20 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-amber-950/10 text-[10px] uppercase text-amber-600 font-bold tracking-wider">
                                <tr>
                                    <th className="p-4">Ref</th>
                                    <th className="p-4">Beneficiary</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Indicator</th>
                                    <th className="p-4 text-right">Procedural Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-mono">
                                {dashboardData.holds.length === 0 ? (
                                    <tr><td colSpan="5" className="p-20 text-center opacity-20 italic">No frozen payments</td></tr>
                                ) : (
                                    dashboardData.holds.map(tx => (
                                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-slate-500">TX-{tx.id}</td>
                                            <td className="p-4 font-bold text-white">{tx.vendor_id}</td>
                                            <td className="p-4 text-amber-400">₹{tx.amount.toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className="bg-red-950/20 text-red-500 px-2 py-0.5 rounded border border-red-900/30 text-[9px] uppercase font-black">
                                                    {tx.hold_reason}
                                                </span>
                                            </td>
                                            <td className="p-4 flex justify-end space-x-2">
                                                <button
                                                    onClick={() => { setSelectedTx(tx); setReleaseModalOpen(true); }}
                                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold uppercase tracking-wider text-[10px] transition shadow-lg shadow-amber-900/20 flex items-center gap-2"
                                                >
                                                    <Unlock size={12} />
                                                    Release
                                                </button>
                                                <button
                                                    onClick={() => handleBlock(tx.id)}
                                                    className="px-4 py-2 bg-black border border-red-900/50 text-red-500 rounded font-bold uppercase tracking-wider text-[10px] hover:bg-red-950 transition"
                                                >
                                                    <XCircle size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Rail */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Authority Feed
                    </h3>
                    <div className="bg-[#0a0a0a] rounded-xl border border-white/5 h-[600px] overflow-y-auto custom-scrollbar p-4 space-y-4">
                        {institutionalMessages.map((msg, i) => (
                            <div key={i} className={`p-4 rounded-lg border-l-2 ${msg.type.includes('RESOLVED') ? 'bg-emerald-500/5 border-emerald-500' : 'bg-red-500/5 border-red-500'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${msg.type.includes('RESOLVED') ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                        {msg.type}
                                    </span>
                                    <span className="text-[9px] font-mono text-gray-600">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-xs text-gray-300 mb-3">{msg.message}</p>
                                <div className="text-[9px] font-mono text-gray-600 uppercase pt-2 border-t border-white/5">
                                    AUTH_REF: {msg.sender_govid}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;

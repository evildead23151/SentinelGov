import React, { useState, useEffect } from 'react';
import {
    Shield, AlertTriangle, CheckCircle, Clock, Info,
    ArrowRight, MapPin, Search, Filter, Tag,
    ChevronRight, Briefcase, User, Calendar, ExternalLink,
    Mail, Phone, FileText, Target, Zap, MessageSquare, X, Scale, Plus, AlertCircle, Lock
} from 'lucide-react';
import { alertApi } from '../api/client';
import useStore from '../store/useStore';

const DetectionCenter = () => {
    const [alerts, setAlerts] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resolutionNote, setResolutionNote] = useState('');
    const [resolutionOutcome, setResolutionOutcome] = useState('CLEARED');
    const [isResolveModalOpen, setResolveModalOpen] = useState(false);

    const { user, invalidateState } = useStore();

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await alertApi.list();
            setAlerts(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Fetch Error:', error);
            setLoading(false);
        }
    };

    const handleAcknowledge = async (id) => {
        try {
            await alertApi.acknowledge(id);
            await invalidateState();
            fetchAlerts();
            setSelectedAlert(prev => ({ ...prev, status: 'ACKNOWLEDGED' }));
        } catch (error) {
            alert('Enforcement Failed: ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleResolve = async () => {
        if (!resolutionNote) return alert("Resolution note required for audit log.");
        try {
            await alertApi.resolve(selectedAlert.id, {
                note: resolutionNote,
                outcome: resolutionOutcome
            });
            setResolveModalOpen(false);
            setResolutionNote('');
            await invalidateState();
            fetchAlerts();
            setSelectedAlert(null);
        } catch (error) {
            alert('Resolution Failed: ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleExportBrief = async (id) => {
        try {
            const response = await alertApi.exportBrief(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sentinel_brief_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Export Failed');
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'ACKNOWLEDGED': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)] animate-in fade-in duration-500">

            {/* Resolve Modal */}
            {isResolveModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
                    <div className="bg-[#111827] border-2 border-emerald-500 p-8 rounded-lg max-w-lg w-full shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Scale className="text-emerald-500" />
                            Final Case Resolution
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Resolution Outcome</label>
                                <select
                                    value={resolutionOutcome}
                                    onChange={(e) => setResolutionOutcome(e.target.value)}
                                    className="w-full bg-black border border-gray-800 rounded p-3 text-white outline-none focus:border-emerald-500"
                                >
                                    <option value="CLEARED">CLEARED (False Positive / Procedural OK)</option>
                                    <option value="FRAUD_CONFIRMED">FRAUD CONFIRMED (Departmental Action Started)</option>
                                    <option value="UNDER_INVESTIGATION">REFER TO ANTI-CORRUPTION BRANCH</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Resolution Note (Logged to Audit)</label>
                                <textarea
                                    value={resolutionNote}
                                    onChange={(e) => setResolutionNote(e.target.value)}
                                    placeholder="Provide forensic justification for this resolution..."
                                    className="w-full bg-black border border-gray-800 rounded p-3 text-white h-32 outline-none focus:border-emerald-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => setResolveModalOpen(false)} className="py-3 bg-gray-900 text-white font-bold rounded">CANCEL</button>
                            <button onClick={handleResolve} className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded">AUTHORIZE RESOLUTION</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert List */}
            <div className="col-span-8 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold flex items-center gap-3 text-white">
                        <Shield className="text-blue-500" />
                        Forensic Detection Center
                    </h1>
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10">
                        Active Monitoring: Delhi/Procurement
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-900 rounded-lg border border-gray-800" />)}
                        </div>
                    ) : alerts.map(alert => (
                        <div
                            key={alert.id}
                            onClick={() => setSelectedAlert(alert)}
                            className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${selectedAlert?.id === alert.id ? 'bg-blue-500/5 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-[#111827] border-transparent hover:bg-gray-800/50'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${getStatusStyles(alert.status)}`}>
                                            {alert.status}
                                        </span>
                                        <span className="text-xs font-bold text-gray-300">TX-{alert.transaction_id}</span>
                                        <span className="text-xs text-gray-500">{alert.department}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-100">{alert.primary_trigger}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-1">{alert.explanation}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-red-500">{alert.risk_score}</div>
                                    <div className="text-[10px] text-gray-600 font-mono tracking-tighter">SCORE_INDICATOR</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Insight Panel */}
            <div className="col-span-4 bg-[#111827] border border-white/5 rounded-xl p-6 overflow-y-auto">
                {selectedAlert ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Incident Brief</span>
                                <h2 className="text-lg font-bold text-white mt-1">Alert #{selectedAlert.id}</h2>
                            </div>
                            <button onClick={() => handleExportBrief(selectedAlert.id)} className="bg-gray-800 p-2 rounded hover:bg-gray-700 transition-colors">
                                <FileText size={16} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                    <Zap size={10} className="text-amber-500" />
                                    AI Forensic Narrative
                                </h4>
                                <p className="text-sm text-gray-300 leading-relaxed italic">
                                    "{selectedAlert.explanation}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black/40 p-3 rounded border border-gray-800">
                                    <span className="text-[9px] text-gray-500 block uppercase mb-1">Risk Band</span>
                                    <span className="text-sm font-bold text-red-400">{selectedAlert.risk_band}</span>
                                </div>
                                <div className="bg-black/40 p-3 rounded border border-gray-800">
                                    <span className="text-[9px] text-gray-500 block uppercase mb-1">Exposure</span>
                                    <span className="text-sm font-bold text-emerald-400">₹{(selectedAlert.amount / 10000000).toFixed(2)} Cr</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-800 space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase">Procedural Enforcement</h4>

                                {selectedAlert.status === 'OPEN' && (
                                    <button
                                        onClick={() => handleAcknowledge(selectedAlert.id)}
                                        className="w-full bg-[#1f2937] hover:bg-[#374151] text-white py-3 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all"
                                    >
                                        <CheckCircle size={14} />
                                        ACKNOWLEDGE FOR REVIEW
                                    </button>
                                )}

                                {selectedAlert.status === 'ACKNOWLEDGED' && (
                                    <button
                                        onClick={() => setResolveModalOpen(true)}
                                        className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-3 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                    >
                                        <Scale size={14} />
                                        RESOLVE CASE / AUTHORIZE PAYMENT
                                    </button>
                                )}

                                {selectedAlert.status === 'RESOLVED' && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg text-center">
                                        <CheckCircle className="text-emerald-500 mx-auto mb-2" size={24} />
                                        <div className="text-xs font-bold text-emerald-500 uppercase">Case Resolved</div>
                                        <div className="text-[10px] text-gray-500 mt-1">Pending Treasury Release</div>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-600 uppercase bg-gray-900/50 p-2 rounded">
                                    <Lock size={10} />
                                    Accountant: {user?.gov_id} | SOC: L3
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                        <Target size={48} className="text-gray-700 mb-4" />
                        <h3 className="text-sm font-bold text-gray-500">Select indicator for forensic drilldown</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetectionCenter;

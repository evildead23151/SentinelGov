import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Clock, CheckCircle, Scale, MessageSquare, User, Users, ChevronRight, Play, Filter, Plus, FileText, Search, X } from 'lucide-react';
import axios from 'axios';
import { alertApi, caseApi } from '../api/client';

const DetectionCenter = () => {
    const [alerts, setAlerts] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [committeeNote, setCommitteeNote] = useState('');
    const [loading, setLoading] = useState(true);

    // Filters & Modals
    const [filters, setFilters] = useState({ department: '', vendor_id: '' });
    const [isCaseModalOpen, setCaseModalOpen] = useState(false);
    const [caseForm, setCaseForm] = useState({ title: '', description: '' });

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const fetchData = async () => {
        try {
            const [alertsRes, usersRes] = await Promise.all([
                alertApi.list(filters),
                axios.get('http://localhost:8000/api/governance/users')
            ]);
            setAlerts(alertsRes.data);
            setUsers(usersRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Fetch Error:', error);
            setLoading(false);
        }
    };

    const handleAcknowledge = async (alertId) => {
        console.log("Acknowledging Alert:", alertId);
        try {
            await alertApi.acknowledge(alertId);
            fetchData();
        } catch (error) {
            console.error("Acknowledge Error:", error);
            alert(`Acknowledge Failed: ${error.response?.data?.detail || error.message}`);
        }
    };

    const handleCreateCase = async () => {
        console.log("Creating Case for:", selectedAlert?.id);
        try {
            await caseApi.create({
                title: caseForm.title,
                department: selectedAlert.department,
                description: caseForm.description,
                initial_alert_ids: [selectedAlert.id]
            });
            setCaseModalOpen(false);
            setCaseForm({ title: '', description: '' });
            fetchData();
            setSelectedAlert(null);
        } catch (error) {
            console.error("Case Create Error:", error);
            alert(`Case Creation Failed: ${error.message}`);
        }
    };

    const handleEscalate = async (alertId) => {
        console.log("Escalating Alert:", alertId);
        // Fallback for safety
        const id = alertId || selectedAlert?.id;
        if (!id) return alert("No alert selected");

        try {
            await alertApi.escalate(id);
            alert('Alert Escalated to OVERSIGHT.');
            fetchData();
        } catch (error) {
            console.error("Escalation Error:", error);
            alert(`Escalation Failed: ${error.response?.data?.detail || error.message}`);
        }
    };

    const handleExportBrief = async (alertId) => {
        console.log("Exporting Brief for:", alertId);
        const id = alertId || selectedAlert?.id;
        if (!id) return alert("No alert selected");

        try {
            const response = await alertApi.exportBrief(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sentinelgov_brief_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export Error:", error);
            alert(`Export Failed: ${error.response?.data?.detail || error.message}`);
        }
    };

    const handleAssignCommittee = async (alertId) => {
        try {
            await alertApi.assignCommittee(alertId, [users[0]?.id, users[1]?.id], committeeNote);
            fetchData();
            setCommitteeNote('');
        } catch (error) {
            alert('Assignment Failed');
        }
    };

    const handleResolve = async (alertId, resolution) => {
        try {
            await alertApi.resolve(alertId, resolution, "Procedural integrity check completed.");
            fetchData();
        } catch (error) {
            alert('Resolution Failed');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'UNDER_REVIEW': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'ESCALATED': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
            case 'CLOSED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)] animate-in fade-in zoom-in duration-500 relative">

            {/* Case Creation Modal */}
            {isCaseModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="panel w-full max-w-lg border-2 border-blue-500 p-8 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center space-x-3 text-white">
                                <FileText className="w-6 h-6 text-blue-500" />
                                <span>Initialize Investigation Case</span>
                            </h2>
                            <button onClick={() => setCaseModalOpen(false)}><X className="w-5 h-5 text-slate-500 hover:text-white" /></button>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Case Title</label>
                                <input
                                    type="text"
                                    value={caseForm.title}
                                    onChange={e => setCaseForm({ ...caseForm, title: e.target.value })}
                                    placeholder="e.g. Procurement Anomaly detected in Q4"
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Description / Hypothesis</label>
                                <textarea
                                    value={caseForm.description}
                                    onChange={e => setCaseForm({ ...caseForm, description: e.target.value })}
                                    placeholder="Initial forensic notes..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none h-24"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleCreateCase}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest rounded transition-all"
                        >
                            Confirm & Create Case File
                        </button>
                    </div>
                </div>
            )}

            {/* Alert List */}
            <div className="col-span-8 flex flex-col h-full">
                {/* Header & Filters */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <h2 className="text-xl font-bold flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-blue-500" />
                        <span>Enforcement Control Plane</span>
                    </h2>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="w-3 h-3 absolute left-3 top-2.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Filter Dept..."
                                value={filters.department}
                                onChange={e => setFilters({ ...filters, department: e.target.value })}
                                className="bg-slate-900 border border-slate-700 rounded-full py-1.5 pl-8 pr-4 text-xs text-white w-32 focus:w-48 transition-all focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="w-3 h-3 absolute left-3 top-2.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Filter Vendor..."
                                value={filters.vendor_id}
                                onChange={e => setFilters({ ...filters, vendor_id: e.target.value })}
                                className="bg-slate-900 border border-slate-700 rounded-full py-1.5 pl-8 pr-4 text-xs text-white w-32 focus:w-48 transition-all focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                onClick={() => setSelectedAlert(alert)}
                                className={`panel border-l-4 transition-all cursor-pointer ${selectedAlert?.id === alert.id ? 'border-blue-500 bg-slate-800/60' : 'border-transparent hover:bg-slate-800/40'} flex items-center justify-between`}
                            >
                                <div className="flex items-start space-x-6">
                                    <div className={`p-2 rounded ${alert.risk_score >= 80 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${getStatusColor(alert.status)}`}>
                                                {alert.status}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-500">#{alert.id}</span>
                                            <h3 className="text-sm font-bold text-slate-200">{alert.department}</h3>
                                        </div>
                                        <p className="text-xs text-slate-400">Vendor: {alert.vendor_id} | Amount: ${alert.amount?.toLocaleString()}</p>
                                        <p className="text-[11px] text-slate-500 line-clamp-1 italic">"{alert.explanation}"</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end space-y-2">
                                    <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-1">
                                        <Clock className="w-3 h-3" />
                                        <span>Deadline: {new Date(alert.deadline).toLocaleDateString()}</span>
                                    </div>
                                    {alert.payment_status === "ON_HOLD" && (
                                        <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full animate-pulse">
                                            PAYMENT ON HOLD
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Governance Action Panel */}
            <div className="col-span-4 bg-slate-900/50 border border-slate-800 rounded-xl p-6 overflow-y-auto">
                {selectedAlert ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Procedural Review</span>
                                <h2 className="text-lg font-bold text-slate-100 mt-1">{selectedAlert.department} Violation</h2>
                            </div>
                            <button onClick={() => handleExportBrief(selectedAlert.id)} className="text-xs text-slate-500 hover:text-white flex items-center space-x-1 cursor-pointer z-50">
                                <FileText className="w-3 h-3" /> <span>PDF</span>
                            </button>
                        </div>

                        <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-2">
                                <MessageSquare className="w-3 h-3" />
                                <span className="text-slate-400">AI Forensic Summary</span>
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                {selectedAlert.explanation}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/30 p-3 rounded text-center">
                                <span className="text-[9px] text-slate-500 block mb-1">Risk Intensity</span>
                                <span className="text-lg font-black text-red-500">{selectedAlert.risk_score}</span>
                            </div>
                            <div className="bg-slate-800/30 p-3 rounded text-center">
                                <span className="text-[9px] text-slate-500 block mb-1">Escalation Lv.</span>
                                <span className="text-lg font-black text-amber-500">{selectedAlert.escalation_level}</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-800">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase">Enforcement Actions</h4>

                            {selectedAlert.status === 'OPEN' && (
                                <button
                                    onClick={() => handleAcknowledge(selectedAlert.id)}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-3 rounded transition-all flex items-center justify-center space-x-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>ACKNOWLEDGE ALERT</span>
                                </button>
                            )}

                            {(selectedAlert.status === 'UNDER_REVIEW' || selectedAlert.status === 'ESCALATED') && (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setCaseModalOpen(true)}
                                        className="w-full bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold py-3 rounded transition-all flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(147,51,234,0.3)] animate-pulse"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>CREATE INVESTIGATION CASE</span>
                                    </button>
                                    <button
                                        onClick={() => handleEscalate(selectedAlert.id)}
                                        className="w-full bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold py-3 rounded transition-all flex items-center justify-center space-x-2"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                        <span>ESCALATE TO OVERSIGHT</span>
                                    </button>
                                </div>
                            )}

                            {selectedAlert.status === 'CLOSED' && (
                                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded text-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                                    <span className="text-[11px] font-bold text-emerald-500">ENFORCEMENT ACTION COMPLETE</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <Scale className="w-12 h-12 text-slate-700" />
                        <div>
                            <h3 className="text-slate-400 font-bold">Select Alert for Review</h3>
                            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">All actions are logged in the immutable audit trail for judicial review.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetectionCenter;

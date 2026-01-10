import React, { useState, useEffect } from 'react';
import {
    Plus,
    Filter,
    ArrowUpRight,
    AlertCircle,
    MoreVertical,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { caseApi } from '../api/client';

const CaseList = () => {
    const navigate = useNavigate();
    const { cases, fetchCases } = useStore();
    const [isCaseModalOpen, setCaseModalOpen] = useState(false);
    const [caseForm, setCaseForm] = useState({ title: '', description: '', department: 'Audit' });

    // AI Email State
    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    const [emailDraft, setEmailDraft] = useState(null);

    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    const handleGenerateDraft = async (caseId) => {
        alert("DEBUG: Generating AI Draft...");
        try {
            // Call AI Endpoint
            const response = await fetch(`http://localhost:8000/api/gen/comms?case_id=${caseId}`, {
                method: 'POST',
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.detail || "Generation failed");

            setEmailDraft({
                to: "department_head@gov.delhi.in", // Default dummy, can be edited
                subject: data.subject,
                body: data.body
            });
            setEmailModalOpen(true);
        } catch (error) {
            alert(`AI Error: ${error.message}`);
        }
    };

    const handleSendEmail = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/comms/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to_email: emailDraft.to,
                    subject: emailDraft.subject,
                    body: emailDraft.body
                })
            });

            if (!response.ok) throw new Error("Failed to send");

            alert("✅ Communication Sent Successfully!");
            setEmailModalOpen(false);
        } catch (error) {
            alert(`Send Error: ${error.message}`);
        }
    };

    const handleCreateCase = async () => {
        // DEBUG: Immediate feedback
        alert("DEBUG: Button Clicked - Starting Request");
        console.log("DEBUG: Form Data", caseForm);

        if (!caseForm.title || !caseForm.department) {
            alert("DEBUG: Validation Failed - Title or Department missing");
            return;
        }

        try {
            console.log("Calling caseApi.create...");
            await caseApi.create({
                title: caseForm.title,
                department: caseForm.department,
                description: caseForm.description,
                initial_alert_ids: []
            });

            alert("DEBUG: Success! Case Created.");
            setCaseModalOpen(false);
            setCaseForm({ title: '', description: '', department: 'Audit' });
            fetchCases(); // Refresh list
        } catch (error) {
            console.error("Case Creation Error:", error);
            const msg = error.response?.data?.detail || error.message;
            alert(`DEBUG: Error - ${msg}`);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">

            {/* Case Creation Modal - Fixed & Scrollable */}
            {isCaseModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm overflow-y-auto w-full h-full">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="panel w-full max-w-lg border-2 border-blue-500 p-8 shadow-[0_0_50px_rgba(37,99,235,0.2)] relative">

                            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                                <h2 className="text-xl font-bold flex items-center space-x-3 text-white">
                                    <Plus className="w-6 h-6 text-blue-500" />
                                    <span>Initialize New Case</span>
                                </h2>
                                <button
                                    onClick={() => setCaseModalOpen(false)}
                                    className="text-slate-500 hover:text-white p-2 text-xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6 mb-8">
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
                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Department</label>
                                    <input
                                        type="text"
                                        value={caseForm.department}
                                        onChange={e => setCaseForm({ ...caseForm, department: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Description / Hypothesis</label>
                                    <textarea
                                        value={caseForm.description}
                                        onChange={e => setCaseForm({ ...caseForm, description: e.target.value })}
                                        placeholder="Initial investigative notes..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white focus:border-blue-500 outline-none h-32"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleCreateCase}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest rounded transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                            >
                                Confirm & Create Case File
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Drafting Modal */}
            {isEmailModalOpen && emailDraft && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm overflow-y-auto w-full h-full">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="panel w-full max-w-2xl border-2 border-green-500 p-8 shadow-[0_0_50px_rgba(34,197,94,0.2)] relative">
                            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                                <h2 className="text-xl font-bold flex items-center space-x-3 text-white">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span>AI Communication Draft</span>
                                </h2>
                                <button
                                    onClick={() => setEmailModalOpen(false)}
                                    className="text-slate-500 hover:text-white p-2"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">To (Simulated for Demo)</label>
                                    <input
                                        type="text"
                                        value={emailDraft.to}
                                        onChange={e => setEmailDraft({ ...emailDraft, to: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Subject</label>
                                    <input
                                        type="text"
                                        value={emailDraft.subject}
                                        onChange={e => setEmailDraft({ ...emailDraft, subject: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-white font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">AI Generated Body</label>
                                    <textarea
                                        value={emailDraft.body}
                                        onChange={e => setEmailDraft({ ...emailDraft, body: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-sm text-slate-300 font-mono h-64 leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setEmailModalOpen(false)}
                                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold uppercase tracking-widest rounded"
                                >
                                    Discard Draft
                                </button>
                                <button
                                    onClick={handleSendEmail}
                                    className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-widest rounded transition-all shadow-lg hover:shadow-green-500/25"
                                >
                                    Approve & Send Notice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Investigation Cases</h1>
                <div className="flex space-x-3">
                    <button className="btn-secondary flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                    <button onClick={() => setCaseModalOpen(true)} className="btn-primary flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>New Case</span>
                    </button>
                </div>
            </div>

            <div className="panel border-t-2 border-slate-700">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] border-b border-[#1e2530] text-slate-500 uppercase tracking-widest font-extrabold">
                            <th className="pb-4">Case ID</th>
                            <th className="pb-4">Entity Identity</th>
                            <th className="pb-4">Severity</th>
                            <th className="pb-4">Type / Violation</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm cursor-pointer">
                        {cases.map((c) => (
                            <tr
                                key={c.id}
                                className="border-b border-[#1e2530]/50 hover:bg-slate-800/40 transition-all group"
                            >
                                <td className="py-5 font-mono text-slate-400" onClick={() => navigate(`/case/${c.id}`)}>{c.id}</td>
                                <td className="py-5 font-bold text-slate-200" onClick={() => navigate(`/case/${c.id}`)}>{c.entity}</td>
                                <td className="py-5" onClick={() => navigate(`/case/${c.id}`)}>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter shadow-sm border ${c.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        c.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-slate-800 text-slate-400 border-slate-700'
                                        }`}>
                                        {c.severity}
                                    </span>
                                </td>
                                <td className="py-5 text-slate-400" onClick={() => navigate(`/case/${c.id}`)}>{c.type}</td>
                                <td className="py-5" onClick={() => navigate(`/case/${c.id}`)}>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'OPEN' ? 'bg-blue-500 animate-pulse' :
                                            c.status === 'ESCALATED' ? 'bg-red-500' :
                                                'bg-green-500'
                                            }`}></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{c.status}</span>
                                    </div>
                                </td>
                                <td className="py-5 text-right flex justify-end space-x-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleGenerateDraft(c.id); }}
                                        className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-green-400 group/btn"
                                        title="Generate AI Communication"
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span className="text-[10px] font-bold uppercase hidden group-hover/btn:block">Draft Email</span>
                                            <ArrowUpRight className="w-4 h-4" />
                                        </div>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default CaseList;

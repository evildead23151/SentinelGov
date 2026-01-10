import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, CheckCircle, AlertTriangle, Shield, Calendar,
    Building, IndianRupee, Send, Key, Lock, FileSignature
} from 'lucide-react';
import useStore from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

const ProcurementPortal = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const [mode, setMode] = useState('SUBMIT'); // SUBMIT or SANCTION
    const [loading, setLoading] = useState(false);

    // Submission Form Data
    const [formData, setFormData] = useState({
        title: '',
        department: 'Audit',
        vendor_name: '',
        amount: '',
        description: ''
    });

    // Sanctioning Data
    const [pendingRequests, setPendingRequests] = useState([]);

    useEffect(() => {
        if (mode === 'SANCTION') {
            fetchPending();
        }
    }, [mode]);

    const fetchPending = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/procurement/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setPendingRequests(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8000/api/procurement/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            });
            if (res.ok) {
                alert("Procurement Request Submitted for Sanctioning.");
                setFormData({ title: '', department: 'Audit', vendor_name: '', amount: '', description: '' });
                if (mode === 'SANCTION') fetchPending();
            } else {
                throw new Error("Submission Failed");
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSanction = async (id, decision) => {
        const notes = prompt(decision === "SANCTION" ? "Add Approval Notes:" : "Reason for Rejection:");
        if (!notes) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:8000/api/procurement/${id}/sanction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ decision, notes })
            });
            fetchPending();
        } catch (err) {
            alert("Action failed.");
        }
    };

    return (
        <div className="p-8 space-y-8 min-h-screen bg-[#0b0e14] text-slate-300 font-mono">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center space-x-3">
                        <FileSignature className="w-8 h-8 text-amber-500" />
                        <span>Central Procurement Portal</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Official Spending Request & Sanctioning Gateway</p>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => setMode('SUBMIT')}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${mode === 'SUBMIT' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
                    >
                        Submit Request
                    </button>
                    {(user?.role === 'SECTION_HEAD' || user?.role === 'OVERSIGHT') && (
                        <button
                            onClick={() => setMode('SANCTION')}
                            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all ${mode === 'SANCTION' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            Sanctioning Queue
                        </button>
                    )}
                </div>
            </div>

            {/* Mode: SUBMIT */}
            <AnimatePresence mode="wait">
                {mode === 'SUBMIT' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="max-w-2xl mx-auto"
                    >
                        <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-amber-500/20 p-8 rounded-xl shadow-2xl relative overflow-hidden group">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center space-x-2 text-amber-500 mb-4">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Secure Government Form 22-A</span>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Project Title</label>
                                        <input required className="w-full bg-black/50 border border-slate-700 rounded p-3 text-white focus:border-amber-500 outline-none transition-colors"
                                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Server Upgrade" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Department</label>
                                        <select className="w-full bg-black/50 border border-slate-700 rounded p-3 text-white focus:border-amber-500 outline-none transition-colors"
                                            value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                            <option>Audit</option>
                                            <option>IT</option>
                                            <option>Procurement</option>
                                            <option>Operations</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Vendor Name</label>
                                        <input required className="w-full bg-black/50 border border-slate-700 rounded p-3 text-white focus:border-amber-500 outline-none transition-colors"
                                            value={formData.vendor_name} onChange={e => setFormData({ ...formData, vendor_name: e.target.value })} placeholder="Official Vendor" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Amount (INR)</label>
                                        <div className="relative">
                                            <IndianRupee className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                                            <input required type="number" className="w-full bg-black/50 border border-slate-700 rounded p-3 pl-10 text-white focus:border-amber-500 outline-none transition-colors"
                                                value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Justification / Description</label>
                                    <textarea required rows={4} className="w-full bg-black/50 border border-slate-700 rounded p-3 text-white focus:border-amber-500 outline-none transition-colors"
                                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Why is this required?" />
                                </div>

                                <button disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase py-4 rounded tracking-widest transition-all shadow-lg hover:shadow-amber-500/25 flex items-center justify-center space-x-2">
                                    {loading ? <span className="animate-spin">Wait...</span> : <><span>Submit for Sanction</span><Send className="w-4 h-4" /></>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Mode: SANCTION (Approval Queue) */}
                {mode === 'SANCTION' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {pendingRequests.length === 0 ? (
                            <div className="col-span-2 text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl">
                                <CheckCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest">No Pending Sanctions</p>
                            </div>
                        ) : (
                            pendingRequests.map(req => (
                                <div key={req.id} className="bg-slate-900 border-l-4 border-amber-500 p-6 rounded shadow-lg relative group hover:bg-slate-800 transition-colors">
                                    <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-amber-500/20">
                                        Pending Action
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">{req.title}</h3>
                                    <div className="flex items-center space-x-2 text-xs text-slate-400 mb-4">
                                        <Building className="w-3 h-3" />
                                        <span>{req.department}</span>
                                        <span className="text-slate-700">|</span>
                                        <span className="text-white font-mono">₹{req.amount.toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-6 bg-black/20 p-3 rounded italic border-l-2 border-slate-700">
                                        "{req.description}"
                                    </p>

                                    <div className="flex gap-3">
                                        <button onClick={() => handleSanction(req.id, "SANCTION")} className="flex-1 bg-green-900/30 hover:bg-green-600 text-green-500 hover:text-white border border-green-500/50 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all">
                                            Sanction
                                        </button>
                                        <button onClick={() => handleSanction(req.id, "REJECT")} className="flex-1 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/50 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProcurementPortal;

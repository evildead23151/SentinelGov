import React, { useState, useEffect } from 'react';
import {
    FileText, Download, Search, RefreshCw, ShieldCheck,
    Landmark, ExternalLink, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const TransparencyBoard = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRecords();
        // Poll every 30 seconds for "Live" feel
        const interval = setInterval(fetchRecords, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/public/transparency');
            const data = await res.json();
            setRecords(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load transparency data", err);
            setLoading(false);
        }
    };

    const handleDownload = (record) => {
        // Simulating PDF Download
        alert(`Downloading Official Sanction Order: ${record.document_hash}.pdf`);
    };

    const filteredRecords = records.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-amber-500/30">
            {/* Hero Section */}
            <div className="relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[#0a0a0a] border-b border-white/10 pb-12 pt-12 px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center space-x-3 text-amber-500 mb-2">
                            <Landmark className="w-6 h-6" />
                            <span className="text-xs font-bold uppercase tracking-[0.2em]">Public Governance Index</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
                            Transparency<span className="text-amber-500">Board</span>
                        </h1>
                        <p className="text-slate-500 max-w-xl text-lg leading-relaxed">
                            Real-time disclosure of government sanctioned expenditures.
                            Immutable ledger records accessible to the public.
                        </p>
                    </motion.div>

                    <div className="mt-8 md:mt-0 flex flex-col items-end space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <span className="block text-2xl font-mono font-bold text-white">{records.length}</span>
                                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Records Indexed</span>
                            </div>
                            <div className="h-10 w-[1px] bg-white/20"></div>
                            <div className="text-right">
                                <span className="block text-2xl font-mono font-bold text-green-500">Live</span>
                                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Status</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="max-w-7xl mx-auto px-8 -mt-8 relative z-10">
                <div className="bg-[#111] border border-white/10 p-4 rounded-xl shadow-2xl flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                        <input
                            type="text"
                            placeholder="Search by Department, ID, or Vendor..."
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg py-3 pl-10 text-white focus:border-amber-500 outline-none transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchRecords} className="p-3 bg-[#1a1a1a] border border-white/5 rounded-lg hover:bg-[#222] transition-colors group">
                        <RefreshCw className="w-5 h-5 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                    <div className="text-xs font-mono text-slate-600 px-2">
                        LAST SYNC: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* Table / Scroll Index */}
            <div className="max-w-7xl mx-auto px-8 py-12">
                {loading ? (
                    <div className="text-center py-20 animate-pulse">
                        <div className="h-2 w-40 bg-slate-800 rounded mx-auto mb-4"></div>
                        <p className="text-slate-600 font-mono text-xs uppercase">Connecting to Ledger...</p>
                    </div>
                ) : (
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Sanction ID</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Title / Purpose</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Department</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Vendor</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Sanctioned Amount</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Docs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredRecords.map((record, idx) => (
                                        <motion.tr
                                            key={record.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="p-6 font-mono text-xs text-slate-400">
                                                <div className="flex items-center space-x-2">
                                                    <ShieldCheck className="w-3 h-3 text-green-500" />
                                                    <span>{record.document_hash.substring(0, 8)}...</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="font-bold text-white text-sm mb-1">{record.title}</div>
                                                <div className="text-xs text-slate-500 truncate max-w-xs">{record.description}</div>
                                            </td>
                                            <td className="p-6">
                                                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                                    {record.department}
                                                </span>
                                            </td>
                                            <td className="p-6 text-sm text-slate-300 font-medium">
                                                {record.vendor_name}
                                            </td>
                                            <td className="p-6 text-right font-mono text-amber-500 font-bold">
                                                ₹{record.amount.toLocaleString()}
                                            </td>
                                            <td className="p-6 text-center">
                                                <button
                                                    onClick={() => handleDownload(record)}
                                                    className="p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                                                    title="Download Sanction Order PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                    {filteredRecords.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center text-slate-600 font-mono text-sm uppercase tracking-widest">
                                                No sanctioned records match your query.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransparencyBoard;

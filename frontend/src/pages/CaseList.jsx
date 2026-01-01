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

const CaseList = () => {
    const navigate = useNavigate();
    const [cases, setCases] = useState([
        { id: 'CASE-9092', entity: 'Global Supplies Corp', severity: 'HIGH', status: 'OPEN', type: 'Procurement Fraud', date: 'Oct 24, 2023' },
        { id: 'CASE-8842', entity: 'Vertex Holdings', severity: 'CRITICAL', status: 'ESCALATED', type: 'Conflict of Interest', date: 'Oct 25, 2023' },
        { id: 'CASE-7712', entity: 'NorthStar Ltd', severity: 'MEDIUM', status: 'RESOLVED', type: 'Invoice Error', date: 'Oct 22, 2023' },
    ]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Investigation Cases</h1>
                <div className="flex space-x-3">
                    <button className="btn-secondary flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                    <button className="btn-primary flex items-center space-x-2">
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
                            <th className="pb-4">Last Updated</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {cases.map((c) => (
                            <tr
                                key={c.id}
                                className="border-b border-[#1e2530]/50 hover:bg-slate-800/40 transition-all cursor-pointer group"
                                onClick={() => navigate(`/case/${c.id}`)}
                            >
                                <td className="py-5 font-mono text-slate-400">{c.id}</td>
                                <td className="py-5 font-bold text-slate-200">{c.entity}</td>
                                <td className="py-5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter shadow-sm border ${c.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                            c.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                'bg-slate-800 text-slate-400 border-slate-700'
                                        }`}>
                                        {c.severity}
                                    </span>
                                </td>
                                <td className="py-5 text-slate-400">{c.type}</td>
                                <td className="py-5 text-slate-500 flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{c.date}</span>
                                </td>
                                <td className="py-5">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'OPEN' ? 'bg-blue-500 animate-pulse' :
                                                c.status === 'ESCALATED' ? 'bg-red-500' :
                                                    'bg-green-500'
                                            }`}></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{c.status}</span>
                                    </div>
                                </td>
                                <td className="py-5 text-right">
                                    <button className="p-2 hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100">
                                        <ArrowUpRight className="w-4 h-4 text-blue-500" />
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

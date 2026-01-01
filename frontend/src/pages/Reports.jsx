import React, { useState } from 'react';
import {
    FileText,
    Download,
    Search,
    Filter,
    Calendar,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Zap
} from 'lucide-react';

const Reports = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [reports, setReports] = useState([
        { id: 'RPT-2023-X99', name: 'Q3 Welfare Fraud Analysis', date: 'Oct 24, 14:30', hash: '8f4a...2b1c', status: 'Ready' },
        { id: 'RPT-2023-X98', name: 'Procurement Anomalies - Sept', date: 'Oct 24, 10:15', hash: '7c2d...9a0f', status: 'Ready' },
        { id: 'RPT-2023-X97', name: 'Monthly Fiscal Risk Summary', date: 'Oct 24, 09:00', hash: 'GENERATING...', status: 'Processing' },
        { id: 'RPT-2023-X96', name: 'Contractor Compliance Audit', date: 'Oct 23, 16:45', hash: '3b1x...8p9q', status: 'Ready' },
        { id: 'RPT-2023-X95', name: 'Raw Data Dump - Sector 7', date: 'Oct 23, 11:20', hash: 'HASH_MISMATCH', status: 'Error' },
    ]);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            alert('Official Audit Report Generated Successfully. Cryptographically signed PDF is ready for export.');
        }, 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Reports & Exports Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Generate audit-ready documentation and cryptographically signed archives.</p>
                </div>
                <div className="flex bg-[#11141b] rounded-lg border border-slate-700 p-1">
                    <div className="px-4 py-1 text-xs font-bold text-slate-500">2.4TB ENCRYPTED STORAGE</div>
                    <div className="w-16 h-4 bg-slate-800 rounded relative mt-0.5 overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500 w-[45%]"></div>
                    </div>
                    <div className="px-4 py-1 text-xs font-bold text-blue-500 uppercase">45% USED</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="panel flex flex-col h-fit">
                    <h3 className="text-title text-[10px] mb-6 flex items-center space-x-2">
                        <PlusCircle className="w-3 h-3 text-blue-500" />
                        <span>Generate New Report</span>
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Report Type</label>
                            <select className="w-full bg-[#1e2530] border border-slate-700 rounded-lg p-3 text-sm focus:outline-none">
                                <option>Procurement Anomaly Report</option>
                                <option>Entity Investigation Dossier</option>
                                <option>System Integrity Audit</option>
                                <option>Welfare Distribution Risk</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Start Date</label>
                                <div className="relative">
                                    <input type="text" value="10/01/2023" className="w-full bg-[#1e2530] border border-slate-700 rounded-lg p-3 text-sm pr-10" />
                                    <Calendar className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">End Date</label>
                                <div className="relative">
                                    <input type="text" value="10/31/2023" className="w-full bg-[#1e2530] border border-slate-700 rounded-lg p-3 text-sm pr-10" />
                                    <Calendar className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-blue-600/5 border border-blue-600/10 rounded-lg">
                            <input type="checkbox" checked className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600" />
                            <div className="flex-1">
                                <p className="text-xs font-bold">Generate Signed PDF</p>
                                <p className="text-[10px] text-slate-500">Official audit format with digital signature</p>
                            </div>
                            <FileText className="w-5 h-5 text-slate-500" />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full btn-primary py-4 flex items-center justify-center space-x-2"
                        >
                            <Zap className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            <span>{isGenerating ? 'GENEVATING...' : 'Generate Report'}</span>
                        </button>
                        <p className="text-[10px] text-slate-500 text-center font-mono">EST. TIME: 45s // QUEUE: IDLE</p>
                    </div>

                    <div className="mt-8 p-4 bg-blue-600/5 rounded-lg border border-blue-600/10">
                        <div className="flex items-start space-x-3">
                            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                            <div>
                                <p className="text-xs font-bold leading-none mb-1">Cryptographic Signing Active</p>
                                <p className="text-[10px] text-slate-400">All generated PDFs include a visible digital signature and an invisible forensic watermark traceable to your Agent ID.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 panel">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-title text-[10px] flex items-center space-x-2">
                            <History className="w-3 h-3" />
                            <span>Historical Archives</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                            <button className="p-1.5 bg-slate-800 rounded border border-slate-700"><Filter className="w-4 h-4" /></button>
                            <button className="btn-secondary py-1.5 text-xs">Export Log</button>
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] border-b border-[#1e2530] text-slate-500 uppercase tracking-widest font-extrabold">
                                <th className="pb-4">Report ID</th>
                                <th className="pb-4">Report Name</th>
                                <th className="pb-4">Generated</th>
                                <th className="pb-4">Integrity Hash</th>
                                <th className="pb-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-mono">
                            {reports.map((r) => (
                                <tr key={r.id} className="border-b border-[#1e2530]/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 text-slate-500">{r.id}</td>
                                    <td className="py-4 font-bold text-slate-200">
                                        <div className="flex items-center space-x-2 font-inter font-medium text-xs">
                                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                                            <span>{r.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-slate-500">{r.date}</td>
                                    <td className={`py-4 ${r.hash === 'HASH_MISMATCH' ? 'text-red-500' : 'text-slate-600'}`}>{r.hash}</td>
                                    <td className="py-4 text-right">
                                        <div className="flex items-center justify-end space-x-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${r.status === 'Ready' ? 'bg-green-500/10 text-green-500' :
                                                    r.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 animate-pulse' :
                                                        'bg-red-500/10 text-red-500'
                                                }`}>
                                                {r.status}
                                            </span>
                                            {r.status === 'Ready' && <Download className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-white" />}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-8 flex justify-center space-x-2">
                        {[1, 2, 3, '...', 9].map(p => (
                            <button key={p} className={`w-8 h-8 flex items-center justify-center rounded border border-slate-800 text-xs ${p === 1 ? 'bg-blue-600 border-blue-600 text-white' : 'hover:bg-slate-800 text-slate-500'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlusCircle = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const History = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default Reports;

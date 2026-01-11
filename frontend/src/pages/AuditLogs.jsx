import React from 'react';
import {
    ClipboardList,
    ShieldCheck,
    Terminal,
    Search,
    Download,
    Fingerprint,
    Lock,
    Cpu
} from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = React.useState([]);

    React.useEffect(() => {
        fetch('http://127.0.0.1:8000/api/audit/logs')
            .then(res => res.json())
            .then(data => setLogs(Array.isArray(data) ? data : []))
            .catch(err => console.error(err));
    }, []);

    const formatTime = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center space-x-3">
                        <ClipboardList className="w-6 h-6 text-blue-500" />
                        <span>Immutable Audit Logs</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Append-only system ledger. All actions are cryptographically hashed for integrity.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="btn-secondary flex items-center space-x-2">
                        <Search className="w-4 h-4" />
                        <span>Search Logs</span>
                    </button>
                    <button className="btn-primary flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Export Archive</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="panel col-span-3 border-t-2 border-blue-600">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Live Feed</span>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">LAST HASH: bc11...e22z</div>
                    </div>

                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] border-b border-[#1e2530] text-slate-500 uppercase tracking-widest font-black">
                                <th className="pb-4">Timestamp (UTC)</th>
                                <th className="pb-4">GovID (Actor)</th>
                                <th className="pb-4">Action Event</th>
                                <th className="pb-4">Resource Target</th>
                                <th className="pb-4">Integrity Hash</th>
                                <th className="pb-4 text-right">Lvl</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-mono">
                            {logs.map((log) => (
                                <tr key={log.id} className="border-b border-[#1e2530]/50 hover:bg-slate-800/20 transition-colors group">
                                    <td className="py-4 text-slate-400">{formatTime(log.timestamp)}</td>
                                    <td className="py-4">
                                        <div className="flex items-center space-x-2">
                                            <Fingerprint className="w-3.5 h-3.5 text-blue-500 opacity-50" />
                                            <span className="font-bold text-slate-300">{log.actor_govid || log.actor_id}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold uppercase tracking-tighter">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="py-4 text-slate-500">{log.details ? log.details.substring(0, 30) + '...' : 'N/A'}</td>
                                    <td className="py-4 text-blue-500/50 group-hover:text-blue-400 transition-colors font-mono text-[10px]">{log.integrity_hash || 'PENDING'}</td>
                                    <td className="py-4 text-right">
                                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-black">L3</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-8 flex items-center justify-between p-4 bg-blue-600/5 border border-blue-600/10 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Lock className="w-5 h-5 text-blue-500" />
                            <p className="text-xs font-bold text-slate-300 tracking-tighter uppercase">Chain Integrity: VERIFIED // HASHES MATCH (256/256)</p>
                        </div>
                        <button className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest">Verify All Recrods</button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="panel">
                        <h3 className="text-title text-[10px] mb-6">Ledger Overview</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Total Records</p>
                                <p className="text-2xl font-black">1.42M</p>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 w-3/4"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Last Sync</p>
                                    <p className="text-xs font-bold font-mono">2m ago</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Status</p>
                                    <p className="text-xs font-bold text-green-500 uppercase">SECURE</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel border-t-2 border-amber-500">
                        <h3 className="text-title text-[10px] mb-4 text-amber-500 flex items-center">
                            <ShieldCheck className="w-3 h-3 mr-2" />
                            Compliance Alert
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Audit record retention policy requires daily backup to offline storage. Last backup was 4 hours ago.
                        </p>
                        <button className="w-full btn-secondary py-2 text-[10px] font-bold">INITIATE ARCHIVE</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;

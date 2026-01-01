import React from 'react';
import { Bell, AlertTriangle, ShieldAlert, Clock, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Alerts = () => {
    const navigate = useNavigate();
    const alerts = [
        { id: 'AL-882', severity: 'CRITICAL', entity: 'Vertex Holdings', type: 'Conflict of Interest', time: '2m ago', desc: 'Cross-ref match found between ID:992 and Ministry Board Member.' },
        { id: 'AL-881', severity: 'HIGH', entity: 'Global Supplies', type: 'Structuring', time: '14m ago', desc: 'Multiple transactions just below $10,000 threshold detected.' },
        { id: 'AL-880', severity: 'HIGH', entity: 'NorthStar Ltd', type: 'Sanctions Match', time: '1h ago', desc: 'Watchlist hit for secondary subsidiary in Sector 4.' },
        { id: 'AL-879', severity: 'MEDIUM', entity: 'Omega Construction', type: 'Duplicate Invoice', time: '3h ago', desc: 'Identical invoice amount detected within 24h window.' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center space-x-3">
                        <Bell className="w-6 h-6 text-red-500" />
                        <span>Active Alerts Feed</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Real-time priority violations requiring immediate analytical review.</p>
                </div>
            </div>

            <div className="space-y-4">
                {alerts.map((alert) => (
                    <div key={alert.id} className={`panel border-l-4 ${alert.severity === 'CRITICAL' ? 'border-red-600 bg-red-600/5' : 'border-amber-500 bg-amber-500/5'} flex items-center justify-between group hover:bg-slate-800/40 transition-all cursor-pointer`}>
                        <div className="flex items-start space-x-6">
                            <div className={`p-3 rounded-lg ${alert.severity === 'CRITICAL' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                                <AlertTriangle className={`w-6 h-6 ${alert.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-3">
                                    <span className="text-[10px] font-mono text-slate-500">{alert.id}</span>
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${alert.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                        {alert.severity}
                                    </span>
                                    <h3 className="text-sm font-bold text-slate-200">{alert.type}</h3>
                                </div>
                                <p className="text-xs font-medium text-slate-400">Entity: <span className="text-blue-400">{alert.entity}</span></p>
                                <p className="text-[11px] text-slate-500 italic max-w-xl">"{alert.desc}"</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end space-y-4">
                            <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                                <Clock className="w-3 h-3" />
                                <span>{alert.time}</span>
                            </div>
                            <button
                                onClick={() => navigate('/detection')}
                                className="flex items-center space-x-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest"
                            >
                                <span>Full Analysis</span>
                                <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 panel border-dashed border-2 border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">End of Active Feed // Monitoring 42,500 Transactions/sec</p>
            </div>
        </div>
    );
};

export default Alerts;

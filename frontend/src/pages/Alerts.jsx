import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, ShieldAlert, Clock, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const Alerts = () => {
    const navigate = useNavigate();
    const { alerts, fetchAlerts } = useStore();

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    // Format relative time (mocked for now as we have fixed dates)
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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
                    <div key={alert.id} className={`panel border-l-4 ${alert.risk_score > 80 ? 'border-red-600 bg-red-600/5' : 'border-amber-500 bg-amber-500/5'} flex items-center justify-between group hover:bg-slate-800/40 transition-all cursor-pointer`}>
                        <div className="flex items-start space-x-6">
                            <div className={`p-3 rounded-lg ${alert.risk_score > 80 ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                                <AlertTriangle className={`w-6 h-6 ${alert.risk_score > 80 ? 'text-red-500' : 'text-amber-500'}`} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-3">
                                    <span className="text-[10px] font-mono text-slate-500">#{alert.id}</span>
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${alert.risk_score > 80 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                        {alert.risk_score > 80 ? 'CRITICAL' : 'HIGH'}
                                    </span>
                                    <h3 className="text-sm font-bold text-slate-200">
                                        {alert.anomaly_flags && alert.anomaly_flags.length > 0 ? alert.anomaly_flags[0] : 'ANOMALY DETECTED'}
                                    </h3>
                                </div>
                                <p className="text-xs font-medium text-slate-400">Entity: <span className="text-blue-400">{alert.department} (Vendor: {alert.vendor_id})</span></p>
                                <p className="text-[11px] text-slate-500 italic max-w-xl">"{alert.explanation}"</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end space-y-4">
                            <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(alert.timestamp)}</span>
                            </div>
                            <button
                                onClick={() => navigate(`/detection?id=${alert.id}`)}
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

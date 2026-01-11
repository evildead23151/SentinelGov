import React, { useEffect } from 'react';
import {
    TrendingUp,
    AlertTriangle,
    Briefcase,
    Cpu,
    ArrowUpRight,
    Download,
    Database,
    Activity,
    Shield
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';

const data = [
    { name: 'Week 1', value: 30 },
    { name: 'Week 2', value: 45 },
    { name: 'Week 3', value: 25 },
    { name: 'Week 4', value: 65 },
    { name: 'Week 5', value: 40 },
    { name: 'Week 6', value: 75 },
    { name: 'Week 7', value: 50 },
];

const StatCard = ({ title, value, subvalue, icon: Icon, trend, color }) => (
    <div className="panel flex flex-col justify-between py-5 border-l-4" style={{ borderColor: color }}>
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">{title}</p>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
            </div>
            <div className={`p-2 rounded-lg bg-slate-800 border border-slate-700`}>
                <Icon className="w-5 h-5 text-slate-400" />
            </div>
        </div>
        <div className="flex items-center space-x-2">
            {trend && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
            <span className="text-[10px] text-slate-500 font-medium">{subvalue}</span>
        </div>
    </div>
);

const Dashboard = () => {
    const {
        systemStats,
        alerts,
        trendData,
        notifications,
        fetchStatus,
        fetchAlerts,
        fetchTrend,
        user // Ensure we pull user from store
    } = useStore();

    const navigate = useNavigate();
    const location = useLocation();
    const ingestReport = location.state?.ingestReport;

    useEffect(() => {
        const load = () => {
            fetchStatus();
            fetchAlerts();
            fetchTrend();
        };
        load();
        const interval = setInterval(fetchStatus, 10000); // 10s Polling for State Consistency
        return () => clearInterval(interval);
    }, [fetchStatus, fetchAlerts, fetchTrend]);

    const formatCurrency = (val) => {
        if (val >= 1000000000) return `$${(val / 1000000000).toFixed(1)}B`;
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
        return `$${val || 0}`;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* System Health Guardian (Fail Closed) */}
            {systemStats.status !== "OPERATIONAL" && (
                <div className="panel border-l-4 border-red-600 bg-red-600/10 mb-6 flex items-center space-x-4 animate-pulse">
                    <Shield className="w-6 h-6 text-red-600" />
                    <div>
                        <h3 className="text-sm font-bold text-red-500 uppercase">System Integrity Breach / Connection Lost</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">The GovIntel secure gateway is currently unresponsive. Enforcement functions are suspended until a secure link is re-established.</p>
                    </div>
                </div>
            )}
            {ingestReport && (
                <div className="panel border-l-4 border-green-500 bg-green-500/10 mb-6 flex items-center justify-between animate-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-500/20 rounded-full">
                            <Database className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Batch Ingestion Finalized</h3>
                            <p className="text-xs text-green-400 font-mono mt-1">
                                {ingestReport.processed} Records Added • {ingestReport.alerts_created} New Anomalies Detect • Risk Delta: +${ingestReport.risk_delta?.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => navigate('.', { replace: true, state: {} })} className="text-xs font-bold text-slate-500 hover:text-white uppercase">DISMISS</button>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Funds Monitored"
                    value={formatCurrency(systemStats.funds_monitored)}
                    subvalue={`${systemStats.total_transactions || 0} Forensic Records Indexed`}
                    icon={Briefcase}
                    trend={1.2}
                    color="#3b82f6"
                />
                <StatCard
                    title="Risk Exposure"
                    value={formatCurrency(systemStats.risk_exposure)}
                    subvalue="Forensic Risk Ratio Active"
                    icon={AlertTriangle}
                    trend={-5.4}
                    color="#ef4444"
                />
                <StatCard
                    title="Tender Flag Rate"
                    value={`${systemStats?.tender_flag_rate?.toFixed(1) || 0}%`}
                    icon={AlertTriangle}
                    color="red"
                    trend="+2.1% vs avg"
                />
                <StatCard
                    title="Payments on Hold"
                    value={systemStats.payments_on_hold || 0}
                    subvalue="Forensic Governance Active"
                    icon={Shield}
                    color="#10b981"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="panel h-[450px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-title text-sm uppercase tracking-widest text-slate-300">Anomaly Detection Trend</h3>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">Normal Volume vs Anomaly Detections (30 Day Window)</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-4 mr-4">
                                    <div className="flex items-center space-x-1.5">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Normal</span>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Anomaly</span>
                                    </div>
                                </div>
                                <select className="bg-[#1e2530] border border-[#334155] text-[10px] font-bold uppercase rounded px-2 py-1 focus:outline-none text-slate-400">
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-0">
                            {trendData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-600 font-mono text-[10px] uppercase italic">
                                    Establishing data baseline for trend analysis...
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorAnomalous" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#11141b', border: '1px solid #1e2530', borderRadius: '8px' }}
                                            itemStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="flag_rate"
                                            name="% Tenders Flagged"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorAnomalous)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="panel">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-title text-sm uppercase tracking-widest text-slate-300">Security Investigations / High Priority</h3>
                            <button onClick={() => navigate('/alerts')} className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center">
                                Detailed Forensic View <ArrowUpRight className="w-3 h-3 ml-1" />
                            </button>
                        </div>

                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] border-b border-[#1e2530] text-slate-500 uppercase tracking-wider font-bold">
                                    <th className="pb-3 px-2">Ref ID</th>
                                    <th className="pb-3">Department</th>
                                    <th className="pb-3 text-center">Risk Score</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 text-right">Operation</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {alerts.length === 0 ? (
                                    <tr className="border-b border-[#1e2530]/50">
                                        <td colSpan="5" className="py-12 text-center">
                                            <div className="bg-slate-800/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Database className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <p className="text-xs text-slate-500 font-mono italic">Scanning blockchain ledger for behavioral anomalies...</p>
                                        </td>
                                    </tr>
                                ) : (
                                    alerts.slice(0, 5).map(alert => (
                                        <tr key={alert.id} className="border-b border-[#1e2530]/50 hover:bg-white/5 transition-colors group">
                                            <td className="py-4 px-2 font-mono text-[11px] text-blue-400 group-hover:text-blue-300">TX_{alert.id}</td>
                                            <td className="py-4 font-bold text-slate-300">{alert.department}</td>
                                            <td className="py-4 text-center">
                                                <span className={`text-xs font-black px-2 py-0.5 rounded ${alert.risk_score >= 80 ? 'text-red-500 bg-red-500/10 border border-red-500/20' :
                                                    'text-amber-500 bg-amber-500/10 border border-amber-500/20'
                                                    }`}>
                                                    {parseInt(alert.risk_score)}%
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`text-[10px] font-black uppercase tracking-tighter ${alert.status === 'OPEN' ? 'text-amber-500' : 'text-green-500'
                                                    }`}>
                                                    • {alert.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <button
                                                    onClick={() => navigate('/alerts')}
                                                    className="px-3 py-1 bg-slate-800 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 rounded text-[10px] font-bold text-slate-300 hover:text-white transition-all uppercase"
                                                >
                                                    Audit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="panel h-full flex flex-col bg-gradient-to-b from-[#11141b] to-[#0d1017]">
                        <h3 className="text-title text-sm border-b border-[#1e2530] pb-4 mb-4 flex items-center justify-between uppercase tracking-widest text-slate-300">
                            Live Intel Feed
                            <div className="flex items-center space-x-2">
                                <span className="text-[9px] font-mono text-green-500 uppercase animate-pulse">Socket Active</span>
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            </div>
                        </h3>

                        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {notifications.length === 0 ? (
                                <div className="h-40 flex flex-col items-center justify-center text-slate-700 text-center">
                                    <Activity className="w-8 h-8 mb-3 opacity-20" />
                                    <p className="text-[10px] font-mono uppercase">Idle: Monitoring encrypted streams...</p>
                                </div>
                            ) : (
                                notifications.slice(0, 10).map((n, i) => (
                                    <div key={i} className="relative pl-6 border-l border-slate-800/50 pb-1 group animate-in slide-in-from-left-2">
                                        <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-[#11141b] border-2 flex items-center justify-center transition-transform group-hover:scale-125`}
                                            style={{ borderColor: n.type === 'CRITICAL' ? '#ef4444' : n.type === 'ANOMALY' ? '#f59e0b' : '#3b82f6' }}>
                                            <div className={`w-1 h-1 rounded-full ${n.type === 'CRITICAL' ? 'bg-red-500' :
                                                n.type === 'ANOMALY' ? 'bg-amber-500' :
                                                    'bg-blue-500'
                                                }`}></div>
                                        </div>
                                        <div className="flex justify-between items-start mb-1 pt-1">
                                            <span className={`text-[9px] font-black tracking-widest uppercase ${n.type === 'CRITICAL' ? 'text-red-500' :
                                                n.type === 'ANOMALY' ? 'text-amber-500' :
                                                    'text-blue-500'
                                                }`}>{n.type}</span>
                                            <span className="text-[9px] text-slate-600 font-mono italic">{n.time}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium group-hover:text-slate-200 transition-colors">
                                            {n.title}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-[#1e2530]">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Tactical Watchlist</h4>
                            <div className="space-y-3">
                                {alerts.filter(a => a.risk_score >= 80).slice(0, 3).map((a, i) => (
                                    <div
                                        key={i}
                                        onClick={() => navigate('/alerts')}
                                        className="flex items-center justify-between p-2.5 rounded bg-red-600/5 border border-red-900/40 hover:bg-red-600/10 hover:border-red-500/30 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                            <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">TX_{a.id} / {a.department}</span>
                                        </div>
                                        <span className="text-[9px] text-red-500 font-black px-1.5 py-0.5 bg-red-500/10 rounded uppercase tracking-tighter border border-red-500/20">Critical Alert</span>
                                    </div>
                                ))}
                                {alerts.filter(a => a.risk_score >= 80).length === 0 && (
                                    <div className="bg-green-500/5 border border-green-900/20 p-3 rounded text-center">
                                        <p className="text-[9px] font-black text-green-700 uppercase">Operational Hygiene: High</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

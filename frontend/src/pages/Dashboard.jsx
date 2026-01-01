import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    AlertTriangle,
    Briefcase,
    Cpu,
    ArrowUpRight,
    Download,
    MoreHorizontal,
    Database
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
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Funds Monitored"
                    value="$42.5B"
                    subvalue="~2.1% of GDP"
                    icon={Briefcase}
                    trend={1.2}
                    color="#3b82f6"
                />
                <StatCard
                    title="Risk Exposure"
                    value="$12.8M"
                    subvalue="0.03% Risk Ratio"
                    icon={AlertTriangle}
                    trend={-5.4}
                    color="#ef4444"
                />
                <StatCard
                    title="Active Cases"
                    value="142"
                    subvalue="+12 New Today"
                    icon={Briefcase}
                    trend={8.2}
                    color="#f59e0b"
                />
                <StatCard
                    title="AI Confidence"
                    value="98.4%"
                    subvalue="Model v4.1 Stable"
                    icon={Cpu}
                    color="#10b981"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="panel h-[450px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-title text-sm">Anomaly Detection Trend</h3>
                                <p className="text-xs text-slate-500 mt-1">Volume comparison vs Normal Transactions (30 Days)</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <select className="bg-[#1e2530] border border-[#334155] text-xs rounded px-2 py-1 focus:outline-none">
                                    <option>Last 30 Days</option>
                                    <option>Last 90 Days</option>
                                </select>
                                <button className="p-1.5 hover:bg-slate-800 rounded transition-colors border border-slate-800">
                                    <Download className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#475569"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#64748b' }}
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#64748b' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#11141b', border: '1px solid #1e2530', borderRadius: '8px' }}
                                        itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-title text-sm">Recent Intelligence Flags</h3>
                            <button className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center">
                                View All Cases <ArrowUpRight className="w-3 h-3 ml-1" />
                            </button>
                        </div>

                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] border-b border-[#1e2530] text-slate-500 uppercase tracking-wider font-bold">
                                    <th className="pb-3 font-bold">Alert ID</th>
                                    <th className="pb-3 font-bold">Entity</th>
                                    <th className="pb-3 font-bold">Violation Type</th>
                                    <th className="pb-3 font-bold">Risk Score</th>
                                    <th className="pb-3 font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr className="border-b border-[#1e2530]/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 font-mono text-slate-400">#ALG-9921</td>
                                    <td className="py-4 font-medium">Omega Construction</td>
                                    <td className="py-4">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Shell Company</span>
                                    </td>
                                    <td className="py-4 font-bold text-red-500">92</td>
                                    <td className="py-4">
                                        <button className="text-blue-500 hover:underline">Investigate</button>
                                    </td>
                                </tr>
                                <tr className="border-b border-[#1e2530]/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 font-mono text-slate-400">#TXN-4428</td>
                                    <td className="py-4 font-medium">Apex Logistics</td>
                                    <td className="py-4">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">Invoice Duplication</span>
                                    </td>
                                    <td className="py-4 font-bold text-amber-500">65</td>
                                    <td className="py-4">
                                        <button className="text-blue-500 hover:underline">Investigate</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Live Intel Feed Column */}
                <div className="space-y-6">
                    <div className="panel h-full">
                        <h3 className="text-title text-sm border-b border-[#1e2530] pb-4 mb-4 flex items-center justify-between">
                            Live Intel Feed
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        </h3>

                        <div className="space-y-6">
                            {[
                                { type: 'CRITICAL', msg: 'Cross-ref match found between ID:992 and Ministry Board Member.', time: '2m ago', icon: AlertTriangle, color: 'text-red-500' },
                                { type: 'WATCHLIST', msg: 'Entity "Global Imports" filed new tender #9910 in Sector 4.', time: '14m ago', icon: Cpu, color: 'text-amber-500' },
                                { type: 'SYSTEM', msg: 'Data sync complete. 3,420 new transaction records ingested from Treasury API.', time: '1h ago', icon: Database, color: 'text-blue-500' },
                            ].map((item, i) => (
                                <div key={i} className="relative pl-6 border-l border-slate-800 pb-1">
                                    <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-[#11141b] border-2 flex items-center justify-center`} style={{ borderColor: 'currentColor' }}>
                                        <div className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                    </div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${i === 0 ? 'text-red-500' : i === 1 ? 'text-amber-500' : 'text-blue-500'}`}>{item.type}</span>
                                        <span className="text-[10px] text-slate-500">{item.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">{item.msg}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-[#1e2530]">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">High Priority Targets</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 rounded hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                        <span className="text-xs font-medium group-hover:text-blue-400 transition-colors">Vertex Holdings</span>
                                    </div>
                                    <span className="text-[10px] text-red-500 font-bold px-1 py-0.5 bg-red-500/10 rounded">CRITICAL</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded hover:bg-slate-800 transition-colors cursor-pointer group">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                        <span className="text-xs font-medium group-hover:text-amber-400 transition-colors">NorthStar Ltd</span>
                                    </div>
                                    <span className="text-[10px] text-amber-500 font-bold px-1 py-0.5 bg-amber-500/10 rounded">HIGH</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

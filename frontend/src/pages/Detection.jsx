import React from 'react';
import {
    AlertTriangle,
    Cpu,
    TrendingUp,
    DollarSign,
    ExternalLink,
    Clipboard,
    ShieldAlert
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea
} from 'recharts';

const baselineData = [
    { name: 'Oct 01', actual: 20, baseline: 18 },
    { name: 'Oct 07', actual: 25, baseline: 22 },
    { name: 'Oct 14', actual: 18, baseline: 20 },
    { name: 'Oct 21', actual: 85, baseline: 19 }, // Anomaly
    { name: 'Oct 28', actual: 22, baseline: 21 },
];

const Detection = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        <span>Alerts</span>
                        <span>/</span>
                        <span>Procurement</span>
                        <span>/</span>
                        <span className="text-slate-300">#2024-X91</span>
                    </div>
                    <h1 className="text-3xl font-bold flex items-center space-x-4 uppercase tracking-tight">
                        <span>Procurement Anomaly</span>
                        <span className="text-slate-500 font-mono font-medium">#2024-X91</span>
                    </h1>
                </div>
                <div className="flex space-x-3">
                    <button className="btn-secondary flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4" />
                        <span>Export Brief</span>
                    </button>
                    <button className="btn-primary flex items-center space-x-2 bg-blue-700">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Initiate Action</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="panel flex flex-col justify-center border-l-4 border-red-500">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Risk Score</p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-black text-white">92</span>
                        <span className="text-sm text-slate-500">/100</span>
                        <span className="text-[10px] text-red-500 font-bold ml-2">+15% vs AVG</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-red-500 h-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: '92%' }}></div>
                    </div>
                </div>

                <div className="panel flex flex-col justify-center border-l-4 border-blue-500">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">AI Confidence</p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-black text-white">98.5%</span>
                        <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded ml-2">HIGH CERTAINTY</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-4 leading-tight">Based on 142 historical patterns match detected.</p>
                </div>

                <div className="panel flex flex-col justify-center border-l-4 border-amber-500">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Total Impact</p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-black text-white">$1.2M</span>
                        <span className="text-[10px] text-amber-500 font-bold ml-2">AT RISK</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-4 leading-tight">Potential loss if not intervened within 72h.</p>
                </div>

                <div className="panel flex flex-col justify-center border-l-4 border-slate-600">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Variance</p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-black text-white">+450%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-4 leading-tight">Above seasonal baseline for Department of Public Works.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 panel h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-title text-sm">Expenditure vs Baseline</h3>
                        <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-widest">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-0.5 bg-blue-500"></div>
                                <span>Actual Spending</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-0.5 bg-slate-600 border-dashed border-t"></div>
                                <span>Predicted Baseline</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={baselineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#11141b', border: '1px solid #1e2530', borderRadius: '8px' }}
                                />
                                <ReferenceArea x1="Oct 14" x2="Oct 28" fill="#ef4444" fillOpacity={0.05} />
                                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="baseline" stroke="#475569" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="panel border-t-4 border-blue-600 bg-blue-600/5">
                    <div className="flex items-center space-x-3 mb-6">
                        <Cpu className="w-6 h-6 text-blue-500" />
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Intelligence Brief</h3>
                            <p className="text-[10px] text-slate-500 font-mono">MODEL: FIN-BERT-V2</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Primary Flag Reason</p>
                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                "The system flagged this transaction cluster due to a pattern match with known shell company behaviors: <span className="text-amber-500 underline underline-offset-4">rapid invoicing post-registration</span> (&lt; 48 hours) and identical IP addresses shared with 3 previously flagged vendors."
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Connected Evidence</p>
                            <div className="space-y-3">
                                <div className="flex items-start space-x-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-slate-400">Vendor registration date: 2 days prior to first invoice.</p>
                                </div>
                                <div className="flex items-start space-x-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-slate-400">Approval timestamp occurred at 03:14 AM (Outside business hours).</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full btn-secondary text-[10px] font-bold flex items-center justify-center space-x-2">
                            <Clipboard className="w-3.5 h-3.5" />
                            <span>COPY BRIEF TO INVESTIGATION</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Detection;

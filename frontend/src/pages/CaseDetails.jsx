import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ShieldAlert,
    Snowflake,
    TrendingUp,
    MapPin,
    Phone,
    Globe,
    Clock,
    FileText,
    Share2,
    ChevronRight,
    UserCheck,
    MoreHorizontal
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const velocityData = [
    { day: 'Mon', value: 12000 },
    { day: 'Tue', value: 8500 },
    { day: 'Wed', value: 42000, anomaly: true },
    { day: 'Thu', value: 9200 },
    { day: 'Fri', value: 11000 },
];

const CaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendorStatus, setVendorStatus] = useState('ACTIVE');
    const [severity, setSeverity] = useState('HIGH');

    const handleFreeze = () => {
        if (window.confirm("CONFIRM VENDOR FREEZE: This will suspend all active contracts and payments for Global Supplies Corp.")) {
            setVendorStatus('FROZEN');
        }
    };

    const handleEscalate = () => {
        setSeverity('CRITICAL');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/cases')} className="p-2 hover:bg-slate-800 rounded-lg border border-slate-800">
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter">Global Supplies Corp</h1>
                        <div className="flex items-center space-x-3 mt-1 text-xs font-mono text-slate-500 uppercase tracking-widest">
                            <span>Potential Procurement Fraud & Structuring</span>
                            <span>/</span>
                            <span className={`font-bold ${severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>{severity} SEVERITY</span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button className="btn-secondary flex items-center space-x-2">
                        <Share2 className="w-4 h-4" />
                        <span>Share Case</span>
                    </button>
                    <button
                        onClick={handleFreeze}
                        disabled={vendorStatus === 'FROZEN'}
                        className="flex items-center space-x-2 px-4 py-2 rounded font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                    >
                        <Snowflake className="w-4 h-4" />
                        <span>{vendorStatus === 'FROZEN' ? 'VENDOR FROZEN' : 'Freeze Vendor'}</span>
                    </button>
                    <button
                        onClick={handleEscalate}
                        disabled={severity === 'CRITICAL'}
                        className="btn-primary flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        <span>{severity === 'CRITICAL' ? 'CASE ESCALATED' : 'Escalate Case'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Entity Profile */}
                <div className="space-y-6">
                    <div className="panel flex flex-col items-center">
                        <h3 className="text-title text-[10px] self-start mb-6">Entity Profile</h3>
                        <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 mb-4 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <UserCheck className="w-12 h-12 text-slate-500 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="text-center mb-6">
                            <h4 className="text-lg font-bold">Global Supplies Corp.</h4>
                            <p className="text-xs text-slate-500 font-mono tracking-tighter">ID: V-99201-AX // Est. 2019</p>
                        </div>

                        <div className="w-full space-y-4 pt-6 border-t border-slate-800">
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                                <span className="text-xs text-slate-300">142 Industrial Pkwy, North District</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                                <span className="text-xs text-slate-300">www.globalsupplies.gov.int</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                                <span className="text-xs text-slate-300">+1 (555) 019-2834</span>
                            </div>
                        </div>
                    </div>

                    <div className="panel border-t-4 border-red-500 bg-red-500/5">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-title text-[10px]">Risk Assessment</h3>
                            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest leading-none">AI Confidence: High</div>
                        </div>
                        <div className="flex flex-col items-center py-8">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="#1e2530" strokeWidth="8" />
                                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="#ef4444" strokeWidth="8" strokeDasharray="440" strokeDashoffset={440 - (440 * 0.88)} strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black">88</span>
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">CRITICAL</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 mb-6">
                            <div className="flex items-start space-x-3">
                                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-300 leading-relaxed italic">
                                    "Anomalous Velocity: Invoicing frequency exceeds historical baseline by 400%. Pattern matches known 'Burst-out' fraud schemes."
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Value</p>
                                <p className="text-xl font-bold font-mono">$4.2M</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Anomalies</p>
                                <p className="text-xl font-bold font-mono text-red-500">7</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patterns and Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="panel">
                        <h3 className="text-title text-[10px] mb-6">Detected Patterns</h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Duplicate Invoicing', desc: '3 invoices with identical amounts and fuzzy-matched descriptions detected within 48 hours.', status: 'CONFIRMED', color: 'bg-red-500' },
                                { title: 'Structuring (Smurfing)', desc: 'Multiple transactions just below the $10,000 reporting threshold detected on Oct 24th.', status: 'HIGH PROBABILITY', color: 'bg-amber-500', badges: ['$9,950.00', '$9,800.00', '$9,990.00'] },
                                { title: 'Vendor Recurrence', desc: 'New vendor winning 80% of bids in specific category "Office Supplies" within 3 months of registration.', status: 'WATCHLIST', color: 'bg-blue-500' },
                            ].map((p, i) => (
                                <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-1 h-8 rounded-full ${p.color}`}></div>
                                            <h4 className="font-bold">{p.title}</h4>
                                        </div>
                                        <span className={`text-[10px] font-black tracking-tighter px-2 py-0.5 rounded border border-${p.color}/20 text-${p.color}`}>
                                            {p.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 pl-4">{p.desc}</p>
                                    {p.badges && (
                                        <div className="flex space-x-2 mt-4 pl-4 font-mono">
                                            {p.badges.map(b => (
                                                <span key={b} className="text-[10px] px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300">{b}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="panel h-64">
                        <h3 className="text-title text-[10px] mb-8">Transaction Velocity</h3>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={velocityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2530" vertical={false} />
                                    <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} hide />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#11141b', border: '1px solid #1e2530', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {velocityData.map((entry, index) => (
                                            <Cell key={index} fill={entry.anomaly ? '#ef4444' : '#f59e0b'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-title text-[10px]">Flagged Transactions</h3>
                            <div className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">7 Critical</div>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] border-b border-[#1e2530] text-slate-500 uppercase tracking-widest font-extrabold">
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">TX HASH / ID</th>
                                    <th className="pb-3">Recipient</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Flags</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-mono">
                                {[
                                    { date: '2023-10-24 14:22', hash: 'tx_8829a...99b', to: 'Dept. of Public Works', amount: '$42,500.00', flag: 'Duplicate' },
                                    { date: '2023-10-24 14:22', hash: 'tx_8829a...44c', to: 'Dept. of Sanitation', amount: '$42,500.00', flag: 'Duplicate' },
                                    { date: '2023-10-12 09:15', hash: 'tx_7712b...11a', to: 'Global Supplies Corp', amount: '$9,950.00', flag: 'Structuring' },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-[#1e2530]/50 hover:bg-slate-800/30 transition-colors group">
                                        <td className="py-4 text-slate-500">{row.date}</td>
                                        <td className="py-4 text-blue-500 cursor-pointer hover:underline">{row.hash}</td>
                                        <td className="py-4 text-slate-300">{row.to}</td>
                                        <td className="py-4 font-bold text-white tracking-tighter">{row.amount}</td>
                                        <td className="py-4">
                                            <span className={`px-1.5 py-0.5 rounded-[4px] border ${row.flag === 'Duplicate' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                                                {row.flag}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="w-full mt-6 py-2 border border-slate-800 rounded bg-slate-900/50 text-[10px] font-bold text-slate-400 hover:text-white transition-colors">
                            VIEW ALL 142 TRANSACTIONS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseDetails;

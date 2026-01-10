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
    // Get ID from query param
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get('id');

    const [alert, setAlert] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!id) return;
        fetch(`http://127.0.0.1:8000/api/alerts/${id}`)
            .then(res => res.json())
            .then(data => {
                setAlert(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [id]);

    const handleAction = (actionType) => {
        fetch(`http://127.0.0.1:8000/api/alerts/${id}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: actionType, note: "Initiated via Dashboard" })
        })
            .then(res => res.json())
            .then(data => {
                // Optimistic update
                setAlert(prev => ({ ...prev, status: data.new_state }));
                alert("Action Processed: " + actionType);
            })
            .catch(err => console.error("Action Error", err));
    };

    if (!id) return <div className="p-10 text-center text-slate-500">Select an alert from the dashboard or feed to view details.</div>;
    if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading intelligence packet...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        <span>Alerts</span>
                        <span>/</span>
                        <span>Procurement</span>
                        <span>/</span>
                        <span className="text-slate-300">#{alert.id}</span>
                    </div>
                    <h1 className="text-3xl font-bold flex items-center space-x-4 uppercase tracking-tight">
                        <span>Procurement Anomaly</span>
                        <span className="text-slate-500 font-mono font-medium">#{alert.id}</span>
                        {alert.status !== 'OPEN' && (
                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded ml-4 border border-slate-700">
                                STATUS: {alert.status}
                            </span>
                        )}
                    </h1>
                </div>
                <div className="flex space-x-3">
                    <button className="btn-secondary flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4" />
                        <span>Export Brief</span>
                    </button>
                    {alert.status === 'OPEN' && (
                        <>
                            <button onClick={() => handleAction('ESCALATE')} className="btn-secondary flex items-center space-x-2 text-amber-500 border-amber-500/50 hover:bg-amber-500/10">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Escalate</span>
                            </button>
                            <button onClick={() => handleAction('FREEZE')} className="btn-primary flex items-center space-x-2 bg-red-600 hover:bg-red-700">
                                <ShieldAlert className="w-4 h-4" />
                                <span>Freeze Vendor</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="panel flex flex-col justify-center border-l-4 border-red-500">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Risk Score</p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-black text-white">{parseInt(alert.risk_score)}</span>
                        <span className="text-sm text-slate-500">/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-red-500 h-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${alert.risk_score}%` }}></div>
                    </div>
                </div>

                <div className="panel flex flex-col justify-center border-l-4 border-blue-500">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Entity</p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-white truncate">{alert.vendor_id}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 leading-tight">Dept: {alert.department}</p>
                </div>

                <div className="panel flex flex-col justify-center border-l-4 border-amber-500">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Transaction Amount</p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-4xl font-black text-white">${alert.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-4 leading-tight">Invoice ID: {alert.invoice_id}</p>
                </div>

                <div className="panel flex flex-col justify-center border-l-4 border-slate-600">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Anomaly Type</p>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-lg font-bold text-white leading-tight">
                            {alert.anomaly_flags && alert.anomaly_flags[0]}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 panel h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-title text-sm">Expenditure vs Baseline</h3>
                        {/* Placeholder Chart - would need real time series data */}
                        <div className="text-slate-500 text-xs italic">Historical context visualization unavailable for this prototype.</div>
                    </div>
                    <div className="flex-1 w-full min-h-0 bg-slate-900/50 rounded flex items-center justify-center">
                        <p className="text-slate-600 text-sm">Chart Placeholder</p>
                    </div>
                </div>

                <div className="panel border-t-4 border-blue-600 bg-blue-600/5">
                    <div className="flex items-center space-x-3 mb-6">
                        <Cpu className="w-6 h-6 text-blue-500" />
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest">Intelligence Brief</h3>
                            <p className="text-[10px] text-slate-500 font-mono">MODEL: ISOLATION-FOREST-V1</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Primary Flag Reason</p>
                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                "{alert.explanation}"
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Connected Evidence</p>
                            <div className="space-y-3">
                                {alert.anomaly_flags && alert.anomaly_flags.map((flag, i) => (
                                    <div key={i} className="flex items-start space-x-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-slate-400">Triggered Rule: {flag}</p>
                                    </div>
                                ))}
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

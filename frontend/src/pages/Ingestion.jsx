import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Upload, CheckCircle2, AlertCircle, PlusCircle, Terminal, Clock, FileText, Trash2 } from 'lucide-react';
import { ingestApi } from '../api/client';

const Ingestion = () => {
    const navigate = useNavigate();
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('IDLE'); // IDLE, UPLOADING, SUCCESS, ERROR
    const [logs, setLogs] = useState([
        { id: 1, time: '12:04:11', msg: 'System ready for gateway input.', type: 'INFO' },
        { id: 2, time: '12:05:22', msg: 'Establishing encrypted bridge...', type: 'PROCESS' }
    ]);

    const addLog = (msg, type = 'INFO') => {
        const time = new Date().toLocaleTimeString('en-GB');
        setLogs(prev => [{ id: Date.now(), time, msg, type }, ...prev].slice(0, 10));
    };

    const handleFile = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.name.endsWith('.csv')) {
            setFile(selected);
            addLog(`Captured file: ${selected.name} (${(selected.size / 1024).toFixed(1)} KB)`, 'SUCCESS');
        } else {
            addLog('Invalid format. System requires RFC-4180 compliant CSV.', 'ERROR');
        }
    };

    const triggerIngest = async () => {
        if (!file) return;

        setStatus('UPLOADING');
        addLog(`Initiating cryptographic data transfer for ${file.name}...`, 'PROCESS');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await ingestApi.upload(formData);

            setStatus('SUCCESS');
            addLog(`Ingestion Complete: ${res.data.processed} records added.`, 'SUCCESS');

            // Palantir-Style: Instant Transition to Analysis
            setTimeout(() => {
                navigate('/dashboard', { state: { ingestReport: res.data } });
            }, 800);

        } catch (err) {
            setStatus('ERROR');
            addLog(`Critical Failure: ${err.message}`, 'ERROR');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center space-x-3 text-white">
                        <Database className="w-6 h-6 text-blue-500" />
                        <span>Data Ingestion Protocol</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 uppercase tracking-wider font-mono">Status: Secure Layer Active (ENC: AES-256)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile({ target: { files: e.dataTransfer.files } }); }}
                        className={`panel border-dashed border-2 min-h-[400px] flex flex-col items-center justify-center transition-all ${dragging ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700'
                            }`}
                    >
                        {!file ? (
                            <div className="text-center group">
                                <div className="p-8 rounded-full bg-slate-900 border border-slate-800 mb-6 group-hover:scale-110 transition-transform inline-block">
                                    <Upload className={`w-12 h-12 ${dragging ? 'text-blue-500' : 'text-slate-600'}`} />
                                </div>
                                <h2 className="text-lg font-bold text-slate-200">Drag & Drop Intelligence Feed</h2>
                                <p className="text-sm text-slate-500 mt-2 mb-8">Drop .CSV file to begin batch verification</p>
                                <label className="btn-primary py-3 px-8 cursor-pointer inline-flex items-center space-x-2">
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Select Archive</span>
                                    <input type="file" className="hidden" accept=".csv" onChange={handleFile} />
                                </label>
                            </div>
                        ) : (
                            <div className="text-center w-full max-w-md p-8 animate-in zoom-in-95 duration-300">
                                <div className="panel bg-[#11141b] border-blue-500/30 p-6 mb-8 text-left">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="w-8 h-8 text-blue-500" />
                                            <div>
                                                <p className="text-sm font-bold text-white">{file.name}</p>
                                                <p className="text-[10px] text-slate-500 uppercase">{(file.size / 1024).toFixed(1)} KB • CSV ARCHIVE</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setFile(null)} className="p-2 hover:bg-red-500/10 rounded-lg group">
                                            <Trash2 className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" />
                                        </button>
                                    </div>
                                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500"
                                            style={{ width: status === 'UPLOADING' ? '70%' : status === 'SUCCESS' ? '100%' : '0%' }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={triggerIngest}
                                    disabled={status === 'UPLOADING'}
                                    className={`w-full py-4 rounded font-black tracking-[0.2em] uppercase text-xs transition-all shadow-lg ${status === 'UPLOADING' ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                                        }`}
                                >
                                    {status === 'UPLOADING' ? 'Synchronizing Cryptographic Chain...' : 'Initiate Batch Ingestion'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="panel border-t-2 border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center">
                                <Terminal className="w-3 h-3 mr-2" />
                                <span>Real-time Communication Log</span>
                            </h3>
                            <span className="flex items-center space-x-1.5 text-[9px] text-green-500 font-bold uppercase tracking-widest px-2 py-0.5 bg-green-500/10 rounded">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Gateway Online</span>
                            </span>
                        </div>
                        <div className="space-y-3 font-mono">
                            {logs.map((log) => (
                                <div key={log.id} className="text-[11px] flex items-start space-x-4 group">
                                    <span className="text-slate-600 font-bold">{log.time}</span>
                                    <span className={`font-black tracking-tighter w-16 text-right ${log.type === 'ERROR' ? 'text-red-500' : log.type === 'SUCCESS' ? 'text-green-500' : log.type === 'PROCESS' ? 'text-blue-500' : 'text-slate-500'}`}>[{log.type}]</span>
                                    <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="panel border-blue-500/20 bg-blue-500/5">
                        <h3 className="text-sm font-bold mb-4 flex items-center text-blue-400">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            <span>Protocol Standards</span>
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed italic mb-6">Ensure your ingest CSV satisfies the following structural requirements for Anomaly Engine analysis:</p>
                        <div className="space-y-4">
                            {[
                                { col: 'vendor_id', desc: 'Unique alphanumeric identifier' },
                                { col: 'vendor_name', desc: 'Display name for entity mapping' },
                                { col: 'amount', desc: 'Integer or Float of payment' },
                                { col: 'timestamp', desc: 'ISO 8601 formatted datetime' },
                                { col: 'department', desc: 'Originating government dept' }
                            ].map(item => (
                                <div key={item.col} className="flex justify-between items-center p-2.5 bg-slate-900 border border-slate-800 rounded">
                                    <code className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{item.col}</code>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">{item.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="panel">
                        <h3 className="text-sm font-bold mb-6 flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-slate-500" />
                            <span>Gateway History</span>
                        </h3>
                        <div className="space-y-2">
                            {[
                                { name: 'Q4_TRANS_BATCH_992.csv', status: 'VERIFIED', size: '1.2 MB' },
                                { name: 'RAIL_PROC_OCT_24.csv', status: 'VERIFIED', size: '840 KB' },
                                { name: 'MIN_FIN_DEDUP_02.csv', status: 'REJECTED', size: '2.1 MB' }
                            ].map((job, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-800">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-300 truncate w-32">{job.name}</p>
                                            <p className="text-[9px] text-slate-600 font-mono italic">{job.size}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest ${job.status === 'VERIFIED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{job.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ingestion;

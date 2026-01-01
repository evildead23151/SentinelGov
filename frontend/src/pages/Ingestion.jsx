import React, { useState, useEffect } from 'react';
import {
    Database,
    Upload,
    Play,
    History,
    CheckCircle2,
    AlertCircle,
    Terminal,
    Clock
} from 'lucide-react';

const Ingestion = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState([
        { id: 1, time: '14:02:01', type: 'SYS', msg: 'Handshake initialized with Treasury_Gateway_v4' },
        { id: 2, time: '14:02:03', type: 'AUTH', msg: 'Token verified. Encryption: AES-256-GCM.' },
    ]);

    const startProcess = () => {
        setIsProcessing(true);
        setProgress(0);
        const newLog = { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'INGEST', msg: 'Stream started. Buffer size: 1024KB.' };
        setLogs(prev => [...prev, newLog]);
    };

    useEffect(() => {
        if (isProcessing && progress < 100) {
            const timer = setTimeout(() => setProgress(prev => prev + 5), 500);
            if (progress === 50) {
                setLogs(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'VAL', msg: 'Schema deviation in column "vendor_risk". Auto-correcting type (str -> int).' }]);
            }
            return () => clearTimeout(timer);
        } else if (progress >= 100) {
            setIsProcessing(false);
            setLogs(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString(), type: 'SYS', msg: 'Batch chunk 8 completed. Committing to ledger...' }]);
        }
    }, [isProcessing, progress]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Data Ingestion Protocol</h1>
                    <p className="text-slate-500 text-sm mt-1">Clearance Level: L5 // Eyes Only // v2.4.1 Stable</p>
                </div>
                <div className="flex space-x-3">
                    <button className="btn-secondary flex items-center space-x-2">
                        <History className="w-4 h-4" />
                        <span>Load History</span>
                    </button>
                    <button
                        onClick={startProcess}
                        disabled={isProcessing}
                        className={`btn-primary flex items-center space-x-2 ${isProcessing ? 'opacity-50' : ''}`}
                    >
                        <Play className="w-4 h-4" />
                        <span>{isProcessing ? 'Processing...' : 'Start Batch Process'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Source Selection */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="panel">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Source Selection</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { name: 'Treasury Dept', id: 'TR-8821-X', active: true },
                                { name: 'Railways Net', id: 'RN-1044-B', active: false },
                                { name: 'Welfare Dist.', id: 'WD-9920-L', active: false },
                                { name: 'Procurement', id: 'PC-4412-M', active: false },
                            ].map(source => (
                                <div key={source.name} className={`p-4 rounded-xl border cursor-pointer transition-all ${source.active ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <Database className={`w-6 h-6 ${source.active ? 'text-blue-500' : 'text-slate-500'}`} />
                                        {source.active && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                    </div>
                                    <div className="text-sm font-bold">{source.name}</div>
                                    <div className="text-[10px] font-mono text-slate-500 mt-1">ID: {source.id}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="panel relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center border-dashed border-2 border-slate-800 bg-slate-900/20">
                        {isProcessing ? (
                            <div className="w-full max-w-md space-y-8 p-8">
                                <div className="text-center">
                                    <div className="inline-block p-4 bg-blue-600/10 rounded-full mb-4 animate-pulse">
                                        <Upload className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold">Ingesting Encrypted Batch...</h3>
                                    <p className="text-sm text-slate-500 mt-2">Source: Treasury Dept // Chunk {Math.floor(progress / 10) + 1}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-mono">
                                        <span className="text-blue-400">{progress}% COMPLETE</span>
                                        <span className="text-slate-500">{Math.floor(progress * 8.42)}K / 84.2K RECORDS</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Errors</div>
                                        <div className="text-lg font-bold text-red-500">0.04%</div>
                                    </div>
                                    <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Confidence</div>
                                        <div className="text-lg font-bold text-green-500">99.8</div>
                                    </div>
                                    <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Integrity</div>
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 mx-auto" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-12">
                                <div className="inline-block p-6 bg-slate-800 rounded-full mb-6 border border-slate-700">
                                    <Upload className="w-12 h-12 text-slate-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-300">Click to upload or drag encrypted archive</h3>
                                <p className="text-sm text-slate-500 mt-2 max-w-xs">Max file size: 5GB (Auto-sharding enabled for large datasets)</p>
                                <div className="mt-8 flex justify-center space-x-3">
                                    <button className="btn-secondary text-xs px-6">Batch Upload</button>
                                    <button className="btn-secondary text-xs px-6">API Stream</button>
                                    <button className="btn-secondary text-xs px-6">Legacy FTP</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Logs */}
                <div className="panel h-full flex flex-col">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                            <Terminal className="w-3 h-3" />
                            <span>System Log</span>
                        </span>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </h3>

                    <div className="flex-1 overflow-auto font-mono text-[10px] space-y-3 custom-scrollbar pr-2">
                        <div className="text-slate-600 mb-4 font-bold border-b border-slate-800 pb-2 uppercase tracking-tighter">
                            SESSION_ID: 0x992A-F11
                        </div>
                        {logs.map((log) => (
                            <div key={log.id} className="flex space-x-3 group">
                                <span className="text-slate-500 shrink-0">{log.time}</span>
                                <span className={`shrink-0 font-bold ${log.type === 'ERR' ? 'text-red-500' :
                                        log.type === 'WARN' ? 'text-amber-500' :
                                            log.type === 'SYS' ? 'text-blue-400' :
                                                'text-green-500'
                                    }`}>[{log.type}]</span>
                                <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{log.msg}</span>
                            </div>
                        ))}
                        {isProcessing && (
                            <div className="flex space-x-3 items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                                <span className="text-blue-500 italic">Listening for next packet_</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Elapsed: 00:04:12</span>
                            </span>
                            <span className="font-mono">IP: 10.99.1.42</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ingestion;

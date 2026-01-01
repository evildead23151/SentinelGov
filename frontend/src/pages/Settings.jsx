import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCcw, Cpu, Shield, Database, Lock, AlertTriangle } from 'lucide-react';
import useStore from '../store/useStore';

const Settings = () => {
    const { user, systemStatus } = useStore();
    const [modelThreshold, setModelThreshold] = useState(75);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center space-x-3">
                        <SettingsIcon className="w-6 h-6 text-slate-500" />
                        <span>System Settings & Model Governance</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Configure detection thresholds, manage security policies, and monitor model health.</p>
                </div>
                <button className="btn-primary flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Save Configuration</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="panel space-y-8">
                    <div>
                        <h3 className="text-title text-[10px] mb-6 flex items-center space-x-2">
                            <Cpu className="w-3 h-3 text-blue-500" />
                            <span>Anomaly Engine Configuration</span>
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-xs font-bold text-slate-300">Global Sensitivity Threshold</label>
                                    <span className="text-xs font-mono text-blue-500">{modelThreshold}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={modelThreshold}
                                    onChange={(e) => setModelThreshold(e.target.value)}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <p className="text-[10px] text-slate-500 mt-2 italic">Anomalies with risk scores below this threshold will be suppressed from the primary alerts feed.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                                    <span className="text-xs text-slate-400">Deterministic Mode</span>
                                    <div className="w-8 h-4 bg-blue-600 rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
                                    <span className="text-xs text-slate-400">Explainability Bias</span>
                                    <div className="w-8 h-4 bg-blue-600 rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-title text-[10px] mb-4 flex items-center space-x-2">
                            <Database className="w-3 h-3 text-blue-500" />
                            <span>Data Retention Policy</span>
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold">Audit Ledger Retention</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Time period to keep immutable history</p>
                                </div>
                                <select className="bg-slate-800 border-none text-[10px] font-bold py-1 px-3 rounded">
                                    <option>7 YEARS</option>
                                    <option>10 YEARS</option>
                                    <option>PERMANENT</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="panel border-t-4 border-green-500">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-title text-[10px] mb-2">Model Health Overview</h3>
                                <p className="text-2xl font-black">{systemStatus}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                <Shield className="w-6 h-6 text-green-500" />
                            </div>
                        </div>

                        <div className="space-y-4 font-mono text-xs">
                            <div className="flex justify-between py-2 border-b border-slate-800">
                                <span className="text-slate-500">VERSION</span>
                                <span className="text-slate-300">v2.4.1-stable_build.9942</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800">
                                <span className="text-slate-500">LAST RETRAIN</span>
                                <span className="text-slate-300">2023-10-24 15:00:01 ZULU</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800">
                                <span className="text-slate-500">LATENCY (P99)</span>
                                <span className="text-slate-300">42ms</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800">
                                <span className="text-slate-500">VALIDATION SCORE</span>
                                <span className="text-green-500">92.4% MATCH</span>
                            </div>
                        </div>

                        <button className="w-full mt-6 flex items-center justify-center space-x-2 py-3 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest">
                            <RefreshCcw className="w-4 h-4" />
                            <span>Re-Validate Model Integrity</span>
                        </button>
                    </div>

                    <div className="panel bg-red-600/5 border-red-500/20 border-dashed border-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">Emergency Protocol</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-6 italic">
                            Activating emergency protocol will immediately freeze all outgoing payments across all departments and revoke L1-L3 clearance keys.
                        </p>
                        <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs tracking-tighter shadow-lg shadow-red-600/20">
                            ACTIVATE SYSTEM LOCKDOWN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

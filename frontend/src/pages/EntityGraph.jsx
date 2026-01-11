import React, { useEffect, useState } from 'react';
import { Share2, Users, Database, ShieldAlert, Cpu, Settings as SettingsIcon, Save, RefreshCcw, Target, AlertCircle, Banknote } from 'lucide-react';
import axios from 'axios';

const EntityGraph = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        fetchGraph();
    }, []);

    const fetchGraph = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8000/api/graph');
            setGraphData(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const getPosition = (index, total) => {
        const radius = 250;
        const angle = (index / total) * 2 * Math.PI;
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    };

    const getNodeStyles = (node) => {
        const risk = node.risk || 0;
        let base = "bg-slate-900 border-slate-700 text-slate-400";
        let shadow = "shadow-lg";

        if (node.type === 'TENDER') base = "bg-blue-600/20 border-blue-500 text-blue-400";
        if (node.type === 'VENDOR') base = risk > 50 ? "bg-red-600/20 border-red-500 text-red-400" : "bg-emerald-600/20 border-emerald-500 text-emerald-400";
        if (node.type === 'ALERT') {
            base = risk > 80 ? "bg-red-600 border-red-400 text-white animate-pulse" : "bg-amber-600/20 border-amber-500 text-amber-500";
            shadow = "shadow-[0_0_20px_rgba(239,68,68,0.3)]";
        }
        if (node.type === 'TRANSACTION') base = "bg-amber-600/20 border-amber-500 text-amber-500";

        return `${base} ${shadow}`;
    };

    const getNodeIcon = (type) => {
        switch (type) {
            case 'TENDER': return <Target size={18} />;
            case 'VENDOR': return <Database size={18} />;
            case 'ALERT': return <ShieldAlert size={18} />;
            case 'TRANSACTION': return <Banknote size={18} />;
            default: return <Cpu size={18} />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-black flex items-center space-x-3 text-white uppercase tracking-tighter">
                        <Share2 className="w-6 h-6 text-blue-500" />
                        <span>Institutional Threat Map</span>
                    </h1>
                    <p className="text-slate-500 text-xs mt-1 uppercase font-mono tracking-widest">Procedural Relationship Visualization // SOC Level 3</p>
                </div>
                <button onClick={fetchGraph} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-xs flex items-center space-x-2 transition-all">
                    <RefreshCcw className="w-4 h-4" />
                    <span>REFRESH SILO</span>
                </button>
            </div>

            <div className="flex-1 panel relative overflow-hidden bg-[#0a0c10] border-2 border-white/5 rounded-2xl flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                {loading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center translate-y-[-20px]">

                        {/* Central Hub */}
                        <div className="absolute z-30 w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center border-4 border-[#0a0c10] shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
                            <ShieldAlert className="w-8 h-8 text-white relative z-10" />
                        </div>

                        {/* Nodes */}
                        {graphData.nodes.map((node, i) => {
                            const pos = getPosition(i, graphData.nodes.length);
                            return (
                                <div
                                    key={node.id}
                                    className="absolute z-20 flex flex-col items-center justify-center group"
                                    style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
                                    onClick={() => setSelectedNode(node)}
                                >
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer group-hover:scale-110 ${getNodeStyles(node)}`}>
                                        {getNodeIcon(node.type)}
                                    </div>
                                    <div className="mt-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter text-gray-300 border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                        {node.label}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Links */}
                        <svg className="absolute inset-0 w-full h-full -z-10 overflow-visible origin-center pointer-events-none">
                            {graphData.nodes.map((node, i) => {
                                const pos = getPosition(i, graphData.nodes.length);
                                return (
                                    <line
                                        key={i}
                                        x1="0" y1="0"
                                        x2={pos.x} y2={pos.y}
                                        stroke={node.risk > 50 ? "#ef4444" : "#1e293b"}
                                        strokeWidth={node.risk > 80 ? "3" : "1"}
                                        opacity={node.risk > 50 ? "0.6" : "0.3"}
                                        className={node.risk > 80 ? "animate-pulse" : ""}
                                    />
                                );
                            })}
                        </svg>

                        {/* Node Detail HUD */}
                        {selectedNode && (
                            <div className="absolute top-6 left-6 w-64 bg-[#111827]/90 backdrop-blur-xl border border-white/10 p-5 rounded-xl text-xs space-y-3 shadow-2xl animate-in slide-in-from-left duration-300">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{selectedNode.type}</span>
                                        <h3 className="font-bold text-white mt-1">{selectedNode.label}</h3>
                                    </div>
                                    <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white">×</button>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Forensic ID</span>
                                        <span className="text-gray-300 font-mono">{selectedNode.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Risk Intensity</span>
                                        <span className={`font-bold ${selectedNode.risk > 50 ? 'text-red-500' : 'text-emerald-500'}`}>{selectedNode.risk || 0}%</span>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-white/5">
                                    <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                        {selectedNode.type === 'ALERT' ? 'High potential for procedural manipulation. Immediate investigator audit required.' : 'Relationship verified in the central procurement registry.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Graph Legend */}
                        <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-sm border border-white/5 p-4 rounded-lg flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div> <span className="text-[10px] font-bold text-gray-400 uppercase">Tenders</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> <span className="text-[10px] font-bold text-gray-400 uppercase">Clean Vendors</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div> <span className="text-[10px] font-bold text-gray-400 uppercase">Alert Silos</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EntityGraph;

import React, { useEffect, useState } from 'react';
import { Share2, Users, Database, ShieldAlert, Cpu, Settings as SettingsIcon, Save, RefreshCcw } from 'lucide-react';
import axios from 'axios';

const EntityGraph = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGraph();
    }, []);

    const fetchGraph = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/graph');
            setGraphData(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    // Calculate position for nodes (Simple circular layout for now)
    const getPosition = (index, total) => {
        const radius = 200;
        const angle = (index / total) * 2 * Math.PI;
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
        };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center space-x-3">
                        <Share2 className="w-6 h-6 text-blue-500" />
                        <span>Entity Relationship Graph</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Cross-departmental relationship mappings and conflict of interest detection.</p>
                </div>
                <button onClick={fetchGraph} className="btn-secondary px-3 py-2 flex items-center space-x-2">
                    <RefreshCcw className="w-4 h-4" />
                    <span>Refresh Intel</span>
                </button>
            </div>

            <div className="panel h-[600px] flex flex-col relative overflow-hidden bg-slate-900/30">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e2530 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="z-10 flex flex-col items-center justify-center flex-1 relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                        {/* Empty State */}
                        {graphData.nodes.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
                                <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700 backdrop-blur-md text-center shadow-2xl">
                                    <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                    <h3 className="text-slate-300 font-bold uppercase tracking-widest text-sm">No Intelligence Mapped</h3>
                                    <p className="text-[10px] text-slate-500 mt-2 max-w-[200px] leading-relaxed">
                                        Ingest transaction data or initiate cases to populate the threat graph.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Central Government Node */}
                        <div className="absolute z-30 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center border-4 border-[#0a0c10] shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                            <Users className="w-10 h-10 text-white" />
                        </div>

                        {/* Nodes */}
                        {graphData.nodes.map((node, i) => {
                            const pos = getPosition(i, graphData.nodes.length);
                            return (
                                <div
                                    key={node.id}
                                    className="absolute z-20 flex flex-col items-center justify-center transition-all hover:scale-110 cursor-pointer"
                                    style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
                                >
                                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 shadow-lg mb-2 ${node.type === 'alert' ? 'bg-red-500/20 border-red-500 text-red-500' :
                                        node.type === 'case' ? 'bg-purple-500/20 border-purple-500 text-purple-500' :
                                            node.type === 'department' ? 'bg-blue-500/20 border-blue-500 text-blue-500' :
                                                'bg-slate-800 border-slate-600 text-slate-400'
                                        }`}>
                                        <div className="text-[9px] font-black uppercase">{node.type.substring(0, 4)}</div>
                                    </div>
                                    <div className="bg-slate-900/80 px-2 py-1 rounded text-[10px] whitespace-nowrap border border-slate-700">
                                        {node.label}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Simple SVG Links */}
                        <svg className="absolute inset-0 w-full h-full -z-10 overflow-visible origin-center pointer-events-none">
                            {graphData.nodes.map((node, i) => {
                                const pos = getPosition(i, graphData.nodes.length);
                                return (
                                    <line
                                        key={i}
                                        x1="0" y1="0"
                                        x2={pos.x} y2={pos.y}
                                        stroke="#334155"
                                        strokeWidth="1"
                                        opacity="0.3"
                                    />
                                );
                            })}
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EntityGraph;

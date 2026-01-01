import React from 'react';
import { Share2, Users, Database, ShieldAlert, Cpu, Settings as SettingsIcon, Save, RefreshCcw } from 'lucide-react';

const EntityGraph = () => {
    const entities = [
        { name: 'Vertex Holdings', type: 'Parent', connections: 12, risk: 'Critical' },
        { name: 'Global Supplies', type: 'Subsidiary', connections: 5, risk: 'High' },
        { name: 'North District Gov', type: 'Department', connections: 45, risk: 'Low' },
        { name: 'Omega Const.', type: 'Contractor', connections: 8, risk: 'Medium' },
    ];

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
            </div>

            <div className="panel h-[600px] flex flex-col relative overflow-hidden bg-slate-900/30">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e2530 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                <div className="z-10 flex flex-col items-center justify-center flex-1 space-y-12">
                    {/* Mock Graph Visualization */}
                    <div className="relative">
                        {/* Center Node */}
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center border-4 border-[#0a0c10] shadow-[0_0_30px_rgba(59,130,246,0.5)] z-20 relative">
                            <Users className="w-10 h-10 text-white" />
                        </div>

                        {/* Satellite Nodes */}
                        <div className="absolute -top-32 -left-32 w-20 h-20 bg-amber-500/20 border-2 border-amber-500/50 rounded-lg flex flex-col items-center justify-center p-2">
                            <div className="text-[8px] font-bold text-amber-500 uppercase">Vendor</div>
                            <div className="text-[10px] font-bold text-center leading-tight">NorthStar Ltd</div>
                        </div>

                        <div className="absolute top-40 left-40 w-20 h-20 bg-red-500/20 border-2 border-red-500/50 rounded-lg flex flex-col items-center justify-center p-2">
                            <div className="text-[8px] font-bold text-red-500 uppercase">Alert</div>
                            <div className="text-[10px] font-bold text-center leading-tight">Vertex Holdings</div>
                        </div>

                        <div className="absolute -top-40 left-32 w-20 h-20 bg-slate-800 border-2 border-slate-700 rounded-lg flex flex-col items-center justify-center p-2">
                            <div className="text-[8px] font-bold text-slate-500 uppercase">Dept</div>
                            <div className="text-[10px] font-bold text-center leading-tight">Public Works</div>
                        </div>

                        {/* Connection Lines (SVGs) */}
                        <svg className="absolute inset-0 w-full h-full -z-10 overflow-visible origin-center" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                            <line x1="0" y1="0" x2="-128" y2="-128" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" />
                            <line x1="0" y1="0" x2="160" y2="160" stroke="#ef4444" strokeWidth="3" opacity="0.5" />
                            <line x1="0" y1="0" x2="128" y2="-160" stroke="#334155" strokeWidth="2" opacity="0.3" />
                        </svg>
                    </div>

                    <div className="w-full max-w-2xl grid grid-cols-4 gap-4">
                        {entities.map(e => (
                            <div key={e.name} className="panel bg-[#11141b]/80 backdrop-blur-sm border-slate-700 hover:border-blue-500 transition-all cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`w-2 h-2 rounded-full ${e.risk === 'Critical' ? 'bg-red-500' : e.risk === 'High' ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">{e.type}</span>
                                </div>
                                <div className="text-xs font-bold group-hover:text-blue-400 transition-colors uppercase truncate">{e.name}</div>
                                <div className="text-[10px] text-slate-500 mt-1">{e.connections} Connections</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-6 right-6 z-10 flex flex-col space-y-2">
                    <button className="btn-secondary p-2 rounded-full h-10 w-10 flex items-center justify-center shadow-lg"><RefreshCcw className="w-4 h-4" /></button>
                    <div className="bg-[#11141b] border border-slate-700 rounded-lg p-3 shadow-2xl">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Graph Depth</h4>
                        <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-2/3"></div>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 mt-1 uppercase font-bold">
                            <span>L1</span>
                            <span>L3 (MAX)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntityGraph;

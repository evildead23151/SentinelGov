import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Fingerprint, Play, ChevronRight, UserPlus } from 'lucide-react';
import useStore from '../store/useStore';

const Home = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useStore();

    const handleLogin = (e) => {
        e.preventDefault();
        if (pin === '1234') {
            navigate('/dashboard');
        } else {
            setError('INVALID CLEARANCE KEY');
            setTimeout(() => setError(''), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-6 group transition-all">
                        <Shield className="w-10 h-10 text-blue-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">GOVINTEL SOC</h1>
                    <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">National Security Audit Protocol</p>
                </div>

                <div className="panel p-8 shadow-2xl border-slate-800/50 backdrop-blur-sm">
                    {user ? (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl text-white">
                                    {user.full_name?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-white truncate">{user.full_name}</div>
                                    <div className="text-xs text-slate-500 font-mono truncate">{user.gov_id}</div>
                                </div>
                                <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400">
                                    LVL {user.clearance_level}
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[.2em] rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                <span>Enter Control Plane</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 mb-4">
                                <Lock className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Identity Not Established</p>
                                <p className="text-[11px] text-slate-600 italic mt-2">Zero-Failure Security Protocol in Effect</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-3 group"
                                >
                                    <span>Establish Secure Link</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <button
                                    onClick={() => navigate('/register')}
                                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-black text-xs uppercase tracking-[0.2em] rounded-lg transition-all flex items-center justify-center space-x-3"
                                >
                                    <span>Institutional Onboarding</span>
                                    <UserPlus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-12 flex items-center justify-center space-x-8 text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em]">
                    <span className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        <span>AES-256 ENCRYPTED</span>
                    </span>
                    <span className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        <span>FIPS 140-2 COMPLIANT</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Home;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Fingerprint } from 'lucide-react';
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
                    <div className="flex items-center space-x-4 mb-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">
                            {user.name[0]}
                        </div>
                        <div>
                            <div className="text-sm font-semibold">{user.name}</div>
                            <div className="text-xs text-slate-500 font-mono">{user.badgeId}</div>
                        </div>
                        <div className="ml-auto px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-400">
                            LVL {user.clearance}
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Clearance Key (PIN: 1234)</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    maxLength={4}
                                    className={`w-full bg-[#1e2530] border ${error ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-[#334155]'} rounded-lg py-4 text-center text-3xl tracking-[1em] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    placeholder="••••"
                                    autoFocus
                                />
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            </div>
                            {error && <div className="text-red-500 text-[10px] font-bold text-center mt-3 tracking-widest animate-pulse">{error}</div>}
                        </div>

                        <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center justify-center space-x-2 group shadow-lg shadow-blue-600/20">
                            <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span>AUTHENTICATE</span>
                        </button>
                    </form>
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

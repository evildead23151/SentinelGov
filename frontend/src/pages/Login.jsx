import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, Play } from 'lucide-react';
import useStore from '../store/useStore';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Default intended destination
    const from = location.state?.from?.pathname;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const user = await login(username, password);

            // STRICT IDENTITY REDIRECT LOGIC
            // If the user was trying to go somewhere specific (e.g. they got kicked out), send them there IF applicable.
            // OTHERWISE, enforce strict dashboard segregation.

            if (user.role === 'FINANCE_OFFICER' || user.role === 'OVERSIGHT') {
                // Finance/Treasury View
                navigate(from && from.includes('/finance') ? from : '/finance/dashboard', { replace: true });
            } else {
                // Investigator/Police View
                navigate(from && !from.includes('/finance') ? from : '/dashboard', { replace: true });
            }

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d1017] flex items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
            <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(37,99,235,0.3)] rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Shield className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">SentinelGov</h1>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Government Intelligence SOC</p>
                    </div>
                </div>

                <div className="panel bg-[#11141b]/80 backdrop-blur-xl border-white/5 p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded flex items-start space-x-3 animate-in shake duration-300">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-xs text-red-400 font-medium italic leading-relaxed">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Code (Username)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-[#0d1017] border border-slate-800 rounded-lg py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                        placeholder="e.g. investigator_01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Credential</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#0d1017] border border-slate-800 rounded-lg py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-lg transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] flex items-center justify-center space-x-3"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Establish Secure Link</span>
                                    <Play className="w-3 h-3 fill-current" />
                                </>
                            )}
                        </button>

                        <div className="text-center">
                            <Link to="/register" className="text-[10px] font-bold text-slate-500 hover:text-blue-500 uppercase tracking-widest transition-colors">
                                No Identity? Register Institutional Actor
                            </Link>
                        </div>
                    </form>
                </div>

                <div className="text-center space-y-4">
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest">
                        SECURE LAYER: AES-256-GCM // ARGON2ID // TLS 1.3
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">Gateway Status: Operational</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

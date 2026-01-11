import React from 'react';
import { ShieldAlert, RefreshCw, LogOut } from 'lucide-react';

class SecuredErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("SECURE_LAYER_EXCEPTION:", error, errorInfo);
    }

    handleReset = () => {
        window.location.href = '/';
    };

    handleLogout = () => {
        localStorage.removeItem('sentinel_token');
        window.location.href = '/login';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0f18] flex items-center justify-center p-6 font-mono">
                    <div className="max-w-md w-full bg-[#111827] border-t-2 border-red-500 rounded-lg p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <ShieldAlert size={120} />
                        </div>

                        <div className="flex items-center gap-3 text-red-500 mb-6">
                            <ShieldAlert size={32} />
                            <h1 className="text-xl font-bold tracking-tighter">SECURED_LAYER_ABORT</h1>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <p className="text-gray-400 text-sm leading-relaxed">
                                The system encountered a procedural exception that could not be recovered by the UI engine.
                                Secure state has been preserved.
                            </p>

                            <div className="bg-black/40 p-3 rounded border border-gray-800">
                                <code className="text-xs text-red-400 break-all">
                                    {this.state.error?.message || "UNDEFINED_PROCEDURAL_ERROR"}
                                </code>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <button
                                    onClick={this.handleReset}
                                    className="flex items-center justify-center gap-2 bg-[#1f2937] hover:bg-[#374151] text-white py-2 px-4 rounded transition-all text-xs border border-gray-700"
                                >
                                    <RefreshCw size={14} />
                                    Soft Reset
                                </button>
                                <button
                                    onClick={this.handleLogout}
                                    className="flex items-center justify-center gap-2 bg-red-950/20 hover:bg-red-900/40 text-red-400 py-2 px-4 rounded transition-all text-xs border border-red-900/50"
                                >
                                    <LogOut size={14} />
                                    Secure Logout
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-800 text-[10px] text-gray-500 flex justify-between uppercase tracking-widest">
                            <span>Status: Locked</span>
                            <span>Sig: {Math.random().toString(36).substring(7)}</span>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default SecuredErrorBoundary;

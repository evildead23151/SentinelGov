import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("SECURE_LAYER_FATAL_ERROR:", error, errorInfo);
        // In production, log to backend with GovID here
    }

    handleReset = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0d1017] flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full panel border-red-500/50 bg-red-500/5 text-center space-y-6 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                            <ShieldAlert className="w-10 h-10 text-red-500" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-xl font-black text-white uppercase tracking-tighter">Secure Layer Failure</h1>
                            <p className="text-sm text-slate-400 leading-relaxed italic">
                                A mid-session state corruption or unauthorized access attempt has been detected.
                                The UI has been locked to prevent undefined behavior.
                            </p>
                        </div>

                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 text-left font-mono">
                            <p className="text-[10px] text-red-400 font-bold mb-1">ERROR_HASH:</p>
                            <p className="text-[9px] text-slate-500 break-all">
                                {this.state.error?.message || "UNDEFINED_STATE_EXCEPTION"}
                            </p>
                        </div>

                        <button
                            onClick={this.handleReset}
                            className="w-full btn-primary bg-red-600 hover:bg-red-500 flex items-center justify-center space-x-2 py-4"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>RESET SECURE SESSION</span>
                        </button>

                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                            Determinism Enforced // Code Sentinel v9
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

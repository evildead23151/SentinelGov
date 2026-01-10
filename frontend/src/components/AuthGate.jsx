import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import { Shield, Lock } from 'lucide-react';

const SecureLoader = () => (
    <div className="min-h-screen bg-[#0d1017] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
            <div className="w-24 h-24 border-2 border-blue-500/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-10 h-10 text-blue-500 animate-pulse" />
            </div>
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse">Decrypting Identity</h2>
            <p className="text-[10px] text-slate-500 font-mono italic">Establishing military-grade bridge...</p>
        </div>
    </div>
);

const AuthGate = ({ children }) => {
    const { authStatus, validateIdentity } = useStore();
    const location = useLocation();

    useEffect(() => {
        validateIdentity();
    }, [validateIdentity]);

    if (authStatus === 'AUTH_LOADING') {
        return <SecureLoader />;
    }

    if (authStatus === 'UNAUTHENTICATED') {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AuthGate;

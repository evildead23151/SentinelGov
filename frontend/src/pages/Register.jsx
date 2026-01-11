import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Lock, Briefcase, Building, MapPin, Award, CheckCircle, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        email: '',
        organization: 'DP',
        jurisdiction: 'DELHI',
        rank: 'Inspector',
        department: 'Audit',
        role: 'DATA_OFFICER',
        clearance_level: 1
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { register } = useStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.name === 'clearance_level' ? parseInt(e.target.value) || 1 : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d1017] flex items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
            <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-5 gap-8 bg-[#11141b]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">

                {/* Visual Sidebar */}
                <div className="md:col-span-2 bg-blue-600 p-8 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <Shield className="w-12 h-12 mb-6" />
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-4">Identity Authorization Request</h1>
                        <p className="text-xs text-blue-100 leading-relaxed font-medium italic">
                            New archival actors must register within the Central Governance Registry for traceability and structural authority.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-blue-200">
                            <CheckCircle className="w-4 h-4" />
                            <span>Encrypted Ledger Ready</span>
                        </div>
                        <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-1/3 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-10 right-10 w-40 h-40 border-8 border-white rounded-full"></div>
                        <div className="absolute bottom-10 left-10 w-20 h-20 border-4 border-white rotate-45"></div>
                    </div>
                </div>

                {/* Form Area */}
                <div className="md:col-span-3 p-8 space-y-6">
                    <div className="flex justify-between items-end mb-2">
                        <h2 className="text-lg font-bold text-white uppercase tracking-widest">Onboarding Portal</h2>
                        <Link to="/login" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest">Back to Login</Link>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded text-[11px] text-red-500 font-medium italic leading-relaxed animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Code</label>
                                <input name="username" value={formData.username} onChange={handleChange} required className="onboarding-input" placeholder="e.g. giteshmalik01" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Credential</label>
                                <input name="password" type="password" value={formData.password} onChange={handleChange} required className="onboarding-input" placeholder="••••••••" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                            <input name="full_name" value={formData.full_name} onChange={handleChange} required className="onboarding-input" placeholder="Officer Name" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Email Address</label>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} required className="onboarding-input" placeholder="officer@gov.delhi.in" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Organization</label>
                                <select name="organization" value={formData.organization} onChange={handleChange} className="onboarding-input">
                                    <option value="DP">DP (Police)</option>
                                    <option value="FIN">FIN (Finance Dept)</option>
                                    <option value="MIN">MIN (Ministry)</option>
                                    <option value="MOD">MOD (Defense)</option>
                                    <option value="CID">CID (Intelligence)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Jurisdiction</label>
                                <input name="jurisdiction" value={formData.jurisdiction} onChange={handleChange} required className="onboarding-input" placeholder="Delhi / Central" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Institutional Rank</label>
                                <input name="rank" value={formData.rank} onChange={handleChange} required className="onboarding-input" placeholder="SSP / DIG / Inspector" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
                                <input name="department" value={formData.department} onChange={handleChange} required className="onboarding-input" placeholder="Finance / Audit" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Governance Role</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="onboarding-input">
                                    <option value="DATA_OFFICER">Data Officer</option>
                                    <option value="FINANCE_OFFICER">Finance Officer</option>
                                    <option value="INVESTIGATOR">Investigator</option>
                                    <option value="SECTION_HEAD">Section Head</option>
                                    <option value="OVERSIGHT">Oversight Cell</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Clearance Level</label>
                                <input name="clearance_level" type="number" min="1" max="5" value={formData.clearance_level} onChange={handleChange} required className="onboarding-input" />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-lg text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all flex items-center justify-center space-x-3 mt-4"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Initiate Authorization</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <style sx>{`
                .onboarding-input {
                    display: block;
                    width: 100%;
                    background: #0d1017;
                    border: 1px solid #1e2530;
                    border-radius: 8px;
                    padding: 10px 14px;
                    font-size: 11px;
                    color: white;
                    transition: border-color 0.2s;
                }
                .onboarding-input:focus {
                    outline: none;
                    border-color: #2563eb;
                }
                select.onboarding-input {
                    appearance: none;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default Register;

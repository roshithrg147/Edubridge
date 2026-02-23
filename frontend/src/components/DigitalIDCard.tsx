import React, { useState, useEffect } from 'react';
import { ShieldCheck, Copy, Clock } from 'lucide-react';

interface DigitalIDCardProps {
    user: {
        fullName: string;
        collegeName: string;
        photoUrl?: string;
        provisionedEmail?: string;
        admissionYear?: number;
        verificationStatus?: string;
    };
}

const DigitalIDCard: React.FC<DigitalIDCardProps> = ({ user }) => {
    const isPending = user.verificationStatus === 'PENDING' || !user.provisionedEmail;
    const [showAlternate, setShowAlternate] = useState(false);

    useEffect(() => {
        if (!isPending) return;
        const interval = setInterval(() => {
            setShowAlternate(prev => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, [isPending]);

    return (
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group w-full max-w-[420px] mx-auto transition-all duration-500">

            {/* S3 Photo Background */}
            {user.photoUrl && (
                <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                    <img src={user.photoUrl} className="w-full h-full object-cover" alt="Profile Background" />
                </div>
            )}

            <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]"></div>

            <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 overflow-hidden">
                    {user.photoUrl ? (
                        <img src={user.photoUrl} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                        <ShieldCheck className="w-8 h-8 text-indigo-300" />
                    )}
                </div>
                <div className="text-right">
                    <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-block ${user.verificationStatus === 'APPROVED' ? 'bg-green-400 text-green-900' : 'bg-amber-400 text-amber-900'
                        }`}>
                        {user.verificationStatus === 'APPROVED' ? 'Verified Active' : 'Pending Verification'}
                    </div>
                    <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-2 block opacity-60">IDaaS Digital Passport</div>
                </div>
            </div>

            <div className="relative z-10">
                <h2 className="text-3xl font-black tracking-tight mb-2">{user.fullName || "Student"}</h2>
                <p className="text-indigo-200/80 font-bold text-sm mb-8">{user.collegeName || "Institution Name"}</p>

                <div className="space-y-4">
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Academic Alias</div>
                    <div className={`bg-white/5 border border-white/10 h-[60px] rounded-[1.5rem] group/code hover:bg-white/10 transition-colors cursor-pointer relative overflow-hidden ${isPending ? 'grayscale-[0.5]' : ''
                        }`}>

                        {/* Primary View: Email Alias */}
                        <div className={`absolute inset-0 px-5 flex items-center justify-between transition-all duration-700 ease-in-out ${isPending && showAlternate ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
                            }`}>
                            <code className="text-indigo-100 font-bold text-sm break-all relative z-10">
                                {user.provisionedEmail || "Provisioning in progress..."}
                            </code>
                            <Copy className="w-4 h-4 text-indigo-400 opacity-0 group-hover/code:opacity-100 transition-opacity relative z-10" />
                        </div>

                        {/* Secondary View: Pending Message */}
                        {isPending && (
                            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out bg-indigo-600/10 ${showAlternate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                        Pending Provisioning...
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 flex justify-between items-center pt-8 border-t border-white/10">
                    <div>
                        <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">ISSUED</div>
                        <div className="text-xs font-bold">{new Date().toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Admission Year</div>
                        <div className="text-xs font-bold">{user.admissionYear || "N/A"}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalIDCard;

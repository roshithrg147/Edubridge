import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ShieldCheck, Award, HardDrive, Terminal, Palette, Coffee, Sparkles, ExternalLink, Zap, Database } from 'lucide-react';
import DigitalIDCard from './DigitalIDCard';

const VaultDashboard: React.FC = () => {
    const { user, getAccessTokenSilently } = useAuth0();
    const [profile, setProfile] = React.useState<any>(null); // Replace 'any' with UserProfile type if imported
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch('http://localhost:8081/api/registrations/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user, getAccessTokenSilently]);

    // Fallback or dynamically generated alias


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (profile?.verificationStatus === 'REJECTED') {
        return (
            <div className="max-w-md mx-auto mt-20 p-12 bg-white rounded-[3rem] border border-red-100 text-center shadow-xl shadow-red-50">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500 font-black text-4xl">!</div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">Verification Rejected</h2>
                <p className="text-slate-500 font-medium mb-8">
                    {profile.rejectionReason || "Your registration was not approved. Please contact support."}
                </p>
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl shadow-slate-200">
                    Appeal Decision
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {profile?.verificationStatus === 'APPROVED' ? (
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Left Column: ID Card & Status */}
                    <div className="w-full lg:w-[420px] space-y-8">
                        <DigitalIDCard user={profile} />

                        {/* Infrastructure Stats */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Database className="w-5 h-5 text-indigo-600" />
                                Infrastructure Audit
                            </h3>
                            <div className="space-y-6">
                                <AuditItem icon={<HardDrive className="w-4 h-4" />} title="S3 Secure Storage" value="Encrypted Shard A" />
                                <AuditItem icon={<Zap className="w-4 h-4" />} title="Kafka Events" value="Stream Active" />
                                <AuditItem icon={<ShieldCheck className="w-4 h-4" />} title="OAuth2 Context" value="JWT Verified" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Benefits Catalog */}
                    <div className="flex-1 space-y-12">
                        <div>
                            <div className="flex items-end justify-between mb-10">
                                <div>
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Claim Your Perks</h3>
                                    <p className="text-slate-500 font-bold mt-1">Unlock benefits with your provisioned academic email.</p>
                                </div>
                                <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                                    <Sparkles className="w-4 h-4 animate-pulse" />
                                    $1,420 Remaining Savings
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                <BenefitCard brand="GitHub" category="Developer" discount="Copilot + Tools Free" icon={<Terminal />} image="https://picsum.photos/seed/ghdev/600/400" title="GitHub Student Pack" />
                                <BenefitCard brand="Adobe" category="Creative" discount="60% OFF Suite" icon={<Palette />} image="https://picsum.photos/seed/adb/600/400" title="Adobe CC Student" />
                                <BenefitCard brand="Notion" category="Education" discount="Free Unlimited" icon={<Award />} image="https://picsum.photos/seed/ntn/600/400" title="Notion Personal Pro" />
                                <BenefitCard brand="AWS" category="Infrastructure" discount="$200 Student Grant" icon={<Terminal />} image="https://picsum.photos/seed/aws/600/400" title="AWS Cloud Credit" />
                                <BenefitCard brand="Spotify" category="Lifestyle" discount="50% OFF Forever" icon={<Coffee />} image="https://picsum.photos/seed/sptf/600/400" title="Spotify Premium" />
                                <BenefitCard brand="Canva" category="Creative" discount="12 Months Free" icon={<Palette />} image="https://picsum.photos/seed/cnv/600/400" title="Canva Pro" />
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                                <Award className="w-64 h-64" />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="max-w-md">
                                    <h4 className="text-3xl font-black mb-4">Extend Your Identity</h4>
                                    <p className="text-indigo-200/70 font-medium leading-relaxed">
                                        Refer another student without an academic email. When they verify, you both unlock an additional <b>$50 cloud hosting credit</b>.
                                    </p>
                                </div>
                                <button className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-indigo-400 hover:text-white transition-all shadow-xl active:scale-95 shrink-0">
                                    Share Referral Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Verification Pending</span>
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter text-center">Identity is being verified...</h2>
                        <p className="text-slate-500 font-bold text-center mt-4">Once an admin approves your registration, your perks will unlock.</p>
                    </div>

                    <DigitalIDCard user={profile} />

                    <div className="mt-12 max-w-sm text-center">
                        <p className="text-amber-600 font-black text-lg animate-pulse">Pending Provisioning...</p>
                        <p className="text-slate-400 text-sm mt-2">Provisioning of your academic email alias starts immediately after verification.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const AuditItem = ({ icon, title, value }: any) => (
    <div className="flex justify-between items-center py-1">
        <div className="flex items-center gap-3 text-slate-500">
            <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
            <span className="text-xs font-bold">{title}</span>
        </div>
        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{value}</span>
    </div>
);

const BenefitCard = ({ title, discount, brand, image, category, icon }: any) => (
    <div className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full">
        <div className="h-48 overflow-hidden relative">
            <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={title} />
            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                {icon}
                {category}
            </div>
        </div>
        <div className="p-8 flex flex-col flex-1">
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">{brand}</div>
            <h4 className="font-black text-slate-900 text-xl mb-4 leading-tight">{title}</h4>
            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-sm font-black text-slate-800">{discount}</span>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <ExternalLink className="w-4 h-4" />
                </div>
            </div>
        </div>
    </div>
);

export default VaultDashboard;

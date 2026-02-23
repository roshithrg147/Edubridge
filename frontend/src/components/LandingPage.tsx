import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Rocket, Sparkles, Globe, Wallet, Zap } from 'lucide-react';

const LandingPage: React.FC = () => {
    const { loginWithRedirect } = useAuth0();

    return (
        <div className="relative overflow-hidden bg-slate-50 min-h-screen">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-200/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] bg-violet-200/20 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-20 pb-24 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-sm font-bold mb-8">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        No Official Student Email? No Problem.
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[1]">
                        Your Digital <br />
                        <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                            Academic Passport.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
                        EduBridge Vault provides you with a professional <b>academic alias</b> backed by document-based verification. Unlock $2,000+ in premium developer, creative, and lifestyle perks today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
                        <button
                            onClick={() => loginWithRedirect()}
                            className="group px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-3 active:scale-95"
                        >
                            Claim My Alias
                            <Rocket className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center gap-4 text-left">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <img key={i} src={`https://i.pravatar.cc/150?u=s${i}`} className="w-12 h-12 rounded-full border-4 border-white shadow-lg" alt="Student" />
                                ))}
                            </div>
                            <div>
                                <div className="text-sm font-black text-slate-800 tracking-wide">TRUSTED BY 15,000+</div>
                                <div className="text-xs font-bold text-slate-400">NON-TRADITIONAL STUDENTS</div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits Showcase Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-24">
                        <BenefitHighlight
                            title="GitHub Pro Bundle"
                            savings="$200/yr"
                            desc="Full access to Copilot, Pages, and advanced developer tools."
                            brand="GitHub"
                        />
                        <BenefitHighlight
                            title="Creative Suite"
                            savings="$450/yr"
                            desc="Student pricing for design, video, and photography apps."
                            brand="Adobe"
                        />
                        <BenefitHighlight
                            title="Global Subscriptions"
                            savings="$300/yr"
                            desc="Significant discounts on Spotify, Amazon Prime, and Notion."
                            brand="Partner Pack"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12 border-t pt-16 border-slate-200">
                    <FeatureCard
                        icon={<Globe className="w-8 h-8" />}
                        title="Global Recognition"
                        desc="Our provisioned '@edubridge.edu' aliases are compatible with identity providers worldwide."
                    />
                    <FeatureCard
                        icon={<Wallet className="w-8 h-8" />}
                        title="S3 Zero-Knowledge"
                        desc="We use document hashing. Your raw files are sharded in encrypted AWS S3 buckets."
                    />
                    <FeatureCard
                        icon={<Zap className="w-8 h-8" />}
                        title="Instant Verification"
                        desc="Our AI scanner validates your institution ID in seconds, bypassing manual review."
                    />
                </div>
            </div>
        </div>
    );
};

const BenefitHighlight = ({ title, savings, desc, brand }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{brand}</span>
            <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-lg">SAVE {savings}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
);

const FeatureCard = ({ icon, title, desc }: any) => (
    <div className="group">
        <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
);

export default LandingPage;

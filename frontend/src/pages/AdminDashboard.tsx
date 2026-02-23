import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Search, RefreshCw, AlertCircle } from 'lucide-react';

interface Registration {
    userId: string;
    fullName: string;
    email: string;
    collegeName: string;
    admissionYear: number;
    verificationStatus: string;
    createdAt: string;
}

const AdminDashboard = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const fetchPendingRegistrations = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const token = await getAccessTokenSilently();
            const response = await axios.get('http://localhost:8081/api/admin/registrations/pending', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRegistrations(response.data);
        } catch (err: any) {
            console.error('Failed to fetch registrations:', err);
            setError(err.response?.data?.message || 'Failed to load pending registrations.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPendingRegistrations();
    }, [getAccessTokenSilently]);

    const handleVerify = async (userId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
        try {
            const token = await getAccessTokenSilently();
            // URL-encode userId (important for characters like |)
            const encodedId = encodeURIComponent(userId);

            const params = new URLSearchParams();
            params.append('status', status);
            if (reason) params.append('reason', reason);

            await axios.patch(`http://localhost:8081/api/admin/verify/${encodedId}?${params.toString()}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            showToast(`User ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`, 'success');
            // Refresh list
            fetchPendingRegistrations(true);
        } catch (err: any) {
            console.error('Verification failed:', err);
            showToast(err.response?.data?.message || 'Verification failed. Please try again.', 'error');
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const filteredRegistrations = registrations.filter(reg =>
        reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-20 px-4 sm:px-6 lg:px-8">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle className="text-emerald-400" size={24} /> : <AlertCircle size={24} />}
                    <p className="font-bold">{toast.message}</p>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Admin Control Center</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Identity Verification</h1>
                        <p className="text-slate-500 mt-2 font-medium">Review and process student registration requests.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition" size={20} />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-4 bg-white rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full md:w-80 shadow-sm font-medium"
                            />
                        </div>
                        <button
                            onClick={() => fetchPendingRegistrations(true)}
                            disabled={refreshing}
                            className="p-4 bg-white rounded-2xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw className={refreshing ? 'animate-spin' : ''} size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                        <p className="text-slate-500 font-bold text-lg animate-pulse">Fetching pending requests...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-12 text-center">
                        <AlertCircle className="mx-auto text-red-500 mb-6" size={64} />
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Failed to Load Content</h2>
                        <p className="text-red-800 font-medium mb-8 max-w-md mx-auto">{error}</p>
                        <button
                            onClick={() => fetchPendingRegistrations()}
                            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition active:scale-95 shadow-xl shadow-slate-200"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : filteredRegistrations.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-xl shadow-slate-100/50">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100 text-slate-300">
                            <Clock size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Queue is Clear</h2>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto text-lg leading-relaxed">
                            No pending registrations found. Everything is up to date!
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Info</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredRegistrations.map((reg) => (
                                        <tr key={reg.userId} className="group hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl border border-indigo-100 group-hover:scale-110 transition duration-500">
                                                        {reg.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-lg leading-tight">{reg.fullName}</p>
                                                        <p className="text-slate-500 font-medium text-sm">{reg.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <p className="font-bold text-slate-700 leading-tight">{reg.collegeName}</p>
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Class of {reg.admissionYear}</p>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleVerify(reg.userId, 'APPROVED')}
                                                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition shadow-lg shadow-emerald-200 active:scale-95"
                                                    >
                                                        <CheckCircle size={18} />
                                                        <span>Approve</span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = window.prompt('Reason for rejection:');
                                                            if (reason !== null) handleVerify(reg.userId, 'REJECTED', reason);
                                                        }}
                                                        className="flex items-center gap-2 px-6 py-3 bg-white border border-red-100 text-red-600 rounded-xl font-bold hover:bg-red-50 transition active:scale-95"
                                                    >
                                                        <XCircle size={18} />
                                                        <span>Reject</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-slate-50/50 p-6 border-t border-slate-100 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                Showing {filteredRegistrations.length} Pending Registration{filteredRegistrations.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

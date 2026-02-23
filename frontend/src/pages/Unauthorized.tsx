import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <ShieldAlert size={40} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-600 mb-8">
                    You do not have the necessary permissions to access the Admin Dashboard. Please contact your system administrator if you believe this is an error.
                </p>
                <Link
                    to="/"
                    className="inline-block w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                >
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;

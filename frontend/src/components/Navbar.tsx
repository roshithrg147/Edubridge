import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Shield, LogOut, LogIn } from 'lucide-react';

const Navbar: React.FC = () => {
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

    return (
        <nav className="bg-white border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <Shield className="h-8 w-8 text-indigo-600" />
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            EduBridge Vault
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                                    <span className="text-xs text-slate-500">{user?.email}</span>
                                </div>
                                <button
                                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => loginWithRedirect()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-sm"
                            >
                                <LogIn className="h-4 w-4" />
                                Student Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AdminRouteProps {
    children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuth0();

    console.log('AdminRoute: user object:', user);
    console.log('AdminRoute: isAuthenticated:', isAuthenticated);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Checking Permissions...</p>
                </div>
            </div>
        );
    }

    // Auth0 custom claims namespace - search flexibly
    const findClaim = (pattern: string) => {
        const key = Object.keys(user || {}).find(k => k.includes(pattern));
        return key ? (user as any)[key] : [];
    };

    const roles = findClaim('roles');
    const permissions = findClaim('permissions');

    // Whitelist fallback for development
    const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || ['admin@test.com'];
    const isWhitelisted = user?.email && adminEmails.includes(user.email);

    console.log('AdminRoute: detected roles:', roles);
    console.log('AdminRoute: detected permissions:', permissions);
    console.log('AdminRoute: isWhitelisted:', isWhitelisted);

    const isAdmin = roles.includes('ADMIN') || permissions.includes('verify:users') || isWhitelisted;

    if (!isAuthenticated || !isAdmin) {
        console.warn('AdminRoute: Access Denied. Auth:', isAuthenticated, 'isAdmin:', isAdmin, 'Email:', user?.email);
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;

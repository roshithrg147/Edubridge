import { useAuth0 } from '@auth0/auth0-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import VaultDashboard from './components/VaultDashboard';
import IdentityVault from './components/IdentityVault';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import AdminRoute from './components/AdminRoute';
import { useState, useEffect } from 'react';

function App() {
  const { isAuthenticated, isLoading, error, getAccessTokenSilently } = useAuth0();
  const [hasIdentity, setHasIdentity] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [registration, setRegistration] = useState<any>(null);

  useEffect(() => {
    const checkIdentity = async () => {
      if (isAuthenticated) {
        setIsChecking(true);
        try {
          const token = await getAccessTokenSilently();
          const response = await fetch('http://localhost:8081/api/registrations/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data) {
              setRegistration(data);
              setHasIdentity(true);
            } else {
              setHasIdentity(false);
            }
          }
        } catch (error) {
          console.error("Failed to check identity:", error);
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkIdentity();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Verifying Identity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Authentication Error</h3>
          <p className="text-slate-500 mb-6">{error.message}</p>
          <a href="/" className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition">Try Again</a>
        </div>
      </div>
    );
  }

  const showNavbar = !isAuthenticated || (hasIdentity && registration?.verificationStatus !== 'PENDING') || !hasIdentity;
  // Actually, if !hasIdentity, we are showing IdentityVault, Navbar might be useful there? 
  // User said: "In the main Dashboard.tsx... If status === 'PENDING', hide the sidebar/navigation"
  // So if PENDING, hide Navbar.

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        {showNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={
            isAuthenticated ? (
              hasIdentity ? <VaultDashboard /> : <IdentityVault onComplete={() => setHasIdentity(true)} />
            ) : (
              <LandingPage />
            )
          } />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

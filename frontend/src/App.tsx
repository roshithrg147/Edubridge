
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Upload from './components/Upload'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'

// Demo Fallback ID
const DEMO_CLIENT_ID = 'YOUR_AUTH0_CLIENT_ID';
const DOMAIN = 'dev-edubridge.us.auth0.com';

const AppContent = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState('');

  if (isLoading) return <div className="loading">Loading Vault...</div>;

  if (isAuthenticated && user) {
    if (!token) {
      getAccessTokenSilently().then(t => setToken(t)).catch(e => console.error("Token error", e));
    }

    return (
      <div className="dashboard">
        <header className="header">
          <h1>EduBridge Vault</h1>
          <div className="user-info">
            <img src={user.picture} alt={user.name} className="avatar" />
            <span>{user.name}</span>
            <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="logout-btn">
              Sign Out
            </button>
          </div>
        </header>

        <main>
          <p className="description">Securely upload and manage your academic documents in the cloud.</p>
          {token && <Upload token={token} />}
        </main>
      </div>
    )
  }

  return (
    <div className="landing">
      <div className="hero">
        <img src={reactLogo} className="logo react" alt="EduBridge logo" />
        <h1>EduBridge Secure Vault</h1>
        <p className="subtitle">High-Performance Multi-Tenant Storage</p>

        <div className="card">
          <p>Login to access your secure document storage.</p>
          <button onClick={() => loginWithRedirect()} className="login-btn">
            Log In with Auth0
          </button>
        </div>

        <p className="info-text">
          Powered by Spring Boot, OAuth2 & AWS S3
        </p>
      </div>
    </div>
  )
}

function App() {
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || DEMO_CLIENT_ID;

  return (
    <Auth0Provider
      domain={DOMAIN}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: 'dev-edubridge',
        scope: 'openid profile email write:documents'
      }}
    >
      <div className="app-container">
        <AppContent />
      </div>
    </Auth0Provider>
  )
}

export default App

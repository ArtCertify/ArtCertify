import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AssetDetailsPage from './components/AssetDetailsPage';
import { DashboardPage } from './components/DashboardPage';
import { CertificationsPage } from './components/CertificationsPage';
import { LoginPage } from './components/LoginPage';
import { OrganizationProfilePage } from './components/OrganizationProfilePage';
import { WalletPage } from './components/WalletPage';
import { RolesPage } from './components/RolesPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { validateConfig } from './config/environment';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const { isAuthenticated, login } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <LoginPage onLogin={login} />
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/certificates" 
          element={
            <ProtectedRoute>
              <CertificationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/asset/:assetId" 
          element={
            <ProtectedRoute>
              <AssetDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <OrganizationProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roles" 
          element={
            <ProtectedRoute>
              <RolesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wallet" 
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          } 
        />
        {/* Redirect any unknown routes to home or login based on auth */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Validate configuration on app startup
    validateConfig();
  }, []);

  return (
    <AuthProvider>
              <Router>
          <AppRoutes />
        </Router>
    </AuthProvider>
  );
}

export default App;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Authenticating session credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4">
        <div className="cyber-card p-8 text-center border-rose-500/30">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-400 mb-6">
            Your current role (<span className="font-mono text-indigo-400">{user?.role}</span>) does
            not hold administrative clearance for this terminal.
          </p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

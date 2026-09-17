import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import PublicReport from './pages/PublicReport';
import TrackCase from './pages/TrackCase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CaseDetails from './pages/CaseDetails';
import AdminConsole from './pages/AdminConsole';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/report" element={<PublicReport />} />
                  <Route path="/track" element={<TrackCase />} />
                  <Route path="/track/:trackingId" element={<TrackCase />} />
                  <Route path="/login" element={<Login />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['INVESTIGATOR', 'ADMIN']}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cases/:id"
                    element={
                      <ProtectedRoute allowedRoles={['INVESTIGATOR', 'ADMIN']}>
                        <CaseDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminConsole />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import App from './App';
import { Loader2 } from 'lucide-react';
import { registerServiceWorker, setupInstallPrompt, requestNotificationPermission } from './pwaRegistration';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Loading FocusFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <App />;
};

const AppWrapper: React.FC = () => {
  useEffect(() => {
    // Register service worker for PWA
    registerServiceWorker();

    // Setup install prompt
    setupInstallPrompt();

    // Request notification permission
    requestNotificationPermission();
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default AppWrapper;


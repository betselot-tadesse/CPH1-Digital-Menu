
import React, { useState, useEffect } from 'react';
import { AdminView } from './components/AdminView';
import { GuestView } from './components/GuestView';
import { Login } from './components/Login';
import { MenuData } from './types';
import { INITIAL_DATA } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'guest' | 'admin'>('guest');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('is_admin_logged_in') === 'true';
  });

  const [data, setData] = useState<MenuData>(() => {
    const saved = localStorage.getItem('crystal_plaza_menu_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('crystal_plaza_menu_data', JSON.stringify(data));
  }, [data]);

  // Listen for hash changes to switch views
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setView('admin');
      } else {
        setView('guest');
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleLogin = (user: string, pass: string): boolean => {
    // Exact credentials as requested by user
    if (user === 'betsi' && pass === 'cph1') {
      setIsLoggedIn(true);
      sessionStorage.setItem('is_admin_logged_in', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('is_admin_logged_in');
    window.location.hash = '';
  };

  const handleGoToAdmin = () => {
    window.location.hash = 'admin';
  };

  const handleCancelLogin = () => {
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen">
      {/* Hidden button for admin entry (the "lock" icon) */}
      {view === 'guest' && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleGoToAdmin}
            className="bg-slate-900/10 hover:bg-slate-900 text-transparent hover:text-white p-3 rounded-full transition-all duration-300 flex items-center justify-center group"
            title="Admin Login"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 group-hover:opacity-100">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </button>
        </div>
      )}

      {view === 'admin' ? (
        isLoggedIn ? (
          <AdminView data={data} onUpdate={setData} onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} onCancel={handleCancelLogin} />
        )
      ) : (
        <GuestView data={data} />
      )}
    </div>
  );
};

export default App;

import React, { useEffect } from 'react';
import Router from './Router';
import useAppStore from './store/useAppStore';
import NotificationProvider from './components/notifications/NotificationProvider';

const App = () => {
  const { initialize, darkMode, initNetworkListeners, syncPendingOperations, isOnline } = useAppStore();

  useEffect(() => {
    initialize();
    initNetworkListeners();
  }, [initialize, initNetworkListeners]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Sync pending operations when coming back online
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is now online, syncing pending operations...');
      syncPendingOperations();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncPendingOperations]);

  return (
    <NotificationProvider>
      <div className={`min-h-screen w-full ${darkMode ? 'dark bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-100 to-blue-50'}`}>
        <div className="flex flex-col h-screen">
          <Router />
        </div>
      </div>
    </NotificationProvider>
  );
};

export default App;

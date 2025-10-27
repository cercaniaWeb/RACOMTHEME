import React, { useEffect } from 'react';
import Router from './Router';
import useAppStore from './store/useAppStore';

const App = () => {
  const { initialize, darkMode } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen w-full ${darkMode ? 'dark bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-100 to-blue-50'}`}>
      <div className="flex flex-col h-screen">
        <Router />
      </div>
    </div>
  );
};

export default App;

import React from 'react';
import useAppStore from '../../store/useAppStore';

const Sidebar = ({ children, className = '' }) => {
  const { darkMode } = useAppStore();

  return (
    <aside className={`w-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md flex flex-col items-center py-4 ${className}`}>
      {children}
    </aside>
  );
};

export default Sidebar;

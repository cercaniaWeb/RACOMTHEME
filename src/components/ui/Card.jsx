import React from 'react';
import useAppStore from '../../store/useAppStore';

const Card = ({ children, className = '', header, title, subtitle }) => {
  const { darkMode } = useAppStore();
  
  const cardClass = darkMode 
    ? `bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl p-6 ${className}`
    : `bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl p-6 ${className}`;

  return (
    <div className={cardClass}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} text-lg`}>{title}</h3>}
          {subtitle && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;

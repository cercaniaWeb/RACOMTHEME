import React from 'react';
import useAppStore from '../../store/useAppStore';

const Button = ({ children, onClick, className = '', variant = 'primary', size = 'md' }) => {
  const { darkMode } = useAppStore();
  
  // Tamaños
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Define button variants based on theme
  const getButtonClass = () => {
    let baseClass = `${sizeClasses[size]} rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 `;
    
    if (darkMode) {
      switch (variant) {
        case 'primary':
          return baseClass + 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl ' + className;
        case 'secondary':
          return baseClass + 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl ' + className;
        case 'success':
          return baseClass + 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl ' + className;
        case 'danger':
          return baseClass + 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl ' + className;
        case 'outline':
          return baseClass + 'bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 shadow-lg hover:shadow-xl ' + className;
        case 'ghost':
          return baseClass + 'bg-transparent text-gray-300 hover:bg-gray-700/50 ' + className;
        default:
          return baseClass + className;
      }
    } else {
      switch (variant) {
        case 'primary':
          return baseClass + 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl ' + className;
        case 'secondary':
          return baseClass + 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 shadow-lg hover:shadow-xl ' + className;
        case 'success':
          return baseClass + 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl ' + className;
        case 'danger':
          return baseClass + 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl ' + className;
        case 'outline':
          return baseClass + 'bg-transparent border-2 border-blue-500 text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl ' + className;
        case 'ghost':
          return baseClass + 'bg-transparent text-gray-700 hover:bg-gray-100 ' + className;
        default:
          return baseClass + className;
      }
    }
  };

  return (
    <button
      onClick={onClick}
      className={getButtonClass()}
    >
      {children}
    </button>
  );
};

export default Button;

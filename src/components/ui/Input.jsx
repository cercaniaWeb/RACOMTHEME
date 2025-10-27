import React from 'react';
import useAppStore from '../../store/useAppStore';

const Input = ({ type = 'text', placeholder, value, onChange, className = '', icon: Icon, prefix, ...rest }) => {
  const { darkMode } = useAppStore();

  const inputClass = darkMode
    ? `w-full ${Icon ? 'pl-12' : prefix ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700/70 text-white transition-all duration-200 shadow-sm focus:shadow-md ${className}`
    : `w-full ${Icon ? 'pl-12' : prefix ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 text-gray-900 transition-all duration-200 shadow-sm focus:shadow-md ${className}`;

  const iconClass = darkMode
    ? "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
    : "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500";

  const prefixClass = darkMode
    ? "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pl-3"
    : "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pl-3";

  return (
    <div className="relative flex items-center">
      {Icon && <Icon className={iconClass} />}
      {prefix && <span className={prefixClass}>{prefix}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputClass}
        {...rest}
      />
    </div>
  );
};

export default Input;

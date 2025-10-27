import React, { useState, useRef, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import { Bell } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import AlertsDropdown from './AlertsDropdown';

const AlertsBell = () => {
  const { alerts } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Notificaciones">
        <AlertsDropdown alerts={alerts} />
      </Modal>
    </div>
  );
};

export default AlertsBell;

import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Cargar notificaciones iniciales
  useEffect(() => {
    loadNotifications();
    
    // Listener para nuevas notificaciones
    notificationService.addListener('all', (notification) => {
      loadNotifications();
    });
    
    // Actualizar contador de no leídas
    const updateUnreadCount = () => {
      setUnreadCount(notificationService.getUnreadCount());
    };
    
    updateUnreadCount();
    
    // Actualizar contador periódicamente
    const interval = setInterval(updateUnreadCount, 30000); // Cada 30 segundos
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications(10);
    setNotifications(allNotifications);
    setUnreadCount(notificationService.getUnreadCount());
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      notificationService.markAllAsRead();
      setUnreadCount(0);
    }
  };

  const handleNotificationClick = (notification) => {
    notificationService.markAsRead(notification.id);
    setIsOpen(false); // Cerrar el dropdown al hacer clic

    // Manejar la acción de la notificación
    if (notification.data && notification.data.action) {
      notificationService.handleNotificationAction(
        notification.data.action, 
        notification.data
      );
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
        aria-label="Notificaciones"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notificaciones</h3>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No hay notificaciones
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <div className={`w-3 h-3 rounded-full ${
                          !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                      </div>
                      <div 
                        className="ml-3 flex-1 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notificationService.getTitleForType(notification.type)}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {notificationService.getBodyForType(notification.type, notification.data)}
                        </p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            notificationService.markAsRead(notification.id);
                            loadNotifications(); // Actualizar la lista
                          }}
                          className="rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                notificationService.markAllAsRead();
                setUnreadCount(0);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Marcar todas como leídas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
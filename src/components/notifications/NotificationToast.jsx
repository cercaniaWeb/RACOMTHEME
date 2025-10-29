import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';

const NotificationToast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Efecto de progreso para auto-cierre
    const startTime = Date.now();
    const duration = 5000; // 5 segundos
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const newProgress = (remaining / duration) * 100;
      
      setProgress(newProgress);
      
      if (elapsed >= duration) {
        clearInterval(timer);
        handleClose();
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const handleClick = () => {
    // Manejar la acción de la notificación al hacer clic en el toast
    if (notification.data && notification.data.action) {
      notificationService.handleNotificationAction(
        notification.data.action, 
        notification.data
      );
    }
    handleClose();
  };

  // Determinar el color basado en el tipo de notificación
  const getToastColor = () => {
    if (notification.type.includes('low') || notification.type.includes('stock')) {
      return 'bg-yellow-500';
    } else if (notification.type.includes('expired') || notification.type.includes('alert')) {
      return 'bg-red-500';
    } else if (notification.type.includes('sale') || notification.type.includes('payment')) {
      return 'bg-green-500';
    } else {
      return 'bg-blue-500';
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 w-3 h-8 ${getToastColor()} rounded-sm`}></div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {notificationService.getTitleForType(notification.type)}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {notificationService.getBodyForType(notification.type, notification.data)}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div 
        className="h-1 bg-gray-200 dark:bg-gray-700"
        style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
      ></div>
    </div>
  );
};

export default NotificationToast;
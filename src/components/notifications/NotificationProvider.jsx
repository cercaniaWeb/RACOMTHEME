import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import NotificationToast from './NotificationToast';
import notificationService from '../../services/notificationService';

const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Listener para nuevas notificaciones que deben mostrarse como toasts
    notificationService.addListener('all', (notification) => {
      // Solo mostrar como toast si no es una notificación de sistema interna
      if (!notification.data || notification.data.showToast !== false) {
        addToast(notification);
      }
    });

    return () => {
      // Limpiar listeners si es necesario
    };
  }, []);

  const addToast = (notification) => {
    // Asegurarse de que cada toast tenga un ID único
    const toastId = `${notification.id}-${Date.now()}-${Math.random()}`;
    const newToast = {
      id: toastId,
      notification,
    };

    setToasts(prev => [...prev, newToast]);

    // Remover el toast después de que termine la animación
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 5300); // 5 segundos de duración del toast + 300ms de transición
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      {children}
      {toasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          notification={toast.notification}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export default NotificationProvider;
import { supabase } from '../config/supabase';

class NotificationService {
  constructor() {
    this.listeners = {};
    this.notifications = [];
    this.pushManager = null;
    this.vapidPublicKey = null;
  }

  // Inicializar el servicio de notificaciones
  async initialize() {
    // Cargar VAPID public key desde la configuración
    // Puedes obtener esta clave desde tu backend de Supabase
    this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    
    // Registrar el service worker para notificaciones push
    await this.registerServiceWorker();
    
    // Inicializar Web Push si está disponible
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      this.pushManager = navigator.serviceWorker.getRegistration().then(reg => reg.pushManager);
    }
  }

  // Registrar el service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado con éxito:', registration);
        return registration;
      } catch (error) {
        console.error('Error registrando Service Worker:', error);
      }
    }
  }

  // Solicitar permiso para notificaciones push
  async requestPushPermission() {
    if (!('serviceWorker' in navigator && 'PushManager' in window)) {
      console.warn('Push notifications no soportadas en este navegador');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Obtener el subscription para enviar notificaciones push
        const subscription = await this.getSubscription();
        return subscription;
      }
      return false;
    } catch (error) {
      console.error('Error solicitando permiso para notificaciones:', error);
      return false;
    }
  }

  // Obtener subscription para notificaciones push
  async getSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        return subscription;
      }

      // Suscribirse si no hay una suscripción existente
      return await this.subscribeToPush();
    } catch (error) {
      console.error('Error obteniendo suscripción:', error);
      throw error;
    }
  }

  // Suscribirse a notificaciones push
  async subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.vapidPublicKey 
          ? this.urlB64ToUint8Array(this.vapidPublicKey)
          : null
      });

      // Aquí puedes enviar la suscripción a tu backend para almacenarla
      await this.sendSubscriptionToBackend(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error suscribiéndose a notificaciones push:', error);
      throw error;
    }
  }

  // Convertir VAPID key de base64 a UInt8Array
  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Enviar suscripción al backend
  async sendSubscriptionToBackend(subscription) {
    try {
      // Aquí puedes guardar la suscripción en tu base de datos
      // Por ejemplo, en una tabla de usuarios o en una tabla específica de notificaciones
      console.log('Suscripción:', JSON.stringify(subscription));
      
      // Ejemplo de cómo guardar en Supabase:
      // await supabase.from('user_subscriptions').insert({
      //   user_id: userId,
      //   endpoint: subscription.endpoint,
      //   p256dh: JSON.stringify(subscription.keys.p256dh),
      //   auth: JSON.stringify(subscription.keys.auth),
      // });
    } catch (error) {
      console.error('Error enviando suscripción al backend:', error);
    }
  }

  // Enviar notificación push
  async sendPushNotification(subscription, title, body, data = {}) {
    try {
      // Esta operación normalmente se haría desde el backend
      // pero en un entorno cliente solo podemos mostrar notificaciones locales
      
      // Mostrar notificación local si no podemos enviar push
      this.showLocalNotification(title, body, data);
    } catch (error) {
      console.error('Error enviando notificación push:', error);
      // Mostrar notificación local como fallback
      this.showLocalNotification(title, body, data);
    }
  }

  // Mostrar notificación local
  showLocalNotification(title, body, data = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        data: data
      });

      // Opcional: manejar clic en notificación
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        // Aquí puedes agregar lógica para manejar el clic en la notificación
        if (data.action) {
          // Ejecutar acción basada en el tipo de notificación
          this.handleNotificationAction(data.action, data);
        }
      };
    }
  }

  // Agregar listener para tipo específico de notificación
  addListener(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  // Eliminar listener
  removeListener(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }
  }

  // Emitir evento de notificación
  emit(type, data) {
    // Generar ID único para evitar duplicados
    // Usar un contador para asegurar unicidad incluso si se generan en el mismo milisegundo
    if (!this._idCounter) {
      this._idCounter = 0;
    }
    this._idCounter++;
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 9);
    const id = `${timestamp}-${randomPart}-${this._idCounter}`;
    
    const notification = {
      id,
      type,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Agregar a la lista de notificaciones
    this.notifications.push(notification);

    // Emitir a todos los listeners del tipo
    if (this.listeners[type]) {
      this.listeners[type].forEach(callback => callback(notification));
    }

    // Emitir a todos los listeners genéricos
    if (this.listeners['all']) {
      this.listeners['all'].forEach(callback => callback(notification));
    }

    // Mostrar notificación local
    this.showLocalNotification(
      this.getTitleForType(type),
      this.getBodyForType(type, data),
      { ...data, type }
    );

    return notification;
  }

  // Obtener título para tipo de notificación
  getTitleForType(type) {
    const titles = {
      'stock_low': 'Stock Bajo',
      'product_expired': 'Producto Vencido',
      'new_sale': 'Nueva Venta',
      'user_login': 'Inicio de Sesión',
      'system_alert': 'Alerta del Sistema',
      'payment_received': 'Pago Recibido',
      'expense_recorded': 'Gasto Registrado',
      'transfer_requested': 'Transferencia Solicitada',
      'transfer_approved': 'Transferencia Aprobada',
      'user_added': 'Usuario Agregado',
      'product_added': 'Producto Agregado',
      'inventory_updated': 'Inventario Actualizado',
      'alert_generated': 'Alerta Generada'
    };

    // Si no se encuentra un título específico, formatear el tipo de notificación
    if (titles[type]) {
      return titles[type];
    } else {
      // Convertir el tipo de notificación a un formato legible
      // Por ejemplo: 'user_logged_in' -> 'Usuario Conectado'
      return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }

  // Obtener cuerpo para tipo de notificación
  getBodyForType(type, data) {
    // Asegurarse de que data no sea null o undefined
    data = data || {};
    
    switch (type) {
      case 'stock_low':
        return `Producto: ${data.productName || 'Desconocido'} - Cantidad: ${data.quantity || '0'}`;
      case 'product_expired':
        return `Producto: ${data.productName || 'Desconocido'} - Vecimiento: ${data.expirationDate || 'Desconocido'}`;
      case 'new_sale':
        return `Venta: ${data.amount ? `$${data.amount}` : 'N/A'} - Cliente: ${data.clientName || 'Contado'}`;
      case 'user_login':
        return `Usuario: ${data.userName || data.email || 'Desconocido'} - Tienda: ${data.storeName || 'N/A'}`;
      case 'system_alert':
        return data.message || 'Alerta del sistema';
      case 'payment_received':
        return `Monto: $${data.amount || '0'} - Método: ${data.method || 'N/A'}`;
      case 'expense_recorded':
        return `Concepto: ${data.concept || 'Sin concepto'} - Monto: $${data.amount || '0'}`;
      case 'transfer_requested':
        return `Desde: ${data.origin || 'Origen desconocido'} - Hacia: ${data.destination || 'Destino desconocido'} - Items: ${data.itemsCount || 0}`;
      case 'transfer_approved':
        return `Transferencia ID: ${data.transferId || 'Desconocido'} - Aprobada`;
      case 'user_added':
        return `Usuario: ${data.userName || data.email || 'Desconocido'} - Rol: ${data.role || 'Sin rol'}`;
      case 'product_added':
        return `Producto: ${data.productName || 'Desconocido'} - Categoría: ${data.categoryName || 'Sin categoría'}`;
      case 'inventory_updated':
        return `Producto: ${data.productName || 'Desconocido'} - Cantidad: ${data.quantity || '0'}`;
      case 'alert_generated':
        return data.message || 'Nueva alerta generada';
      default:
        // Si no es un tipo específico, intentar formatear los datos disponibles
        if (data.message) {
          return data.message;
        } else if (data.title) {
          return data.title;
        } else {
          // Intentar formatear otros campos comunes
          const commonFields = ['productName', 'userName', 'amount', 'concept', 'transferId', 'email'];
          for (const field of commonFields) {
            if (data[field]) {
              return `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${data[field]}`;
            }
          }
          return 'Detalles de notificación no disponibles';
        }
    }
  }

  // Obtener notificaciones
  getNotifications(limit = 10) {
    // Filtrar duplicados basados en ID antes de retornar
    const uniqueNotifications = this.notifications
      .reduce((acc, notification) => {
        if (!acc.find(n => n.id === notification.id)) {
          acc.push(notification);
        }
        return acc;
      }, []);

    return uniqueNotifications
      .slice()
      .reverse()
      .slice(0, limit)
      .map(notification => ({ ...notification }));
  }

  // Marcar notificación como leída
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // Remover notificación por ID (opcional para limpiar notificaciones)
  removeNotification(notificationId) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  // Marcar todas como leídas
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
  }

  // Obtener notificaciones no leídas
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Manejar acción de notificación
  handleNotificationAction(action, data) {
    switch (action) {
      case 'view_product':
        // Lógica para navegar a la vista del producto
        if (data.productId) {
          // Ejemplo: navigate(`/products/${data.productId}`);
          console.log('Ver producto:', data.productId);
        }
        break;
      case 'view_transfer':
        // Lógica para navegar a la vista de transferencia
        if (data.transferId) {
          // Ejemplo: navigate(`/transfers/${data.transferId}`);
          console.log('Ver transferencia:', data.transferId);
        }
        break;
      case 'view_user':
        // Lógica para navegar a la vista del usuario
        if (data.userId) {
          // Ejemplo: navigate(`/users/${data.userId}`);
          console.log('Ver usuario:', data.userId);
        }
        break;
      default:
        console.log('Acción no reconocida:', action);
    }
  }
}

// Instancia singleton del servicio de notificaciones
const notificationService = new NotificationService();
export default notificationService;
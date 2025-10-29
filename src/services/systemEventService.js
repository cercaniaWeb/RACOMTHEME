import notificationService from './notificationService';

class SystemEventService {
  constructor() {
    this.eventHandlers = new Map();
    this.lastLoginNotification = null; // Para evitar notificaciones duplicadas de login
    this.initializeEventHandlers();
  }

  // Inicializar manejadores de eventos
  initializeEventHandlers() {
    // Eventos relacionados con productos
    this.eventHandlers.set('product_stock_low', this.handleProductStockLow.bind(this));
    this.eventHandlers.set('product_expired', this.handleProductExpired.bind(this));
    this.eventHandlers.set('product_added', this.handleProductAdded.bind(this));
    this.eventHandlers.set('product_updated', this.handleProductUpdated.bind(this));

    // Eventos relacionados con ventas
    this.eventHandlers.set('sale_completed', this.handleSaleCompleted.bind(this));
    this.eventHandlers.set('sale_refunded', this.handleSaleRefunded.bind(this));

    // Eventos relacionados con usuarios
    this.eventHandlers.set('user_logged_in', this.handleUserLoggedIn.bind(this));
    this.eventHandlers.set('user_added', this.handleUserAdded.bind(this));
    this.eventHandlers.set('user_updated', this.handleUserUpdated.bind(this));

    // Eventos relacionados con transferencias
    this.eventHandlers.set('transfer_requested', this.handleTransferRequested.bind(this));
    this.eventHandlers.set('transfer_approved', this.handleTransferApproved.bind(this));
    this.eventHandlers.set('transfer_received', this.handleTransferReceived.bind(this));

    // Eventos relacionados con clientes
    this.eventHandlers.set('client_added', this.handleClientAdded.bind(this));
    this.eventHandlers.set('credit_granted', this.handleCreditGranted.bind(this));
    this.eventHandlers.set('payment_recorded', this.handlePaymentRecorded.bind(this));

    // Eventos relacionados con gastos
    this.eventHandlers.set('expense_recorded', this.handleExpenseRecorded.bind(this));

    // Eventos de sistema
    this.eventHandlers.set('system_alert', this.handleSystemAlert.bind(this));
    this.eventHandlers.set('inventory_updated', this.handleInventoryUpdated.bind(this));
  }

  // Emitir un evento del sistema
  emit(eventType, eventData) {
    console.log(`Evento del sistema emitido: ${eventType}`, eventData);

    // Disparar notificación específica para este evento
    notificationService.emit(eventType, eventData);

    // Ejecutar manejador específico si existe
    const handler = this.eventHandlers.get(eventType);
    if (handler) {
      handler(eventData);
    }
  }

  // Manejadores de eventos específicos

  handleProductStockLow(data) {
    console.log('Manejando producto con stock bajo:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleProductExpired(data) {
    console.log('Manejando producto vencido:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleProductAdded(data) {
    console.log('Manejando producto agregado:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleProductUpdated(data) {
    console.log('Manejando producto actualizado:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleSaleCompleted(data) {
    console.log('Manejando venta completada:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleSaleRefunded(data) {
    console.log('Manejando venta devuelta:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleUserLoggedIn(data) {
    console.log('Manejando inicio de sesión de usuario:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleUserAdded(data) {
    console.log('Manejando usuario agregado:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleUserUpdated(data) {
    console.log('Manejando usuario actualizado:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleTransferRequested(data) {
    console.log('Manejando transferencia solicitada:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleTransferApproved(data) {
    console.log('Manejando transferencia aprobada:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleTransferReceived(data) {
    console.log('Manejando transferencia recibida:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleClientAdded(data) {
    console.log('Manejando cliente agregado:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleCreditGranted(data) {
    console.log('Manejando crédito concedido:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handlePaymentRecorded(data) {
    console.log('Manejando pago registrado:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleExpenseRecorded(data) {
    console.log('Manejando gasto registrado:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleSystemAlert(data) {
    console.log('Manejando alerta del sistema:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  handleInventoryUpdated(data) {
    console.log('Manejando inventario actualizado:', data);
    // Aquí puedes agregar lógica adicional específica para este tipo de evento
  }

  // Métodos de conveniencia para emitir eventos comunes

  emitProductStockLow(product, store, quantity) {
    this.emit('product_stock_low', {
      productId: product.id,
      productName: product.name,
      storeId: store?.id,
      storeName: store?.name,
      quantity: quantity,
      showToast: product.minStockThreshold && quantity <= product.minStockThreshold[store?.id] 
                ? true : false
    });
  }

  emitProductExpired(product, batch) {
    this.emit('product_expired', {
      productId: product.id,
      productName: product.name,
      batchId: batch?.id,
      expirationDate: batch?.expirationDate,
      quantity: batch?.quantity
    });
  }

  emitSaleCompleted(sale) {
    this.emit('sale_completed', {
      saleId: sale.id || sale.saleId,
      amount: sale.total,
      cashier: sale.cashier,
      clientName: sale.clientName || 'Contado',
      itemsCount: sale.cart?.length || 0
    });
  }
  
  emitUserLoggedIn(user) {
    const now = Date.now();
    // Evitar duplicados en un periodo corto (1 segundo)
    if (this.lastLoginNotification && (now - this.lastLoginNotification.timestamp) < 1000) {
      // Si es el mismo usuario, evitar la notificación duplicada
      if (this.lastLoginNotification.userId === (user.uid || user.id)) {
        return;
      }
    }
    
    const notificationData = {
      userId: user.uid || user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      storeId: user.storeId,
      timestamp: new Date().toISOString()
    };
    
    this.lastLoginNotification = {
      ...notificationData,
      timestamp: now
    };
    
    this.emit('user_logged_in', notificationData);
  }

  emitTransferRequested(transfer) {
    this.emit('transfer_requested', {
      transferId: transfer.id,
      origin: transfer.originLocationId,
      destination: transfer.destinationLocationId,
      requestedBy: transfer.requestedBy,
      itemsCount: transfer.items?.length || 0,
      status: transfer.status
    });
  }

  emitSystemAlert(message, type = 'info', data = {}) {
    this.emit('system_alert', {
      message,
      type,
      ...data
    });
  }

  emitInventoryUpdated(productId, productName, storeId, quantityChange, newQuantity) {
    this.emit('inventory_updated', {
      productId,
      productName,
      storeId,
      quantityChange,
      newQuantity,
      timestamp: new Date().toISOString()
    });
  }
}

// Instancia singleton del servicio de eventos
const systemEventService = new SystemEventService();
export default systemEventService;
import { create } from 'zustand';
import { 
  getProducts, 
  getProduct,
  addProduct, 
  updateProduct, 
  deleteProduct,
  getCategories, 
  addCategory, 
  updateCategory,
  getUsers,
  getUser,
  addUser,
  updateUser,
  getStores,
  getInventoryBatches,
  addInventoryBatch,
  updateInventoryBatch,
  getSales,
  addSale,
  getClients,
  addClient,
  updateClient,
  grantCredit,
  recordPayment,
  liquidateCredit,
  getTransfers,
  getShoppingList,
  getExpenses,
  getCashClosings,
  initializeSupabaseCollections
} from '../utils/supabaseAPI';
import offlineStorage from '../utils/offlineStorage';
import { auth, supabase } from '../config/firebase';
import systemEventService from '../services/systemEventService';


const useAppStore = create((set, get) => ({
  // --- STATE ---
  currentUser: null,
  currentView: 'login',
  activeTab: 'pos',
  cart: [],
  discount: { type: 'none', value: 0 }, // New discount state
  note: '', // New note state
  lastSale: null, // To store the last sale details for ticket printing
  darkMode: false, // New state for dark mode
  isOnline: navigator.onLine, // Add online status
  offlineMode: false, // Add offline mode flag
  
  // Catálogos
  products: [],
  categories: [],
  users: [],
  stores: [],
  clients: [], // New state for clients

  // Datos transaccionales
  inventoryBatches: [],
  transfers: [],
  salesHistory: [],
  expenses: [],
  shoppingList: [], // New state for shopping list
  cashClosings: [],

  // Loading state management
  setLoading: (key, value) => set(state => ({
    isLoading: { ...state.isLoading, [key]: value }
  })),
  
  setDiscount: (newDiscount) => set({ discount: newDiscount }), // New action to set discount
  setNote: (newNote) => set({ note: newNote }), // New action to set note
  addToShoppingList: (item) => set(state => ({ shoppingList: [...state.shoppingList, item] })), // New action to add to shopping list
  clearShoppingList: () => set({ shoppingList: [] }), // New action to clear shopping list
  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode;
    set({ darkMode: newDarkMode });
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  },
  
  // Network status management
  updateNetworkStatus: (isOnline) => {
    set({ isOnline, offlineMode: !isOnline });
    if (isOnline) {
      // Try to sync pending operations when coming back online
      get().syncPendingOperations();
      // Reload data from server
      if (get().currentUser) {
        get().loadAllData();
      }
    }
  },
  
  // Initialize network status listeners
  initNetworkListeners: () => {
    window.addEventListener('online', () => {
      get().updateNetworkStatus(true);
    });
    
    window.addEventListener('offline', () => {
      get().updateNetworkStatus(false);
    });
  },

  // Initialize auth state listener
  initAuthListener: () => {
    // Check if there's already a subscription to avoid duplicates
    if (get().authSubscription) {
      try {
        // Unsubscribe from the existing subscription first
        get().authSubscription.unsubscribe();
      } catch (error) {
        console.warn("Error unsubscribing from previous auth listener:", error);
      }
    }
    
    // Set up a listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN' && session) {
        // User just signed in
        try {
          const userDoc = await getUser(session.user.id);
          if (userDoc) {
            // Only emit login notification if user was not already logged in
            const previousUser = get().currentUser;
            
            // Set the current view based on role and store assignment
            let currentView = 'pos';
            if (userDoc.role === 'admin' || userDoc.role === 'gerente') {
              currentView = 'admin-dashboard';
            } else if (userDoc.role === 'cashier' || userDoc.role === 'cajera') {
              // For cashiers, make sure they have a store assigned
              if (!userDoc.storeId) {
                currentView = 'unauthorized'; // Redirect to unauthorized page if no store assigned
              }
            }
            
            set({
              currentUser: userDoc,
              currentView: currentView,
            });
            
            // Only emit notification if this is a new login (not a session refresh)
            if (!previousUser || previousUser.id !== userDoc.id) {
              // Emit notification for user login
              systemEventService.emitUserLoggedIn(userDoc);
            }
          }
        } catch (error) {
          console.error("Error fetching user data after sign in:", error);
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        set({ 
          currentUser: null, 
          currentView: 'login', 
          cart: [],
          // Reset all data to empty arrays
          products: [],
          categories: [],
          users: [],
          stores: [],
          clients: [],
          inventoryBatches: [],
          transfers: [],
          salesHistory: [],
          expenses: [],
          shoppingList: [],
          cashClosings: [],
        });
      } else if (event === 'USER_UPDATED' && session) {
        // User data was updated
        try {
          const userDoc = await getUser(session.user.id);
          if (userDoc) {
            set({ currentUser: userDoc });
          }
        } catch (error) {
          console.error("Error fetching updated user data:", error);
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        // Password recovery event
        console.log('Password recovery event');
      } else if (event === 'TOKEN_REFRESHED') {
        // Token was refreshed
        console.log('Auth token refreshed');
      }
    });

    // Store the subscription to be able to unsubscribe later
    set({ authSubscription: subscription });
    
    // Return unsubscribe function
    return () => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.warn("Error unsubscribing from auth listener:", error);
      }
    };
  },
  
  // Store for the auth subscription to prevent duplicates
  authSubscription: null,
  
  // Sync pending operations when online
  syncPendingOperations: async () => {
    // Sync pending sales
    try {
      const pendingSales = await offlineStorage.getAllData('pendingSales');
      if (pendingSales && pendingSales.length > 0) {
        console.log(`Syncing ${pendingSales.length} pending sales...`);
        
        for (const sale of pendingSales) {
          try {
            // Remove the temporary offline properties
            const { id, status, createdAt, ...saleData } = sale;
            
            // Save the sale to Firebase
            const saleId = await addSale(saleData);
            
            // Remove from offline storage after successful sync
            await offlineStorage.deleteData('pendingSales', sale.id);
            
            console.log(`Successfully synced sale ${sale.id} with new ID ${saleId}`);
          } catch (error) {
            console.error(`Error syncing sale ${sale.id}:`, error);
          }
        }
        
        // Reload sales history after sync
        await get().loadSalesHistory();
      }
    } catch (error) {
      console.error('Error syncing pending sales:', error);
    }
    
    console.log('Finished syncing pending operations');
  },

  // --- LÓGICA DE CARGA DE DATOS DESDE FIREBASE ---
  loadAllData: async () => {
    await Promise.all([
      get().loadProducts(),
      get().loadCategories(), 
      get().loadUsers(),
      get().loadStores(),
      get().loadInventoryBatches(),
      get().loadSalesHistory(),
      get().loadClients(),
      get().loadTransfers(),
      get().loadShoppingList(),
      get().loadExpenses(),
      get().loadCashClosings(),
    ]);
  },
  
  loadProducts: async () => {
    set({ isLoading: { ...get().isLoading, products: true } });
    try {
      // Try to load from network first if online
      if (get().isOnline) {
        const products = await getProducts();
        // Map category_id back to categoryId and subcategory_id back to subcategoryId
        const mappedProducts = products.map(product => ({
          ...product,
          categoryId: product.category_id,
          subcategoryId: product.subcategory_id,
          // Also maintain the old fields for compatibility
          category_id: product.category_id,
          subcategory_id: product.subcategory_id
        }));
        set({ products: mappedProducts });
        // Store in offline storage for later use
        await Promise.all(mappedProducts.map(product => 
          offlineStorage.updateData('products', product.id, product)
        ));
      } else {
        // Load from offline storage
        const offlineProducts = await offlineStorage.getAllData('products');
        set({ products: offlineProducts });
      }
    } catch (error) {
      console.error("Error loading products:", error);
      // Fallback to offline storage if network failed
      try {
        const offlineProducts = await offlineStorage.getAllData('products');
        set({ products: offlineProducts });
      } catch (offlineError) {
        console.error("Error loading products from offline storage:", offlineError);
      }
    } finally {
      set({ isLoading: { ...get().isLoading, products: false } });
    }
  },

  loadCategories: async () => {
    set({ isLoading: { ...get().isLoading, categories: true } });
    try {
      if (get().isOnline) {
        const categories = await getCategories();
        set({ categories });
        // Store in offline storage
        await Promise.all(categories.map(category => 
          offlineStorage.updateData('categories', category.id, category)
        ));
      } else {
        const offlineCategories = await offlineStorage.getAllData('categories');
        set({ categories: offlineCategories });
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      try {
        const offlineCategories = await offlineStorage.getAllData('categories');
        set({ categories: offlineCategories });
      } catch (offlineError) {
        console.error("Error loading categories from offline storage:", offlineError);
      }
    } finally {
      set({ isLoading: { ...get().isLoading, categories: false } });
    }
  },

  loadUsers: async () => {
    set({ isLoading: { ...get().isLoading, users: true } });
    try {
      if (get().isOnline) {
        const users = await getUsers();
        set({ users });
        // Store in offline storage
        await Promise.all(users.map(user => 
          offlineStorage.updateData('users', user.id, user)
        ));
      } else {
        const offlineUsers = await offlineStorage.getAllData('users');
        set({ users: offlineUsers });
      }
    } catch (error) {
      console.error("Error loading users:", error);
      try {
        const offlineUsers = await offlineStorage.getAllData('users');
        set({ users: offlineUsers });
      } catch (offlineError) {
        console.error("Error loading users from offline storage:", offlineError);
      }
    } finally {
      set({ isLoading: { ...get().isLoading, users: false } });
    }
  },

  loadStores: async () => {
    set({ isLoading: { ...get().isLoading, stores: true } });
    try {
      if (get().isOnline) {
        const stores = await getStores();
        set({ stores });
        // Store in offline storage
        await Promise.all(stores.map(store => 
          offlineStorage.updateData('stores', store.id, store)
        ));
      } else {
        const offlineStores = await offlineStorage.getAllData('stores');
        set({ stores: offlineStores });
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      try {
        const offlineStores = await offlineStorage.getAllData('stores');
        set({ stores: offlineStores });
      } catch (offlineError) {
        console.error("Error loading stores from offline storage:", offlineError);
      }
    } finally {
      set({ isLoading: { ...get().isLoading, stores: false } });
    }
  },

  loadInventoryBatches: async () => {
    set({ isLoading: { ...get().isLoading, inventory: true } });
    try {
      if (get().isOnline) {
        const inventoryBatches = await getInventoryBatches();
        // Map database field names back to our expected field names
        const mappedInventoryBatches = inventoryBatches.map(batch => ({
          ...batch,
          inventoryId: batch.id || batch.inventoryId, // Use the database id as inventoryId
          productId: batch.product_id || batch.productId,
          locationId: batch.location_id || batch.locationId,
          quantity: batch.quantity || batch.quantity,
          expirationDate: batch.expiration_date || batch.expirationDate,
          // Maintain old fields for compatibility
          id: batch.id,
          product_id: batch.product_id,
          location_id: batch.location_id,
          expiration_date: batch.expiration_date
        }));
        set({ inventoryBatches: mappedInventoryBatches });
        // Store in offline storage
        await Promise.all(mappedInventoryBatches.map(batch => 
          offlineStorage.updateData('inventoryBatches', batch.inventoryId, batch)
        ));
      } else {
        const offlineInventoryBatches = await offlineStorage.getAllData('inventoryBatches');
        // Also ensure offline batches are properly mapped
        const mappedOfflineBatches = offlineInventoryBatches.map(batch => ({
          ...batch,
          inventoryId: batch.id || batch.inventoryId,
          productId: batch.product_id || batch.productId,
          locationId: batch.location_id || batch.locationId,
          quantity: batch.quantity || batch.quantity,
          expirationDate: batch.expiration_date || batch.expirationDate,
        }));
        set({ inventoryBatches: mappedOfflineBatches });
      }
    } catch (error) {
      console.error("Error loading inventory batches:", error);
      try {
        const offlineInventoryBatches = await offlineStorage.getAllData('inventoryBatches');
        // Also ensure offline batches are properly mapped
        const mappedOfflineBatches = offlineInventoryBatches.map(batch => ({
          ...batch,
          inventoryId: batch.id || batch.inventoryId,
          productId: batch.product_id || batch.productId,
          locationId: batch.location_id || batch.locationId,
          quantity: batch.quantity || batch.quantity,
          expirationDate: batch.expiration_date || batch.expirationDate,
        }));
        set({ inventoryBatches: mappedOfflineBatches });
      } catch (offlineError) {
        console.error("Error loading inventory batches from offline storage:", offlineError);
      }
    } finally {
      set({ isLoading: { ...get().isLoading, inventory: false } });
    }
  },

  loadSalesHistory: async () => {
    set({ isLoading: { ...get().isLoading, sales: true } });
    try {
      if (get().isOnline) {
        const salesHistory = await getSales();
        set({ salesHistory });
        // Store in offline storage (limit to last 100 sales for storage efficiency)
        const limitedSales = salesHistory.slice(0, 100);
        await Promise.all(limitedSales.map(sale => 
          offlineStorage.updateData('sales', sale.saleId, sale)
        ));
      } else {
        const offlineSales = await offlineStorage.getAllData('sales');
        set({ salesHistory: offlineSales });
      }
    } catch (error) {
      console.error("Error loading sales history:", error);
      try {
        const offlineSales = await offlineStorage.getAllData('sales');
        set({ salesHistory: offlineSales });
      } catch (offlineError) {
        console.error("Error loading sales from offline storage:", offlineError);
      }
    } finally {
      set({ isLoading: { ...get().isLoading, sales: false } });
    }
  },

  loadClients: async () => {
    set({ isLoading: { ...get().isLoading, clients: true } });
    try {
      if (get().isOnline) {
        const clients = await getClients();
        set({ clients });
        // Store in offline storage
        await Promise.all(clients.map(client => 
          offlineStorage.updateData('clients', client.id, client)
        ));
      } else {
        const offlineClients = await offlineStorage.getAllData('clients');
        set({ clients: offlineClients });
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      try {
        const offlineClients = await offlineStorage.getAllData('clients');
        set({ clients: offlineClients });
      } catch (offlineError) {
        console.error("Error loading clients from offline storage:", offlineError);
      }
    } finally {
      set({ isLoading: { ...get().isLoading, clients: false } });
    }
  },

  loadTransfers: async () => {
    try {
      const transfers = await getTransfers();
      set({ transfers });
    } catch (error) {
      console.error("Error loading transfers:", error);
    }
  },

  loadShoppingList: async () => {
    try {
      const shoppingList = await getShoppingList();
      set({ shoppingList });
    } catch (error) {
      console.error("Error loading shopping list:", error);
    }
  },

  loadExpenses: async () => {
    try {
      const expenses = await getExpenses();
      set({ expenses });
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  },

  loadCashClosings: async () => {
    try {
      const cashClosings = await getCashClosings();
      set({ cashClosings });
    } catch (error) {
      console.error("Error loading cash closings:", error);
    }
  },

  // --- LÓGICA DE CLIENTES ---
  addClient: async (clientData) => {
    try {
      const clientId = await addClient({
        ...clientData,
        creditBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Reload clients to reflect the change
      await get().loadClients();
      
      return { success: true, id: clientId };
    } catch (error) {
      console.error("Error adding client:", error);
      return { success: false, error: error.message };
    }
  },
  updateClient: async (id, updatedData) => {
    try {
      await updateClient(id, updatedData);
      
      // Reload clients to reflect the change
      await get().loadClients();
      
      return { success: true };
    } catch (error) {
      console.error("Error updating client:", error);
      return { success: false, error: error.message };
    }
  },
  deleteClient: async (id) => {
    try {
      // Implementation will depend on your Firestore delete function
      // For now, we'll reload clients after deletion
      await get().loadClients();
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting client:", error);
      return { success: false, error: error.message };
    }
  },
  grantCredit: async (clientId, amount) => {
    try {
      await grantCredit(clientId, amount);
      
      // Reload clients to reflect the change
      await get().loadClients();
      
      return { success: true };
    } catch (error) {
      console.error("Error granting credit:", error);
      return { success: false, error: error.message };
    }
  },
  recordPayment: async (clientId, amount) => {
    try {
      await recordPayment(clientId, amount);
      
      // Reload clients to reflect the change
      await get().loadClients();
      
      return { success: true };
    } catch (error) {
      console.error("Error recording payment:", error);
      return { success: false, error: error.message };
    }
  },
  liquidateCredit: async (clientId) => {
    try {
      await liquidateCredit(clientId);
      
      // Reload clients to reflect the change
      await get().loadClients();
      
      return { success: true };
    } catch (error) {
      console.error("Error liquidating credit:", error);
      return { success: false, error: error.message };
    }
  },
  addReminder: (reminderData) => {
    const newReminder = { ...reminderData, id: `rem-${Date.now()}`, isConcluded: false, createdAt: new Date().toISOString() };
    set(state => ({ reminders: [...state.reminders, newReminder] }));
  },

  markReminderAsConcluded: (id) => {
    set(state => ({
      reminders: state.reminders.map(rem => rem.id === id ? { ...rem, isConcluded: true } : rem)
    }));
  },
  // --- LÓGICA DE TRANSFERENCIAS ---
  createTransferRequest: ({ items }) => {
    const { currentUser, stores } = get();
    const destinationStore = stores.find(s => s.id === currentUser.storeId);

    if (!destinationStore) {
      console.error("Cannot create transfer request: User has no assigned store.");
      return;
    }

    const newTransfer = {
      id: `TR-${Date.now()}`,
      originLocationId: 'bodega-central',
      destinationLocationId: destinationStore.id,
      requestedBy: currentUser.uid,
      createdAt: new Date().toISOString(),
      status: 'solicitado',
      items: items, // [{ productId, productName, requestedQuantity }]
      history: [{ status: 'solicitado', date: new Date().toISOString(), userId: currentUser.uid }],
    };

    set(state => ({
      transfers: [...state.transfers, newTransfer]
    }));
  },

  alerts: [],
  reminders: [], // New state for reminders

  // Configuración
  alertSettings: {
    daysBeforeExpiration: 30,
    cardCommissionRate: 0.04, // 4% commission
  },

  // --- ACTIONS ---

  // Inicialización
  initialize: () => {
    set({
      products: localProducts,
      categories: localCategories,
      users: localUsers,
      stores: localStores,
      inventoryBatches: localInventoryBatches,
    });
    get().checkAllAlerts();
  },

  // Autenticación
  handleLogin: async (email, password) => {
    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid email/phone')) {
          return { success: false, error: "Usuario o contraseña incorrectos" };
        } else {
          return { success: false, error: `Error de autenticación: ${error.message}` };
        }
      }
      
      // La respuesta de autenticación de Supabase tiene la estructura data.user
      if (!data || !data.user) {
        return { success: false, error: "Error de autenticación: No se recibió información de usuario" };
      }
      
      // Fetch user details from Supabase
      const userDoc = await getUser(data.user.id);
      if (userDoc) {
        // Set the current view based on role and store assignment
        let currentView = 'pos';
        if (userDoc.role === 'admin' || userDoc.role === 'gerente') {
          currentView = 'admin-dashboard';
        } else if (userDoc.role === 'cashier' || userDoc.role === 'cajera') {
          // For cashiers, make sure they have a store assigned
          if (!userDoc.storeId) {
            return { success: false, error: "Usuario no tiene tienda asignada. Contacte al administrador." };
          }
        }
        
        set({
          currentUser: userDoc,
          currentView: currentView,
        });
        // Initialize the app data after login
        await get().initialize();
        
        // Emitir notificación de inicio de sesión
        systemEventService.emitUserLoggedIn(userDoc);
        
        return { success: true, user: userDoc };
      } else {
        return { success: false, error: "Usuario no encontrado en la base de datos" };
      }
    } catch (error) {
      return { success: false, error: `Error de autenticación: ${error.message}` };
    }
  },
  handleLogout: () => {
    set({ 
      currentUser: null, 
      currentView: 'login', 
      cart: [],
      // Reset all data to empty arrays
      products: [],
      categories: [],
      users: [],
      stores: [],
      clients: [],
      inventoryBatches: [],
      transfers: [],
      salesHistory: [],
      expenses: [],
      shoppingList: [],
      cashClosings: [],
    });
  },

  // Navegación
  setCurrentView: (view) => set({ currentView: view }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Carrito
  addToCart: (product) => {
    const { currentUser, inventoryBatches, cart } = get();
    const storeId = currentUser?.storeId;

    if (!storeId) {
      console.error("No store ID found for current user. Cannot add to cart.");
      return;
    }

    // For offline mode, we'll use the last known inventory
    let stockInLocation = 0;
    if (inventoryBatches && inventoryBatches.length > 0) {
      stockInLocation = inventoryBatches
        .filter(batch => batch.productId === product.id && batch.locationId === storeId)
        .reduce((sum, batch) => sum + batch.quantity, 0);
    } else {
      // If no inventory data is available (offline), allow adding to cart
      stockInLocation = Infinity;
    }

    const itemInCart = cart.find(item => item.id === product.id);
    const quantityInCart = itemInCart ? itemInCart.quantity : 0;

    if (quantityInCart >= stockInLocation) {
      console.warn(`Cannot add more ${product.name} to cart. Stock limit reached.`);
      return; 
    }

    set((state) => {
      const existingItem = state.cart.find(item => item.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      } else {
        return {
          cart: [...state.cart, { ...product, quantity: 1 }],
        };
      }
    });
    
    // Save cart to offline storage
    offlineStorage.saveCart(get().cart);
  },
  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter(item => item.id !== productId),
    }));
    // Save cart to offline storage
    offlineStorage.saveCart(get().cart);
  },

  updateCartItemQuantity: (productId, quantity) => {
    set((state) => ({
      cart: state.cart.map(item =>
        item.id === productId ? { ...item, quantity: quantity } : item
      ).filter(item => item.quantity > 0),
    }));
    // Save cart to offline storage
    offlineStorage.saveCart(get().cart);
  },

  handleCheckout: async (payment) => {
    const { cart, currentUser, inventoryBatches, discount, note, isOnline } = get();
    const { cash, card, cardCommission, commissionInCash } = payment;
    const storeId = currentUser?.storeId;

    if (!storeId) {
      console.error("Checkout failed: No store ID for current user.");
      return;
    }

    // Create a copy of inventory batches to update
    let updatedBatches = JSON.parse(JSON.stringify(inventoryBatches)); // Deep copy to avoid mutation issues

    // Deduct quantities from inventory batches
    for (const item of cart) {
      let quantityToDeduct = item.quantity;

      const relevantBatches = updatedBatches
        .filter(b => b.productId === item.id && b.locationId === storeId)
        .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

      for (const batch of relevantBatches) {
        if (quantityToDeduct <= 0) break;

        const deductAmount = Math.min(quantityToDeduct, batch.quantity);
        batch.quantity -= deductAmount;
        quantityToDeduct -= deductAmount;
      }
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let finalTotal = subtotal;

    if (discount.type === 'percentage') {
      finalTotal = subtotal * (1 - discount.value / 100);
    } else if (discount.type === 'amount') {
      finalTotal = subtotal - discount.value;
    }

    // Apply card commission
    if (cardCommission > 0 && !commissionInCash) {
      finalTotal += cardCommission;
    }

    const saleDetails = {
      cart: cart.map(item => ({...item})), // Create a copy to avoid reference issues
      subtotal: subtotal,
      discount: discount,
      note: note,
      total: finalTotal,
      cash: cash,
      card: card,
      cardCommission: cardCommission,
      commissionInCash: commissionInCash,
      cashier: currentUser ? currentUser.name : 'Unknown',
      storeId: storeId,
      date: new Date().toISOString(), // This will be set by Firebase serverTimestamp
    };

    // If offline, store the sale for later sync
    if (!isOnline) {
      const offlineSaleId = `offline-sale-${Date.now()}`;
      const offlineSale = {
        ...saleDetails,
        id: offlineSaleId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Store in offline storage
      await offlineStorage.updateData('pendingSales', offlineSaleId, offlineSale);
      
      // Update inventory batches in offline storage
      await Promise.all(updatedBatches.map(batch => 
        offlineStorage.updateData('inventoryBatches', batch.inventoryId, batch)
      ));
      
      // Update the state
      set({ 
        cart: [], 
        lastSale: { ...saleDetails, saleId: offlineSaleId },
        salesHistory: [...get().salesHistory, { ...saleDetails, saleId: offlineSaleId }],
        discount: { type: 'none', value: 0 }, // Reset discount after checkout
        note: '', // Reset note after checkout
        inventoryBatches: updatedBatches.filter(b => b.quantity > 0),
      });

      get().checkAllAlerts();
      
      // Emitir notificación de venta completada
      systemEventService.emitSaleCompleted({
        id: offlineSaleId,
        total: finalTotal,
        cashier: currentUser ? currentUser.name : 'Unknown',
        clientName: 'Contado',
        cart: cart
      });
      
      return { success: true, saleId: offlineSaleId, offline: true };
    }

    try {
      // Save the sale to Firebase
      const saleId = await addSale(saleDetails);
      
      // Update inventory batches in Firebase
      // For simplicity, we'll reload inventory after checkout
      await get().loadInventoryBatches();

      // Update the state
      set({ 
        cart: [], 
        lastSale: { ...saleDetails, saleId }, // Add the generated sale ID
        salesHistory: [...get().salesHistory, { ...saleDetails, saleId }], // Add sale to history
        discount: { type: 'none', value: 0 }, // Reset discount after checkout
        note: '', // Reset note after checkout
      });

      get().checkAllAlerts();
      
      // Emitir notificación de venta completada
      systemEventService.emitSaleCompleted({
        id: saleId,
        total: finalTotal,
        cashier: currentUser ? currentUser.name : 'Unknown',
        clientName: 'Contado',
        cart: cart
      });
      
      return { success: true, saleId };
    } catch (error) {
      console.error("Error processing checkout:", error);
      return { success: false, error: error.message };
    }
  },

  // --- LÓGICA DE TRANSFERENCIAS ---
  createTransferRequest: ({ items }) => {
    const { currentUser, stores } = get();
    const destinationStore = stores.find(s => s.id === currentUser.storeId);

    if (!destinationStore) {
      console.error("Cannot create transfer request: User has no assigned store.");
      return;
    }

    const newTransfer = {
      id: `TR-${Date.now()}`,
      originLocationId: 'bodega-central',
      destinationLocationId: destinationStore.id,
      requestedBy: currentUser.uid,
      createdAt: new Date().toISOString(),
      status: 'solicitado',
      items: items, // [{ productId, productName, requestedQuantity }]
      history: [{ status: 'solicitado', date: new Date().toISOString(), userId: currentUser.uid }],
    };

    set(state => ({
      transfers: [...state.transfers, newTransfer]
    }));
  },

  approveTransfer: (transferId) => {
    set(state => ({
      transfers: state.transfers.map(t => 
        t.id === transferId 
        ? { 
            ...t, 
            status: 'aprobado', 
            history: [...t.history, { status: 'aprobado', date: new Date().toISOString(), userId: get().currentUser.uid }]
          } 
        : t
      )
    }));
  },

  shipTransfer: (transferId, sentItems) => {
    const { inventoryBatches } = get();
    let updatedBatches = JSON.parse(JSON.stringify(inventoryBatches));

    // Deduct stock from origin (bodega-central)
    for (const item of sentItems) {
      let quantityToDeduct = item.sentQuantity;
      const relevantBatches = updatedBatches
        .filter(b => b.productId === item.id && b.locationId === 'bodega-central')
        .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

      for (const batch of relevantBatches) {
        if (quantityToDeduct <= 0) break;
        const deductAmount = Math.min(quantityToDeduct, batch.quantity);
        batch.quantity -= deductAmount;
        quantityToDeduct -= deductAmount;
      }
    }

    set(state => ({
      inventoryBatches: updatedBatches.filter(b => b.quantity > 0),
      transfers: state.transfers.map(t => 
        t.id === transferId 
        ? { 
            ...t, 
            status: 'enviado', 
            items: t.items.map(origItem => {
              const sentItem = sentItems.find(si => si.productId === origItem.productId);
              return sentItem ? { ...origItem, sentQuantity: sentItem.sentQuantity } : origItem;
            }),
            history: [...t.history, { status: 'enviado', date: new Date().toISOString(), userId: get().currentUser.uid }]
          } 
        : t
      )
    }));
    get().checkAllAlerts();
  },

  updateInventoryBatch: async (inventoryId, updatedData) => {
    try {
      // Update the inventory batch in the database
      // The inventoryId here corresponds to the 'id' field in the database
      await updateInventoryBatch(inventoryId, updatedData);
      
      // Reload inventory batches to reflect the changes
      await get().loadInventoryBatches();
      
      // Update alerts based on the new quantities
      get().checkAllAlerts();
      
      return { success: true };
    } catch (error) {
      console.error("Error updating inventory batch:", error);
      return { success: false, error: error.message };
    }
  },

  receiveTransfer: (transferId, receivedItems) => {
    const { inventoryBatches } = get();
    let updatedBatches = JSON.parse(JSON.stringify(inventoryBatches));
    const transfer = get().transfers.find(t => t.id === transferId);
    const destinationId = transfer.destinationLocationId;

    // Add stock to destination
    for (const item of receivedItems) {
        // This is a simplified logic. A real system would need to decide if it merges with an existing batch
        // or creates a new one. For now, we create a new batch.
        const originalItem = transfer.items.find(i => i.productId === item.productId);
        updatedBatches.push({
            inventoryId: `inv-${Date.now()}-${item.productId}`,
            productId: item.productId,
            locationId: destinationId,
            quantity: item.receivedQuantity,
            cost: originalItem?.cost || 0, // This should be improved to get the real cost from the shipped batch
            expirationDate: '2027-12-31', // This should come from the shipped batch
        });
    }

    set(state => ({
      inventoryBatches: updatedBatches,
      transfers: state.transfers.map(t => 
        t.id === transferId 
        ? { 
            ...t, 
            status: 'recibido', 
            items: t.items.map(origItem => { 
              const receivedItem = receivedItems.find(ri => ri.productId === origItem.productId);
              return receivedItem ? { ...origItem, receivedQuantity: receivedItem.receivedQuantity } : origItem;
            }),
            history: [...t.history, { status: 'recibido', date: new Date().toISOString(), userId: get().currentUser.uid }]
          } 
        : t
      )
    }));
    get().checkAllAlerts();
  },

  // --- LÓGICA DE PRODUCTOS ---
  addProduct: async (productData) => {
    try {
      console.log("Intentando agregar producto con datos:", productData);
      const { storeId, categoryId, subcategoryId, initialStock, ...rest } = productData;
      
      console.log("Datos extraídos - storeId:", storeId, "categoryId:", categoryId, "subcategoryId:", subcategoryId, "initialStock:", initialStock, "rest:", rest);
      
      // Validate required fields
      if (!storeId) {
        throw new Error("storeId is required for product creation");
      }
      if (!categoryId) {
        throw new Error("categoryId is required for product creation");
      }
      if (!rest.name) {
        throw new Error("Product name is required for product creation");
      }
      if (typeof rest.price === 'undefined' || rest.price === null) {
        throw new Error("Product price is required for product creation");
      }
      
      // Add product to Supabase
      const productId = await addProduct({
        ...rest,
        categoryId,
        subcategoryId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log("Producto agregado con ID:", productId);

      // Add initial inventory batch to Supabase 
      // Only add inventory batch if initialStock is provided and greater than 0
      if (initialStock && parseInt(initialStock) > 0) {
        console.log("Agregando lote de inventario inicial para producto:", productId, "cantidad:", parseInt(initialStock));
        await addInventoryBatch({
          product_id: productId,
          location_id: storeId,
          quantity: parseInt(initialStock) || 0, // Usar la cantidad inicial del formulario
          cost: rest.cost || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        console.log("Lote de inventario inicial agregado exitosamente");
      } else {
        console.log("No se agregó lote de inventario inicial - cantidad:", initialStock);
      }

      // Reload products and inventory to reflect the changes
      console.log("Recargando productos e inventario...");
      await get().loadProducts();
      await get().loadInventoryBatches();
      console.log("Productos e inventario recargados exitosamente");
      
      // Emitir notificación de producto agregado
      const category = get().categories.find(cat => cat.id === categoryId);
      systemEventService.emit('product_added', {
        productId: productId,
        productName: rest.name,
        categoryName: category?.name || 'Sin categoría',
        userId: get().currentUser?.id || 'system', // Cambiado de .uid a .id
        storeId: storeId
      });
      
      console.log("Producto agregado exitosamente con ID:", productId);
      return { success: true, id: productId };
    } catch (error) {
      console.error("Error detallado al agregar producto:", error);
      console.error("Mensaje de error:", error.message);
      console.error("Stack trace:", error.stack);
      return { success: false, error: error.message };
    }
  },

  updateProduct: async (id, updatedData) => {
    try {
      await updateProduct(id, {
        ...updatedData,
        updatedAt: new Date().toISOString()
      });

      // Reload products to reflect the changes
      await get().loadProducts();
      
      return { success: true };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, error: error.message };
    }
  },

  deleteProduct: async (id) => {
    try {
      // Eliminar el producto de Supabase
      await deleteProduct(id);
      
      // Actualizar la lista de productos en el estado
      await get().loadProducts();
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, error: error.message };
    }
  },
  checkAllAlerts: () => {
    const { inventoryBatches, products, stores, alertSettings } = get();
    const newAlerts = [];

    // 1. Alertas de Stock Bajo
    stores.forEach(store => {
      products.forEach(product => {
        const totalStockInLocation = inventoryBatches
          .filter(batch => batch.productId === product.id && batch.locationId === store.id)
          .reduce((sum, batch) => sum + batch.quantity, 0);
        
        const threshold = product.minStockThreshold ? product.minStockThreshold[store.id] : undefined;

        if (threshold !== undefined && totalStockInLocation < threshold) {
          newAlerts.push({
            id: `low-stock-${product.id}-${store.id}`,
            type: 'Stock Bajo',
            message: `Quedan ${totalStockInLocation} de ${product.name} en ${store.name}. (Mínimo: ${threshold})`,
            isRead: false,
          });
        }
      });
    });

    // 2. Alertas de Próxima Caducidad
    const today = new Date();
    const alertDate = new Date();
    alertDate.setDate(today.getDate() + alertSettings.daysBeforeExpiration);

    inventoryBatches.forEach(batch => {
      if (batch.expirationDate) {
        const expiration = new Date(batch.expirationDate);
        if (expiration > today && expiration <= alertDate) {
          const product = products.find(p => p.id === batch.productId);
          const store = stores.find(s => s.id === batch.locationId);
          newAlerts.push({
            id: `exp-${batch.inventoryId}`,
            type: 'Próxima Caducidad',
            message: `${batch.quantity} de ${product.name} en ${store.name} vencen el ${batch.expirationDate}.`,
            isRead: false,
          });
        }
      }
    });

    set({ alerts: newAlerts });
  },

  // Acción para marcar alerta como leída
  markAlertAsRead: (alertId) => {
    set(state => ({
      alerts: state.alerts.map(a => a.id === alertId ? { ...a, isRead: true } : a),
    }));
  },

  // --- LÓGICA DE GASTOS ---
  addExpense: (expenseData) => {
    set(state => {
      let newExpenses = [];
      if (Array.isArray(expenseData)) {
        newExpenses = expenseData.map(item => ({
          id: `exp-${Date.now()}-${item.id}`,
          date: new Date().toISOString(),
          concept: item.name,
          amount: item.price * item.quantity,
          type: 'Compra Miscelánea',
          details: `Comprado desde lista de compras. Cantidad: ${item.quantity}`,
        }));
      } else {
        newExpenses.push({ ...expenseData, id: `exp-${Date.now()}`, date: new Date().toISOString() });
      }
      return { expenses: [...state.expenses, ...newExpenses] };
    });
  },
  // --- LÓGICA DE USUARIOS ---
  addUser: async (userData) => {
    try {
      const { email, password, ...userDetails } = userData;
      
      // First, check if user already exists in the users table
      const { data: existingUsers, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1);

      if (fetchError) {
        console.error("Error checking existing user:", fetchError);
      } else if (existingUsers && existingUsers.length > 0) {
        return { success: false, error: 'Ya existe un usuario con este email.' };
      }

      // Then, create the user in Supabase Auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error("Error creating user in Supabase Auth:", authError);
        // Return more specific error information based on the type of error
        if (authError.message.includes('User already registered')) {
          return { success: false, error: 'Ya existe un usuario con este email.' };
        }
        return { success: false, error: authError.message };
      }

      // If authUser is null (email confirmation required), handle accordingly
      if (!authUser) {
        return { success: false, error: 'La cuenta fue creada pero requiere confirmación de email.' };
      }

      // Then, add the user details to the users table
      const userDataWithId = { 
        id: authUser.id,
        email: authUser.email,
        ...userDetails
      };
      
      const userId = await addUser(userDataWithId);
      
      // Reload users to reflect the change
      await get().loadUsers();
      
      return { success: true, id: userId };
    } catch (error) {
      console.error("Error adding user:", error);
      return { success: false, error: error.message };
    }
  },

  updateUser: async (uid, updatedData) => {
    try {
      // If password is being updated, we need to handle it separately
      let passwordToUpdate = null;
      const updatedDataWithoutPassword = { ...updatedData };
      
      if (updatedData.password) {
        passwordToUpdate = updatedData.password;
        delete updatedDataWithoutPassword.password;
      }
      
      // Map storeId to store_id if it exists
      const mappedUpdatedData = { ...updatedDataWithoutPassword };
      if (mappedUpdatedData.storeId !== undefined) {
        mappedUpdatedData.store_id = mappedUpdatedData.storeId;
        delete mappedUpdatedData.storeId;
      }
      
      // Update user in Supabase users table (excluding password)
      if (Object.keys(mappedUpdatedData).length > 0) {
        await updateUser(uid, mappedUpdatedData);
      }
      
      // If password was provided, update it via Supabase Auth
      if (passwordToUpdate) {
        // Note: Changing password via Supabase Admin API requires special permissions
        // This is typically done by the user themselves using update user's own password
        // For now, we'll just save the password update request and handle it differently
        console.warn("Password update functionality requires special handling and may not be directly supported via client library");
      }
      
      // Reload users to reflect the change
      await get().loadUsers();
      
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error: error.message };
    }
  },

  deleteUser: async (uid) => {
    try {
      // Delete user from Supabase users table
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', uid);

      if (error) {
        console.error("Error deleting user from Supabase:", error);
        throw new Error(error.message);
      }
      
      // Reload users to reflect the change
      await get().loadUsers();
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, error: error.message };
    }
  },

  // --- LÓGICA DE CATEGORÍAS ---
  addCategory: async (categoryData) => {
    try {
      const categoryId = await addCategory(categoryData);
      
      // Reload categories to reflect the change
      await get().loadCategories();
      
      return { success: true, id: categoryId };
    } catch (error) {
      console.error("Error adding category:", error);
      return { success: false, error: error.message };
    }
  },

  updateCategory: async (id, updatedData) => {
    try {
      await updateCategory(id, updatedData);
      
      // Reload categories to reflect the change
      await get().loadCategories();
      
      return { success: true };
    } catch (error) {
      console.error("Error updating category:", error);
      return { success: false, error: error.message };
    }
  },

  deleteCategory: async (id) => {
    try {
      await deleteCategory(id);
      
      // Reload categories to reflect the change
      await get().loadCategories();
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting category:", error);
      return { success: false, error: error.message };
    }
  },

  handleCashClosing: (initialCash) => {
    const { salesHistory, currentUser } = get();
    const salesToClose = salesHistory.filter(sale => sale.cashier === currentUser.name);
    const totalSalesAmount = salesToClose.reduce((acc, sale) => acc + sale.total, 0);
    const totalCashSales = salesToClose.filter(sale => sale.cash).reduce((acc, sale) => acc + sale.cash, 0);
    const totalCardSales = salesToClose.filter(sale => sale.card).reduce((acc, sale) => acc + sale.card, 0);

    const cashClosing = {
      id: `cc-${Date.now()}`,
      date: new Date().toISOString(),
      cashier: currentUser.name,
      initialCash: initialCash,
      totalSalesAmount: totalSalesAmount,
      totalCashSales: totalCashSales,
      totalCardSales: totalCardSales,
      finalCash: initialCash + totalCashSales,
      sales: salesToClose,
    };
    set(state => ({
      cashClosings: [...state.cashClosings, cashClosing],
      salesHistory: state.salesHistory.filter(sale => sale.cashier !== currentUser.name),
    }));
  },

  // --- LÓGICA DE CONSUMO DE EMPLEADOS ---
  recordEmployeeConsumption: (consumedItems, consumingUser) => {
    const { inventoryBatches } = get();
    let updatedBatches = JSON.parse(JSON.stringify(inventoryBatches));

    // Deduct stock for each consumed item
    for (const item of consumedItems) {
      let quantityToDeduct = item.quantity;

      // Find and sort relevant batches (FEFO) for the consuming user's store
      const relevantBatches = updatedBatches
        .filter(b => b.productId === item.id && b.locationId === consumingUser.storeId)
        .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

      for (const batch of relevantBatches) {
        if (quantityToDeduct <= 0) break;

        const deductAmount = Math.min(quantityToDeduct, batch.quantity);
        batch.quantity -= deductAmount;
        quantityToDeduct -= deductAmount;
      }
    }

    // Record the consumption (e.g., in a separate consumption history or as a special expense)
    const consumptionRecord = {
      id: `CONS-${Date.now()}`,
      date: new Date().toISOString(),
      items: consumedItems,
      user: consumingUser.name,
      storeId: consumingUser.storeId,
      type: 'Consumo de Empleado',
    };
    console.log("Employee Consumption Recorded:", consumptionRecord);

    set({ 
      inventoryBatches: updatedBatches.filter(b => b.quantity > 0),
      // Optionally, add to a separate consumption history array
    });

    get().checkAllAlerts();
  },

  // --- LÓGICA DE CONFIGURACIÓN DE TICKET ---
  ticketSettings: {
    headerText: '¡Gracias por tu compra!',
    footerText: 'Vuelve pronto.',
    showQrCode: true,
    fontSize: 'base',
    logoUrl: '',
  },

  updateTicketSettings: (newSettings) => {
    set(state => {
      const updatedSettings = { ...state.ticketSettings, ...newSettings };
      console.log("Saving ticketSettings to localStorage:", updatedSettings);
      localStorage.setItem('ticketSettings', JSON.stringify(updatedSettings));
      return { ticketSettings: updatedSettings };
    });
  },

  updateAlertSettings: (newSettings) => {
    set(state => {
      const updatedSettings = { ...state.alertSettings, ...newSettings };
      console.log("Saving alertSettings to localStorage:", updatedSettings);
      localStorage.setItem('alertSettings', JSON.stringify(updatedSettings));
      return { alertSettings: updatedSettings };
    });
  },

  // --- ACTIONS ---

  // Inicialización
  initialized: false, // Track if the app has been initialized
  
  initialize: async () => {
    console.log("useAppStore initialize function called.");
    
    // Only initialize once
    if (get().initialized) {
      console.log("App already initialized, skipping initialization");
      return;
    }

    set({ initialized: true }); // Mark as initialized to prevent multiple initializations

    const storedTicketSettings = localStorage.getItem('ticketSettings');
    const storedDarkMode = localStorage.getItem('darkMode');
    let initialTicketSettings = get().ticketSettings; // Get default settings
    let darkModePreference = false; // Default to light mode

    if (storedTicketSettings) {
      const parsedSettings = JSON.parse(storedTicketSettings);
      console.log("Loading ticketSettings from localStorage:", parsedSettings);
      initialTicketSettings = { ...initialTicketSettings, ...parsedSettings }; // Merge with stored
    }

    if (storedDarkMode) {
      darkModePreference = JSON.parse(storedDarkMode);
    }

    // Check if there's an active session with Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // If there's an active session, fetch user details and set current user
      try {
        const userDoc = await getUser(session.user.id);
        if (userDoc) {
          // Set the current view based on role and store assignment
          let currentView = 'pos';
          if (userDoc.role === 'admin' || userDoc.role === 'gerente') {
            currentView = 'admin-dashboard';
          } else if (userDoc.role === 'cashier' || userDoc.role === 'cajera') {
            // For cashiers, make sure they have a store assigned
            if (!userDoc.storeId) {
              currentView = 'unauthorized'; // Redirect to unauthorized page if no store assigned
            }
          }
          
          set({
            currentUser: userDoc,
            currentView: currentView,
          });
        }
      } catch (error) {
        console.error("Error fetching user data on initialization:", error);
        // If there's an error, the user session might be invalid, so we'll continue without a user
      }
    }

    // Initialize auth state listener
    get().initAuthListener();

    // Initialize network listeners for offline support
    get().initNetworkListeners();

    // Initialize Supabase collections if needed
    await initializeSupabaseCollections();

    // Load data from Firebase only if there's a current user
    if (get().currentUser) {
      await Promise.all([
        get().loadProducts(),
        get().loadCategories(), 
        get().loadUsers(),
        get().loadStores(),
        get().loadInventoryBatches(),
        get().loadSalesHistory(),
        get().loadClients(),
        get().loadTransfers(),
        get().loadShoppingList(),
        get().loadExpenses(),
        get().loadCashClosings(),
      ]);
    }

    set({
      ticketSettings: initialTicketSettings, // Set merged settings
      darkMode: darkModePreference, // Set dark mode preference
      isOnline: navigator.onLine, // Set initial network status
      offlineMode: !navigator.onLine, // Set initial offline mode
    });
    get().checkAllAlerts();
  },

}));



export default useAppStore;
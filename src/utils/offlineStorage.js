// offlineStorage.js - Offline data persistence for POS app

// Initialize IndexedDB for offline data storage
class OfflineStorage {
  constructor() {
    this.dbName = 'POSOfflineDB';
    this.version = 1;
    this.db = null;
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Database failed to open');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (e) => {
        this.db = e.target.result;

        // Create object stores if they don't exist
        if (!this.db.objectStoreNames.contains('products')) {
          const productsStore = this.db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('name', 'name', { unique: false });
          productsStore.createIndex('category', 'category', { unique: false });
        }

        if (!this.db.objectStoreNames.contains('inventory')) {
          const inventoryStore = this.db.createObjectStore('inventory', { keyPath: 'id' });
          inventoryStore.createIndex('productId', 'productId', { unique: false });
          inventoryStore.createIndex('locationId', 'locationId', { unique: false });
        }

        if (!this.db.objectStoreNames.contains('sales')) {
          const salesStore = this.db.createObjectStore('sales', { keyPath: 'id' });
          salesStore.createIndex('date', 'date', { unique: false });
          salesStore.createIndex('cashier', 'cashier', { unique: false });
        }

        if (!this.db.objectStoreNames.contains('categories')) {
          const categoriesStore = this.db.createObjectStore('categories', { keyPath: 'id' });
          categoriesStore.createIndex('name', 'name', { unique: false });
        }

        if (!this.db.objectStoreNames.contains('carts')) {
          const cartsStore = this.db.createObjectStore('carts', { keyPath: 'id' });
        }
        
        if (!this.db.objectStoreNames.contains('users')) {
          const usersStore = this.db.createObjectStore('users', { keyPath: 'id' });
        }
        
        if (!this.db.objectStoreNames.contains('stores')) {
          const storesStore = this.db.createObjectStore('stores', { keyPath: 'id' });
        }
        
        if (!this.db.objectStoreNames.contains('clients')) {
          const clientsStore = this.db.createObjectStore('clients', { keyPath: 'id' });
        }
        
        if (!this.db.objectStoreNames.contains('pendingSales')) {
          const pendingSalesStore = this.db.createObjectStore('pendingSales', { keyPath: 'id' });
        }

        console.log('Database setup complete');
      };
    });
  }

  async addData(storeName, data) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.add(data);

      request.onsuccess = () => {
        console.log(`${storeName} data added successfully`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`Error adding ${storeName} data`);
        reject(request.error);
      };
    });
  }

  async getData(storeName, key) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.get(key);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`Error getting ${storeName} data`);
        reject(request.error);
      };
    });
  }

  async getAllData(storeName) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`Error getting all ${storeName} data`);
        reject(request.error);
      };
    });
  }

  async updateData(storeName, key, data) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.put({ ...data, id: key });

      request.onsuccess = () => {
        console.log(`${storeName} data updated successfully`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`Error updating ${storeName} data`);
        reject(request.error);
      };
    });
  }

  async deleteData(storeName, key) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.delete(key);

      request.onsuccess = () => {
        console.log(`${storeName} data deleted successfully`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`Error deleting ${storeName} data`);
        reject(request.error);
      };
    });
  }

  // Specific methods for POS data
  async saveCart(cart) {
    const cartData = {
      id: 'current_cart',
      cart: cart,
      timestamp: Date.now()
    };
    return await this.updateData('carts', 'current_cart', cartData);
  }

  async getSavedCart() {
    try {
      const cartData = await this.getData('carts', 'current_cart');
      return cartData ? cartData.cart : [];
    } catch (error) {
      console.error('Error getting saved cart:', error);
      return [];
    }
  }
  
  async getAllPendingSales() {
    try {
      return await this.getAllData('pendingSales');
    } catch (error) {
      console.error('Error getting pending sales:', error);
      return [];
    }
  }

  async syncPendingOperations() {
    // Get all pending operations from localStorage
    const pendingOperations = JSON.parse(localStorage.getItem('pendingOperations') || '[]');
    
    if (pendingOperations.length === 0) {
      return { success: true, message: 'No pending operations to sync' };
    }

    // Process each pending operation
    const results = [];
    for (const op of pendingOperations) {
      try {
        // In a real implementation, you would send these to your backend
        // For now, we'll just remove them after attempting to sync
        results.push({ id: op.id, success: true });
      } catch (error) {
        console.error('Error syncing operation:', error);
        results.push({ id: op.id, success: false, error: error.message });
      }
    }

    // Clear the pending operations
    localStorage.removeItem('pendingOperations');

    return { 
      success: true, 
      results,
      message: `Synced ${pendingOperations.length} operations`
    };
  }

  // Check for network status and offline capabilities
  isOnline() {
    return navigator.onLine;
  }

  // Store operations that need to be synced when online
  addPendingOperation(operation) {
    const pendingOperations = JSON.parse(localStorage.getItem('pendingOperations') || '[]');
    pendingOperations.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...operation
    });
    localStorage.setItem('pendingOperations', JSON.stringify(pendingOperations));
  }
}

const offlineStorage = new OfflineStorage();
export default offlineStorage;
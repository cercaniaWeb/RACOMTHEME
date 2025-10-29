import { supabase } from '../config/supabase';

// Funciones para productos
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo productos:', error);
    return [];
  }

  return data;
};

export const getProduct = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error obteniendo producto:', error);
    return null;
  }

  return data;
};

export const addProduct = async (productData) => {
  console.log("Intentando agregar producto con datos:", productData);
  // Copiar los datos del producto sin modificar el original
  const mappedProductData = { ...productData };

  // Mapear campos del formulario a los campos correctos de la base de datos
  if ('categoryId' in mappedProductData) {
    mappedProductData.category_id = mappedProductData.categoryId;
    delete mappedProductData.categoryId;
  }
  if ('subcategoryId' in mappedProductData) {
    // Solo establecer subcategory_id si no está vacío
    if (mappedProductData.subcategoryId && mappedProductData.subcategoryId !== '') {
      mappedProductData.subcategory_id = mappedProductData.subcategoryId;
    } else {
      // Si está vacío, eliminar el campo para que sea NULL en la base de datos
      delete mappedProductData.subcategory_id;
    }
    delete mappedProductData.subcategoryId;
  }
  if ('unitOfMeasure' in mappedProductData) {
    mappedProductData.unit = mappedProductData.unitOfMeasure;
    delete mappedProductData.unitOfMeasure;
  }
  if ('image' in mappedProductData) {
    mappedProductData.image_url = mappedProductData.image;
    delete mappedProductData.image;
  }
  if ('expirationDate' in mappedProductData) {
    delete mappedProductData.expirationDate; // Este campo no existe en la base de datos de productos
  }
  if ('createdAt' in mappedProductData) {
    delete mappedProductData.createdAt; // Eliminar, ya que se establece automáticamente
  }
  if ('updatedAt' in mappedProductData) {
    delete mappedProductData.updatedAt; // Eliminar, ya que se establece automáticamente
  }
  if ('created_at' in mappedProductData) {
    delete mappedProductData.created_at; // Eliminar, ya que se establece automáticamente
  }
  if ('updated_at' in mappedProductData) {
    delete mappedProductData.updated_at; // Eliminar, ya que se establece automáticamente
  }
  if ('wholesalePrice' in mappedProductData) {
    delete mappedProductData.wholesalePrice; // Este campo no existe en la base de datos
  }

  // Agregar campos automáticos
  mappedProductData.created_at = new Date().toISOString();
  mappedProductData.updated_at = new Date().toISOString();
  
  console.log("Datos mapeados para insertar en products:", mappedProductData);

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([mappedProductData])
      .select('id')
      .single();

    if (error) {
      console.error('Error agregando producto:', error);
      console.error('Detalle del error:', error.message, error.code, error.details);
      throw new Error(`Error al agregar producto: ${error.message} (Code: ${error.code})`);
    }

    console.log("Producto agregado con ID:", data.id);
    return data.id;
  } catch (insertError) {
    console.error('Error durante la inserción del producto:', insertError);
    throw insertError;
  }
};

export const updateProduct = async (id, productData) => {
  // Copiar los datos del producto sin modificar el original
  const mappedProductData = { ...productData };

  // Mapear campos del formulario a los campos correctos de la base de datos
  if ('categoryId' in mappedProductData) {
    // Solo establecer category_id si no está vacío
    if (mappedProductData.categoryId && mappedProductData.categoryId !== '') {
      mappedProductData.category_id = mappedProductData.categoryId;
    } else {
      // Si está vacío, eliminar el campo para que sea NULL en la base de datos
      delete mappedProductData.category_id;
    }
    delete mappedProductData.categoryId;
  }
  if ('subcategoryId' in mappedProductData) {
    // Solo establecer subcategory_id si no está vacío
    if (mappedProductData.subcategoryId && mappedProductData.subcategoryId !== '') {
      mappedProductData.subcategory_id = mappedProductData.subcategoryId;
    } else {
      // Si está vacío, eliminar el campo para que sea NULL en la base de datos
      delete mappedProductData.subcategory_id;
    }
    delete mappedProductData.subcategoryId;
  }
  if ('unitOfMeasure' in mappedProductData) {
    mappedProductData.unit = mappedProductData.unitOfMeasure;
    delete mappedProductData.unitOfMeasure;
  }
  if ('image' in mappedProductData) {
    mappedProductData.image_url = mappedProductData.image;
    delete mappedProductData.image;
  }
  if ('expirationDate' in mappedProductData) {
    delete mappedProductData.expirationDate; // Este campo no existe en la base de datos de productos
  }
  if ('createdAt' in mappedProductData) {
    delete mappedProductData.createdAt; // No se actualiza en ediciones
  }
  if ('updatedAt' in mappedProductData) {
    delete mappedProductData.updatedAt; // No se envía, se gestiona automáticamente
  }
  if ('created_at' in mappedProductData) {
    delete mappedProductData.created_at; // No se actualiza en ediciones
  }
  if ('updated_at' in mappedProductData) {
    delete mappedProductData.updated_at; // No se envía, se gestiona automáticamente
  }
  if ('wholesalePrice' in mappedProductData) {
    delete mappedProductData.wholesalePrice; // Este campo no existe en la base de datos
  }

  // Actualizar el campo updated_at
  mappedProductData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('products')
    .update(mappedProductData)
    .eq('id', id);

  if (error) {
    console.error('Error actualizando producto:', error);
    throw new Error(error.message);
  }
};

export const deleteProduct = async (id) => {
  // Primero eliminar los lotes de inventario asociados al producto
  const { error: inventoryError } = await supabase
    .from('inventory_batches')
    .delete()
    .eq('product_id', id);

  if (inventoryError) {
    console.error('Error eliminando lotes de inventario asociados:', inventoryError);
    throw new Error(inventoryError.message);
  }

  // Luego eliminar el producto
  const { error: productError } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (productError) {
    console.error('Error eliminando producto:', productError);
    throw new Error(productError.message);
  }
};

// Funciones para categorías
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo categorías:', error);
    return [];
  }

  return data;
};

export const addCategory = async (categoryData) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{
      ...categoryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando categoría:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const updateCategory = async (id, categoryData) => {
  const { error } = await supabase
    .from('categories')
    .update({
      ...categoryData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error actualizando categoría:', error);
    throw new Error(error.message);
  }
};

export const deleteCategory = async (id) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando categoría:', error);
    throw new Error(error.message);
  }
};

// Funciones para usuarios
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }

  // Mapear campos de la base de datos a los campos esperados por la aplicación
  const mappedUsers = data.map(user => {
    const mappedUser = { ...user };
    if ('store_id' in mappedUser) {
      mappedUser.storeId = mappedUser.store_id;
      delete mappedUser.store_id;
    }
    return mappedUser;
  });

  return mappedUsers;
};

export const getUser = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error obteniendo usuario:', error);
    return null;
  }

  // Mapear campos de la base de datos a los campos esperados por la aplicación
  const mappedUser = { ...data };
  if ('store_id' in mappedUser) {
    mappedUser.storeId = mappedUser.store_id;
    delete mappedUser.store_id;
  }
  
  return mappedUser;
};

export const addUser = async (userData) => {
  // Copiar los datos del usuario sin modificar el original
  const mappedUserData = { ...userData };

  // Mapear campos del formulario a los campos correctos de la base de datos
  if ('storeId' in mappedUserData) {
    mappedUserData.store_id = mappedUserData.storeId;
    delete mappedUserData.storeId;
  }

  // Agregar campos automáticos
  mappedUserData.created_at = new Date().toISOString();
  mappedUserData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .insert([mappedUserData])
    .select('id')
    .single();

  if (error) {
    console.error('Error agregando usuario:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const updateUser = async (id, userData) => {
  // Copiar los datos del usuario sin modificar el original
  const mappedUserData = { ...userData };

  // Mapear campos del formulario a los campos correctos de la base de datos
  if ('storeId' in mappedUserData) {
    mappedUserData.store_id = mappedUserData.storeId;
    delete mappedUserData.storeId;
  }
  
  // Actualizar el campo updated_at
  mappedUserData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('users')
    .update(mappedUserData)
    .eq('id', id);

  if (error) {
    console.error('Error actualizando usuario:', error);
    throw new Error(error.message);
  }
};

// Funciones para tiendas
export const getStores = async () => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo tiendas:', error);
    return [];
  }

  return data;
};

// Funciones para lotes de inventario
export const getInventoryBatches = async () => {
  const { data, error } = await supabase
    .from('inventory_batches')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo lotes de inventario:', error);
    return [];
  }

  return data;
};

export const addInventoryBatch = async (inventoryData) => {
  console.log("Intentando agregar lote de inventario con datos:", inventoryData);
  // Copiar los datos del lote de inventario sin modificar el original
  const mappedInventoryData = { ...inventoryData };

  // Mapear campos del formulario a los campos correctos de la base de datos
  if ('productId' in mappedInventoryData) {
    mappedInventoryData.product_id = mappedInventoryData.productId;
    delete mappedInventoryData.productId;
  }
  if ('locationId' in mappedInventoryData) {
    mappedInventoryData.location_id = mappedInventoryData.locationId;
    delete mappedInventoryData.locationId;
  }
  if ('expirationDate' in mappedInventoryData) {
    mappedInventoryData.expiration_date = mappedInventoryData.expirationDate;
    delete mappedInventoryData.expirationDate;
  }
  
  // Agregar campos automáticos
  mappedInventoryData.created_at = new Date().toISOString();
  mappedInventoryData.updated_at = new Date().toISOString();
  
  console.log("Datos mapeados para insertar en inventory_batches:", mappedInventoryData);

  try {
    const { data, error } = await supabase
      .from('inventory_batches')
      .insert([mappedInventoryData])
      .select('id')
      .single();

    if (error) {
      console.error('Error agregando lote de inventario:', error);
      console.error('Detalle del error:', error.message, error.code, error.details);
      throw new Error(`Error al agregar lote de inventario: ${error.message} (Code: ${error.code})`);
    }

    console.log("Lote de inventario agregado con ID:", data.id);
    return data.id;
  } catch (insertError) {
    console.error('Error durante la inserción del lote de inventario:', insertError);
    throw insertError;
  }
};

export const updateInventoryBatch = async (id, inventoryData) => {
  console.log("Intentando actualizar lote de inventario con ID:", id, "y datos:", inventoryData);
  // Copiar los datos del lote de inventario sin modificar el original
  const mappedInventoryData = { ...inventoryData };

  // Mapear campos del formulario a los campos correctos de la base de datos
  if ('productId' in mappedInventoryData) {
    mappedInventoryData.product_id = mappedInventoryData.productId;
    delete mappedInventoryData.productId;
  }
  if ('locationId' in mappedInventoryData) {
    mappedInventoryData.location_id = mappedInventoryData.locationId;
    delete mappedInventoryData.locationId;
  }
  if ('expirationDate' in mappedInventoryData) {
    mappedInventoryData.expiration_date = mappedInventoryData.expirationDate;
    delete mappedInventoryData.expirationDate;
  }
  
  // Actualizar el campo updated_at
  mappedInventoryData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('inventory_batches')
    .update(mappedInventoryData)
    .eq('id', id);

  if (error) {
    console.error('Error actualizando lote de inventario:', error);
    throw new Error(error.message);
  }
  
  console.log("Lote de inventario actualizado con ID:", id);
};

// Funciones para ventas
export const getSales = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Error obteniendo ventas:', error);
    return [];
  }

  return data;
};

export const addSale = async (saleData) => {
  const { data, error } = await supabase
    .from('sales')
    .insert([{
      ...saleData,
      date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando venta:', error);
    throw new Error(error.message);
  }

  return data.id;
};

// Funciones para clientes
export const getClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error obteniendo clientes:', error);
    return [];
  }

  return data;
};

export const addClient = async (clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .insert([{
      ...clientData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error agregando cliente:', error);
    throw new Error(error.message);
  }

  return data.id;
};

export const updateClient = async (id, clientData) => {
  const { error } = await supabase
    .from('clients')
    .update({
      ...clientData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error actualizando cliente:', error);
    throw new Error(error.message);
  }
};

// Funciones para transferencias
export const getTransfers = async () => {
  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo transferencias:', error);
    return [];
  }

  return data;
};

// Funciones para lista de compras
export const getShoppingList = async () => {
  const { data, error } = await supabase
    .from('shopping_list')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo lista de compras:', error);
    return [];
  }

  return data;
};

// Funciones para gastos
export const getExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo gastos:', error);
    return [];
  }

  return data;
};

// Funciones para cierres de caja
export const getCashClosings = async () => {
  const { data, error } = await supabase
    .from('cash_closings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo cierres de caja:', error);
    return [];
  }

  return data;
};

// Inicializar colecciones/tablas por defecto si no existen
export const initializeSupabaseCollections = async () => {
  try {
    // Verificar si existen categorías y agregar por defecto si no hay
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('Error obteniendo categorías:', categoriesError);
    } else if (!categories || categories.length === 0) {
      // Agregar categorías por defecto
      const defaultCategories = [
        { name: 'Abarrotes', parent_id: null },
        { name: 'Vicio', parent_id: null },
        { name: 'Bebidas', parent_id: null }
      ];

      for (const cat of defaultCategories) {
        try {
          // Verificar si la categoría ya existe por nombre
          const { data: existingCategories, error: existingError } = await supabase
            .from('categories')
            .select('id')
            .eq('name', cat.name);

          if (existingError) {
            console.error('Error verificando categoría existente:', existingError);
            continue;
          }

          // Solo agregar si no existe
          if (!existingCategories || existingCategories.length === 0) {
            await addCategory({
              ...cat,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Error agregando categoría por defecto:', err);
        }
      }
    }

    // Verificar si existen tiendas y agregar por defecto si no hay
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*');

    if (storesError) {
      console.error('Error obteniendo tiendas:', storesError);
    } else if (!stores || stores.length === 0) {
      // Agregar tiendas por defecto
      const defaultStores = [
        { id: 'bodega-central', name: 'Bodega Central' },
        { id: 'tienda1', name: 'Tienda 1' },
        { id: 'tienda2', name: 'Tienda 2' }
      ];

      for (const store of defaultStores) {
        try {
          const { error } = await supabase
            .from('stores')
            .insert([{
              ...store,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (error) {
            console.error('Error agregando tienda por defecto:', error);
          }
        } catch (err) {
          console.error('Error agregando tienda por defecto:', err);
        }
      }
    }
  } catch (error) {
    console.error('Error inicializando colecciones de Supabase:', error);
  }
};

// Funciones para manejar crédito de clientes
export const grantCredit = async (clientId, amount) => {
  const { data: client, error: fetchError } = await supabase
    .from('clients')
    .select('creditBalance')
    .eq('id', clientId)
    .single();

  if (fetchError) {
    console.error('Error obteniendo cliente para conceder crédito:', fetchError);
    throw new Error(fetchError.message);
  }

  const newCreditBalance = (client.creditBalance || 0) + amount;

  const { error } = await supabase
    .from('clients')
    .update({
      creditBalance: newCreditBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId);

  if (error) {
    console.error('Error concediendo crédito al cliente:', error);
    throw new Error(error.message);
  }
};

export const recordPayment = async (clientId, amount) => {
  const { data: client, error: fetchError } = await supabase
    .from('clients')
    .select('creditBalance')
    .eq('id', clientId)
    .single();

  if (fetchError) {
    console.error('Error obteniendo cliente para registrar pago:', fetchError);
    throw new Error(fetchError.message);
  }

  const currentCreditBalance = client.creditBalance || 0;
  const newCreditBalance = Math.max(0, currentCreditBalance - amount); // No permitir crédito negativo

  const { error } = await supabase
    .from('clients')
    .update({
      creditBalance: newCreditBalance,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId);

  if (error) {
    console.error('Error registrando pago del cliente:', error);
    throw new Error(error.message);
  }
};

export const liquidateCredit = async (clientId) => {
  const { error } = await supabase
    .from('clients')
    .update({
      creditBalance: 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId);

  if (error) {
    console.error('Error liquidando crédito del cliente:', error);
    throw new Error(error.message);
  }
};
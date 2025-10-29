import React, { useState, useMemo } from 'react';
import useAppStore from '../store/useAppStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ProductFormModal from '../features/products/ProductFormModal';
import InventoryBatchModal from '../features/products/InventoryBatchModal';
import ProductDetailsModal from '../features/products/ProductDetailsModal';
import { Plus, Package, Eye } from 'lucide-react';

const InventoryPage = () => {
  const { inventoryBatches, products, stores, categories, updateInventoryBatch, deleteProduct } = useAppStore();
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(0);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  const getProductName = (productId) => products.find(p => p.id === productId)?.name || 'Producto Desconocido';
  const getStoreName = (storeId) => stores.find(s => s.id === storeId)?.name || 'Ubicación Desconocida';
  const getCategoryName = (categoryId) => categories.find(c => c.id === categoryId)?.name || 'Sin Categoría';
  const getSubcategoryName = (subcategoryId) => {
    let name = 'Sin Subcategoría';
    categories.forEach(cat => {
      const subCat = cat.subcategories?.find(sub => sub.id === subcategoryId);
      if (subCat) name = subCat.name;
    });
    return name;
  };

  const filteredBatches = useMemo(() => {
    let filtered = inventoryBatches;

    if (locationFilter !== 'all') {
      filtered = filtered.filter(batch => batch.locationId === locationFilter);
    }

    if (categoryFilter !== 'all') {
      const productsInCategory = products.filter(p => p.categoryId === categoryFilter);
      filtered = filtered.filter(batch => productsInCategory.some(p => p.id === batch.productId));
    }

    if (subcategoryFilter !== 'all') {
      const productsInSubcategory = products.filter(p => p.subcategoryId === subcategoryFilter);
      filtered = filtered.filter(batch => productsInSubcategory.some(p => p.id === batch.productId));
    }

    return filtered;
  }, [inventoryBatches, locationFilter, categoryFilter, subcategoryFilter, products]);

  const isDateNearby = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return date > today && date <= thirtyDaysFromNow;
  };

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleEditQuantity = (batch) => {
    setEditingBatchId(batch.inventoryId);
    setEditingQuantity(batch.quantity);
  };

  const handleSaveQuantity = async (batchId) => {
    const result = await updateInventoryBatch(batchId, { quantity: parseInt(editingQuantity) });
    if (result.success) {
      alert('Cantidad actualizada exitosamente');
      setEditingBatchId(null);
    } else {
      alert('Error al actualizar la cantidad: ' + result.error);
      setEditingBatchId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingBatchId(null);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto del catálogo? Esto no afecta los lotes de inventario existentes.')) {
      deleteProduct(productId);
    }
  };

  const handleOpenBatchModal = (batch = null) => {
    setEditingBatch(batch);
    setIsBatchModalOpen(true);
  };

  const handleCloseBatchModal = () => {
    setIsBatchModalOpen(false);
    setEditingBatch(null);
  };

  const handleViewProductDetails = (product) => {
    setViewingProduct(product);
    setIsProductDetailsModalOpen(true);
  };

  const handleCloseProductDetailsModal = () => {
    setIsProductDetailsModalOpen(false);
    setViewingProduct(null);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventario Detallado por Lote</h1>
        <div className="flex items-center space-x-4">
          <Button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center">
            <Plus className="mr-2" size={18} />
            Añadir/Editar Producto
          </Button>
          <Button 
            onClick={() => handleOpenBatchModal()} 
            className="bg-green-600 text-white hover:bg-green-700 flex items-center"
          >
            <Package className="mr-2" size={18} />
            Editar Lote
          </Button>
          <div>
            <label htmlFor="location-filter" className="mr-2 font-medium">Filtrar por Ubicación:</label>
            <select 
              id="location-filter"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="all">Todas las Ubicaciones</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category-filter" className="mr-2 font-medium">Filtrar por Categoría:</label>
            <select 
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setSubcategoryFilter('all'); // Reset subcategory filter when category changes
              }}
              className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="all">Todas las Categorías</option>
              {categories.filter(cat => !cat.parentId).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          {categoryFilter !== 'all' && categories.find(cat => cat.id === categoryFilter)?.subcategories && categories.find(cat => cat.id === categoryFilter)?.subcategories.length > 0 && (
            <div>
              <label htmlFor="subcategory-filter" className="mr-2 font-medium">Filtrar por Subcategoría:</label>
              <select 
                id="subcategory-filter"
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="all">Todas las Subcategorías</option>
                {categories.find(cat => cat.id === categoryFilter)?.subcategories?.map(subCat => (
                  <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Lotes de Inventario</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subcategoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costo Unitario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Caducidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID de Lote</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No hay lotes de inventario que coincidan con el filtro.</td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const product = products.find(p => p.id === batch.productId);
                  const isEditing = editingBatchId === batch.inventoryId;
                  
                  return (
                    <tr key={batch.inventoryId} className={isDateNearby(batch.expirationDate) ? 'bg-yellow-100' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getProductName(batch.productId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getCategoryName(product?.categoryId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getSubcategoryName(product?.subcategoryId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStoreName(batch.locationId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-800">
                        {isEditing ? (
                          <div className="flex items-center justify-center space-x-2">
                            <input
                              type="number"
                              value={editingQuantity}
                              onChange={(e) => setEditingQuantity(parseInt(e.target.value) || 0)}
                              min="0"
                              className="w-20 border rounded p-1 text-center"
                              autoFocus
                            />
                            <Button onClick={() => handleSaveQuantity(batch.inventoryId)} className="p-1 text-xs bg-green-500 text-white">
                              ✓
                            </Button>
                            <Button onClick={handleCancelEdit} className="p-1 text-xs bg-gray-500 text-white">
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <span className="font-semibold">{batch.quantity}</span>
                            <Button 
                              onClick={() => handleEditQuantity(batch)}
                              className="p-1 text-xs bg-blue-500 text-white"
                            >
                              ✏
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">${batch.cost.toFixed(2)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDateNearby(batch.expirationDate) ? 'text-yellow-800 font-bold' : 'text-gray-500'}`}>
                        {batch.expirationDate ? new Date(batch.expirationDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{batch.inventoryId}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Catálogo de Productos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subcategoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio Unitario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio Mayoreo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Costo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Códigos de Barras</th>
                <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product, index) => (
                <tr key={`${product.id}-${index}`} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-850'} hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getCategoryName(product.categoryId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getSubcategoryName(product.subcategoryId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${product.wholesalePrice ? product.wholesalePrice.toFixed(2) : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${product.cost ? product.cost.toFixed(2) : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.unitOfMeasure}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.barcodes ? product.barcodes.join(', ') : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      onClick={() => handleViewProductDetails(product)} 
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </Button>
                    <Button 
                      onClick={() => handleOpenModal(product)} 
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3"
                      title="Editar producto"
                    >
                      ✏
                    </Button>
                    <Button 
                      onClick={() => handleDeleteProduct(product.id)} 
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      title="Eliminar producto"
                    >
                      🗑
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? "Editar Producto" : "Añadir Nuevo Producto"}>
        <ProductFormModal product={editingProduct} onClose={handleCloseModal} />
      </Modal>
      
      <Modal 
        isOpen={isBatchModalOpen} 
        onClose={handleCloseBatchModal} 
        title={editingBatch ? "Editar Lote de Inventario" : "Agregar Nuevo Lote de Inventario"}
      >
        <InventoryBatchModal batch={editingBatch} onClose={handleCloseBatchModal} />
      </Modal>
      
      <Modal 
        isOpen={isProductDetailsModalOpen} 
        onClose={handleCloseProductDetailsModal} 
        title="Detalles del Producto"
      >
        <ProductDetailsModal product={viewingProduct} onClose={handleCloseProductDetailsModal} />
      </Modal>
    </div>
  );
};

export default InventoryPage;
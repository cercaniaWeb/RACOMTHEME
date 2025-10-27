
import React, { useState, useMemo } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Search, Edit3, Trash2, Package, AlertCircle } from 'lucide-react';

const ProductCollectionModal = ({ onClose }) => {
  const { products, inventoryBatches, currentUser, updateProduct, deleteProduct } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const productsInStore = useMemo(() => {
    const storeId = currentUser?.storeId;
    if (!storeId) return [];

    const stockByProduct = inventoryBatches.reduce((acc, batch) => {
      if (batch.locationId === storeId) {
        acc[batch.productId] = (acc[batch.productId] || 0) + batch.quantity;
      }
      return acc;
    }, {});

    return products
      .map(product => ({
        ...product,
        stockInLocation: stockByProduct[product.id] || 0,
      }))
      .filter(product => product.stockInLocation > 0)
      .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, inventoryBatches, currentUser, searchTerm]);

  const handleEditProduct = (productId) => {
    // This would typically open a ProductFormModal for editing
    alert(`Edit product ${productId}`);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      deleteProduct(productId);
    }
  };

  const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'gerente');

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-xl bg-blue-100 text-blue-600 mr-4">
          <Package size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Colección de Productos</h2>
          <p className="text-gray-500 dark:text-gray-400">Gestiona los productos disponibles en tu tienda</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition duration-200"
          />
        </div>
        <Button 
          onClick={onClose} 
          variant="outline"
          className="px-4 py-3 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Cerrar
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        {productsInStore.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                <AlertCircle size={32} className="text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No se encontraron productos</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No hay productos en esta tienda o no coinciden con la búsqueda.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio</th>
                {canEdit && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {productsInStore.map((product, index) => (
                <tr 
                  key={product.id} 
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-750 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-850'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-8 w-8 object-cover rounded-md"
                          />
                        ) : (
                          <Package size={20} className="text-gray-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.barcodes && product.barcodes.length > 0 ? product.barcodes[0] : 'Sin código'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-200">
                      {product.categoryId || 'Sin categoría'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.stockInLocation < 10 
                        ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300' 
                        : product.stockInLocation < 20 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300' 
                          : 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                    }`}>
                      {product.stockInLocation}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-semibold">
                    ${product.price.toFixed(2)}
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleEditProduct(product.id)} 
                          variant="outline"
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                        >
                          <Edit3 size={16} />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteProduct(product.id)} 
                          variant="outline"
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {productsInStore.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
          <span>Mostrando {productsInStore.length} producto{productsInStore.length !== 1 ? 's' : ''}</span>
          <span>Total en stock: {productsInStore.reduce((sum, product) => sum + product.stockInLocation, 0)}</span>
        </div>
      )}
    </div>
  );
};

export default ProductCollectionModal;

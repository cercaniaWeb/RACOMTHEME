import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const InventoryBatchModal = ({ batch, onClose }) => {
  const { updateInventoryBatch, products, stores } = useAppStore();
  const [formData, setFormData] = useState({
    productId: '',
    locationId: '',
    quantity: 0,
    cost: 0,
    expirationDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (batch) {
      setFormData({
        productId: batch.productId || batch.product_id || '',
        locationId: batch.locationId || batch.location_id || '',
        quantity: batch.quantity || 0,
        cost: batch.cost || 0,
        expirationDate: batch.expirationDate || batch.expiration_date || ''
      });
    } else {
      // Default values for new batch
      setFormData({
        productId: '',
        locationId: '',
        quantity: 0,
        cost: 0,
        expirationDate: ''
      });
    }
  }, [batch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'cost' ? parseFloat(value) || 0 : value 
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Prepare the data to send, mapping to the proper field names
      const batchData = {
        productId: formData.productId,
        locationId: formData.locationId,
        quantity: parseInt(formData.quantity) || 0,
        cost: parseFloat(formData.cost) || 0,
        expirationDate: formData.expirationDate || null
      };
      
      let result;
      if (batch) {
        // Update existing batch
        result = await updateInventoryBatch(batch.inventoryId || batch.id, batchData);
      } else {
        // This would be for adding a new batch, but we might not need this functionality
        // since adding batches is usually done when adding products
        setError('Adding new inventory batches is not supported in this modal');
        return;
      }
      
      if (result.success) {
        alert(batch ? 'Lote actualizado exitosamente' : 'Lote agregado exitosamente');
        onClose();
      } else {
        setError(result.error || 'Ocurrió un error desconocido');
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // Get product name for display
  const productName = products.find(p => p.id === (formData.productId))?.name || 'Seleccionar producto';
  const storeName = stores.find(s => s.id === (formData.locationId))?.name || 'Seleccionar tienda';

  return (
    <div className="p-4 dark:text-white">
      <h2 className="text-xl font-bold mb-4 dark:text-white">
        {batch ? 'Editar Lote de Inventario' : 'Agregar Nuevo Lote de Inventario'}
      </h2>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="productId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Producto</label>
          <select
            id="productId"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Seleccionar producto</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">{productName}</p>
        </div>

        <div>
          <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tienda/Ubicación</label>
          <select
            id="locationId"
            name="locationId"
            value={formData.locationId}
            onChange={handleChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Seleccionar tienda</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">{storeName}</p>
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            required
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Costo Unitario</label>
          <Input
            id="cost"
            name="cost"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={handleChange}
            min="0"
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Expiración (Opcional)</label>
          <Input
            id="expirationDate"
            name="expirationDate"
            type="date"
            value={formData.expirationDate}
            onChange={handleChange}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            onClick={onClose} 
            variant="outline"
            className="dark:bg-gray-600 dark:hover:bg-gray-700"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-indigo-600 text-white hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (batch ? 'Actualizar Lote' : 'Agregar Lote')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InventoryBatchModal;
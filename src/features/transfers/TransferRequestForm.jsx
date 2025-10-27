import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { X, Search } from 'lucide-react';

const TransferRequestForm = ({ onClose }) => {
  const { products, createTransferRequest, stores } = useAppStore();
  const [requestedItems, setRequestedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [destinationStoreId, setDestinationStoreId] = useState('');

  const filteredProducts = searchTerm
    ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const handleAddProduct = (product) => {
    if (!requestedItems.some(item => item.productId === product.id)) {
      setRequestedItems([...requestedItems, { productId: product.id, productName: product.name, requestedQuantity: 1 }]);
    }
    setSearchTerm('');
  };

  const handleQuantityChange = (productId, quantity) => {
    const newQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    setRequestedItems(requestedItems.map(item => 
      item.productId === productId ? { ...item, requestedQuantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (productId) => {
    setRequestedItems(requestedItems.filter(item => item.productId !== productId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (requestedItems.length === 0) {
      alert('Por favor, añade al menos un producto a la solicitud.');
      return;
    }
    createTransferRequest({ items: requestedItems, destinationStoreId });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 dark:text-white">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Buscar Producto</label>
        <Input 
          icon={Search}
          type="text"
          placeholder="Escribe para buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <ul className="mt-2 border rounded-md max-h-40 overflow-y-auto dark:border-gray-700 dark:bg-gray-700">
            {filteredProducts.map(p => (
              <li 
                key={p.id} 
                className="p-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-600 dark:text-white"
                onClick={() => handleAddProduct(p)}
              >
                {p.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="destinationStore" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tienda de Destino</label>
        <select
          id="destinationStore"
          name="destinationStore"
          value={destinationStoreId}
          onChange={(e) => setDestinationStoreId(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        >
          <option value="" className="dark:bg-gray-700 dark:text-white">Selecciona una tienda</option>
          {stores.map(store => (
            <option key={store.id} value={store.id} className="dark:bg-gray-700 dark:text-white">{store.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium dark:text-white">Productos Solicitados</h3>
        {requestedItems.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Aún no has añadido productos.</p>
        ) : (
          requestedItems.map(item => (
            <div key={item.productId} className="flex items-center justify-between bg-gray-50 p-2 rounded-md dark:bg-gray-700 dark:text-white">
              <span className="dark:text-white">{item.productName}</span>
              <div className="flex items-center space-x-2">
                <Input 
                  type="number"
                  value={item.requestedQuantity}
                  onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                  className="w-20 text-center dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  min="1"
                />
                <Button onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  <X size={18} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
          Enviar Solicitud
        </Button>
      </div>
    </form>
  );
};

export default TransferRequestForm;

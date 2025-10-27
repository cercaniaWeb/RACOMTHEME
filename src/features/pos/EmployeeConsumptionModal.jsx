import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { X, Search } from 'lucide-react';

const EmployeeConsumptionModal = ({ onClose }) => {
  const { products, currentUser, recordEmployeeConsumption } = useAppStore();
  const [consumedItems, setConsumedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = searchTerm
    ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const handleAddProduct = (product) => {
    if (!consumedItems.some(item => item.id === product.id)) {
      setConsumedItems([...consumedItems, { id: product.id, name: product.name, quantity: 1 }]);
    }
    setSearchTerm('');
  };

  const handleQuantityChange = (productId, quantity) => {
    const newQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    setConsumedItems(consumedItems.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (productId) => {
    setConsumedItems(consumedItems.filter(item => item.id !== productId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (consumedItems.length === 0) {
      alert('Por favor, añade al menos un producto para registrar el consumo.');
      return;
    }
    recordEmployeeConsumption(consumedItems, currentUser);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Buscar Producto</label>
        <Input 
          icon={Search}
          type="text"
          placeholder="Escribe para buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <ul className="mt-2 border rounded-md max-h-40 overflow-y-auto">
            {filteredProducts.map(p => (
              <li 
                key={p.id} 
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleAddProduct(p)}
              >
                {p.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Productos a Consumir</h3>
        {consumedItems.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no has añadido productos para consumo.</p>
        ) : (
          consumedItems.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
              <span>{item.name}</span>
              <div className="flex items-center space-x-2">
                <Input 
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  className="w-20 text-center"
                  min="1"
                />
                <Button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700">
                  <X size={18} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
          Registrar Consumo
        </Button>
      </div>
    </form>
  );
};

export default EmployeeConsumptionModal;

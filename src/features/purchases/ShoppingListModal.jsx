
import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Trash, CheckCircle } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const ShoppingListModal = ({ onClose }) => {
  const { addExpense, clearShoppingList } = useAppStore();
  const [shoppingList, setShoppingList] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const handleAddItem = () => {
    if (newItemName.trim()) {
      setShoppingList(prev => [...prev, { id: Date.now(), name: newItemName, quantity: newItemQuantity, purchased: false, price: 0 }]);
      setNewItemName('');
      setNewItemQuantity(1);
    }
  };

  const handleRemoveItem = (id) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const handleTogglePurchased = (id) => {
    setShoppingList(prev => prev.map(item => item.id === id ? { ...item, purchased: !item.purchased } : item));
  };

  const handlePriceChange = (id, price) => {
    setShoppingList(prev => prev.map(item => item.id === id ? { ...item, price: parseFloat(price) || 0 } : item));
  };

  const handleGenerateExpenses = () => {
    const purchasedItems = shoppingList.filter(item => item.purchased && item.price > 0);
    if (purchasedItems.length > 0) {
      addExpense(purchasedItems);
      setShoppingList(prev => prev.filter(item => !item.purchased)); // Remove purchased items from the list
    }
    onClose();
  };

  return (
    <div className="p-4 dark:text-white">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Lista de Compras</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Añadir Nuevo Artículo</label>
        <div className="flex space-x-2 mt-1">
          <Input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Nombre del artículo"
            className="flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <Input
            type="number"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
            className="w-20 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="1"
          />
          <Button onClick={handleAddItem} className="bg-green-500 text-white hover:bg-green-600">
            <Plus size={20} />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium dark:text-white">Artículos en la Lista</h3>
        {shoppingList.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">La lista de compras está vacía.</p>
        ) : (
          shoppingList.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md dark:bg-gray-700 dark:text-white">
              <div className="flex items-center flex-grow">
                <input
                  type="checkbox"
                  checked={item.purchased}
                  onChange={() => handleTogglePurchased(item.id)}
                  className="mr-2 dark:bg-gray-600 dark:border-gray-500"
                />
                <span className={`${item.purchased ? 'line-through text-gray-500 dark:text-gray-400' : 'dark:text-white'}`}>{item.name} ({item.quantity})</span>
              </div>
              {item.purchased && (
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  placeholder="Precio"
                  className="w-24 mr-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  prefix="$"
                />
              )}
              <Button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                <Trash size={18} />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 mr-2 dark:bg-gray-600 dark:hover:bg-gray-700">
          Cerrar
        </Button>
        <Button onClick={() => {
          if (window.confirm('¿Estás seguro de que quieres vaciar la lista de compras?')) {
            clearShoppingList();
          }
        }} className="bg-red-500 text-white hover:bg-red-600 mr-2">
          Vaciar Lista
        </Button>
        <Button onClick={handleGenerateExpenses} className="bg-indigo-600 text-white hover:bg-indigo-700">
          Generar Gastos
        </Button>
      </div>
    </div>
  );
};

export default ShoppingListModal;

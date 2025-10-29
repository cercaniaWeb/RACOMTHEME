
import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Edit, Trash } from 'lucide-react';

const CategoryManagementModal = ({ onClose }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({ name: newCategoryName, parentId: newCategoryParent });
      setNewCategoryName('');
      setNewCategoryParent(null);
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      updateCategory(editingCategory.id, { name: editingCategory.name });
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      deleteCategory(id);
    }
  };

  const renderCategory = (category, level = 0) => {
    return (
      <div key={category.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
          {editingCategory?.id === category.id ? (
            <Input
              type="text"
              value={editingCategory.name}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              className="flex-grow dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
          ) : (
            <span className="dark:text-white">{category.name}</span>
          )}
          <div className="flex items-center space-x-2">
            {editingCategory?.id === category.id ? (
              <Button onClick={handleUpdateCategory} className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Guardar
              </Button>
            ) : (
              <Button onClick={() => setEditingCategory(category)} className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300">
                <Edit size={18} />
              </Button>
            )}
            <Button onClick={() => handleDeleteCategory(category.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
              <Trash size={18} />
            </Button>
          </div>
        </div>
        {category.subcategories && category.subcategories.map(subCategory => renderCategory(subCategory, level + 1))}
      </div>
    );
  };

  return (
    <div className="p-4 dark:text-white max-h-[70vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Gestión de Categorías</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nueva Categoría</label>
        <div className="flex space-x-2 mt-1">
          <Input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nombre de la categoría"
            className="flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={newCategoryParent || ''}
            onChange={(e) => setNewCategoryParent(e.target.value || null)}
            className="flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="" className="dark:bg-gray-700 dark:text-white">Categoría Principal</option>
            {categories.map(category => (
              <option key={category.id} value={category.id} className="dark:bg-gray-700 dark:text-white">{category.name}</option>
            ))}
          </select>
          <Button onClick={handleAddCategory} className="bg-green-500 text-white hover:bg-green-600">
            <Plus size={20} />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium dark:text-white">Categorías Existentes</h3>
        {categories.filter(c => !c.parentId).map(category => renderCategory(category))}
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700">
          Cerrar
        </Button>
      </div>
    </div>
  );
};

export default CategoryManagementModal;

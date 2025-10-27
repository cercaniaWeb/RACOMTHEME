import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const UserFormModal = ({ user, onClose }) => {
  const { addUser, updateUser, stores } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier',
    storeId: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Never pre-fill password for security
        role: user.role || 'cashier',
        storeId: user.storeId || null,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'cashier',
        storeId: null,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user) {
      // Update user
      updateUser(user.uid, formData);
    } else {
      // Add new user
      addUser(formData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 dark:text-white">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña {user ? '(dejar en blanco para no cambiar)' : ''}</label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          {...(!user && { required: true })} // Required only for new users
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        >
          <option value="admin" className="dark:bg-gray-700 dark:text-white">Admin</option>
          <option value="gerente" className="dark:bg-gray-700 dark:text-white">Gerente</option>
          <option value="cashier" className="dark:bg-gray-700 dark:text-white">Cajero</option>
          <option value="bodeguero" className="dark:bg-gray-700 dark:text-white">Bodeguero</option>
        </select>
      </div>
      <div>
        <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tienda Asignada</label>
        <select
          id="storeId"
          name="storeId"
          value={formData.storeId || ''}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="" className="dark:bg-gray-700 dark:text-white">Ninguna (para Admin/Gerente sin tienda específica)</option>
          {stores.map(store => (
            <option key={store.id} value={store.id} className="dark:bg-gray-700 dark:text-white">{store.name}</option>
          ))}
        </select>
      </div>
      <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
        {user ? "Guardar Cambios" : "Añadir Usuario"}
      </Button>
    </form>
  );
};

export default UserFormModal;

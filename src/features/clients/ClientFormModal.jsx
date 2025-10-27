
import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useAppStore from '../../store/useAppStore';

const ClientFormModal = ({ client, onClose }) => {
  const { addClient, updateClient } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    creditLimit: 0,
    creditBalance: 0,
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        creditLimit: client.creditLimit || 0,
        creditBalance: client.creditBalance || 0,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        creditLimit: 0,
        creditBalance: 0,
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (client) {
      updateClient(client.id, formData);
    } else {
      addClient(formData);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
        <Input
          id="phone"
          name="phone"
          type="text"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
        <Input
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="creditLimit" className="block text-sm font-medium text-gray-700">Límite de Crédito</label>
        <Input
          id="creditLimit"
          name="creditLimit"
          type="number"
          value={formData.creditLimit}
          onChange={handleChange}
          prefix="$"
        />
      </div>
      <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
        {client ? "Guardar Cambios" : "Añadir Cliente"}
      </Button>
    </form>
  );
};

export default ClientFormModal;

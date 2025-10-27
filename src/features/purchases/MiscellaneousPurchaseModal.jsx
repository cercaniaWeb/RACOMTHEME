import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const MiscellaneousPurchaseModal = ({ onClose }) => {
  const { addExpense } = useAppStore();
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    type: 'Gasto Operativo', // Default to Gasto Operativo for now
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense({ ...formData, amount: parseFloat(formData.amount) });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
        <Input
          id="description"
          name="description"
          type="text"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Monto</label>
        <Input
          id="amount"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          required
        />
      </div>
      {/* For now, type is fixed to Gasto Operativo */}
      <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
        Registrar Gasto
      </Button>
    </form>
  );
};

export default MiscellaneousPurchaseModal;

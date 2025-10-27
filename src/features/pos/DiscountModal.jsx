import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const DiscountModal = ({ onClose }) => {
  const { setDiscount } = useAppStore();
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);

  const handleApplyDiscount = () => {
    setDiscount({ type: discountType, value: parseFloat(discountValue) });
    onClose();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Aplicar Descuento</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Tipo de Descuento</label>
        <select
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="percentage">Porcentaje (%)</option>
          <option value="amount">Monto Fijo ($)</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Valor del Descuento</label>
        <Input
          type="number"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder="0"
        />
      </div>
      <Button onClick={handleApplyDiscount} className="w-full bg-blue-600 text-white py-2 hover:bg-blue-700">
        Aplicar Descuento
      </Button>
    </div>
  );
};

export default DiscountModal;

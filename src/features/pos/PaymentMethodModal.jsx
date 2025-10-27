
import React from 'react';
import Button from '../../components/ui/Button';

const PaymentMethodModal = ({ onClose, onSelectPayment }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Seleccionar Método de Pago</h2>
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={() => onSelectPayment('Efectivo')} className="w-full bg-green-500 text-white py-3 hover:bg-green-600">
          Efectivo
        </Button>
        <Button onClick={() => onSelectPayment('Tarjeta')} className="w-full bg-blue-500 text-white py-3 hover:bg-blue-600">
          Tarjeta
        </Button>
        <Button onClick={() => onSelectPayment('Otro')} className="w-full bg-gray-500 text-white py-3 hover:bg-gray-600">
          Otro
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethodModal;


import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useAppStore from '../../store/useAppStore';
import { DollarSign } from 'lucide-react';

const WithdrawalModal = ({ onClose }) => {
  const { addExpense } = useAppStore(); // Assuming withdrawals are recorded as expenses
  const [amount, setAmount] = useState(0);
  const commissionRate = 0.04; // 4% commission

  const commission = amount * commissionRate;
  const totalDeducted = amount + commission;

  const handleWithdrawal = () => {
    if (amount > 0) {
      // Record as an expense
      addExpense({
        concept: 'Retiro de Efectivo (Tarjeta)',
        amount: totalDeducted,
        type: 'Retiro',
        details: `Monto retirado: $${amount.toFixed(2)}, Comisión (4%): $${commission.toFixed(2)}`,
      });
      onClose();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Retiro de Efectivo (Tarjeta)</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Monto a Retirar</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          prefix="$"
          icon={DollarSign}
        />
      </div>
      <p className="text-gray-700">Comisión (4%): ${commission.toFixed(2)}</p>
      <p className="text-lg font-bold mt-2">Total a Deducir: ${totalDeducted.toFixed(2)}</p>
      <div className="flex justify-end gap-4 mt-4">
        <Button onClick={onClose} className="bg-gray-300 hover:bg-gray-400">
          Cancelar
        </Button>
        <Button onClick={handleWithdrawal} className="bg-blue-600 text-white hover:bg-blue-700" disabled={amount <= 0}>
          Confirmar Retiro
        </Button>
      </div>
    </div>
  );
};

export default WithdrawalModal;

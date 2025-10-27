
import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Ticket from './Ticket';

const PreviousSalesModal = ({ onClose }) => {
  const { salesHistory } = useAppStore();
  const [selectedSale, setSelectedSale] = useState(null);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Ventas Anteriores</h2>
      <div className="space-y-2">
        {salesHistory.map((sale) => (
          <div key={sale.saleId} className="flex justify-between items-center p-2 border rounded-md">
            <div>
              <p>ID de Venta: {sale.saleId}</p>
              <p>Total: ${sale.total.toFixed(2)}</p>
            </div>
            <Button onClick={() => setSelectedSale(sale)} className="bg-blue-500 text-white hover:bg-blue-600">
              Ver Ticket
            </Button>
          </div>
        ))}
      </div>

      {selectedSale && (
        <Modal isOpen={!!selectedSale} onClose={() => setSelectedSale(null)} title="Ticket de Venta">
          <Ticket saleDetails={selectedSale} />
        </Modal>
      )}
    </div>
  );
};

export default PreviousSalesModal;

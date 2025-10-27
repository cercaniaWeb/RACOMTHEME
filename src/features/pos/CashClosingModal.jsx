
import React, { useState, useRef } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal'; // Import Modal
import { useReactToPrint } from 'react-to-print';
import CashClosingTicket from './CashClosingTicket';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CashClosingModal = ({ onClose }) => {
  const { salesHistory, currentUser, handleCashClosing, cashClosings } = useAppStore();
  const [initialCash, setInitialCash] = useState(0);
  const [showTicketPreview, setShowTicketPreview] = useState(false); // New state for modal visibility
  const cashClosingRef = useRef();

  const salesToClose = salesHistory.filter(sale => sale.cashier === currentUser.name);
  const totalSalesAmount = salesToClose.reduce((acc, sale) => acc + sale.total, 0);
  const totalCashSales = salesToClose.filter(sale => sale.cash).reduce((acc, sale) => acc + sale.cash, 0);
  const totalCardSales = salesToClose.filter(sale => sale.card).reduce((acc, sale) => acc + sale.card, 0);

  const finalCash = initialCash + totalCashSales;

  const cashClosingDetails = {
    date: new Date().toISOString(),
    cashier: currentUser?.name,
    initialCash: initialCash,
    totalSalesAmount: totalSalesAmount,
    totalCashSales: totalCashSales,
    totalCardSales: totalCardSales,
    finalCash: finalCash,
    sales: salesToClose,
  };

  const handlePrint = useReactToPrint({
    content: () => cashClosingRef.current,
    documentTitle: `Cierre_Caja_${currentUser?.name}_${new Date().toLocaleDateString()}`,
  });

  const handleSaveTicket = async () => {
    const element = cashClosingRef.current;
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`cierre_caja_${currentUser?.name}_${new Date().toLocaleDateString()}.pdf`);
    }
    onClose();
  };

  const handleCloseCash = () => {
    handleCashClosing(initialCash);
    handlePrint(); // Automatically print after closing cash
    setShowTicketPreview(true); // Show ticket preview after printing
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Cierre de Caja</h2>
      <p>Usuario: {currentUser?.name}</p>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Efectivo Inicial en Caja</label>
        <Input
          type="number"
          value={initialCash}
          onChange={(e) => setInitialCash(parseFloat(e.target.value) || 0)}
          placeholder="0.00"
        />
      </div>
      <p>Ventas en Efectivo: ${totalCashSales.toLocaleString()}</p>
      <p>Ventas con Tarjeta: ${totalCardSales.toLocaleString()}</p>
      <p>Total de ventas: {salesToClose.length}</p>
      <p>Monto total de ventas: ${totalSalesAmount.toLocaleString()}</p>
      <p className="text-lg font-bold">Total en Caja (Efectivo Inicial + Ventas Efectivo): ${finalCash.toLocaleString()}</p>
      <Button onClick={handleCloseCash} className="w-full bg-blue-600 text-white py-2 hover:bg-blue-700 mt-4">
        Realizar Cierre de Caja e Imprimir
      </Button>
      {/* Hidden component for printing */}
      <div style={{ display: 'none' }}>
        <CashClosingTicket ref={cashClosingRef} cashClosingDetails={cashClosingDetails} />
      </div>

      <Modal isOpen={showTicketPreview} onClose={() => onClose()} title="Ticket de Cierre de Caja">
        <CashClosingTicket cashClosingDetails={cashClosingDetails} />
        <div className="flex justify-end space-x-4 mt-4">
          <Button onClick={handleSaveTicket} className="bg-green-600 text-white hover:bg-green-700">
            Guardar Ticket
          </Button>
          <Button onClick={() => onClose()} className="bg-gray-300 hover:bg-gray-400">
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CashClosingModal;


import React from 'react';

const CashClosingTicket = ({ cashClosingDetails }) => {
  const { date, cashier, initialCash, totalSalesAmount, totalCashSales, totalCardSales, finalCash, sales } = cashClosingDetails;

  return (
    <div className="bg-white p-6 font-mono text-sm">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">Cierre de Caja</h2>
        <p>Fecha: {new Date(date).toLocaleString()}</p>
        <p>Cajero: {cashier}</p>
      </div>

      <div className="border-t border-b border-gray-300 py-2 mb-2">
        <div className="flex justify-between">
          <span>Efectivo Inicial:</span>
          <span>${initialCash.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Ventas en Efectivo:</span>
          <span>${totalCashSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Ventas con Tarjeta:</span>
          <span>${totalCardSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold mt-2">
          <span>Total en Caja:</span>
          <span>${finalCash.toFixed(2)}</span>
        </div>
      </div>

      <div className="mb-2">
        <h3 className="font-bold">Detalle de Ventas:</h3>
        {sales.map((sale) => (
          <div key={sale.saleId} className="flex justify-between text-xs">
            <span>Venta {sale.saleId.substring(sale.saleId.length - 4)}:</span>
            <span>${sale.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-300 pt-2 text-center">
        <p>Gracias por su trabajo!</p>
      </div>
    </div>
  );
};

export default CashClosingTicket;

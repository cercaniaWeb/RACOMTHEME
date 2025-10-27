import React, { useMemo } from 'react';
import useAppStore from '../store/useAppStore';
import Card from '../components/ui/Card';

const ReportsPage = () => {
  const { salesHistory, expenses, products, stores } = useAppStore();

  const getProductName = (productId) => products.find(p => p.id === productId)?.name || 'Producto Desconocido';
  const getStoreName = (storeId) => stores.find(s => s.id === storeId)?.name || 'Tienda Desconocida';

  const reportData = useMemo(() => {
    let totalSales = 0;
    let totalCOGS = 0;
    const salesByProduct = {}; // { productId: { name, quantity, revenue, cogs } }
    const salesByStore = {};   // { storeId: { name, totalSales } }

    salesHistory.forEach(sale => {
      totalSales += sale.total;
      if (!salesByStore[sale.storeId]) {
        salesByStore[sale.storeId] = { name: getStoreName(sale.storeId), totalSales: 0 };
      }
      salesByStore[sale.storeId].totalSales += sale.total;

      sale.cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        const itemCOGS = (product?.cost || 0) * item.quantity;
        totalCOGS += itemCOGS;

        if (!salesByProduct[item.id]) {
          salesByProduct[item.id] = { name: getProductName(item.id), quantity: 0, revenue: 0, cogs: 0 };
        }
        salesByProduct[item.id].quantity += item.quantity;
        salesByProduct[item.id].revenue += item.price * item.quantity;
        salesByProduct[item.id].cogs += itemCOGS;
      });
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalProfit = totalSales - totalCOGS - totalExpenses;

    const sortedProductsByRevenue = Object.values(salesByProduct).sort((a, b) => b.revenue - a.revenue);
    const topSellingProducts = sortedProductsByRevenue.slice(0, 3);
    const bottomSellingProducts = sortedProductsByRevenue.slice(-3).reverse();

    const productsWithProfit = Object.values(salesByProduct).map(p => ({ ...p, profit: p.revenue - p.cogs }));
    const lowProfitProducts = productsWithProfit.filter(p => p.profit < (p.revenue * 0.1)); // Example: less than 10% margin
    const negativeProfitProducts = productsWithProfit.filter(p => p.profit < 0);

    return {
      totalSales,
      totalCOGS,
      totalExpenses,
      totalProfit,
      salesByProduct: Object.values(salesByProduct),
      salesByStore: Object.values(salesByStore),
      topSellingProducts,
      bottomSellingProducts,
      lowProfitProducts,
      negativeProfitProducts,
    };
  }, [salesHistory, expenses, products, stores]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reportes Generales</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h2 className="text-xl font-semibold mb-2">Ventas Totales</h2>
          <p className="text-3xl font-bold text-indigo-600">${reportData.totalSales.toFixed(2)}</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-2">Gastos Totales</h2>
          <p className="text-3xl font-bold text-red-600">${reportData.totalExpenses.toFixed(2)}</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-2">Ganancia Neta</h2>
          <p className="text-3xl font-bold text-green-600">${reportData.totalProfit.toFixed(2)}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Insights del Negocio (IA Simple)</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {reportData.topSellingProducts.length > 0 && (
            <li>
              <span className="font-semibold">Productos Más Vendidos:</span> {reportData.topSellingProducts.map(p => p.name).join(', ')}.
            </li>
          )}
          {reportData.negativeProfitProducts.length > 0 && (
            <li className="text-red-600">
              <span className="font-semibold">¡Atención! Productos con Ganancia Negativa:</span> {reportData.negativeProfitProducts.map(p => p.name).join(', ')}. Revisa sus costos o precios.
            </li>
          )}
          {reportData.lowProfitProducts.length > 0 && (
            <li>
              <span className="font-semibold">Productos con Bajo Margen:</span> {reportData.lowProfitProducts.map(p => p.name).join(', ')}. Considera ajustar precios o buscar mejores proveedores.
            </li>
          )}
          {reportData.bottomSellingProducts.length > 0 && (
            <li>
              <span className="font-semibold">Productos de Baja Rotación:</span> {reportData.bottomSellingProducts.map(p => p.name).join(', ')}. Podrías considerar promociones o descontinuarlos.
            </li>
          )}
          {reportData.topSellingProducts.length === 0 && reportData.negativeProfitProducts.length === 0 && (
            <li>No hay suficientes datos para generar insights en este momento.</li>
          )}
        </ul>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Ventas por Producto</h2>
        {reportData.salesByProduct.length === 0 ? (
          <p className="text-gray-500">No hay datos de ventas por producto.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ganancia</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.salesByProduct.map(item => (
                  <tr key={item.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">${item.revenue.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">${item.cogs.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-semibold">${(item.revenue - item.cogs).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Ventas por Tienda</h2>
        {reportData.salesByStore.length === 0 ? (
          <p className="text-gray-500">No hay datos de ventas por tienda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tienda</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ventas Totales</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.salesByStore.map(store => (
                  <tr key={store.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">${store.totalSales.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Detalle de Gastos</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-500">No hay gastos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">${expense.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;
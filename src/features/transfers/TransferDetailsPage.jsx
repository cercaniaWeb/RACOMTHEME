import React, { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

// Main Component
const TransferDetailsPage = ({ transferId, onBack }) => {
  const { transfers, stores, users, currentUser, approveTransfer } = useAppStore();
  const transfer = transfers.find(t => t.id === transferId);

  const getStoreName = (storeId) => stores.find(s => s.id === storeId)?.name || storeId;
  const getUserName = (userId) => users.find(u => u.uid === userId)?.name || userId;

  if (!transfer) {
    return <div>Error: Transfer not found. <Button onClick={onBack}>Back</Button></div>;
  }

  const renderActionBox = () => {
    if (transfer.status === 'solicitado' && (currentUser.role === 'admin' || currentUser.role === 'gerente')) {
      return <ApproveAction transfer={transfer} approveTransfer={approveTransfer} />;
    }
    if (transfer.status === 'aprobado' && currentUser.role === 'bodeguero' && currentUser.storeId === transfer.originLocationId) {
        return <ShipAction transfer={transfer} />;
    }
    if (transfer.status === 'enviado' && (currentUser.role === 'cashier' || currentUser.role === 'gerente') && currentUser.storeId === transfer.destinationLocationId) {
        return <ReceiveAction transfer={transfer} />;
    }
    return <p className="text-gray-500 dark:text-gray-400">No hay acciones disponibles para ti en este momento.</p>;
  };

  return (
    <div className="p-4 space-y-6 dark:text-white">
      <div>
        <Button onClick={onBack}>&larr; Volver a la lista</Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Traslado #{transfer.id.slice(-6)}</h1>
          <p className="text-gray-500 dark:text-gray-400">De: <span className="font-medium text-gray-700 dark:text-gray-300">{getStoreName(transfer.originLocationId)}</span></p>
          <p className="text-gray-500 dark:text-gray-400">A: <span className="font-medium text-gray-700 dark:text-gray-300">{getStoreName(transfer.destinationLocationId)}</span></p>
        </div>
        <div className="text-right">
            <p className="text-lg font-semibold dark:text-white">Estado Actual:</p>
            <span className={`px-3 py-1 text-base font-semibold rounded-full ${ 
                transfer.status === 'solicitado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' :
                transfer.status === 'aprobado' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200' :
                transfer.status === 'enviado' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
                'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
            }`}>
                {transfer.status}
            </span>
        </div>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Productos</h2>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Producto</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Solicitado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Enviado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase dark:text-gray-300">Recibido</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {transfer.items.map(item => (
              <tr key={item.productId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.productName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 font-bold dark:text-gray-300">{item.requestedQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">{item.sentQuantity || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">{item.receivedQuantity || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Historial de la Orden</h2>
        <ul className="space-y-2">
            {transfer.history.map((event, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-bold dark:text-white">{new Date(event.date).toLocaleString()}:</span> 
                    Estado cambiado a <span className="font-semibold dark:text-white">{event.status}</span> por {getUserName(event.userId)}.
                </li>
            ))}
        </ul>
      </Card>

      <div className="p-4 border-t bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Acciones Disponibles</h2>
        {renderActionBox()}
      </div>

    </div>
  );
};


const ApproveAction = ({ transfer, approveTransfer }) => (
  <div className="dark:text-white">
    <p className="mb-4 text-gray-700 dark:text-gray-300">Como Gerente/Admin, puedes aprobar esta solicitud para que sea preparada en bodega.</p>
    <Button onClick={() => approveTransfer(transfer.id)} className="bg-green-600 text-white hover:bg-green-700">
      Aprobar Solicitud
    </Button>
  </div>
);

const ShipAction = ({ transfer }) => {
  const { shipTransfer } = useAppStore();
  const [sentItems, setSentItems] = useState(transfer.items.map(i => ({ ...i, sentQuantity: i.requestedQuantity })));

  const handleQuantityChange = (productId, value) => {
    setSentItems(sentItems.map(i => i.productId === productId ? { ...i, sentQuantity: parseInt(value, 10) || 0 } : i));
  };

  const handleSubmit = () => {
    shipTransfer(transfer.id, sentItems);
  };

  return (
    <div className="space-y-4 dark:text-white">
      <p className="text-gray-700 dark:text-gray-300">Confirma las cantidades que estás enviando desde bodega.</p>
      {sentItems.map(item => (
        <div key={item.productId} className="flex justify-between items-center">
          <span className="font-medium dark:text-white">{item.productName}</span>
          <Input type="number" value={item.sentQuantity} onChange={e => handleQuantityChange(item.productId, e.target.value)} className="w-24" />
        </div>
      ))}
      <Button onClick={handleSubmit} className="bg-yellow-600 text-white hover:bg-yellow-700">Confirmar Envío</Button>
    </div>
  );
};

const ReceiveAction = ({ transfer }) => {
    const { receiveTransfer } = useAppStore();
    const [receivedItems, setReceivedItems] = useState(transfer.items.map(i => ({ ...i, receivedQuantity: i.sentQuantity || i.requestedQuantity })));

    const handleQuantityChange = (productId, value) => {
        setReceivedItems(receivedItems.map(i => i.productId === productId ? { ...i, receivedQuantity: parseInt(value, 10) || 0 } : i));
    };

    const handleSubmit = () => {
        receiveTransfer(transfer.id, receivedItems);
    };

    return (
        <div className="space-y-4 dark:text-white">
            <p className="text-gray-700 dark:text-gray-300">Confirma las cantidades que has recibido en tu tienda.</p>
            {receivedItems.map(item => (
                <div key={item.productId} className="flex justify-between items-center">
                    <span className="font-medium dark:text-white">{item.productName} (Enviado: {item.sentQuantity || 'N/A'})</span>
                    <Input type="number" value={item.receivedQuantity} onChange={e => handleQuantityChange(item.productId, e.target.value)} className="w-24" />
                </div>
            ))}
            <Button onClick={handleSubmit} className="bg-purple-600 text-white hover:bg-purple-700">Confirmar Recepción</Button>
        </div>
    );
};

export default TransferDetailsPage;

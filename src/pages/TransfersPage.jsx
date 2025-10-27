import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import TransferRequestForm from '../features/transfers/TransferRequestForm';
import TransferDetailsPage from '../features/transfers/TransferDetailsPage'; // Import the new component

const TransfersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState(null); // New state for view management
  const { transfers, stores, currentUser } = useAppStore();

  const getStoreName = (storeId) => stores.find(s => s.id === storeId)?.name || storeId;

  const transfersToSend = transfers.filter(t => t.originLocationId === currentUser.storeId);
  const transfersToReceive = transfers.filter(t => t.destinationLocationId === currentUser.storeId);

  // If a transfer is selected, show the details page
  if (selectedTransferId) {
    return <TransferDetailsPage transferId={selectedTransferId} onBack={() => setSelectedTransferId(null)} />;
  }

  // Otherwise, show the list of transfers
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Órdenes de Traslado</h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white hover:bg-indigo-700">
          Crear Solicitud de Traslado
        </Button>
      </div>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Traslados por Enviar ({transfersToSend.length})</h2>
        {transfersToSend.length === 0 ? (
          <p className="text-gray-500">No hay traslados pendientes de envío.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Creación</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfersToSend.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStoreName(order.destinationLocationId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                        order.status === 'solicitado' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'aprobado' ? 'bg-indigo-100 text-indigo-800' :
                        order.status === 'enviado' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button onClick={() => setSelectedTransferId(order.id)} className="text-indigo-600 hover:text-indigo-900">
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Traslados por Recibir ({transfersToReceive.length})</h2>
        {transfersToReceive.length === 0 ? (
          <p className="text-gray-500">No hay traslados pendientes de recepción.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Creación</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfersToReceive.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStoreName(order.originLocationId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                        order.status === 'solicitado' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'aprobado' ? 'bg-indigo-100 text-indigo-800' :
                        order.status === 'enviado' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {order.status === 'enviado' && (
                        <Button onClick={() => setSelectedTransferId(order.id)} className="text-green-600 hover:text-green-900 mr-2">
                          Recibir Traslado
                        </Button>
                      )}
                      <Button onClick={() => setSelectedTransferId(order.id)} className="text-indigo-600 hover:text-indigo-900">
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nueva Solicitud de Traslado">
        <TransferRequestForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default TransfersPage;
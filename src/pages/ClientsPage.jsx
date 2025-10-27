
import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ClientFormModal from '../features/clients/ClientFormModal';

const ClientsPage = () => {
  const { clients, deleteClient } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const handleOpenModal = (client = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleDelete = (clientId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      deleteClient(clientId);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
        <Button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white hover:bg-indigo-700">
          Añadir Nuevo Cliente
        </Button>
      </div>

      <Card>
        {clients.length === 0 ? (
          <p className="text-gray-500">No hay clientes registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crédito Pendiente</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${client.creditBalance.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button onClick={() => handleOpenModal(client)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Editar
                      </Button>
                      <Button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-900">
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient ? "Editar Cliente" : "Añadir Nuevo Cliente"}>
        <ClientFormModal client={editingClient} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default ClientsPage;

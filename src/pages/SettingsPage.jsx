
import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import useAppStore from '../store/useAppStore';
import TicketDesignModal from '../features/pos/TicketDesignModal';
import CategoryManagementModal from '../features/products/CategoryManagementModal';
import ReminderFormModal from '../features/settings/ReminderFormModal';
import { Trash } from 'lucide-react';

const SettingsPage = () => {
  const { alertSettings, ticketSettings, updateAlertSettings, updateTicketSettings, reminders, markReminderAsConcluded } = useAppStore();
  const [isTicketDesignModalOpen, setIsTicketDesignModalOpen] = useState(false);
  const [isCategoryManagementModalOpen, setIsCategoryManagementModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [commissionRate, setCommissionRate] = useState(alertSettings.cardCommissionRate * 100);
  const [appLogo, setAppLogo] = useState(ticketSettings.appLogoUrl);

  const handleSaveSettings = () => {
    updateAlertSettings({ cardCommissionRate: commissionRate / 100 });
    updateTicketSettings({ appLogoUrl: appLogo });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Configuración</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button onClick={() => setIsTicketDesignModalOpen(true)} className="px-4 py-2 border text-gray-700 font-medium hover:bg-gray-50 flex items-center space-x-2">
          <span>Editar Diseño de Ticket</span>
        </Button>
        <Button onClick={() => setIsCategoryManagementModalOpen(true)} className="px-4 py-2 border text-gray-700 font-medium hover:bg-gray-50 flex items-center space-x-2">
          <span>Gestionar Categorías</span>
        </Button>
        <Button onClick={() => setIsReminderModalOpen(true)} className="px-4 py-2 border text-gray-700 font-medium hover:bg-gray-50 flex items-center space-x-2">
          <span>Crear Recordatorio</span>
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold">Configuración General</h2>
        <div>
          <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700">Comisión por Tarjeta (%)</label>
          <Input
            id="commissionRate"
            name="commissionRate"
            type="number"
            value={commissionRate}
            onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="appLogo" className="block text-sm font-medium text-gray-700">URL del Logo de la Aplicación</label>
          <Input
            id="appLogo"
            name="appLogo"
            type="text"
            value={appLogo}
            onChange={(e) => setAppLogo(e.target.value)}
          />
        </div>
        <Button onClick={handleSaveSettings} className="bg-indigo-600 text-white hover:bg-indigo-700">
          Guardar Configuración General
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold">Recordatorios Activos</h2>
        {reminders.filter(rem => !rem.isConcluded).length === 0 ? (
          <p className="text-gray-500">No hay recordatorios activos.</p>
        ) : (
          <ul className="space-y-2">
            {reminders.filter(rem => !rem.isConcluded).map(rem => (
              <li key={rem.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <div>
                  <p className="font-medium">{rem.title} (Vence: {new Date(rem.dueDate).toLocaleDateString()})</p>
                  <p className="text-sm text-gray-600">{rem.description}</p>
                </div>
                <Button onClick={() => markReminderAsConcluded(rem.id)} className="text-green-600 hover:text-green-900">
                  Marcar como Concluido
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal isOpen={isTicketDesignModalOpen} onClose={() => setIsTicketDesignModalOpen(false)} title="Editar Diseño de Ticket">
        <TicketDesignModal onClose={() => setIsTicketDesignModalOpen(false)} />
      </Modal>

      <Modal isOpen={isCategoryManagementModalOpen} onClose={() => setIsCategoryManagementModalOpen(false)} title="Gestionar Categorías">
        <CategoryManagementModal onClose={() => setIsCategoryManagementModalOpen(false)} />
      </Modal>

      <Modal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} title="Crear Nuevo Recordatorio">
        <ReminderFormModal onClose={() => setIsReminderModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default SettingsPage;

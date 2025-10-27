import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const TicketDesignModal = ({ onClose }) => {
  const { ticketSettings, updateTicketSettings } = useAppStore();
  const [formData, setFormData] = useState(ticketSettings);

  useEffect(() => {
    setFormData(ticketSettings);
  }, [ticketSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateTicketSettings(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="headerText" className="block text-sm font-medium text-gray-700">Texto de Encabezado</label>
        <Input
          id="headerText"
          name="headerText"
          type="text"
          value={formData.headerText}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="footerText" className="block text-sm font-medium text-gray-700">Texto de Pie de Página</label>
        <Input
          id="footerText"
          name="footerText"
          type="text"
          value={formData.footerText}
          onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">URL del Logo</label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  type="text"
                  value={formData.logoUrl}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center">
        <Input
          id="showQrCode"
          name="showQrCode"
          type="checkbox"
          checked={formData.showQrCode}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="showQrCode" className="ml-2 block text-sm text-gray-900">Mostrar Código QR</label>
      </div>
      <div>
        <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700">Tamaño de Fuente</label>
        <select
          id="fontSize"
          name="fontSize"
          value={formData.fontSize}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="sm">Pequeño</option>
          <option value="base">Normal</option>
          <option value="lg">Grande</option>
        </select>
      </div>
      <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
        Guardar Diseño
      </Button>
    </form>
  );
};

export default TicketDesignModal;

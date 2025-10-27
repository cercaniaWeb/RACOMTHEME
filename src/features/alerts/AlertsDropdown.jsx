import React from 'react';
import useAppStore from '../../store/useAppStore';
import { XCircle, CheckCircle } from 'lucide-react';

const AlertsDropdown = ({ alerts }) => {
  const { markAlertAsRead, addToShoppingList, reminders, markReminderAsConcluded } = useAppStore();

  const unreadAlerts = alerts.filter(a => !a.isRead);
  const activeReminders = reminders.filter(rem => !rem.isConcluded);
  const readAlerts = alerts.filter(a => a.isRead);

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-gray-800">Notificaciones</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {unreadAlerts.length === 0 && activeReminders.length === 0 && readAlerts.length === 0 && (
            <p className="text-center text-gray-500 p-4">No hay notificaciones ni recordatorios.</p>
        )}
        {activeReminders.length > 0 && (
            <div className="p-2">
                <h4 className="text-xs font-bold text-blue-500 uppercase px-2 mb-1">Recordatorios</h4>
                {activeReminders.map(rem => (
                    <div key={rem.id} className="flex items-start p-2 rounded-lg hover:bg-blue-100">
                        <div className="flex-grow">
                            <p className="text-sm font-medium text-blue-700">{rem.title}</p>
                            <p className="text-xs text-blue-600">{rem.description} (Vence: {new Date(rem.dueDate).toLocaleDateString()})</p>
                        </div>
                        <button onClick={() => markReminderAsConcluded(rem.id)} className="ml-2 text-green-500 hover:text-green-700">
                            <CheckCircle size={16} />
                        </button>
                    </div>
                ))}
            </div>
        )}
        {unreadAlerts.length > 0 && (
            <div className="p-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase px-2 mb-1">Nuevas Alertas</h4>
                {unreadAlerts.map(alert => (
                    <div key={alert.id} className="flex items-start p-2 rounded-lg hover:bg-gray-100">
                        <div className={`mr-3 mt-1 flex-shrink-0 h-2 w-2 rounded-full ${alert.type === 'Stock Bajo' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                        <div className="flex-grow">
                            <p className="text-sm text-gray-700">{alert.message}</p>
                        </div>
                        <button onClick={() => markAlertAsRead(alert.id)} className="ml-2 text-gray-400 hover:text-gray-600">
                            <XCircle size={16} />
                        </button>
                        {alert.type === 'Stock Bajo' && (
                          <button 
                            onClick={() => addToShoppingList({ id: alert.id, name: alert.message.split(' en ')[0].replace('Quedan ', ''), quantity: 1, purchased: false, price: 0 })}
                            className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
                          >
                            Añadir a Lista
                          </button>
                        )}
                    </div>
                ))}
            </div>
        )}
        {readAlerts.length > 0 && (
            <div className="p-2 border-t">
                <h4 className="text-xs font-bold text-gray-400 uppercase px-2 mb-1">Alertas Leídas</h4>
                {readAlerts.map(alert => (
                    <div key={alert.id} className="flex items-start p-2">
                        <div className="flex-grow">
                            <p className="text-sm text-gray-500 opacity-70">{alert.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default AlertsDropdown;

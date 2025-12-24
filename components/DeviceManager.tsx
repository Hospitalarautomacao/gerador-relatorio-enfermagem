
import React from 'react';
import { Device } from '../types';

interface DeviceManagerProps {
  devices: Device[];
  onUpdate: (devices: Device[]) => void;
  onAdd: () => void;
}

const DeviceManager: React.FC<DeviceManagerProps> = ({ devices, onUpdate, onAdd }) => {
  const handleRemoveDevice = (id: string) => {
    onUpdate(devices.filter(dev => dev.id !== id));
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
        <i className="fas fa-syringe mr-2 text-cyan-600"></i>
        Dispositivos em Uso (OPME)
      </h2>
      <div className="space-y-3">
        {devices.length > 0 ? devices.map(device => (
            <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50 hover:bg-slate-100 transition-colors">
                <div>
                    <p className="font-bold text-slate-800">{device.name || 'Dispositivo não especificado'}</p>
                    <p className="text-sm text-slate-600">{device.details || 'Sem detalhes'}</p>
                </div>
                <button
                  onClick={() => handleRemoveDevice(device.id)}
                  className="bg-red-100 text-red-600 hover:bg-red-200 font-bold py-2 px-3 rounded-md flex items-center justify-center transition-colors"
                  aria-label={`Remover ${device.name || 'dispositivo'}`}
                >
                  <i className="fas fa-trash"></i>
                </button>
            </div>
        )) : (
            <p className="text-center text-slate-500 py-4">Nenhum dispositivo adicionado.</p>
        )}
      </div>
      <button
        onClick={onAdd}
        className="mt-4 flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700"
      >
        <i className="fas fa-plus"></i>
        Adicionar Dispositivo
      </button>
    </div>
  );
};

export default DeviceManager;
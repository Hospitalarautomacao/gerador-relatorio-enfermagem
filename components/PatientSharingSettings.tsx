
import React, { useState } from 'react';
import { PatientSharingSettings } from '../types';
import Checkbox from './ui/Checkbox';

const PatientSharingSettings: React.FC = () => {
  const [settings, setSettings] = useState<PatientSharingSettings>({
    shareVitals: true,
    shareMedications: false,
    shareGeneralState: true,
    shareNotes: false,
    realtimeUpdates: true,
  });

  const handleChange = (field: keyof PatientSharingSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <div className="flex items-center gap-3 mb-4 border-b pb-2">
        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
          <i className="fas fa-mobile-screen-button text-xl"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Configuração do App Família</h2>
          <p className="text-sm text-slate-500">Controle quais dados são visíveis em tempo real para os familiares.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-3">Dados Compartilhados</h3>
          <div className="space-y-3">
            <Checkbox 
              label="Sinais Vitais (PA, Temp, Sat)" 
              description="Exibe gráficos de evolução simplificados."
              checked={settings.shareVitals} 
              onChange={v => handleChange('shareVitals', v)} 
            />
            <Checkbox 
              label="Estado Geral e Consciência" 
              description="Resumo do quadro clínico (Estável, Alerta, etc)."
              checked={settings.shareGeneralState} 
              onChange={v => handleChange('shareGeneralState', v)} 
            />
            <Checkbox 
              label="Medicações Administradas" 
              description="Mostra horário das medicações (sem dosagens complexas)."
              checked={settings.shareMedications} 
              onChange={v => handleChange('shareMedications', v)} 
            />
            <Checkbox 
              label="Anotações de Enfermagem" 
              description="Compartilha o campo de observações livres (Cuidado!)."
              checked={settings.shareNotes} 
              onChange={v => handleChange('shareNotes', v)} 
            />
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <h3 className="font-bold text-indigo-800 mb-3">Sincronização</h3>
          <div className="space-y-4">
            <Checkbox 
              label="Atualização em Tempo Real" 
              description="Envia dados via Push Notification assim que salvos."
              checked={settings.realtimeUpdates} 
              onChange={v => handleChange('realtimeUpdates', v)} 
            />
            
            <div className="p-3 bg-white rounded border border-indigo-200 mt-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Link de Acesso Seguro</p>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value="https://paciente.app/v/7f8a9d" 
                  className="flex-1 bg-slate-100 border-none text-sm text-slate-600 p-1 rounded"
                />
                <button className="text-indigo-600 hover:text-indigo-800 font-bold text-sm">
                  <i className="fas fa-copy"></i>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Válido por 24h. Requer CPF do responsável para acesso.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSharingSettings;

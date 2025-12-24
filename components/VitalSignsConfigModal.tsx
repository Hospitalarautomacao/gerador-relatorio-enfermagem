
import React, { useState } from 'react';
import Modal from './Modal';
import { VitalAlertSettings } from '../types';
import InputField from './ui/InputField';
import Checkbox from './ui/Checkbox';

interface VitalSignsConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSettings?: VitalAlertSettings;
    onSave: (settings: VitalAlertSettings) => void;
}

const defaultSettings: VitalAlertSettings = {
    monitoringInterval: 4,
    autoCreateIntercorrencia: true,
    audioAlerts: true,
    limits: {
        sysBpHigh: 140,
        sysBpLow: 90,
        diaBpHigh: 90,
        diaBpLow: 60,
        hrHigh: 100,
        hrLow: 60,
        tempHigh: 37.8,
        tempLow: 35,
        satLow: 90,
        glycemiaHigh: 200,
        glycemiaLow: 70
    }
};

const VitalSignsConfigModal: React.FC<VitalSignsConfigModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
    const [settings, setSettings] = useState<VitalAlertSettings>(currentSettings || defaultSettings);

    const handleLimitChange = (field: keyof VitalAlertSettings['limits'], value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setSettings(prev => ({
                ...prev,
                limits: { ...prev.limits, [field]: numValue }
            }));
        }
    };

    const handleSettingChange = (field: keyof Omit<VitalAlertSettings, 'limits'>, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Configurar Monitoramento & Alertas"
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 font-semibold rounded-lg">Cancelar</button>
                    <button onClick={() => { onSave(settings); onClose(); }} className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg shadow">Salvar Configuração</button>
                </>
            }
        >
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* General Settings */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-700 mb-3"><i className="fas fa-cog mr-2"></i> Geral</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Frequência de Monitoramento (horas)</label>
                            <div className="flex gap-2">
                                {[1, 2, 4, 6, 12].map(h => (
                                    <button
                                        key={h}
                                        onClick={() => handleSettingChange('monitoringInterval', h)}
                                        className={`px-3 py-1 text-sm rounded border ${settings.monitoringInterval === h ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-600 border-slate-300'}`}
                                    >
                                        {h}h
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Checkbox 
                            label="Gerar Intercorrência Automática" 
                            description="Criar evento crítico se valores ultrapassarem limites."
                            checked={settings.autoCreateIntercorrencia} 
                            onChange={v => handleSettingChange('autoCreateIntercorrencia', v)}
                        />
                        <Checkbox 
                            label="Alertas Sonoros" 
                            description="Tocar som de alerta em valores críticos."
                            checked={settings.audioAlerts} 
                            onChange={v => handleSettingChange('audioAlerts', v)}
                        />
                    </div>
                </div>

                {/* Limits */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-bold text-red-800 mb-3"><i className="fas fa-sliders mr-2"></i> Limites Críticos Personalizados</h4>
                    <p className="text-xs text-red-600 mb-4">Defina os valores que disparam alertas vermelhos para este paciente.</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Pressão Sistólica (Máx)</label>
                            <input type="number" value={settings.limits.sysBpHigh} onChange={e => handleLimitChange('sysBpHigh', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Pressão Sistólica (Mín)</label>
                            <input type="number" value={settings.limits.sysBpLow} onChange={e => handleLimitChange('sysBpLow', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Freq. Cardíaca (Máx)</label>
                            <input type="number" value={settings.limits.hrHigh} onChange={e => handleLimitChange('hrHigh', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Freq. Cardíaca (Mín)</label>
                            <input type="number" value={settings.limits.hrLow} onChange={e => handleLimitChange('hrLow', e.target.value)} className="w-full p-2 border rounded" />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Saturação (Mín)</label>
                            <input type="number" value={settings.limits.satLow} onChange={e => handleLimitChange('satLow', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Temperatura (Máx)</label>
                            <input type="number" value={settings.limits.tempHigh} onChange={e => handleLimitChange('tempHigh', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Glicemia (Máx)</label>
                            <input type="number" value={settings.limits.glycemiaHigh} onChange={e => handleLimitChange('glycemiaHigh', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Glicemia (Mín)</label>
                            <input type="number" value={settings.limits.glycemiaLow} onChange={e => handleLimitChange('glycemiaLow', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default VitalSignsConfigModal;

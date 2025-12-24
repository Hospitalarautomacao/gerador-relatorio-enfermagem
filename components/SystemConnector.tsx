
import React, { useState, useEffect } from 'react';
import { IntegrationConfig } from '../types';
import Modal from './Modal';
import InputField from './ui/InputField';

interface SystemConnectorProps {
    integrations: IntegrationConfig[];
    onSave: (config: IntegrationConfig) => void;
    onDelete: (id: string) => void;
}

const eventOptions = [
    { value: 'report.created', label: 'Relatório Criado' },
    { value: 'report.updated', label: 'Relatório Atualizado' },
    { value: 'stock.low', label: 'Alerta de Estoque Baixo' },
    { value: 'alert.critical', label: 'Alerta Crítico (Sinais Vitais)' }
];

const IntegrationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: IntegrationConfig) => void;
    config: IntegrationConfig | null;
}> = ({ isOpen, onClose, onSave, config }) => {
    const [formData, setFormData] = useState<IntegrationConfig>({
        id: '',
        name: '',
        type: 'webhook',
        url: '',
        token: '',
        events: [],
        status: 'active'
    });

    useEffect(() => {
        if (config) {
            setFormData(config);
        } else {
            setFormData({
                id: '',
                name: '',
                type: 'webhook',
                url: '',
                token: '',
                events: [],
                status: 'active'
            });
        }
    }, [config, isOpen]);

    const handleChange = (field: keyof IntegrationConfig, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleEventToggle = (event: string) => {
        setFormData(prev => {
            const currentEvents = prev.events || [];
            if (currentEvents.includes(event)) {
                return { ...prev, events: currentEvents.filter(e => e !== event) };
            } else {
                return { ...prev, events: [...currentEvents, event] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: formData.id || Date.now().toString()
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={config ? "Editar Integração" : "Nova Integração"}
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700">Salvar</button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField 
                    id="intName" 
                    label="Nome da Integração" 
                    value={formData.name} 
                    onChange={e => handleChange('name', e.target.value)} 
                    placeholder="Ex: ERP Hospitalar" 
                    required 
                />
                
                <div>
                    <label htmlFor="intType" className="block text-sm font-medium text-slate-600 mb-1">Tipo</label>
                    <select 
                        id="intType" 
                        value={formData.type} 
                        onChange={e => handleChange('type', e.target.value)} 
                        className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="webhook">Webhook (JSON)</option>
                        <option value="api">API REST</option>
                        <option value="zapier">Zapier / Make</option>
                    </select>
                </div>

                <InputField 
                    id="intUrl" 
                    label="Endpoint URL" 
                    value={formData.url} 
                    onChange={e => handleChange('url', e.target.value)} 
                    placeholder="https://api.sistema.com.br/v1/hook" 
                    required 
                />

                <InputField 
                    id="intToken" 
                    label="Token de Autenticação / Chave de API" 
                    value={formData.token || ''} 
                    onChange={e => handleChange('token', e.target.value)} 
                    placeholder="(Opcional)"
                    type="password"
                />

                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Eventos Gatilho</label>
                    <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        {eventOptions.map(opt => (
                            <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={formData.events.includes(opt.value)} 
                                    onChange={() => handleEventToggle(opt.value)}
                                    className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                />
                                <span className="text-sm text-slate-700">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <label className="flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.status === 'active'} 
                            onChange={e => handleChange('status', e.target.checked ? 'active' : 'inactive')}
                            className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        <span className="ms-3 text-sm font-medium text-gray-900">Integração Ativa</span>
                    </label>
                </div>
            </form>
        </Modal>
    );
};

const SystemConnector: React.FC<SystemConnectorProps> = ({ integrations, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<IntegrationConfig | null>(null);

    const handleOpenModal = (config: IntegrationConfig | null = null) => {
        setEditingConfig(config);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingConfig(null);
        setIsModalOpen(false);
    };

    const handleSave = (config: IntegrationConfig) => {
        onSave(config);
        handleCloseModal();
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'webhook': return 'fa-globe';
            case 'api': return 'fa-server';
            case 'zapier': return 'fa-bolt';
            default: return 'fa-link';
        }
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow min-h-[600px]">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        <i className="fas fa-network-wired mr-3 text-cyan-600"></i>
                        Conectores de Sistema
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Gerencie integrações externas, webhooks e APIs para troca de dados.
                    </p>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700 flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i>
                    Nova Conexão
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.length > 0 ? integrations.map(int => (
                    <div key={int.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow relative bg-slate-50">
                        <div className="absolute top-4 right-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${int.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                                <span className={`w-2 h-2 mr-1 rounded-full ${int.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                                {int.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-cyan-600 text-xl shadow-sm">
                                <i className={`fas ${getTypeIcon(int.type)}`}></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{int.name}</h3>
                                <p className="text-xs text-slate-500 uppercase font-semibold">{int.type}</p>
                            </div>
                        </div>

                        <div className="text-xs text-slate-600 mb-4 font-mono bg-white p-2 rounded border border-slate-100 truncate">
                            {int.url}
                        </div>

                        <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-500 mb-1">Eventos:</p>
                            <div className="flex flex-wrap gap-1">
                                {int.events.length > 0 ? int.events.map(ev => (
                                    <span key={ev} className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]">
                                        {ev}
                                    </span>
                                )) : <span className="text-xs text-slate-400 italic">Nenhum evento selecionado</span>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                            <div className="text-xs text-slate-400">
                                <i className="fas fa-sync-alt mr-1"></i> Sync: Nunca
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(int)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors" title="Editar">
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button onClick={() => onDelete(int.id)} className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors" title="Excluir">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
                        <i className="fas fa-plug text-4xl mb-4"></i>
                        <p className="font-medium">Nenhuma integração configurada.</p>
                        <p className="text-sm">Adicione um webhook ou API para sincronizar dados.</p>
                    </div>
                )}
            </div>

            <IntegrationModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                config={editingConfig}
            />
        </div>
    );
};

export default SystemConnector;

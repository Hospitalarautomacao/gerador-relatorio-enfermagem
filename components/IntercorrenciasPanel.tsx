
import React, { useState, useEffect } from 'react';
import { Intercorrencia } from '../types';
import { getIntercorrenciasHistorico, createIntercorrencia, updateIntercorrencia, subscribeToIntercorrencias } from '../services/databaseService';
import InputField from './ui/InputField';
import Modal from './Modal';

interface IntercorrenciasPanelProps {
    patientName: string;
    professionalName: string;
}

const IntercorrenciasPanel: React.FC<IntercorrenciasPanelProps> = ({ patientName, professionalName }) => {
    const [intercorrencias, setIntercorrencias] = useState<Intercorrencia[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<'Todas' | 'Aberta' | 'Finalizado'>('Todas');
    
    // Form State
    const [formData, setFormData] = useState<Partial<Intercorrencia>>({
        motivo: '',
        descricao: '',
        conduta_realizada: '',
        acompanhamento: 'Enfermagem'
    });

    useEffect(() => {
        loadData();
        
        // Setup Realtime Subscription
        const subscription = subscribeToIntercorrencias((payload) => {
            if (payload.eventType === 'INSERT') {
                setIntercorrencias(prev => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
                setIntercorrencias(prev => prev.map(i => i.id === payload.new.id ? payload.new : i));
            }
        }, patientName);

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [patientName]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getIntercorrenciasHistorico(patientName);
            setIntercorrencias(data);
        } catch (error) {
            console.error("Erro ao carregar intercorrências:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.motivo || !formData.descricao) return;

        try {
            const newIntercorrencia: Intercorrencia = {
                id: Date.now().toString(),
                paciente_id: patientName || 'Desconhecido',
                profissional_id: professionalName || 'Enfermagem',
                data: new Date().toISOString(),
                data_criacao: new Date().toISOString(),
                data_atualizacao: new Date().toISOString(),
                status: 'Aberta',
                motivo: formData.motivo!,
                descricao: formData.descricao!,
                conduta_realizada: formData.conduta_realizada || '',
                acompanhamento: formData.acompanhamento as any || 'Enfermagem'
            };

            await createIntercorrencia(newIntercorrencia);
            // Optimistic update for local DB (realtime handles Supabase)
            setIntercorrencias(prev => [newIntercorrencia, ...prev]);
            
            setIsModalOpen(false);
            setFormData({ motivo: '', descricao: '', conduta_realizada: '', acompanhamento: 'Enfermagem' });
        } catch (error) {
            alert("Erro ao criar intercorrência");
        }
    };

    const handleResolve = async (id: string) => {
        if (window.confirm("Deseja finalizar esta intercorrência?")) {
            try {
                await updateIntercorrencia(id, { status: 'Finalizado' });
                // Optimistic update
                setIntercorrencias(prev => prev.map(i => i.id === id ? { ...i, status: 'Finalizado' } : i));
            } catch (error) {
                alert("Erro ao finalizar intercorrência");
            }
        }
    };

    const filteredList = intercorrencias.filter(i => filter === 'Todas' || i.status === filter);

    return (
        <div className="bg-white p-5 rounded-xl shadow h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle text-red-500"></i>
                        Intercorrências
                    </h2>
                    <p className="text-sm text-slate-500">Gestão de eventos críticos em tempo real.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md flex items-center gap-2"
                >
                    <i className="fas fa-plus-circle"></i>
                    Nova Intercorrência
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
                {['Todas', 'Aberta', 'Finalizado'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-3 py-1 text-sm rounded-full font-medium transition-colors ${
                            filter === f 
                            ? 'bg-slate-800 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {loading ? (
                    <div className="text-center py-10"><i className="fas fa-spinner fa-spin text-2xl text-slate-400"></i></div>
                ) : filteredList.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                        <i className="fas fa-check-circle text-4xl mb-2 text-green-100"></i>
                        <p>Nenhuma intercorrência encontrada.</p>
                    </div>
                ) : (
                    filteredList.map(item => (
                        <div key={item.id} className={`p-4 rounded-lg border-l-4 shadow-sm transition-all ${
                            item.status === 'Aberta' 
                            ? 'bg-red-50 border-red-500' 
                            : 'bg-slate-50 border-green-500 opacity-75'
                        }`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                                        item.status === 'Aberta' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                    <h3 className="font-bold text-slate-800 mt-1 text-lg">{item.motivo}</h3>
                                </div>
                                <span className="text-xs text-slate-500 font-mono">
                                    {new Date(item.data).toLocaleString('pt-BR')}
                                </span>
                            </div>
                            
                            <p className="text-sm text-slate-700 mb-2">{item.descricao}</p>
                            
                            {item.conduta_realizada && (
                                <div className="mt-2 p-2 bg-white/50 rounded border border-slate-200">
                                    <p className="text-xs font-bold text-slate-600">Conduta:</p>
                                    <p className="text-sm text-slate-800">{item.conduta_realizada}</p>
                                </div>
                            )}

                            <div className="mt-3 flex justify-between items-center border-t pt-2 border-slate-200/50">
                                <div className="text-xs text-slate-500 flex gap-3">
                                    <span><i className="fas fa-user-nurse mr-1"></i> {item.profissional_id}</span>
                                    <span><i className="fas fa-tags mr-1"></i> {item.acompanhamento}</span>
                                </div>
                                {item.status === 'Aberta' && (
                                    <button 
                                        onClick={() => handleResolve(item.id)}
                                        className="text-xs font-bold text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                                    >
                                        <i className="fas fa-check mr-1"></i> Finalizar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registrar Intercorrência"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 font-semibold rounded-lg">Cancelar</button>
                        <button onClick={handleCreate} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700">Registrar</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <InputField 
                        id="motivo" 
                        label="Motivo Principal" 
                        value={formData.motivo || ''} 
                        onChange={e => setFormData({...formData, motivo: e.target.value})}
                        placeholder="Ex: Queda da própria altura, Pico Hipertensivo..."
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Descrição do Evento</label>
                        <textarea 
                            className="w-full p-2 border rounded-md" 
                            rows={3}
                            value={formData.descricao || ''}
                            onChange={e => setFormData({...formData, descricao: e.target.value})}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Conduta Imediata</label>
                        <textarea 
                            className="w-full p-2 border rounded-md" 
                            rows={2}
                            value={formData.conduta_realizada || ''}
                            onChange={e => setFormData({...formData, conduta_realizada: e.target.value})}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Necessita Acompanhamento</label>
                        <select 
                            className="w-full p-2 border rounded-md"
                            value={formData.acompanhamento}
                            onChange={e => setFormData({...formData, acompanhamento: e.target.value as any})}
                        >
                            <option>Enfermagem</option>
                            <option>Médico</option>
                            <option>Fisioterapia</option>
                            <option>Nutrição</option>
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default IntercorrenciasPanel;

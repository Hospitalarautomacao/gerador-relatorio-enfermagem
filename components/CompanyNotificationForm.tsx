import React, { useState, useEffect } from 'react';
import { CompanyNotification } from '../types';
import Modal from './Modal';
import InputField from './ui/InputField';

interface CompanyNotificationFormProps {
  patientName: string;
  professionalName: string;
}

const initialState: CompanyNotification = {
  protocolo: "REV06_COMMUNICATION",
  versao: "1.0",
  metadata: {
    timestamp: "",
    origem: {
      sistema: "Gerador de Relatório de Enfermagem com IA",
      setor: "Enfermagem",
      agente: "",
    },
  },
  evento: {
    tipo: "",
    prioridade: "media",
    titulo: "",
    descricao: "",
  },
  solicitacao: {
    tipo_resposta_esperada: "",
    prazo: "",
    pergunta_especifica: "",
  },
  flags: {
    requer_resposta: true,
  },
};

const testTemplate = {
  de: "GESTOR ORGANOGRAMA 1",
  setor: "Teste",
  tipo: "alerta",
  prioridade: "media",
  titulo: "Teste de Integração - Fase 1",
  mensagem: "Este é um teste de comunicação entre GESTOR ORGANOGRAMA 1 e Abacus.AI. Sistema está online e pronto para receber orientações.",
  preciso: "orientacao",
  prazo: "imediato",
};

const CompanyNotificationForm: React.FC<CompanyNotificationFormProps> = ({ patientName, professionalName }) => {
    const [formData, setFormData] = useState<CompanyNotification>(initialState);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [finalJson, setFinalJson] = useState('');

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                origem: {
                    ...prev.metadata.origem,
                    agente: professionalName || ''
                }
            }
        }));
    }, [professionalName]);

    const handleChange = (section: keyof Omit<CompanyNotification, 'flags'>, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value,
            }
        }));
    };
    
    const handleFlagChange = (field: keyof CompanyNotification['flags'], value: boolean) => {
        setFormData(prev => ({
            ...prev,
            flags: {
                ...prev.flags,
                [field]: value
            }
        }));
    };

    const handleLoadTemplate = () => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                origem: {
                    ...prev.metadata.origem,
                    agente: testTemplate.de,
                    setor: testTemplate.setor,
                }
            },
            evento: {
                ...prev.evento,
                tipo: testTemplate.tipo as any,
                prioridade: testTemplate.prioridade as any,
                titulo: testTemplate.titulo,
                descricao: testTemplate.mensagem,
            },
            solicitacao: {
                ...prev.solicitacao,
                tipo_resposta_esperada: testTemplate.preciso as any,
                prazo: testTemplate.prazo as any,
                pergunta_especifica: "", // O template não especifica uma pergunta
            },
            flags: {
                ...prev.flags,
                requer_resposta: true,
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalPayload: Partial<CompanyNotification> = {
            ...formData,
            metadata: {
                ...formData.metadata,
                timestamp: new Date().toISOString(),
                origem: {
                    ...formData.metadata.origem,
                    agente: formData.metadata.origem.agente || professionalName,
                }
            }
        };

        // If not a 'solicitacao', remove the solicitation part from the final JSON
        if (finalPayload.evento.tipo !== 'solicitacao') {
            delete (finalPayload as any).solicitacao;
        }

        setFinalJson(JSON.stringify(finalPayload, null, 2));
        setIsConfirmModalOpen(true);
    };

    const handleConfirmSend = () => {
        // Simulating send
        alert("Comunicação enviada (simulação).");
        setIsConfirmModalOpen(false);
        setFormData(initialState);
    };

    return (
      <>
        <div className="bg-white p-5 rounded-xl shadow max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        <i className="fas fa-paper-plane mr-2 text-cyan-600"></i>
                        Protocolo de Comunicação
                    </h2>
                    <p className="text-sm text-slate-500">
                        Envie comunicações estruturadas para a administração ou outros sistemas.
                    </p>
                </div>
                 <button onClick={handleLoadTemplate} className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-800 font-semibold rounded-md hover:bg-indigo-200 transition-colors">
                    <i className="fas fa-vial mr-1"></i>
                    Carregar Exemplo de Teste
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                    <InputField 
                        id="titulo" 
                        label="Título do Evento"
                        value={formData.evento.titulo}
                        onChange={e => handleChange('evento', 'titulo', e.target.value)}
                        placeholder="Ex: Paciente com pico hipertensivo"
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="tipo" className="block text-sm font-medium text-slate-600 mb-1">Tipo de Evento</label>
                            <select id="tipo" value={formData.evento.tipo} onChange={e => handleChange('evento', 'tipo', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md" required>
                                <option value="">Selecione...</option>
                                <option value="alerta">Alerta</option>
                                <option value="solicitacao">Solicitação</option>
                                <option value="relatorio">Relatório</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="prioridade" className="block text-sm font-medium text-slate-600 mb-1">Prioridade</label>
                            <select id="prioridade" value={formData.evento.prioridade} onChange={e => handleChange('evento', 'prioridade', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md" required>
                                <option value="baixa">Baixa</option>
                                <option value="media">Média</option>
                                <option value="alta">Alta</option>
                                <option value="critica">Crítica</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="descricao" className="block text-sm font-medium text-slate-600 mb-1">Descrição Detalhada</label>
                        <textarea id="descricao" value={formData.evento.descricao} onChange={e => handleChange('evento', 'descricao', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg" rows={4} required placeholder="Descreva a situação, o que foi feito e o que é necessário."></textarea>
                    </div>
                </div>

                {formData.evento.tipo === 'solicitacao' && (
                    <div className="p-4 border border-cyan-200 rounded-lg bg-cyan-50 space-y-4 animate-fade-in">
                        <h3 className="font-semibold text-cyan-800">Detalhes da Solicitação</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="tipo_resposta_esperada" className="block text-sm font-medium text-slate-600 mb-1">Resposta Esperada</label>
                                <select id="tipo_resposta_esperada" value={formData.solicitacao.tipo_resposta_esperada} onChange={e => handleChange('solicitacao', 'tipo_resposta_esperada', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md">
                                    <option value="">Selecione...</option>
                                    <option value="orientacao">Orientação</option>
                                    <option value="analise">Análise</option>
                                    <option value="acao">Ação</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="prazo" className="block text-sm font-medium text-slate-600 mb-1">Prazo</label>
                                <select id="prazo" value={formData.solicitacao.prazo} onChange={e => handleChange('solicitacao', 'prazo', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md">
                                    <option value="">Selecione...</option>
                                    <option value="imediato">Imediato</option>
                                    <option value="24h">24 horas</option>
                                    <option value="48h">48 horas</option>
                                </select>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="pergunta_especifica" className="block text-sm font-medium text-slate-600 mb-1">Pergunta Específica (Opcional)</label>
                            <input id="pergunta_especifica" type="text" value={formData.solicitacao.pergunta_especifica} onChange={e => handleChange('solicitacao', 'pergunta_especifica', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md" placeholder="Ex: Qual a conduta para este caso?"/>
                        </div>
                    </div>
                )}
                
                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="requer_resposta" checked={formData.flags.requer_resposta} onChange={e => handleFlagChange('requer_resposta', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-cyan-600" />
                    <label htmlFor="requer_resposta" className="text-sm font-medium text-slate-700">Requer Resposta</label>
                </div>

                <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-sm hover:bg-cyan-700 disabled:bg-slate-400"
                    disabled={!formData.evento.titulo || !formData.evento.descricao}
                >
                    <i className="fas fa-check-double mr-2"></i>
                    Revisar e Enviar
                </button>
            </form>
        </div>
        
        <Modal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            title="Confirmação de Envio"
            footer={
                <>
                    <button onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 bg-slate-200 font-semibold rounded-lg">Voltar</button>
                    <button onClick={handleConfirmSend} className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg">Confirmar e Enviar</button>
                </>
            }
        >
            <p className="text-sm text-slate-600 mb-3">Revise o protocolo de comunicação gerado. Ele será enviado no formato JSON abaixo.</p>
            <pre className="bg-slate-800 text-white p-4 rounded-lg text-xs max-h-80 overflow-auto">
                <code>
                    {finalJson}
                </code>
            </pre>
        </Modal>
      </>
    );
};

export default CompanyNotificationForm;


import React, { useState, useMemo } from 'react';
import { RoutineItem, StockItem } from '../types';
import Modal from './Modal';
import InputField from './ui/InputField';

interface PatientRoutineViewProps {
    routine: RoutineItem[];
    onUpdateRoutine: (updatedRoutine: RoutineItem[]) => void;
    userRole: string;
    stockItems: StockItem[];
    onConsumeStock: (itemId: string, quantity: number) => void;
    patientDiagnosis?: string;
    vitalSigns?: {
        bloodPressure: string;
        heartRate: string;
        temperature: string;
        saturation: string;
        glycemia: string;
    };
}

type RoutineType = 'medication' | 'procedure' | 'diet' | 'hygiene' | 'exam' | 'therapy' | 'admin' | 'attendance';

interface RoutineTemplate {
    id: string;
    name: string;
    icon: string;
    color: string;
    items: { timeOffset: number; task: string; type: RoutineType; requiredStockItem?: string }[];
}

const TEMPLATES: RoutineTemplate[] = [
    {
        id: 't1',
        name: 'Manhã Padrão',
        icon: 'fa-sun',
        color: 'bg-amber-50 border-amber-200 text-amber-700',
        items: [
            { timeOffset: 0, task: 'HGT (Glicemia) + Sinais Vitais', type: 'exam' },
            { timeOffset: 0.5, task: 'Café da Manhã', type: 'diet' },
            { timeOffset: 1, task: 'Medicação Matinal', type: 'medication' },
            { timeOffset: 2, task: 'Banho no Leito', type: 'hygiene' },
            { timeOffset: 2.5, task: 'Curativo', type: 'procedure' }
        ]
    },
    {
        id: 't2',
        name: 'Tarde / Visita',
        icon: 'fa-cloud-sun',
        color: 'bg-blue-50 border-blue-200 text-blue-700',
        items: [
            { timeOffset: 0, task: 'Almoço', type: 'diet' },
            { timeOffset: 1, task: 'Medicação (13h)', type: 'medication' },
            { timeOffset: 1.5, task: 'Mudança de Decúbito', type: 'procedure' },
            { timeOffset: 3, task: 'Lanche da Tarde', type: 'diet' },
            { timeOffset: 3.5, task: 'HGT (Glicemia)', type: 'exam' }
        ]
    },
    {
        id: 't3',
        name: 'Noite / Repouso',
        icon: 'fa-moon',
        color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        items: [
            { timeOffset: 0, task: 'Jantar', type: 'diet' },
            { timeOffset: 1, task: 'Medicação Noturna', type: 'medication' },
            { timeOffset: 1.5, task: 'Higiene Oral / Conforto', type: 'hygiene' },
            { timeOffset: 2, task: 'Sinais Vitais', type: 'procedure' }
        ]
    }
];

const getTypeConfig = (type: RoutineType) => {
    switch (type) {
        case 'medication': return { label: 'Medicação', icon: 'fa-pills', color: 'text-blue-600 bg-blue-100', border: 'border-l-4 border-blue-500' };
        case 'diet': return { label: 'Dieta', icon: 'fa-utensils', color: 'text-green-600 bg-green-100', border: 'border-l-4 border-green-500' };
        case 'hygiene': return { label: 'Higiene', icon: 'fa-bath', color: 'text-cyan-600 bg-cyan-100', border: 'border-l-4 border-cyan-500' };
        case 'procedure': return { label: 'Procedimento', icon: 'fa-briefcase-medical', color: 'text-purple-600 bg-purple-100', border: 'border-l-4 border-purple-500' };
        case 'therapy': return { label: 'Terapia', icon: 'fa-user-nurse', color: 'text-pink-600 bg-pink-100', border: 'border-l-4 border-pink-500' };
        case 'exam': return { label: 'Exame', icon: 'fa-microscope', color: 'text-orange-600 bg-orange-100', border: 'border-l-4 border-orange-500' };
        case 'attendance': return { label: 'Atendimento', icon: 'fa-user-doctor', color: 'text-teal-600 bg-teal-100', border: 'border-l-4 border-teal-500' };
        default: return { label: 'Outros', icon: 'fa-clipboard-check', color: 'text-slate-600 bg-slate-100', border: 'border-l-4 border-slate-500' };
    }
};

const PatientRoutineView: React.FC<PatientRoutineViewProps> = ({ routine, onUpdateRoutine, userRole, stockItems, onConsumeStock }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    
    // State para adição/edição
    const [currentItem, setCurrentItem] = useState<{ 
        id?: string, 
        type: RoutineType; 
        time: string; 
        task: string;
        requiredStockItem?: string;
        notes?: string;
        professional?: string;
        isRecurring?: boolean;
        recurrenceEndDate?: string;
    }>({ 
        type: 'medication', 
        time: '', 
        task: '' 
    });

    const progress = routine.length > 0 
        ? Math.round((routine.filter(r => r.completed).length / routine.length) * 100) 
        : 0;

    // Sort routine by time
    const sortedRoutine = [...routine].sort((a, b) => a.time.localeCompare(b.time));

    // Group by Period
    const groupedRoutine = useMemo(() => {
        const groups = {
            'Manhã (06:00 - 11:59)': [] as RoutineItem[],
            'Tarde (12:00 - 17:59)': [] as RoutineItem[],
            'Noite (18:00 - 05:59)': [] as RoutineItem[]
        };

        sortedRoutine.forEach(item => {
            const hour = parseInt(item.time.split(':')[0], 10);
            if (hour >= 6 && hour < 12) groups['Manhã (06:00 - 11:59)'].push(item);
            else if (hour >= 12 && hour < 18) groups['Tarde (12:00 - 17:59)'].push(item);
            else groups['Noite (18:00 - 05:59)'].push(item);
        });

        return groups;
    }, [sortedRoutine]);

    const handleApplyTemplate = (template: RoutineTemplate) => {
        const now = new Date();
        const currentHour = now.getHours();
        
        const newItems: RoutineItem[] = template.items.map((item, index) => {
            let itemHour = currentHour + item.timeOffset;
            if (itemHour >= 24) itemHour -= 24;
            
            const timeString = `${String(itemHour).padStart(2, '0')}:00`;

            return {
                id: Date.now().toString() + index,
                time: timeString,
                task: item.task,
                type: item.type,
                completed: false,
                requiredStockItem: item.requiredStockItem
            };
        });

        if (window.confirm(`Adicionar ${newItems.length} itens da rotina "${template.name}"?`)) {
            onUpdateRoutine([...routine, ...newItems]);
        }
    };

    const handleSaveItem = () => {
        if (!currentItem.task || !currentItem.time) return;

        if (currentItem.id) {
            // Edit Mode
            const updated = routine.map(r => r.id === currentItem.id ? { ...r, ...currentItem } as RoutineItem : r);
            onUpdateRoutine(updated);
            setIsEditModalOpen(false);
        } else {
            // Add Mode
            const newItem: RoutineItem = {
                id: Date.now().toString(),
                time: currentItem.time,
                task: currentItem.task,
                type: currentItem.type,
                completed: false,
                requiredStockItem: currentItem.requiredStockItem,
                notes: currentItem.notes,
                professional: currentItem.professional,
                isRecurring: currentItem.isRecurring,
                recurrenceEndDate: currentItem.recurrenceEndDate
            };
            onUpdateRoutine([...routine, newItem]);
            setIsAddModalOpen(false);
        }
        
        // Reset
        setCurrentItem({ type: 'medication', time: '', task: '', requiredStockItem: '', notes: '' });
    };

    const handleEditClick = (item: RoutineItem) => {
        setCurrentItem({
            id: item.id,
            time: item.time,
            task: item.task,
            type: item.type,
            requiredStockItem: item.requiredStockItem,
            notes: item.notes,
            professional: item.professional,
            isRecurring: item.isRecurring,
            recurrenceEndDate: item.recurrenceEndDate
        });
        setIsEditModalOpen(true);
    };

    const toggleComplete = (id: string) => {
        const updated = routine.map(item => {
            if (item.id === id) {
                const isCompleting = !item.completed;
                
                // Logic for Stock Consumption
                if (isCompleting && item.requiredStockItem) {
                    const stock = stockItems.find(s => s.id === item.requiredStockItem);
                    if (stock) {
                        // Consome 1 unidade (Aditivo)
                        onConsumeStock(item.requiredStockItem, 1);
                    }
                }

                return {
                    ...item,
                    completed: isCompleting,
                    completedAt: isCompleting ? new Date().toISOString() : undefined,
                    completedBy: isCompleting ? userRole : undefined
                };
            }
            return item;
        });
        onUpdateRoutine(updated);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Remover este item da rotina?')) {
            onUpdateRoutine(routine.filter(r => r.id !== id));
        }
    };

    const handleClearAll = () => {
        if(window.confirm('Deseja iniciar um novo plantão? Isso apagará todas as tarefas atuais.')) {
            onUpdateRoutine([]);
        }
    };

    const generateShiftSummary = () => {
        const completed = routine.filter(r => r.completed).sort((a, b) => (a.completedAt || '').localeCompare(b.completedAt || ''));
        if (completed.length === 0) return "Nenhuma atividade registrada no plantão.";
        
        const lines = completed.map(item => {
            const time = new Date(item.completedAt!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            let line = `- ${time}: ${item.task}`;
            if (item.notes) line += ` (Obs: ${item.notes})`;
            return line;
        });
        
        return `RESUMO DO PLANTÃO:\n${lines.join('\n')}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => alert("Copiado para a área de transferência!"));
    };

    const RoutineForm = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <InputField 
                    id="routineTime" 
                    label="Horário" 
                    type="time" 
                    value={currentItem.time} 
                    onChange={e => setCurrentItem({...currentItem, time: e.target.value})} 
                />
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Tipo</label>
                    <select
                        value={currentItem.type}
                        onChange={e => setCurrentItem({...currentItem, type: e.target.value as RoutineType})}
                        className="w-full p-2 border rounded-md bg-white"
                    >
                        <option value="medication">💊 Medicação</option>
                        <option value="diet">🥗 Dieta</option>
                        <option value="hygiene">🚿 Higiene</option>
                        <option value="procedure">💉 Procedimento</option>
                        <option value="exam">🔬 Exame</option>
                        <option value="attendance">🩺 Atendimento</option>
                        <option value="therapy">🧘 Terapia</option>
                        <option value="admin">📋 Outros</option>
                    </select>
                </div>
            </div>
            
            {currentItem.type === 'attendance' && (
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Especialidade</label>
                    <select
                        value={currentItem.professional || ''}
                        onChange={e => setCurrentItem({...currentItem, professional: e.target.value})}
                        className="w-full p-2 border rounded-md bg-white"
                    >
                        <option value="">Selecione...</option>
                        <option value="Fisioterapia">Fisioterapia</option>
                        <option value="Fonoaudiologia">Fonoaudiologia</option>
                        <option value="Nutricionista">Nutricionista</option>
                        <option value="Médico">Médico</option>
                        <option value="Psicologia">Psicologia</option>
                    </select>
                </div>
            )}

            <InputField 
                id="routineTask" 
                label="Descrição da Tarefa" 
                placeholder="Ex: Dipirona 1g EV"
                value={currentItem.task} 
                onChange={e => setCurrentItem({...currentItem, task: e.target.value})} 
            />
            
            {/* Stock Linking */}
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                    <i className="fas fa-box-open mr-1"></i>
                    Vincular Material/Medicamento (Estoque)
                </label>
                <select
                    value={currentItem.requiredStockItem || ''}
                    onChange={e => setCurrentItem({...currentItem, requiredStockItem: e.target.value})}
                    className="w-full p-2 border rounded-md bg-white text-sm"
                >
                    <option value="">-- Nenhum item vinculado --</option>
                    {stockItems.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.name} ({item.quantity} {item.unit})
                        </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                    Ao marcar a tarefa como concluída, 1 unidade deste item será consumida automaticamente do estoque.
                </p>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                    Particularidades / Observações
                </label>
                <textarea
                    value={currentItem.notes || ''}
                    onChange={e => setCurrentItem({...currentItem, notes: e.target.value})}
                    placeholder="Ex: Paciente recusou, ou diluído em 100ml..."
                    className="w-full p-2 border rounded-md bg-white text-sm h-20"
                />
            </div>

            {/* Recurrence */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={currentItem.isRecurring || false} 
                        onChange={e => setCurrentItem({...currentItem, isRecurring: e.target.checked})}
                        className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-sm font-semibold text-slate-700">Deseja tornar Rotina?</span>
                </label>
                {currentItem.isRecurring && (
                    <div className="mt-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Até quando? (Opcional)</label>
                        <input 
                            type="date" 
                            value={currentItem.recurrenceEndDate || ''}
                            onChange={e => setCurrentItem({...currentItem, recurrenceEndDate: e.target.value})}
                            className="w-full p-1.5 border rounded text-sm"
                        />
                    </div>
                )}
            </div>
        </div>
    );

    // Filter completed items for history
    const completedItems = routine.filter(r => r.completed).sort((a, b) => (a.completedAt || '').localeCompare(b.completedAt || ''));

    return (
        <div className="flex flex-col space-y-6 pb-20">
            
            {/* Header */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Rotina Diária</h2>
                        <p className="text-xs text-slate-500">Checklist de tarefas, medicações e cuidados.</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsHistoryModalOpen(true)}
                            className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors border border-slate-300 font-semibold"
                        >
                            <i className="fas fa-history mr-1"></i> Histórico
                        </button>
                        <button 
                            onClick={handleClearAll}
                            className="text-xs text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                            <i className="fas fa-trash-alt mr-1"></i> Limpar
                        </button>
                        <button 
                            onClick={() => {
                                setCurrentItem({ type: 'medication', time: '', task: '' });
                                setIsAddModalOpen(true);
                            }}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all"
                        >
                            <i className="fas fa-plus"></i> Adicionar
                        </button>
                    </div>
                </div>

                {/* Progress */}
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-cyan-600 bg-cyan-200">
                                Progresso do Plantão
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-cyan-600">
                                {progress}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-cyan-100">
                        <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-cyan-600 transition-all duration-500"></div>
                    </div>
                </div>

                {/* Templates */}
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {TEMPLATES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => handleApplyTemplate(t)}
                            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all hover:shadow-md ${t.color}`}
                        >
                            <i className={`fas ${t.icon}`}></i>
                            {t.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Routine Lists by Period */}
            {Object.entries(groupedRoutine).map(([period, items]) => {
                const listItems = items as RoutineItem[];
                return listItems.length > 0 && (
                    <div key={period} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                            <i className={`fas ${period.includes('Manhã') ? 'fa-sun text-amber-500' : period.includes('Tarde') ? 'fa-cloud-sun text-blue-500' : 'fa-moon text-indigo-500'}`}></i>
                            <h3 className="font-bold text-slate-700 text-sm">{period}</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {listItems.map(item => {
                                const config = getTypeConfig(item.type);
                                const linkedStock = item.requiredStockItem ? stockItems.find(s => s.id === item.requiredStockItem) : null;

                                return (
                                    <div 
                                        key={item.id} 
                                        className={`flex items-center p-3 hover:bg-slate-50 transition-colors group ${item.completed ? 'opacity-60 bg-slate-50' : 'bg-white'} ${config.border}`}
                                    >
                                        {/* Time */}
                                        <div className="min-w-[60px] text-center mr-3">
                                            <span className="text-lg font-black text-slate-700 block leading-none">{item.time}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">{config.label}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 cursor-pointer" onClick={() => handleEditClick(item)}>
                                            <div className="flex items-center gap-2">
                                                {item.isRecurring && <i className="fas fa-sync-alt text-[10px] text-slate-400" title="Rotina Fixa"></i>}
                                                <p className={`font-medium text-sm ${item.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                                    {item.task}
                                                </p>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {item.professional && (
                                                    <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200 flex items-center">
                                                        <i className="fas fa-user-doctor mr-1 text-xs"></i> {item.professional}
                                                    </span>
                                                )}
                                                {linkedStock && (
                                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 flex items-center">
                                                        <i className="fas fa-box-open mr-1 text-xs"></i> {linkedStock.name}
                                                    </span>
                                                )}
                                                {item.notes && (
                                                    <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200 flex items-center">
                                                        <i className="fas fa-sticky-note mr-1 text-xs"></i> {item.notes}
                                                    </span>
                                                )}
                                            </div>

                                            {item.completed && (
                                                <p className="text-[10px] text-green-600 font-bold mt-1">
                                                    <i className="fas fa-check-double mr-1"></i>
                                                    Realizado às {new Date(item.completedAt!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 ml-2">
                                            <button 
                                                onClick={() => toggleComplete(item.id)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                                    item.completed 
                                                    ? 'bg-green-500 border-green-500 text-white' 
                                                    : 'border-slate-300 text-transparent hover:border-green-400'
                                                }`}
                                            >
                                                <i className="fas fa-check text-sm"></i>
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors px-2"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            })}

            {routine.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                    <i className="fas fa-clipboard-list text-5xl mb-4 opacity-30"></i>
                    <p>Nenhuma tarefa agendada.</p>
                    <p className="text-sm">Use os modelos acima ou adicione tarefas manualmente.</p>
                </div>
            )}

            {/* Modals */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Nova Tarefa na Rotina"
                footer={
                    <>
                        <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-lg font-semibold text-slate-700">Cancelar</button>
                        <button onClick={handleSaveItem} className="px-4 py-2 bg-cyan-600 rounded-lg text-white font-bold shadow-md hover:bg-cyan-700">Adicionar</button>
                    </>
                }
            >
                <RoutineForm />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Editar Tarefa / Particularidades"
                footer={
                    <>
                        <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-lg font-semibold text-slate-700">Cancelar</button>
                        <button onClick={handleSaveItem} className="px-4 py-2 bg-blue-600 rounded-lg text-white font-bold shadow-md hover:bg-blue-700">Salvar Alterações</button>
                    </>
                }
            >
                <RoutineForm />
            </Modal>

            {/* History Summary Modal */}
            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                title="Histórico de Plantão (Checklist)"
                footer={
                    <>
                        <button onClick={() => copyToClipboard(generateShiftSummary())} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 mr-2">
                            <i className="fas fa-copy mr-2"></i> Copiar Resumo
                        </button>
                        <button onClick={() => setIsHistoryModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-lg font-semibold text-slate-700">Fechar</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded">
                        <i className="fas fa-info-circle mr-2"></i>
                        Este é o registro cronológico das ações realizadas na rotina. Você pode copiar para o relatório final.
                    </p>
                    <div className="bg-slate-800 text-slate-200 p-4 rounded-lg font-mono text-xs max-h-60 overflow-y-auto whitespace-pre-wrap">
                        {generateShiftSummary()}
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default PatientRoutineView;

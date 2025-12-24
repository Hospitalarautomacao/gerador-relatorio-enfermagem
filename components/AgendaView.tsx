
import React, { useState, useEffect } from 'react';
import { Shift } from '../types';
import Modal from './Modal';
import InputField from './ui/InputField';
import { getReports, getShifts, saveShift, deleteShift, subscribeToShifts, getDbType } from '../services/databaseService';
import { analyzeScheduleWithAI } from '../services/geminiService';

const AgendaView: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [patients, setPatients] = useState<string[]>([]);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentShift, setCurrentShift] = useState<Partial<Shift>>({});
    
    // AI & Loading
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

    const dbType = getDbType();

    // Initial Load and Subscription
    useEffect(() => {
        loadShiftsData();
        loadPatients();

        // Subscribe to realtime changes if using Supabase
        const subscription = subscribeToShifts((payload) => {
            if (payload.eventType === 'INSERT') {
                setShifts(prev => [...prev, payload.new]);
            } else if (payload.eventType === 'UPDATE') {
                setShifts(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
            } else if (payload.eventType === 'DELETE') {
                setShifts(prev => prev.filter(s => s.id !== payload.old.id));
            }
        });

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const loadShiftsData = async () => {
        setDataLoading(true);
        try {
            const data = await getShifts();
            if (data.length > 0) {
                setShifts(data);
            } else {
                // If local and empty, add a default mock for UX if needed, 
                // but usually better to leave empty for clean state.
                setShifts([]); 
            }
        } catch (error) {
            console.error("Erro ao carregar plantões:", error);
        } finally {
            setDataLoading(false);
        }
    };

    const loadPatients = async () => {
        const reports = await getReports();
        const names = Array.from(new Set(reports.map(r => r.patientName).filter(Boolean)));
        setPatients(names);
    };

    // Calendar Helpers
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate);
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() && 
               d1.getMonth() === d2.getMonth() && 
               d1.getFullYear() === d2.getFullYear();
    };

    const getShiftsForDay = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        return shifts.filter(s => s.date === dateStr);
    };

    // CRUD Handlers
    const handleSaveShift = async () => {
        if (!currentShift.date || !currentShift.startTime || !currentShift.patientName) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        const newShiftData: Shift = {
            id: currentShift.id || Date.now().toString(),
            date: currentShift.date,
            startTime: currentShift.startTime,
            endTime: currentShift.endTime || '',
            patientName: currentShift.patientName,
            patientAddress: currentShift.patientAddress || '',
            status: currentShift.status || 'Confirmado',
            type: currentShift.type || 'Diurno'
        };

        setLoading(true);
        try {
            await saveShift(newShiftData);
            // Optimistic update for local feel (realtime will confirm)
            setShifts(prev => {
                const index = prev.findIndex(s => s.id === newShiftData.id);
                if (index >= 0) {
                    const updated = [...prev];
                    updated[index] = newShiftData;
                    return updated;
                }
                return [...prev, newShiftData];
            });
            setIsModalOpen(false);
            setCurrentShift({});
        } catch (e) {
            alert("Erro ao salvar plantão.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteShift = async (id: string) => {
        if (window.confirm("Excluir este plantão?")) {
            setLoading(true);
            try {
                await deleteShift(id);
                // Optimistic update
                setShifts(prev => prev.filter(s => s.id !== id));
            } catch (e) {
                alert("Erro ao excluir plantão.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditShift = (shift: Shift) => {
        setCurrentShift(shift);
        setIsModalOpen(true);
    };

    const handleNewShift = () => {
        setCurrentShift({
            date: selectedDate.toISOString().split('T')[0],
            startTime: '07:00',
            endTime: '19:00',
            status: 'Confirmado',
            type: 'Diurno'
        });
        setIsModalOpen(true);
    };

    // Integrations
    const handleSyncGoogle = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert('Agenda sincronizada com Google Calendar! (Simulação)');
        }, 1500);
    };

    const handleAnalyzeAI = async () => {
        setIsAnalyzing(true);
        setAiAnalysis(null);
        try {
            // Filter future shifts or current month shifts for analysis
            const relevantShifts = shifts.filter(s => new Date(s.date) >= new Date(new Date().setDate(new Date().getDate() - 7)));
            const analysis = await analyzeScheduleWithAI(relevantShifts);
            setAiAnalysis(analysis);
        } catch (e) {
            alert("Erro na análise de IA.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getStatusColor = (status: Shift['status']) => {
        switch (status) {
            case 'Confirmado': return 'bg-green-100 text-green-800 border-green-200';
            case 'Pendente': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const selectedShifts = getShiftsForDay(selectedDate);

    return (
        <div className="flex flex-col h-full space-y-6">
            
            {/* Header */}
            <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                        <i className="fas fa-calendar-days mr-2 text-blue-600"></i>
                        Minha Agenda
                        {dbType === 'supabase' && <span className="ml-2 text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full"><i className="fas fa-cloud"></i> Online</span>}
                    </h2>
                    <p className="text-sm text-slate-500">Gestão de escalas e plantões</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleSyncGoogle}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors text-xs"
                    >
                        <i className={`fab fa-google ${loading ? 'fa-spin' : ''}`}></i>
                        Sync Google
                    </button>
                    <button 
                        onClick={handleNewShift}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-xs"
                    >
                        <i className="fas fa-plus"></i> Novo Plantão
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Calendar Widget */}
                <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow relative">
                    {dataLoading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
                            <i className="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-full"><i className="fas fa-chevron-left"></i></button>
                        <h3 className="font-bold text-lg capitalize">{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-full"><i className="fas fa-chevron-right"></i></button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sab</div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const hasShift = getShiftsForDay(date).length > 0;
                            const isSelected = isSameDay(date, selectedDate);
                            const isToday = isSameDay(date, new Date());

                            return (
                                <button 
                                    key={day} 
                                    onClick={() => handleDayClick(day)}
                                    className={`
                                        h-14 md:h-20 flex flex-col items-center justify-start pt-2 rounded-xl text-sm font-medium transition-all relative border
                                        ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-100 bg-white hover:bg-slate-50'}
                                    `}
                                >
                                    <span className={`${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                                        {day}
                                    </span>
                                    {hasShift && (
                                        <div className="mt-1 flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Day Details Side Panel */}
                <div className="bg-white p-5 rounded-xl shadow flex flex-col h-full">
                    <div className="border-b pb-4 mb-4">
                        <h3 className="font-bold text-slate-700 text-lg flex items-center">
                            <i className="far fa-calendar-check mr-2 text-slate-400"></i>
                            {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                        {loading && selectedShifts.length === 0 ? (
                             <div className="text-center py-4 text-slate-400"><i className="fas fa-spinner fa-spin"></i> Atualizando...</div>
                        ) : selectedShifts.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                <i className="fas fa-mug-hot text-4xl mb-3 opacity-50"></i>
                                <p>Dia livre! Nenhum plantão agendado.</p>
                                <button onClick={handleNewShift} className="mt-4 text-blue-600 hover:underline text-sm">Adicionar Plantão</button>
                            </div>
                        ) : (
                            selectedShifts.map(shift => (
                                <div key={shift.id} className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-slate-50 group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(shift.status)}`}>
                                            {shift.status}
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditShift(shift)} className="text-blue-500 hover:text-blue-700"><i className="fas fa-edit"></i></button>
                                            <button onClick={() => handleDeleteShift(shift.id)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm">{shift.patientName}</h4>
                                    <div className="text-xs text-slate-500 mt-1 space-y-1">
                                        <p><i className="far fa-clock mr-1"></i> {shift.startTime} - {shift.endTime} ({shift.type})</p>
                                        <p className="truncate"><i className="fas fa-map-marker-alt mr-1"></i> {shift.patientAddress}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <button 
                            onClick={handleAnalyzeAI}
                            disabled={isAnalyzing}
                            className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-xs shadow-md hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-brain"></i>}
                            Analisar Escala (IA)
                        </button>
                        {aiAnalysis && (
                            <div className="mt-3 bg-purple-50 p-3 rounded-lg border border-purple-100 text-xs text-purple-900 animate-fade-in">
                                <h5 className="font-bold mb-1"><i className="fas fa-sparkles mr-1"></i> Análise de Bem-estar</h5>
                                <p>{aiAnalysis}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentShift.id ? "Editar Plantão" : "Novo Plantão"}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button onClick={handleSaveShift} disabled={loading} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50">
                            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Salvar'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <InputField 
                        id="shiftDate" 
                        label="Data" 
                        type="date" 
                        value={currentShift.date || ''} 
                        onChange={e => setCurrentShift({...currentShift, date: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField 
                            id="startTime" 
                            label="Início" 
                            type="time" 
                            value={currentShift.startTime || ''} 
                            onChange={e => setCurrentShift({...currentShift, startTime: e.target.value})}
                        />
                        <InputField 
                            id="endTime" 
                            label="Fim" 
                            type="time" 
                            value={currentShift.endTime || ''} 
                            onChange={e => setCurrentShift({...currentShift, endTime: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Paciente</label>
                        <input 
                            list="patient-list" 
                            className="w-full p-2 border rounded-md"
                            value={currentShift.patientName || ''}
                            onChange={e => setCurrentShift({...currentShift, patientName: e.target.value})}
                            placeholder="Selecione ou digite..."
                        />
                        <datalist id="patient-list">
                            {patients.map(p => <option key={p} value={p} />)}
                        </datalist>
                    </div>

                    <InputField 
                        id="address" 
                        label="Endereço (Opcional)" 
                        value={currentShift.patientAddress || ''} 
                        onChange={e => setCurrentShift({...currentShift, patientAddress: e.target.value})}
                        placeholder="Rua, Número, Bairro"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Tipo</label>
                            <select 
                                className="w-full p-2 border rounded-md"
                                value={currentShift.type}
                                onChange={e => setCurrentShift({...currentShift, type: e.target.value as any})}
                            >
                                <option value="Diurno">Diurno</option>
                                <option value="Noturno">Noturno</option>
                                <option value="24h">24 Horas</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                            <select 
                                className="w-full p-2 border rounded-md"
                                value={currentShift.status}
                                onChange={e => setCurrentShift({...currentShift, status: e.target.value as any})}
                            >
                                <option value="Confirmado">Confirmado</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AgendaView;

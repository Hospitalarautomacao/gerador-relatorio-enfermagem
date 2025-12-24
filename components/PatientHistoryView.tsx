
import React, { useMemo, useState } from 'react';
import { AuditLog } from '../types';

interface PatientHistoryViewProps {
  logs: AuditLog[];
}

interface HistoryEvent {
  id: string;
  timestamp: string;
  icon: string;
  color: string;
  title: string;
  description: string;
  user: string;
}

const transformLogsToEvents = (logs: AuditLog[]): HistoryEvent[] => {
  const events: HistoryEvent[] = [];

  // Reverse logs to process from oldest to newest
  const sortedLogs = [...logs].reverse();

  for (const log of sortedLogs) {
    let event: Omit<HistoryEvent, 'id' | 'timestamp' | 'user'> | null = null;
    
    switch (log.field) {
      case 'Medicação':
        if (log.action === 'create' && log.newValue) {
          event = {
            icon: 'fas fa-pills',
            color: 'bg-teal-500',
            title: 'Medicação Administrada',
            description: `${log.newValue.name} ${log.newValue.dose} via ${log.newValue.route}`,
          };
        }
        break;
      
      case 'Dispositivo':
        if (log.action === 'create' && log.newValue) {
          event = {
            icon: 'fas fa-syringe',
            color: 'bg-sky-500',
            title: 'Dispositivo Aplicado',
            description: `${log.newValue.name} (${log.newValue.details})`,
          };
        }
        break;

      case 'procedures': {
        const oldProcedures = (log.oldValue as string[]) || [];
        const newProcedures = (log.newValue as string[]) || [];
        const addedProcedures = newProcedures.filter(p => !oldProcedures.includes(p));
        if (addedProcedures.length > 0) {
            event = {
                icon: 'fas fa-briefcase-medical',
                color: 'bg-indigo-500',
                title: 'Procedimento Realizado',
                description: addedProcedures.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', '),
            };
        }
        break;
      }
      
      case 'generalState':
        if (log.oldValue && log.newValue) {
          event = {
            icon: 'fas fa-user-md',
            color: 'bg-amber-500',
            title: 'Alteração no Estado Geral',
            description: `De "${log.oldValue}" para "${log.newValue}"`,
          };
        }
        break;

      case 'bloodPressure':
      case 'pulse':
      case 'temperature':
      case 'saturation':
      case 'glycemia':
        if (log.newValue) {
            const fieldMap: Record<string, string> = {
                bloodPressure: 'PA',
                pulse: 'Pulso',
                temperature: 'Temp.',
                saturation: 'SatO₂',
                glycemia: 'Glicemia'
            };
            event = {
                icon: 'fas fa-heart-pulse',
                color: 'bg-rose-500',
                title: 'Sinal Vital Verificado',
                description: `${fieldMap[log.field] || log.field}: ${log.newValue}`,
            };
        }
        break;
    }

    if (event) {
      events.push({
        id: log.id,
        timestamp: log.timestamp,
        user: log.user,
        ...event,
      });
    }
  }

  // Remove duplicate vital sign entries if they occur close together
  const uniqueEvents = events.reduce((acc, current, index, array) => {
    if (current.title === 'Sinal Vital Verificado') {
        const next = array[index + 1];
        if (next && next.title === 'Sinal Vital Verificado' && (new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime() < 1000 * 60)) {
            // Skip this one, as the next one is very close
            return acc;
        }
    }
    acc.push(current);
    return acc;
  }, [] as HistoryEvent[]);

  return uniqueEvents;
};


const PatientHistoryView: React.FC<PatientHistoryViewProps> = ({ logs }) => {
  const historyEvents = useMemo(() => transformLogsToEvents(logs), [logs]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');

  const handleSearch = () => {
    setIsSearching(true);
    setSearchMessage('');
    setTimeout(() => {
      setIsSearching(false);
      // Simulate finding no more records
      setSearchMessage('Nenhum registro mais antigo foi encontrado.');
    }, 1500);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
        <i className="fas fa-timeline mr-2 text-cyan-600"></i>
        Histórico de Cuidados do Paciente
      </h2>
      
      {historyEvents.length === 0 ? (
        <div className="text-center py-10">
            <i className="fas fa-history text-4xl text-slate-300 mb-4"></i>
            <p className="text-slate-500">Nenhum evento clínico relevante foi registrado ainda.</p>
            <p className="text-sm text-slate-400 mt-2">Comece a preencher o relatório para ver o histórico aqui.</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-200">
          {historyEvents.map((event, index) => (
            <div key={event.id} className={`mb-8 relative ${index === historyEvents.length - 1 ? 'pb-2' : ''}`}>
              {/* Timeline Dot */}
              <div className={`absolute -left-[34px] top-1 w-6 h-6 rounded-full ${event.color} flex items-center justify-center text-white ring-8 ring-white`}>
                <i className={event.icon}></i>
              </div>

              <div className="ml-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-bold text-slate-800">{event.title}</h3>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    {new Date(event.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                <p className="text-xs text-slate-400 mt-2">
                  <i className="fas fa-user-pen mr-1"></i>
                  Registrado por: {event.user}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Button Section */}
      <div className="mt-6 pt-4 border-t border-slate-200 text-center">
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-wait transition-colors"
        >
          {isSearching ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Buscando...
            </>
          ) : (
            <>
              <i className="fas fa-search mr-2"></i>
              Buscar Histórico
            </>
          )}
        </button>
        {searchMessage && (
          <p className="text-sm text-slate-500 mt-3 animate-fade-in">{searchMessage}</p>
        )}
      </div>
    </div>
  );
};

export default PatientHistoryView;

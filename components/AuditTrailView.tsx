import React from 'react';
import { AuditLog } from '../types';

// Helper to format values for display
const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return 'vazio';
  if (typeof value === 'string') return `"${value}"`;
  if (Array.isArray(value)) return `[${value.join(', ')}]`;
  if (typeof value === 'object') {
    // For specific object types, create a summary
    if (value.name && value.dose) { // Medication
      return `Med: ${value.name} ${value.dose} ${value.route} ${value.frequency}`;
    }
    if (value.name && value.details) { // Device
      return `Disp: ${value.name} (${value.details})`;
    }
    return JSON.stringify(value); // Fallback
  }
  return String(value);
};


const getActionStyle = (action: AuditLog['action']) => {
    switch(action) {
        case 'create': return 'bg-green-100 text-green-800';
        case 'update': return 'bg-blue-100 text-blue-800';
        case 'delete': return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const AuditTrailView: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
        <i className="fas fa-clipboard-list mr-2 text-cyan-600"></i>
        Trilha de Auditoria do Relatório
      </h2>
      
      {logs.length === 0 ? (
        <p className="text-slate-500">Nenhuma alteração foi registrada ainda.</p>
      ) : (
        <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          {logs.map(log => (
            <li key={log.id} className="p-3 border rounded-lg bg-slate-50 text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-700">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getActionStyle(log.action)}`}>
                  {log.action.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-600">
                <i className="fas fa-user mr-2"></i>
                <span className="font-medium">{log.user}</span> alterou o campo <span className="font-medium text-cyan-700">{log.field}</span>.
              </p>
              <div className="mt-1 p-2 bg-white border rounded-md text-xs font-mono">
                 <p><span className="font-semibold text-red-600">De:</span> {formatValue(log.oldValue)}</p>
                 <p><span className="font-semibold text-green-700">Para:</span> {formatValue(log.newValue)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuditTrailView;
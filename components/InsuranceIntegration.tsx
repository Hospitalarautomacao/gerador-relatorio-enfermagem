
import React, { useState } from 'react';
import { InsuranceGuide } from '../types';

const mockGuides: InsuranceGuide[] = [
  { id: '1', guideNumber: '34902100', type: 'Internação', status: 'Autorizado', requestDate: '2023-10-25', lastUpdate: '2023-10-25', items: ['Diária UTI', 'Gasometria', 'Hemograma'] },
  { id: '2', guideNumber: '34902105', type: 'SADT', status: 'Em Análise', requestDate: '2023-10-26', lastUpdate: '2023-10-26', items: ['Tomografia Tórax'] },
  { id: '3', guideNumber: '34902099', type: 'Prorrogação', status: 'Glosa Parcial', requestDate: '2023-10-24', lastUpdate: '2023-10-26', items: ['Curativo Especial', 'Bomba Infusão'] },
];

const InsuranceIntegration: React.FC = () => {
  const [guides, setGuides] = useState<InsuranceGuide[]>(mockGuides);

  const getStatusBadge = (status: InsuranceGuide['status']) => {
    switch (status) {
      case 'Autorizado': return 'bg-green-100 text-green-800';
      case 'Em Análise': return 'bg-yellow-100 text-yellow-800';
      case 'Negado': return 'bg-red-100 text-red-800';
      case 'Glosa Parcial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleRefresh = () => {
    // Simulate API fetch
    alert("Sincronizando status com operadora...");
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <i className="fas fa-file-invoice-dollar text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Gestão de Convênio (TISS)</h2>
            <p className="text-sm text-slate-500">Integração direta com App da Operadora.</p>
          </div>
        </div>
        <button onClick={handleRefresh} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm font-semibold">
          <i className="fas fa-sync-alt"></i> Atualizar Status
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col items-center">
              <span className="text-2xl font-bold text-blue-700">98%</span>
              <span className="text-xs text-blue-600 uppercase tracking-wide">Conformidade Auditoria</span>
           </div>
           <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex flex-col items-center">
              <span className="text-2xl font-bold text-green-700">R$ 0,00</span>
              <span className="text-xs text-green-600 uppercase tracking-wide">Glosas Pendentes</span>
           </div>
           <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex flex-col items-center">
              <span className="text-2xl font-bold text-purple-700">12h</span>
              <span className="text-xs text-purple-600 uppercase tracking-wide">Tempo Médio Aprovação</span>
           </div>
        </div>

        <h3 className="font-bold text-slate-700 mb-2">Guias Recentes</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3">Guia</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Itens</th>
                <th className="px-4 py-3">Data Solic.</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {guides.map(guide => (
                <tr key={guide.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{guide.guideNumber}</td>
                  <td className="px-4 py-3">{guide.type}</td>
                  <td className="px-4 py-3 truncate max-w-[150px]" title={guide.items.join(', ')}>{guide.items.join(', ')}</td>
                  <td className="px-4 py-3">{new Date(guide.requestDate).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(guide.status)}`}>
                      {guide.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end pt-2">
           <button className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-sm hover:bg-emerald-700 flex items-center gap-2">
             <i className="fas fa-plus"></i> Nova Solicitação
           </button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceIntegration;

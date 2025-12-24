
import React from 'react';

const IntegrationsView: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow text-center border border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <i className="fas fa-network-wired text-3xl"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Integrações de Sistema</h2>
        <p className="text-slate-500">Painel de gerenciamento de APIs e Webhooks.</p>
    </div>
  );
};

export default IntegrationsView;

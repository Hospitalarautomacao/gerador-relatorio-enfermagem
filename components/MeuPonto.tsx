
import React from 'react';

const MeuPonto: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow text-center border border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <i className="fas fa-fingerprint text-3xl"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Meu Ponto (RH)</h2>
        <p className="text-slate-500 mb-4">Módulo de espelho de ponto e holerite em desenvolvimento.</p>
        <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            Voltar ao Início
        </button>
    </div>
  );
};

export default MeuPonto;

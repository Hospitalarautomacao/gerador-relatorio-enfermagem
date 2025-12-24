
import React, { useState } from 'react';

const PontoCertoView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const PONTO_CERTO_URL = "https://ponto-certo-batida-de-ponto-inteligente-763912239127.us-west1.run.app";

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative" style={{ minHeight: '600px' }}>
            {/* Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-clock text-cyan-600"></i>
                        Ponto Certo
                    </h2>
                    <p className="text-xs text-slate-500">Sistema de registro de ponto inteligente</p>
                </div>
                <a 
                    href={PONTO_CERTO_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                    Abrir em nova aba <i className="fas fa-external-link-alt"></i>
                </a>
            </div>

            {/* Iframe Container */}
            <div className="flex-1 relative w-full h-full bg-slate-100">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="flex flex-col items-center">
                            <i className="fas fa-circle-notch fa-spin text-4xl text-cyan-600 mb-2"></i>
                            <p className="text-sm text-slate-500 font-medium">Carregando sistema...</p>
                        </div>
                    </div>
                )}
                
                <iframe 
                    src={PONTO_CERTO_URL}
                    className="w-full h-full border-none"
                    onLoad={() => setIsLoading(false)}
                    title="Ponto Certo App"
                    allow="geolocation; microphone; camera; midi; encrypted-media;"
                />
            </div>
        </div>
    );
};

export default PontoCertoView;

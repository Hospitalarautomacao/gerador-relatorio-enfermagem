
import React, { useState, useEffect } from 'react';
import { DigitalSignature } from '../types';

interface ReportPreviewProps {
  originalReport: string;
  improvedReport: string;
  isImproving: boolean;
  onGenerate: () => void;
  onImprove: () => void;
  onSbar: () => void;
  onReset: () => void;
  onSave: () => void;
  onSign?: () => void; 
  digitalSignature?: DigitalSignature; 
}

const DigitalSignatureBadge: React.FC<{ signature: DigitalSignature }> = ({ signature }) => (
    <div className="mt-12 border-2 border-green-600 bg-white p-6 rounded-sm relative max-w-sm ml-auto mr-auto lg:mr-0 lg:ml-auto">
        {/* Selo Visual */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-2">
            <div className="flex items-center gap-1 text-green-700 font-bold border border-green-600 rounded px-2 py-0.5 text-xs uppercase tracking-wider">
                <i className="fas fa-lock"></i>
                Assinatura Qualificada
            </div>
        </div>

        <div className="text-center mb-3">
            <i className="fas fa-file-signature text-4xl text-green-600 mb-2 opacity-80"></i>
            <h3 className="font-serif font-bold text-slate-900 text-sm uppercase border-b border-slate-200 pb-2">Certificado de Autenticidade</h3>
        </div>

        <div className="text-[10px] font-mono text-slate-600 space-y-1.5 text-left">
            <p className="flex justify-between">
                <span className="font-bold text-slate-800">Assinado por:</span> 
                <span>{signature.signerName}</span>
            </p>
            <p className="flex justify-between">
                <span className="font-bold text-slate-800">Registro (COREN):</span> 
                <span>{signature.signerCoren}</span>
            </p>
            <p className="flex justify-between">
                <span className="font-bold text-slate-800">Carimbo de Tempo:</span> 
                <span>{new Date(signature.timestamp).toLocaleString('pt-BR')}</span>
            </p>
            <p className="flex justify-between">
                <span className="font-bold text-slate-800">Tipo:</span> 
                <span>{signature.certificateType} (ICP-Brasil)</span>
            </p>
            
            <div className="mt-3 pt-2 border-t border-slate-100 break-all text-[8px] text-slate-400">
                <span className="font-bold">HASH SHA-256:</span> {signature.hash}
            </div>
        </div>

        <div className="mt-4 text-center">
            <p className="text-[8px] text-green-700 font-bold uppercase tracking-tighter">
                Documento assinado digitalmente conforme MP 2.200-2/2001 e Res. COFEN 754/2024
            </p>
        </div>
    </div>
);

const PaperSheet: React.FC<{ title: string; content: string; isLoading?: boolean; signature?: DigitalSignature }> = ({ title, content, isLoading, signature }) => (
  <div className="animate-fade-in mx-auto w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-sm p-8 md:p-12 relative border border-slate-100 dark:bg-white dark:text-slate-900">
    {/* Header Institucional */}
    <div className="mb-8 border-b-2 border-slate-800 pb-4 flex justify-between items-start">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 text-white flex items-center justify-center font-bold text-xl rounded">HD</div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Evolução de Enfermagem</h1>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Hospital Digital • Prontuário Eletrônico</p>
            </div>
        </div>
        <div className="text-right">
            <span className="block text-xs font-bold text-slate-400 uppercase">Data de Emissão</span>
            <span className="text-sm font-mono text-slate-900">{new Date().toLocaleDateString('pt-BR')}</span>
        </div>
    </div>

    {/* Corpo do Texto */}
    <div className="font-serif text-sm leading-7 whitespace-pre-wrap text-justify text-slate-900 min-h-[400px]">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <i className="fas fa-circle-notch fa-spin text-4xl text-cyan-600 mb-4"></i>
            <span className="font-sans font-medium animate-pulse">Gerando Relatório Inteligente...</span>
        </div>
      ) : (
        content || (
            <div className="flex flex-col items-center justify-center h-64 text-slate-300 italic text-center p-8 border-2 border-dashed border-slate-100 rounded-xl">
                <i className="fas fa-file-signature text-5xl mb-4 opacity-50"></i>
                <p className="font-sans text-lg font-medium text-slate-400">Aguardando Dados</p>
                <p className="font-sans text-xs mt-2 max-w-xs">Preencha as avaliações para gerar o documento oficial.</p>
            </div>
        )
      )}
    </div>

    {/* Área de Assinatura */}
    <div className="mt-10">
        {signature ? (
            <DigitalSignatureBadge signature={signature} />
        ) : (
            <div className="mt-20 border-t border-slate-400 w-64 mx-auto pt-2 text-center">
                <p className="text-xs text-slate-500 uppercase mb-4">Assinatura do Responsável</p>
                <p className="text-[10px] text-red-400 bg-red-50 inline-block px-2 py-1 rounded">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    Documento ainda não assinado
                </p>
            </div>
        )}
    </div>
    
    {/* Rodapé da Página */}
    <div className="absolute bottom-4 left-0 w-full px-12 text-center">
        <div className="border-t border-slate-200 pt-2 flex justify-between text-[8px] text-slate-400 font-mono">
            <span>Sistema EnfSmart v2.0</span>
            <span>Página 1 de 1</span>
            <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
        </div>
    </div>
  </div>
);


const ReportPreview: React.FC<ReportPreviewProps> = ({ originalReport, improvedReport, isImproving, onGenerate, onImprove, onSbar, onReset, onSave, onSign, digitalSignature }) => {
  const [copySuccess, setCopySuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'report' | 'suggestion' | 'actions'>('actions'); 

  useEffect(() => {
    if (improvedReport && !isImproving) {
      setActiveTab('suggestion');
    }
  }, [improvedReport, isImproving]);
  
  useEffect(() => {
    if (originalReport) {
        setActiveTab('report');
    }
  }, [originalReport]);

  const handleCopy = (textToCopy: string) => {
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess('Copiado!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('Falha ao copiar');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  const handleResetClick = () => {
    if (window.confirm("Tem certeza que deseja limpar todo o formulário? Todos os dados preenchidos serão perdidos.")) {
        onReset();
    }
  };

  const TabButton: React.FC<{
    id: 'report' | 'suggestion' | 'actions';
    label: string;
    icon: string;
    disabled?: boolean;
  }> = ({ id, label, icon, disabled }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center border-b-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        activeTab === id 
        ? 'border-cyan-600 text-cyan-700 bg-white dark:bg-slate-800 dark:text-cyan-400' 
        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
      }`}
      disabled={disabled}
    >
      <i className={`fa-solid ${icon} mr-2 text-lg`}></i>
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-200 dark:bg-slate-900 border-l border-slate-300 dark:border-slate-800">

      {/* Tabs Header */}
      <div className="flex bg-white dark:bg-slate-800 shadow-sm z-10">
        <TabButton id="actions" label="Controles" icon="fa-sliders" />
        <TabButton id="report" label="Documento" icon="fa-file-contract" disabled={!originalReport} />
        <TabButton id="suggestion" label="IA / SBAR" icon="fa-wand-magic-sparkles" disabled={!improvedReport && !isImproving} />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative">
        
        {/* Paper View */}
        {(activeTab === 'report' || activeTab === 'suggestion') && (
          <div id="print-area" className="pb-20">
            <PaperSheet 
                title={activeTab === 'report' ? "Texto Original" : "Versão Aprimorada"}
                content={activeTab === 'report' ? originalReport : improvedReport}
                isLoading={isImproving && activeTab === 'suggestion'}
                signature={digitalSignature}
            />
          </div>
        )}

        {/* Actions Panel View */}
        {activeTab === 'actions' && (
             <div className="max-w-md mx-auto space-y-6">
                
                {/* Generation Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 transform transition-all hover:scale-[1.01]">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                        <i className="fas fa-keyboard mr-2"></i> Controle Principal
                    </h4>
                    <div className="space-y-4">
                        <button
                            onClick={onGenerate}
                            className="w-full relative overflow-hidden group inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all duration-300 active:scale-95"
                        >
                            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                            <i className="fas fa-sync-alt mr-3 text-xl group-hover:rotate-180 transition-transform duration-500"></i>
                            <span className="relative text-lg">Atualizar Documento</span>
                        </button>
                        <p className="text-[10px] text-center text-slate-400">Compila todos os dados preenchidos em um texto formal.</p>
                        
                        <button
                            onClick={handleResetClick}
                            className="w-full inline-flex items-center justify-center px-4 py-3 bg-white border-2 border-red-100 text-red-500 font-semibold rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors text-sm dark:bg-slate-800 dark:border-red-900/30 dark:text-red-400"
                        >
                            <i className="fa-solid fa-trash-can mr-2"></i>
                            Novo Relatório (Limpar)
                        </button>
                    </div>
                </div>

                {/* AI Tools Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                        <i className="fas fa-microchip mr-2"></i> Inteligência Artificial
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onImprove}
                            disabled={isImproving || !originalReport}
                            className="flex flex-col items-center justify-center p-5 bg-indigo-50 border-2 border-indigo-100 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-md disabled:opacity-50 disabled:grayscale transition-all duration-200 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300"
                        >
                            <i className="fa-solid fa-wand-magic-sparkles text-3xl mb-3"></i>
                            <span>Melhorar Texto</span>
                        </button>
                        <button
                            onClick={onSbar}
                            disabled={isImproving || !originalReport}
                            className="flex flex-col items-center justify-center p-5 bg-orange-50 border-2 border-orange-100 text-orange-600 font-bold rounded-2xl hover:bg-orange-100 hover:border-orange-300 hover:shadow-md disabled:opacity-50 disabled:grayscale transition-all duration-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300"
                        >
                            <i className="fa-solid fa-clipboard-list text-3xl mb-3"></i>
                            <span>SBAR (Plantão)</span>
                        </button>
                    </div>
                </div>

                {/* Signature & Save Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                        <i className="fas fa-file-contract mr-2"></i> Validação Jurídica
                    </h4>
                    
                    {!digitalSignature && onSign && (
                        <button
                            onClick={onSign}
                            disabled={!originalReport}
                            className="w-full inline-flex items-center justify-center px-4 py-4 bg-white border-2 border-green-500 text-green-600 font-bold rounded-xl shadow-sm hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-slate-300 disabled:text-slate-400"
                        >
                            <i className="fas fa-signature mr-3 text-xl"></i>
                            Assinar (Certificado Digital)
                        </button>
                    )}

                    <button
                        onClick={onSave}
                        disabled={!originalReport}
                        className="w-full inline-flex items-center justify-center px-4 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 hover:shadow-lg disabled:bg-slate-300 disabled:shadow-none transition-all duration-200 transform active:scale-95"
                    >
                        <i className="fas fa-save mr-3 text-xl"></i>
                        Salvar Prontuário
                    </button>
                </div>
             </div>
        )}
      </div>

      {/* Footer Actions (Floating for Report Tab) */}
      {(activeTab === 'report' || activeTab === 'suggestion') && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-2xl border border-slate-200 dark:bg-slate-800/90 dark:border-slate-700 z-20">
             <button
                onClick={() => handleCopy(activeTab === 'report' ? originalReport : improvedReport)}
                className="w-12 h-12 flex items-center justify-center bg-slate-800 text-white rounded-full hover:bg-slate-700 hover:scale-110 transition-all shadow-lg"
                title="Copiar texto"
            >
                <i className={`fa-solid ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
            </button>
            <button
                onClick={() => window.print()}
                className="w-12 h-12 flex items-center justify-center bg-cyan-600 text-white rounded-full hover:bg-cyan-500 hover:scale-110 transition-all shadow-lg"
                title="Imprimir"
            >
                <i className="fa-solid fa-print"></i>
            </button>
        </div>
      )}
    </div>
  );
};

export default ReportPreview;

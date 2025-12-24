
import React, { useState } from 'react';
import { ReportData } from '../types';

interface QuickHistoryFormProps {
    data: Pick<ReportData, 'comorbidities' | 'mainComplaint' | 'patientCid' | 'patientDiagnosis' | 'patientAllergies'>;
    onInputChange: (field: keyof ReportData, value: any) => void;
    onSuggestCid: () => void;
    isSuggestingCid: boolean;
}

const COMMON_COMORBIDITIES = [
    { label: 'Hipertensão (HAS)', value: 'HAS' },
    { label: 'Diabetes (DM)', value: 'DM' },
    { label: 'Dislipidemia (DLP)', value: 'DLP' },
    { label: 'AVC Prévio', value: 'AVC Prévio' },
    { label: 'Asma / DPOC', value: 'DPOC/Asma' },
    { label: 'Insuf. Cardíaca', value: 'ICC' },
    { label: 'Insuf. Renal', value: 'IRC' },
    { label: 'Obesidade', value: 'Obesidade' },
    { label: 'Tabagista', value: 'Tabagista' },
    { label: 'Etilista', value: 'Etilista' },
    { label: 'Alzheimer/Demência', value: 'Demência' },
    { label: 'Acamado Crônico', value: 'Acamado' }
];

const MAIN_COMPLAINTS = [
    'Dor Aguda', 'Febre', 'Dispineia (Falta de ar)', 'Queda', 'Alteração de Nível de Consciência', 
    'Pós-Operatório Imediato', 'Reabilitação', 'Controle de Infecção', 'Cuidados Paliativos'
];

const QuickHistoryForm: React.FC<QuickHistoryFormProps> = ({ data, onInputChange, onSuggestCid, isSuggestingCid }) => {
    
    const toggleComorbidity = (value: string) => {
        const current = data.comorbidities || [];
        const updated = current.includes(value)
            ? current.filter(c => c !== value)
            : [...current, value];
        onInputChange('comorbidities', updated);
    };

    return (
        <div className="space-y-6">
            
            {/* 1. Motivo do Atendimento (Queixa Principal) */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                    <i className="fas fa-bullseye mr-2"></i>
                    Motivo do Atendimento (Queixa Principal)
                </h3>
                <p className="text-xs text-blue-600 mb-3">Por que o paciente precisa de cuidados hoje?</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                    {MAIN_COMPLAINTS.map(complaint => (
                        <button
                            key={complaint}
                            onClick={() => onInputChange('mainComplaint', complaint)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                data.mainComplaint === complaint 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-100'
                            }`}
                        >
                            {complaint}
                        </button>
                    ))}
                </div>
                <input 
                    type="text" 
                    placeholder="Outro motivo (digite aqui se necessário)..."
                    value={data.mainComplaint}
                    onChange={(e) => onInputChange('mainComplaint', e.target.value)}
                    className="w-full p-2 text-sm border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* 2. Histórico de Saúde (Comorbidades) - Simplificado */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-2 flex items-center">
                    <i className="fas fa-file-medical mr-2"></i>
                    Histórico de Saúde (Comorbidades)
                </h3>
                <div className="flex flex-wrap gap-2">
                    {COMMON_COMORBIDITIES.map(item => (
                        <button
                            key={item.value}
                            onClick={() => toggleComorbidity(item.value)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                                (data.comorbidities || []).includes(item.value)
                                ? 'bg-slate-700 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                            }`}
                        >
                            <i className={`fas ${
                                (data.comorbidities || []).includes(item.value) ? 'fa-check-square' : 'fa-square'
                            }`}></i>
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Diagnóstico e CID (Para Convênio) */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-3 flex items-center justify-between">
                    <span>
                        <i className="fas fa-file-invoice-dollar mr-2 text-green-600"></i>
                        Dados para Convênio/Faturamento
                    </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Diagnóstico Médico</label>
                        <input 
                            type="text" 
                            value={data.patientDiagnosis} 
                            readOnly 
                            className="w-full p-2 bg-slate-100 border border-slate-300 rounded text-slate-600 cursor-not-allowed"
                            title="Edite na aba Identificação"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">CID-10 Principal</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={data.patientCid} 
                                onChange={(e) => onInputChange('patientCid', e.target.value)}
                                placeholder="Ex: I10"
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-cyan-500 font-mono"
                            />
                            <button
                                onClick={onSuggestCid}
                                disabled={isSuggestingCid || !data.patientDiagnosis}
                                className="px-3 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 disabled:opacity-50 transition-colors"
                                title="Sugerir CID com IA"
                            >
                                <i className={`fas ${isSuggestingCid ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                            </button>
                        </div>
                        {!data.patientDiagnosis && <p className="text-[10px] text-red-500 mt-1">Preencha o diagnóstico na identificação.</p>}
                    </div>
                </div>
            </div>

            {/* 4. Alergias e Precauções (Para Colaborador/Segurança) */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-800 mb-2 flex items-center">
                    <i className="fas fa-shield-virus mr-2"></i>
                    Alertas para Equipe (Segurança)
                </h3>
                <div>
                    <label className="block text-xs font-bold text-red-700 mb-1 uppercase">Alergias Conhecidas</label>
                    <input 
                        type="text" 
                        value={data.patientAllergies || ''} 
                        onChange={(e) => onInputChange('patientAllergies', e.target.value)}
                        placeholder="Nega / Dipirona / Iodo..."
                        className="w-full p-2 border border-red-300 rounded bg-white text-red-900 font-bold placeholder-red-200 focus:ring-red-500"
                    />
                </div>
            </div>

        </div>
    );
};

export default QuickHistoryForm;

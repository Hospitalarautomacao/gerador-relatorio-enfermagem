
import React, { useState } from 'react';
import { generateCarePlanSuggestion, getErrorMessage } from '../../services/geminiService';

interface PpsScaleProps {
  value: string;
  onChange: (value: string) => void;
}

const ppsOptions = [
  { value: '100%', label: '100% - Normal, sem evidência de doença.' },
  { value: '90%', label: '90% - Atividade normal, alguns sinais/sintomas.' },
  { value: '80%', label: '80% - Atividade normal com esforço, alguns sinais/sintomas.' },
  { value: '70%', label: '70% - Redução da atividade, mas capaz de trabalho leve.' },
  { value: '60%', label: '60% - Redução significativa, necessidade ocasional de auxílio.' },
  { value: '50%', label: '50% - Principalmente sentado/deitado, doença extensa.' },
  { value: '40%', label: '40% - Principalmente na cama, incapaz de trabalho leve.' },
  { value: '30%', label: '30% - Totalmente acamado, necessidade total de cuidados.' },
  { value: '20%', label: '20% - Totalmente acamado, boca seca, sonolento.' },
  { value: '10%', label: '10% - Totalmente acamado, muito sonolento ou comatoso.' },
  { value: '0%', label: '0% - Morte.' },
];

const PpsScale: React.FC<PpsScaleProps> = ({ value, onChange }) => {
  const [suggestion, setSuggestion] = useState('');
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const handleGetSuggestion = async () => {
    const selectedOption = ppsOptions.find(opt => opt.value === value);
    if (!selectedOption) return;

    setIsSuggestionLoading(true);
    setSuggestion('');
    setSuggestionError(null);
    try {
      const result = await generateCarePlanSuggestion('PPS', { score: selectedOption.value, risk: selectedOption.label });
      setSuggestion(result);
    } catch (e: any) {
      setSuggestionError(getErrorMessage(e));
    } finally {
      setIsSuggestionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="pps-scale" className="block text-sm font-medium text-slate-600 mb-1">
          Selecione o nível de performance do paciente:
        </label>
        <select
          id="pps-scale"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Selecione...</option>
          {ppsOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="text-center border-t pt-4">
        <button
          onClick={handleGetSuggestion}
          disabled={isSuggestionLoading || !value}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          <i className="fas fa-wand-magic-sparkles"></i>
          {isSuggestionLoading ? 'Gerando...' : 'Sugerir Cuidados Paliativos com IA'}
        </button>
      </div>
      
      {(isSuggestionLoading || suggestionError || suggestion) && (
        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="font-bold text-indigo-800 mb-2">Plano de Cuidados Sugerido pela IA</h4>
          {isSuggestionLoading && <p className="text-slate-600">Analisando o nível de performance e gerando sugestões...</p>}
          {suggestionError && <p className="text-red-600">{suggestionError}</p>}
          {suggestion && <div className="text-sm text-slate-700 whitespace-pre-wrap font-mono prose prose-sm">{suggestion}</div>}
        </div>
      )}
    </div>
  );
};

export default PpsScale;
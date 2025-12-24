
import React, { useMemo, useState } from 'react';
import { MorseData } from '../../types';
import { generateCarePlanSuggestion, getErrorMessage } from '../../services/geminiService';

interface MorseScaleProps {
  data: MorseData | null;
  onChange: (data: MorseData) => void;
}

type MorseCategory = keyof MorseData;

const options: Record<MorseCategory, { label: string; points: { score: number; text: string }[] }> = {
  history: {
    label: 'Histórico de Quedas',
    points: [
      { score: 0, text: 'Não' },
      { score: 25, text: 'Sim' },
    ],
  },
  diagnosis: {
    label: 'Diagnóstico Secundário',
    points: [
      { score: 0, text: 'Não' },
      { score: 15, text: 'Sim' },
    ],
  },
  ambulatoryAid: {
    label: 'Auxílio na Deambulação',
    points: [
      { score: 0, text: 'Nenhum / Acamado / Auxílio de enfermagem' },
      { score: 15, text: 'Muletas / Bengala / Andador' },
      { score: 30, text: 'Mobiliário' },
    ],
  },
  ivTherapy: {
    label: 'Terapia Endovenosa / Cateter',
    points: [
      { score: 0, text: 'Não' },
      { score: 20, text: 'Sim' },
    ],
  },
  gait: {
    label: 'Marcha',
    points: [
      { score: 0, text: 'Normal / Acamado / Cadeira de rodas' },
      { score: 10, text: 'Fraca' },
      { score: 20, text: 'Comprometida / Cambaleante' },
    ],
  },
  mentalStatus: {
    label: 'Estado Mental',
    points: [
      { score: 0, text: 'Orientado / Consciente de suas limitações' },
      { score: 15, text: 'Superestima / Esquece limitações' },
    ],
  },
};

const RiskGauge: React.FC<{ value: number; color: string; }> = ({ value, color }) => (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
);


const MorseScale: React.FC<MorseScaleProps> = ({ data, onChange }) => {
  const [suggestion, setSuggestion] = useState('');
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const handleChange = (category: MorseCategory, score: number) => {
    onChange({
      ...(data || { history: 0, diagnosis: 0, ambulatoryAid: 0, ivTherapy: 0, gait: 0, mentalStatus: 0 }),
      [category]: score,
    });
  };

  const { totalScore, riskLevel, riskColor, riskValue } = useMemo(() => {
    if (!data) return { totalScore: 0, riskLevel: 'N/A', riskColor: 'bg-slate-400', riskValue: 0 };
    const total = (data.history || 0) + (data.diagnosis || 0) + (data.ambulatoryAid || 0) + (data.ivTherapy || 0) + (data.gait || 0) + (data.mentalStatus || 0);
    
    let risk = 'N/A';
    let color = 'bg-slate-400';
    let value = 0;

    if (total >= 45) { risk = 'Alto Risco'; color = 'bg-red-500'; value = 90; }
    else if (total >= 25) { risk = 'Médio Risco'; color = 'bg-orange-500'; value = 50; }
    else { risk = 'Baixo Risco'; color = 'bg-green-500'; value = 20; }
    
    return { totalScore: total, riskLevel: risk, riskColor: color, riskValue: value };
  }, [data]);

  const handleGetSuggestion = async () => {
      setIsSuggestionLoading(true);
      setSuggestion('');
      setSuggestionError(null);
      try {
          const result = await generateCarePlanSuggestion('Morse', { score: totalScore, risk: riskLevel });
          setSuggestion(result);
      } catch (e: any) {
          setSuggestionError(getErrorMessage(e));
      } finally {
          setIsSuggestionLoading(false);
      }
  };


  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Object.keys(options) as MorseCategory[]).map(key => (
          <div key={key}>
            <label className="block text-sm font-bold text-slate-700 mb-2">{options[key].label}</label>
            <div role="radiogroup" className="flex flex-col space-y-2">
              {options[key].points.map(point => (
                 <button
                    key={point.score}
                    type="button"
                    role="radio"
                    aria-checked={data?.[key] === point.score}
                    onClick={() => handleChange(key, point.score)}
                    className={`w-full text-left p-3 border rounded-lg transition-all duration-150 text-sm ${
                        data?.[key] === point.score
                        ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-400 shadow'
                        : 'bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                >
                    <span className="font-medium text-slate-800">{point.text}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 border-t pt-4 space-y-4">
            <div className="flex items-center justify-between gap-4 bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-4">
                    <span className="font-semibold text-slate-600">Pontuação Total:</span>
                    <span className="text-2xl font-bold text-cyan-700">{totalScore}</span>
                </div>
                <div className="flex-1">
                    <RiskGauge value={riskValue} color={riskColor} />
                </div>
                <div className="w-40 text-right">
                    <span className={`px-3 py-1 text-sm font-bold text-white ${riskColor} rounded-full`}>{riskLevel}</span>
                </div>
            </div>
            <div className="text-center">
                <button
                    onClick={handleGetSuggestion}
                    disabled={isSuggestionLoading || !data}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    <i className="fas fa-wand-magic-sparkles"></i>
                    {isSuggestionLoading ? 'Gerando...' : 'Sugerir Prevenções de Queda com IA'}
                </button>
            </div>
             {(isSuggestionLoading || suggestionError || suggestion) && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h4 className="font-bold text-indigo-800 mb-2">Plano de Cuidados Sugerido pela IA</h4>
                    {isSuggestionLoading && <p className="text-slate-600">Analisando o risco e gerando sugestões...</p>}
                    {suggestionError && <p className="text-red-600">{suggestionError}</p>}
                    {suggestion && <div className="text-sm text-slate-700 whitespace-pre-wrap font-mono prose prose-sm">{suggestion}</div>}
                </div>
            )}
        </div>
    </div>
  );
};

export default MorseScale;
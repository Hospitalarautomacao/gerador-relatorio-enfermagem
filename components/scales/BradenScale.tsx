
import React, { useMemo, useState } from 'react';
import { BradenData } from '../../types';
import { generateCarePlanSuggestion, getErrorMessage } from '../../services/geminiService';

interface BradenScaleProps {
  data: BradenData | null;
  onChange: (data: BradenData) => void;
}

type BradenCategory = keyof BradenData;

const options: Record<BradenCategory, { label: string; points: { score: number; text: string }[] }> = {
  sensory: {
    label: 'Percepção Sensorial',
    points: [
      { score: 1, text: '1. Completamente limitado' },
      { score: 2, text: '2. Muito limitado' },
      { score: 3, text: '3. Ligeiramente limitado' },
      { score: 4, text: '4. Nenhuma limitação' },
    ],
  },
  moisture: {
    label: 'Umidade',
    points: [
      { score: 1, text: '1. Constantemente úmido' },
      { score: 2, text: '2. Muito úmido' },
      { score: 3, text: '3. Ocasionalmente úmido' },
      { score: 4, text: '4. Raramente úmido' },
    ],
  },
  activity: {
    label: 'Atividade',
    points: [
      { score: 1, text: '1. Acamado' },
      { score: 2, text: '2. Confinado à cadeira' },
      { score: 3, text: '3. Anda ocasionalmente' },
      { score: 4, text: '4. Anda frequentemente' },
    ],
  },
  mobility: {
    label: 'Mobilidade',
    points: [
      { score: 1, text: '1. Completamente imóvel' },
      { score: 2, text: '2. Muito limitado' },
      { score: 3, text: '3. Ligeiramente limitado' },
      { score: 4, text: '4. Nenhuma limitação' },
    ],
  },
  nutrition: {
    label: 'Nutrição',
    points: [
      { score: 1, text: '1. Muito pobre' },
      { score: 2, text: '2. Provavelmente inadequada' },
      { score: 3, text: '3. Adequada' },
      { score: 4, text: '4. Excelente' },
    ],
  },
  friction: {
    label: 'Fricção e Cisalhamento',
    points: [
      { score: 1, text: '1. Problema' },
      { score: 2, text: '2. Problema potencial' },
      { score: 3, text: '3. Sem problema aparente' },
    ],
  },
};

const RiskGauge: React.FC<{ value: number; color: string; }> = ({ value, color }) => (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
);

const BradenScale: React.FC<BradenScaleProps> = ({ data, onChange }) => {
  const [suggestion, setSuggestion] = useState('');
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const handleChange = (category: BradenCategory, score: number) => {
    onChange({
      ...(data || { sensory: 0, moisture: 0, activity: 0, mobility: 0, nutrition: 0, friction: 0 }),
      [category]: score,
    });
  };

  const { totalScore, riskLevel, riskColor, riskValue } = useMemo(() => {
    if (!data) return { totalScore: 0, riskLevel: 'N/A', riskColor: 'bg-slate-400', riskValue: 0 };
    const total = (data.sensory || 0) + (data.moisture || 0) + (data.activity || 0) + (data.mobility || 0) + (data.nutrition || 0) + (data.friction || 0);
    
    let risk = 'N/A';
    let color = 'bg-slate-400';
    let value = 0;

    if (total > 0) {
        if (total >= 19) { risk = 'Sem Risco'; color = 'bg-green-500'; value = 10; }
        else if (total >= 15) { risk = 'Risco Leve'; color = 'bg-yellow-500'; value = 30; }
        else if (total >= 13) { risk = 'Risco Moderado'; color = 'bg-orange-500'; value = 60; }
        else if (total >= 10) { risk = 'Risco Alto'; color = 'bg-red-500'; value = 80; }
        else { risk = 'Risco Muito Alto'; color = 'bg-red-700'; value = 100; }
    } else {
        risk = 'Não preenchido';
    }
    return { totalScore: total, riskLevel: risk, riskColor: color, riskValue: value };
  }, [data]);

  const handleGetSuggestion = async () => {
      if (totalScore === 0) return;
      setIsSuggestionLoading(true);
      setSuggestion('');
      setSuggestionError(null);
      try {
          const result = await generateCarePlanSuggestion('Braden', { score: totalScore, risk: riskLevel });
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
        {(Object.keys(options) as BradenCategory[]).map(key => (
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
                  disabled={isSuggestionLoading || totalScore === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                  <i className="fas fa-wand-magic-sparkles"></i>
                  {isSuggestionLoading ? 'Gerando...' : 'Sugerir Plano de Cuidados com IA'}
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

export default BradenScale;
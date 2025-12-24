
import React from 'react';
import { AbemidData } from '../../types';

interface AbemidScaleProps {
  data: AbemidData | null;
  onChange: (data: AbemidData) => void;
}

const abemidClassifications = [
  'Cuidados Mínimos',
  'Cuidados Intermediários',
  'Alta Dependência',
  'Cuidados Semi-Intensivos',
  'Cuidados Intensivos',
];

const AbemidScale: React.FC<AbemidScaleProps> = ({ data, onChange }) => {
  
  const handleInputChange = (field: keyof AbemidData, value: string) => {
    onChange({
      ...(data || { score: '', classification: '' }),
      [field]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="abemid-score" className="block text-sm font-medium text-slate-600 mb-1">
          Pontuação (Opcional)
        </label>
        <input
          type="text"
          id="abemid-score"
          value={data?.score || ''}
          onChange={(e) => handleInputChange('score', e.target.value)}
          placeholder="Ex: 15"
          className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      <div>
        <label htmlFor="abemid-classification" className="block text-sm font-medium text-slate-600 mb-1">
          Classificação de Complexidade
        </label>
        <select
          id="abemid-classification"
          value={data?.classification || ''}
          onChange={(e) => handleInputChange('classification', e.target.value)}
          className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Selecione a classificação...</option>
          {abemidClassifications.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
};

export default AbemidScale;

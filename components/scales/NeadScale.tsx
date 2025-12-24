
import React from 'react';
import { NeadData } from '../../types';

interface NeadScaleProps {
  data: NeadData | null;
  onChange: (data: NeadData) => void;
}

const neadClassifications = [
  'Dependência Mínima',
  'Dependência Parcial',
  'Dependência Extensa',
  'Dependência Total',
];

const NeadScale: React.FC<NeadScaleProps> = ({ data, onChange }) => {
  
  const handleInputChange = (field: keyof NeadData, value: string) => {
    onChange({
      ...(data || { score: '', classification: '' }),
      [field]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="nead-score" className="block text-sm font-medium text-slate-600 mb-1">
          Pontuação (Opcional)
        </label>
        <input
          type="text"
          id="nead-score"
          value={data?.score || ''}
          onChange={(e) => handleInputChange('score', e.target.value)}
          placeholder="Ex: 10"
          className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
        />
      </div>
      <div>
        <label htmlFor="nead-classification" className="block text-sm font-medium text-slate-600 mb-1">
          Nível de Dependência
        </label>
         <select
          id="nead-classification"
          value={data?.classification || ''}
          onChange={(e) => handleInputChange('classification', e.target.value)}
          className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Selecione o nível...</option>
          {neadClassifications.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
};

export default NeadScale;

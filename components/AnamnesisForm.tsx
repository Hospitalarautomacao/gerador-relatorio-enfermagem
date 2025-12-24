
import React from 'react';
import type { ReportData, FormErrors } from '../types';
import RichTextEditor from './ui/RichTextEditor';

interface AnamnesisFormProps {
  data: Pick<ReportData, 'patientHistory' | 'patientCid' | 'patientDiagnosis' | 'pain' | 'painLocation' | 'painAggravating' | 'painAlleviating' | 'painSummary'>;
  onInputChange: (field: 'patientHistory' | 'patientCid' | 'painSummary', value: string) => void;
  onPainChange: (value: string) => void;
  onMultiSelect: (field: keyof ReportData, value: string) => void;
  errors: FormErrors;
  onSuggestCid: () => void;
  isSuggestingCid: boolean;
  onSummarizePain: () => void;
  isSummarizingPain: boolean;
}

const PainCheckbox: React.FC<{
    label: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
}> = ({ label, value, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 transition-colors">
        <input
            type="checkbox"
            checked={checked}
            onChange={() => onChange(value)}
            className="h-5 w-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
        />
        <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
);

const PainFactorSelector: React.FC<{
    title: string;
    options: string[];
    selected: string[];
    onSelect: (value: string) => void;
}> = ({ title, options, selected, onSelect }) => (
    <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2">{title}</h4>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onSelect(option)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        selected.includes(option)
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

const AnamnesisForm: React.FC<AnamnesisFormProps> = ({ 
    data, onInputChange, onPainChange, onMultiSelect, errors, 
    onSuggestCid, isSuggestingCid,
    onSummarizePain, isSummarizingPain
}) => {
  const painIntensityOptions = [
    { label: 'Nega Dor', value: 'nega queixas álgicas' },
    { label: 'Refere Dor Leve', value: 'refere dor de leve intensidade' },
    { label: 'Refere Dor Moderada', value: 'refere dor de moderada intensidade' },
    { label: 'Refere Dor Intensa', value: 'refere dor de intensa intensidade' },
  ];
  
  const painLocationOptions = ['Cabeça', 'Tórax', 'Abdômen', 'Membros Superiores', 'Membros Inferiores', 'Dorso'];
  const painAggravatingOptions = ['Movimento', 'Tosse', 'Esforço', 'Palpação'];
  const painAlleviatingOptions = ['Repouso', 'Medicação', 'Posicionamento', 'Aplicação de calor/frio'];

  const isSuggestCidDisabled = isSuggestingCid || !data.patientDiagnosis;
  const isSummarizePainDisabled = isSummarizingPain || data.pain.length === 0 || data.pain.includes('nega queixas álgicas');

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
        <i className="fas fa-book-medical mr-2 text-cyan-600"></i>
        Anamnese e Histórico do Paciente
      </h2>
      
      <div className="mb-4">
        <label htmlFor="patientCid" className="block text-sm font-medium text-slate-600 mb-1">CID-10</label>
        <div className="flex items-start gap-2">
            <div className="flex-grow">
                <input
                    type="text"
                    id="patientCid"
                    name="patientCid"
                    value={data.patientCid}
                    onChange={(e) => onInputChange('patientCid', e.target.value)}
                    placeholder="Ex: I10"
                    className={`w-full p-2 bg-white border rounded-md transition duration-150 ${errors.patientCid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-cyan-500 focus:border-cyan-500'}`}
                    aria-invalid={!!errors.patientCid}
                    aria-describedby={errors.patientCid ? 'patientCid-error' : undefined}
                />
                {errors.patientCid && <p id="patientCid-error" className="text-red-600 text-xs mt-1">{errors.patientCid}</p>}
            </div>
             <div title={!data.patientDiagnosis ? "Preencha o Diagnóstico Principal para habilitar a sugestão." : "Sugerir CID-10 com base no Diagnóstico"}>
                <button
                    type="button"
                    onClick={onSuggestCid}
                    disabled={isSuggestCidDisabled}
                    className="h-[42px] px-4 inline-flex items-center justify-center bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isSuggestingCid ? (
                        <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                        <i className="fas fa-wand-magic-sparkles"></i>
                    )}
                </button>
             </div>
        </div>
        {!data.patientDiagnosis && <p className="text-xs text-slate-500 mt-1">Preencha o Diagnóstico Principal na seção 'Identificação' para usar a sugestão de IA.</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="patientHistory" className="block text-sm font-medium text-slate-600 mb-1">Histórico do Paciente</label>
        <p className="text-sm text-slate-500 mb-2">
          Registre aqui o histórico clínico relevante, comorbidades, alergias, cirurgias prévias e outras informações importantes.
        </p>
        <RichTextEditor
          value={data.patientHistory}
          onChange={(value) => onInputChange('patientHistory', value)}
          placeholder="Ex: Paciente hipertenso, diabético tipo 2, com histórico de IAM há 5 anos. Alérgico a penicilina..."
        />
      </div>

      <div className="pt-4 border-t">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-bold text-slate-700">Avaliação da Dor</h3>
            <div title={isSummarizePainDisabled ? "Selecione um nível de dor para habilitar." : "Gerar resumo da avaliação da dor com IA"}>
                <button
                    type="button"
                    onClick={onSummarizePain}
                    disabled={isSummarizePainDisabled}
                    className="px-3 py-1 text-xs bg-indigo-100 text-indigo-800 font-semibold rounded-md hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSummarizingPain ? (
                        <>
                            <i className="fas fa-spinner fa-spin mr-1"></i>
                            Gerando...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-wand-magic-sparkles mr-1"></i>
                            Resumir com IA
                        </>
                    )}
                </button>
            </div>
        </div>
        
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Intensidade</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {painIntensityOptions.map(option => (
                        <PainCheckbox
                            key={option.value}
                            label={option.label}
                            value={option.value}
                            checked={data.pain.includes(option.value)}
                            onChange={onPainChange}
                        />
                    ))}
                </div>
            </div>

            <PainFactorSelector
                title="Localização"
                options={painLocationOptions}
                selected={data.painLocation || []}
                onSelect={(value) => onMultiSelect('painLocation', value)}
            />

            <PainFactorSelector
                title="Fatores Agravantes"
                options={painAggravatingOptions}
                selected={data.painAggravating || []}
                onSelect={(value) => onMultiSelect('painAggravating', value)}
            />

            <PainFactorSelector
                title="Fatores Aliviantes"
                options={painAlleviatingOptions}
                selected={data.painAlleviating || []}
                onSelect={(value) => onMultiSelect('painAlleviating', value)}
            />
        </div>

        <div className="mt-4">
            <label htmlFor="painSummary" className="block text-sm font-medium text-slate-600 mb-1">
                Resumo da Avaliação da Dor (Gerado por IA)
            </label>
            <RichTextEditor
                value={data.painSummary}
                onChange={(value) => onInputChange('painSummary', value)}
                placeholder={isSummarizingPain ? "Gerando resumo..." : "O resumo da avaliação da dor aparecerá aqui após a análise da IA. Você também pode editar manualmente."}
                readOnly={isSummarizingPain}
            />
        </div>
    </div>

    </div>
  );
};

export default AnamnesisForm;

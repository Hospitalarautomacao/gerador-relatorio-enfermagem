
import React from 'react';
import type { ReportData, FormErrors } from '../types';
import InputField from './ui/InputField';

interface PatientInfoFormProps {
  data: Pick<ReportData, 'patientName' | 'patientAge' | 'patientBed' | 'patientDiagnosis' | 'patientCid' | 'professionalName' | 'coren' | 'dataAdmissao' | 'horaAdmissao' | 'patientObservations' | 'patientAllergies'>;
  onInputChange: (field: keyof ReportData, value: string) => void;
  errors: FormErrors;
  onSuggestCid?: () => void;
  isSuggestingCid?: boolean;
}

const PatientInfoForm: React.FC<PatientInfoFormProps> = ({ data, onInputChange, errors, onSuggestCid, isSuggestingCid }) => {
  
  const { dataAdmissao, horaAdmissao } = data;
  let lengthOfStay = '';
  if (dataAdmissao) {
    // Combine date and time, defaulting to midnight if time is not provided
    const admissionDateTimeString = `${dataAdmissao}T${horaAdmissao || '00:00:00'}`;
    const admissionDateTime = new Date(admissionDateTimeString);
    const now = new Date();

    // Ensure the date is valid and in the past
    if (!isNaN(admissionDateTime.getTime()) && admissionDateTime <= now) {
      const diffTime = now.getTime() - admissionDateTime.getTime();
      // Add 1ms to handle the exact moment of admission, rounding up to the first day.
      const diffDays = Math.ceil((diffTime + 1) / (1000 * 60 * 60 * 24));
      lengthOfStay = `${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    }
  }
  
  return (
    <div className="bg-white p-5 rounded-xl shadow border-l-4 border-cyan-500">
      <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Identificação do Paciente</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
            id="patientName"
            label="Nome do Paciente (ou iniciais)"
            placeholder="Ex: J.S.S."
            value={data.patientName}
            onChange={(e) => onInputChange('patientName', e.target.value)}
            error={errors.patientName}
            className="placeholder-slate-300"
        />
        <div className="grid grid-cols-2 gap-4">
             <InputField
                id="patientAge"
                label="Idade"
                placeholder="Ex: 45"
                value={data.patientAge}
                onChange={(e) => onInputChange('patientAge', e.target.value)}
                error={errors.patientAge}
            />
            <InputField
                id="patientBed"
                label="Leito"
                placeholder="Ex: 201-A"
                value={data.patientBed}
                onChange={(e) => onInputChange('patientBed', e.target.value)}
                error={errors.patientBed}
            />
        </div>
        
        {/* Linha Diagnóstico + CID + IA */}
        <div className="md:col-span-1 flex gap-2 items-end">
            <div className="flex-grow">
                <InputField
                    id="patientDiagnosis"
                    label="Diagnóstico Principal"
                    placeholder="Ex: Pós-operatório..."
                    value={data.patientDiagnosis}
                    onChange={(e) => onInputChange('patientDiagnosis', e.target.value)}
                    error={errors.patientDiagnosis}
                />
            </div>
            
            <div className="w-24">
                <label htmlFor="patientCid" className="block text-sm font-medium text-slate-600 mb-1">CID-10</label>
                <input
                    id="patientCid"
                    type="text"
                    value={data.patientCid || ''}
                    onChange={(e) => onInputChange('patientCid', e.target.value)}
                    placeholder="Ex: I10"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 font-mono text-sm uppercase"
                />
            </div>

            {onSuggestCid && (
                <button
                    onClick={onSuggestCid}
                    disabled={isSuggestingCid || !data.patientDiagnosis}
                    className="mb-[1px] h-[42px] px-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-sm border border-indigo-200"
                    title="Sugerir CID via IA"
                >
                    {isSuggestingCid ? (
                        <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                        <i className="fas fa-wand-magic-sparkles"></i>
                    )}
                </button>
            )}
        </div>

         <div className="md:col-span-1">
             <label htmlFor="patientAllergies" className="flex items-center text-sm font-bold text-red-600 mb-1">
                <i className="fas fa-exclamation-circle mr-2"></i>
                Alergias
            </label>
             <input
                id="patientAllergies"
                value={data.patientAllergies || ''}
                onChange={(e) => onInputChange('patientAllergies', e.target.value)}
                placeholder="Nega / Dipirona / Iodo..."
                className="w-full p-2 bg-red-50 border border-red-300 text-red-900 rounded-md focus:ring-2 focus:ring-red-500 placeholder-red-300 font-medium"
            />
         </div>

        <div className="grid grid-cols-2 gap-4">
            <InputField
                id="dataAdmissao"
                label="Data de Admissão"
                value={data.dataAdmissao}
                onChange={(e) => onInputChange('dataAdmissao', e.target.value)}
                error={errors.dataAdmissao}
                type="date"
            />
             <InputField
                id="horaAdmissao"
                label="Hora de Admissão"
                value={data.horaAdmissao}
                onChange={(e) => onInputChange('horaAdmissao', e.target.value)}
                error={errors.horaAdmissao}
                type="time"
            />
        </div>

        {lengthOfStay && (
            <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-600 mb-1">Tempo de Internação</label>
                <div className="w-full p-2 bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-medium flex items-center gap-2">
                    <i className="fas fa-clock text-slate-400"></i>
                    {lengthOfStay}
                </div>
            </div>
        )}
        
        <div className="md:col-span-2 pt-4 mt-2 border-t">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Dados do Profissional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputField
                    id="professionalName"
                    label="Seu Nome"
                    placeholder="Ex: Enf. Maria Souza"
                    value={data.professionalName}
                    onChange={(e) => onInputChange('professionalName', e.target.value)}
                    error={errors.professionalName}
                />
                <InputField
                    id="coren"
                    label="Seu COREN"
                    placeholder="Ex: COREN-SP 123456-AE"
                    value={data.coren}
                    onChange={(e) => onInputChange('coren', e.target.value)}
                    error={errors.coren}
                />
            </div>
        </div>

        <div className="md:col-span-2">
            <label htmlFor="patientObservations" className="flex items-center text-sm font-medium text-slate-600 mb-1">
                <i className="fas fa-eye mr-2 text-cyan-600"></i>
                Observações Adicionais / Precauções
            </label>
            <textarea
                id="patientObservations"
                value={data.patientObservations}
                onChange={(e) => onInputChange('patientObservations', e.target.value)}
                placeholder="Preferências, contatos familiares, precauções de contato, etc."
                className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-150"
                rows={3}
            ></textarea>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoForm;


import React from 'react';

interface PatientContextHeaderProps {
  patientName: string;
  patientAge: string;
  patientBed: string;
  patientDiagnosis: string;
}

const InfoPill: React.FC<{ icon: string; label: string; value: string; }> = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2">
            <i className={`fas ${icon} text-cyan-600 dark:text-cyan-400`}></i>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}:</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{value}</span>
        </div>
    );
};

const PatientContextHeader: React.FC<PatientContextHeaderProps> = ({
  patientName,
  patientAge,
  patientBed,
  patientDiagnosis,
}) => {
    const hasPatientData = patientName || patientAge || patientBed || patientDiagnosis;

    if (!hasPatientData) {
        return (
             <div className="bg-amber-50 border-b border-amber-200 p-2 text-center text-sm text-amber-800 dark:bg-amber-900/50 dark:border-amber-800 dark:text-amber-300">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Nenhum paciente selecionado. Preencha os dados na seção 'Identificação' para começar.
            </div>
        );
    }

  return (
    <div className="relative z-20 bg-white shadow-sm border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
      <div className="container mx-auto px-4 py-2 md:px-6 flex items-center justify-between flex-wrap gap-x-6 gap-y-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            <i className="fas fa-user-circle mr-2 text-slate-500 dark:text-slate-400"></i>
            {patientName || 'Paciente não identificado'}
        </h3>
        <div className="flex items-center gap-x-6 gap-y-2 flex-wrap">
            <InfoPill icon="fa-birthday-cake" label="Idade" value={patientAge ? `${patientAge} anos` : ''} />
            <InfoPill icon="fa-bed" label="Leito" value={patientBed} />
            <InfoPill icon="fa-stethoscope" label="Diagnóstico" value={patientDiagnosis} />
        </div>
      </div>
    </div>
  );
};

export default PatientContextHeader;

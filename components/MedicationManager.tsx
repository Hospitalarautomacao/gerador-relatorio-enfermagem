
import React from 'react';
import { Medication } from '../types';

interface MedicationManagerProps {
  medications: Medication[];
  onUpdate: (medications: Medication[]) => void;
  onAdd: () => void;
  onOpenPrescriptionModal: () => void;
}

const MedicationManager: React.FC<MedicationManagerProps> = ({ medications, onUpdate, onAdd, onOpenPrescriptionModal }) => {
  
  const handleRemoveMedication = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este medicamento da lista?")) {
      onUpdate(medications.filter(med => med.id !== id));
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
        <i className="fas fa-pills mr-2 text-cyan-600"></i>
        Medicamentos Administrados
      </h2>
      <div className="space-y-3">
        {medications.length > 0 ? medications.map((med) => (
            <div key={med.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50 hover:bg-slate-100 transition-colors">
                <div>
                    <p className="font-bold text-slate-800">{med.name || 'Medicamento não especificado'}</p>
                    <p className="text-sm text-slate-600">
                      {med.administrationTime ? `(${med.administrationTime}) ` : ''}
                      {`${med.dose || 's/ dose'} - ${med.route || 's/ via'} - ${med.frequency || 's/ frequência'}`}
                    </p>
                    {med.observation && (
                        <p className="text-xs text-slate-500 mt-1 italic">
                            <i className="fas fa-info-circle mr-1"></i> {med.observation}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => handleRemoveMedication(med.id)}
                    className="bg-red-100 text-red-600 hover:bg-red-200 font-bold py-2 px-3 rounded-md flex items-center justify-center transition-colors"
                    aria-label={`Remover ${med.name || 'medicamento'}`}
                >
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        )) : (
            <p className="text-center text-slate-500 py-4">Nenhum medicamento adicionado.</p>
        )}
      </div>
       <div className="mt-4 flex flex-wrap gap-3">
            <button
                onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700"
            >
                <i className="fas fa-plus"></i>
                Adicionar Manualmente
            </button>
             <button
                onClick={onOpenPrescriptionModal}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700"
            >
                <i className="fas fa-file-prescription"></i>
                Buscar Prescrição Eletrônica
            </button>
       </div>
    </div>
  );
};

export default MedicationManager;
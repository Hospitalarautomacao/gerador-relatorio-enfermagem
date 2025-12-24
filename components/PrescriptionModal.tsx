import React, { useState, useEffect } from 'react';
import { PrescribedMedication } from '../types';
import Modal from './Modal';
import { fetchPrescriptionsForPatient } from '../services/prescriptionService';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedications: (medications: Omit<PrescribedMedication, 'id'>[]) => void;
  patientName: string;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({ isOpen, onClose, onAddMedications, patientName }) => {
  const [prescriptions, setPrescriptions] = useState<PrescribedMedication[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadPrescriptions = async () => {
        setIsLoading(true);
        setError(null);
        setSelectedIds(new Set());
        try {
          const data = await fetchPrescriptionsForPatient(patientName);
          setPrescriptions(data);
        } catch (e) {
          setError('Não foi possível carregar a prescrição. Tente novamente.');
        } finally {
          setIsLoading(false);
        }
      };
      loadPrescriptions();
    }
  }, [isOpen, patientName]);

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddSelected = () => {
    const selectedMeds = prescriptions
      .filter(p => selectedIds.has(p.id))
      .map(({ id, ...rest }) => rest); // Remove o ID da prescrição, pois um novo será gerado
    onAddMedications(selectedMeds);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Prescrição Eletrônica (Simulação)"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
          <button 
            onClick={handleAddSelected} 
            className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700 disabled:bg-slate-400"
            disabled={selectedIds.size === 0}
          >
            Adicionar {selectedIds.size > 0 ? `${selectedIds.size} ` : ''}Medicamento(s)
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
          Esta é uma simulação de integração com um sistema de prescrição eletrônica. Selecione os medicamentos que foram administrados neste atendimento.
        </p>

        {isLoading && (
          <div className="flex items-center justify-center h-40">
            <i className="fas fa-spinner fa-spin text-3xl text-cyan-600"></i>
            <span className="ml-3 text-slate-600">Buscando prescrição...</span>
          </div>
        )}
        
        {error && <p className="text-center text-red-600">{error}</p>}
        
        {!isLoading && !error && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {prescriptions.map(med => (
              <label 
                key={med.id} 
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-150 ${selectedIds.has(med.id) ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-400' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(med.id)}
                  onChange={() => handleToggleSelection(med.id)}
                  className="h-5 w-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <div className="ml-4">
                  <p className="font-bold text-slate-800">{med.name}</p>
                  <p className="text-sm text-slate-600">{`${med.dose} - ${med.route} - ${med.frequency}`}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PrescriptionModal;

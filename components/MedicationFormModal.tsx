
import React, { useState, useEffect } from 'react';
import { Medication } from '../types';
import Modal from './Modal';
import InputField from './ui/InputField';

interface MedicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medication: Omit<Medication, 'id'>) => void;
  initialData?: Medication;
}

const MedicationFormModal: React.FC<MedicationFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    dose: '',
    route: '',
    frequency: '',
    administrationTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    observation: ''
  });

  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
             setFormData({
                name: initialData.name,
                dose: initialData.dose,
                route: initialData.route,
                frequency: initialData.frequency,
                administrationTime: initialData.administrationTime,
                observation: initialData.observation || ''
             });
        } else {
            setFormData({
                name: '',
                dose: '',
                route: '',
                frequency: '',
                administrationTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                observation: ''
            });
        }
        setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: 'Nome do medicamento é obrigatório' });
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Medicamento" : "Adicionar Medicamento Manualmente"}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
          <button onClick={handleSubmit} type="submit" form="med-form" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700">Salvar</button>
        </>
      }
    >
      <form id="med-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <InputField
                    id="name"
                    name="name"
                    label="Nome do Medicamento"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Dipirona Monohidratada"
                    error={errors.name}
                    required
                />
            </div>
            
            <InputField
                id="dose"
                name="dose"
                label="Dose"
                value={formData.dose}
                onChange={handleChange}
                placeholder="Ex: 1g, 500mg"
            />

            <div>
                <label htmlFor="route" className="block text-sm font-medium text-slate-600 mb-1">Via de Administração</label>
                <div className="relative">
                    <input 
                        list="routes-list" 
                        id="route" 
                        name="route" 
                        className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500" 
                        value={formData.route}
                        onChange={handleChange}
                        placeholder="Selecione ou digite..."
                    />
                    <datalist id="routes-list">
                        <option value="VO (Oral)" />
                        <option value="EV (Endovenosa)" />
                        <option value="IM (Intramuscular)" />
                        <option value="SC (Subcutânea)" />
                        <option value="SL (Sublingual)" />
                        <option value="SNE (Sonda)" />
                        <option value="Tópica" />
                        <option value="Inalatória" />
                        <option value="Ocular" />
                        <option value="Retal" />
                    </datalist>
                </div>
            </div>

            <InputField
                id="frequency"
                name="frequency"
                label="Frequência / Intervalo"
                value={formData.frequency}
                onChange={handleChange}
                placeholder="Ex: 6/6h, 1x ao dia"
            />

            <InputField
                id="administrationTime"
                name="administrationTime"
                label="Horário da Administração"
                type="time"
                value={formData.administrationTime}
                onChange={handleChange}
            />
        </div>

        <div>
            <label htmlFor="observation" className="block text-sm font-medium text-slate-600 mb-1">
                Observações / Preparo / Detalhes
            </label>
            <textarea
                id="observation"
                name="observation"
                value={formData.observation}
                onChange={handleChange}
                placeholder="Ex: Diluído em 10ml AD, Administrado lentamente. Paciente referiu dor local."
                className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 min-h-[80px]"
                rows={3}
            ></textarea>
            <p className="text-xs text-slate-500 mt-1">
                Registre aqui detalhes sobre diluição, tempo de infusão ou reações imediatas.
            </p>
        </div>
      </form>
    </Modal>
  );
};

export default MedicationFormModal;

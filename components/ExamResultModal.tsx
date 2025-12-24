
import React, { useState, useEffect } from 'react';
import { ExamResult } from '../types';
import Modal from './Modal';
import InputField from './ui/InputField';

interface ExamResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (exam: Omit<ExamResult, 'id' | 'patientName'> & { id?: string }) => void;
    exam: ExamResult | null;
}

const ExamResultModal: React.FC<ExamResultModalProps> = ({ isOpen, onClose, onSave, exam }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'lab' as 'lab' | 'imaging',
        date: new Date().toISOString().split('T')[0], // Default to today
        result: '',
    });
    const [errors, setErrors] = useState<{ name?: string; date?: string; }>({});

    useEffect(() => {
        if (exam) {
            setFormData({
                name: exam.name,
                type: exam.type,
                date: exam.date,
                result: exam.result,
            });
        } else {
            setFormData({
                name: '',
                type: 'lab',
                date: new Date().toISOString().split('T')[0],
                result: '',
            });
        }
        setErrors({});
    }, [exam, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors: { name?: string; date?: string; } = {};
        if (!formData.name.trim()) {
            newErrors.name = 'O nome do exame é obrigatório.';
        }
        if (!formData.date) {
            newErrors.date = 'A data do exame é obrigatória.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({ id: exam?.id, ...formData });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={exam ? 'Editar Exame/Laudo' : 'Adicionar Exame/Laudo'}
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                    <button onClick={handleSubmit} type="submit" form="exam-result-form" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700">Salvar</button>
                </>
            }
        >
            <form id="exam-result-form" onSubmit={handleSubmit} className="space-y-4">
                <InputField
                    id="name"
                    name="name"
                    label="Nome do Exame"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Ex: Hemograma Completo, Raio-X de Tórax"
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-slate-600 mb-1">Tipo</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-cyan-500"
                        >
                            <option value="lab">Laboratorial</option>
                            <option value="imaging">Imagem</option>
                        </select>
                    </div>
                    <InputField
                        id="date"
                        name="date"
                        label="Data do Exame"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        error={errors.date}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="result" className="block text-sm font-medium text-slate-600 mb-1">Resultado / Laudo</label>
                    <textarea
                        id="result"
                        name="result"
                        value={formData.result}
                        onChange={handleChange}
                        placeholder="Insira os valores, laudo ou observações relevantes..."
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        rows={5}
                    ></textarea>
                </div>
            </form>
        </Modal>
    );
};

export default ExamResultModal;

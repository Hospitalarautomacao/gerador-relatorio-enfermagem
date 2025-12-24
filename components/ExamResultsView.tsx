
import React, { useState, useMemo } from 'react';
import { ExamResult } from '../types';
import ExamResultModal from './ExamResultModal';

interface ExamResultsViewProps {
    exams: ExamResult[];
    onSave: (exam: Omit<ExamResult, 'id'> & { id?: string }) => void;
    onDelete: (examId: string) => void;
    currentPatientName: string;
}

const ExamCard: React.FC<{ exam: ExamResult; onEdit: () => void; onDelete: () => void; }> = ({ exam, onEdit, onDelete }) => {
    const formattedDate = new Date(exam.date + 'T00:00:00').toLocaleDateString('pt-BR');

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-slate-800">{exam.name}</p>
                    <p className="text-sm text-slate-500">{formattedDate}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={onEdit} className="text-cyan-600 hover:text-cyan-800" title="Editar Exame"><i className="fas fa-edit"></i></button>
                    <button onClick={onDelete} className="text-red-500 hover:text-red-700" title="Excluir Exame"><i className="fas fa-trash"></i></button>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-sm text-slate-600 whitespace-pre-wrap font-mono bg-slate-50 p-2 rounded-md max-h-24 overflow-y-auto">{exam.result || 'Nenhum resultado inserido.'}</p>
            </div>
        </div>
    );
};

const ExamResultsView: React.FC<ExamResultsViewProps> = ({ exams, onSave, onDelete, currentPatientName }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<ExamResult | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenModal = (exam: ExamResult | null = null) => {
        setEditingExam(exam);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingExam(null);
        setIsModalOpen(false);
    };

    const handleSave = (exam: Omit<ExamResult, 'id' | 'patientName'> & { id?: string }) => {
        onSave({ ...exam, patientName: currentPatientName });
        handleCloseModal();
    };

    const filteredExams = useMemo(() => {
        return exams
            .filter(exam => exam.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [exams, searchTerm]);

    const labExams = filteredExams.filter(e => e.type === 'lab');
    const imagingExams = filteredExams.filter(e => e.type === 'imaging');

    if (!currentPatientName) {
         return (
            <div className="bg-white p-5 rounded-xl shadow text-center">
                <i className="fas fa-user-slash text-4xl text-slate-300 mb-4"></i>
                <h2 className="text-xl font-bold text-slate-700">Nenhum Paciente Selecionado</h2>
                <p className="text-slate-500 mt-2">Por favor, preencha as informações do paciente na aba 'Identificação' para gerenciar os exames.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white p-5 rounded-xl shadow">
                <div className="flex justify-between items-center mb-4 border-b pb-2 flex-wrap gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            <i className="fas fa-vial mr-2 text-cyan-600"></i>
                            Exames e Laudos
                        </h2>
                        <p className="text-sm text-slate-500">
                            Histórico de resultados laboratoriais e de imagem para: <span className="font-bold">{currentPatientName}</span>
                        </p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700 flex items-center gap-2">
                        <i className="fas fa-plus"></i>
                        Adicionar Exame
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Buscar por nome do exame..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-6 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                />

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-3"><i className="fas fa-microscope mr-2 text-indigo-500"></i>Exames Laboratoriais</h3>
                        {labExams.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {labExams.map(exam => (
                                    <ExamCard key={exam.id} exam={exam} onEdit={() => handleOpenModal(exam)} onDelete={() => onDelete(exam.id)} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-4">Nenhum exame laboratorial registrado.</p>
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-3"><i className="fas fa-x-ray mr-2 text-rose-500"></i>Exames de Imagem</h3>
                        {imagingExams.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {imagingExams.map(exam => (
                                    <ExamCard key={exam.id} exam={exam} onEdit={() => handleOpenModal(exam)} onDelete={() => onDelete(exam.id)} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-4">Nenhum exame de imagem registrado.</p>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <ExamResultModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    exam={editingExam}
                />
            )}
        </>
    );
};

export default ExamResultsView;

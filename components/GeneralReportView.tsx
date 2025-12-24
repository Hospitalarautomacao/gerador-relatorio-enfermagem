
import React, { useState } from 'react';
import { SavedReport } from '../types';
import { exportReportsToCSV } from '../utils/exportUtils';
import ReportDetailModal from './ReportDetailModal';

interface GeneralReportViewProps {
    savedReports: SavedReport[];
}

const GeneralReportView: React.FC<GeneralReportViewProps> = ({ savedReports }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

    const filteredReports = savedReports.filter(report =>
        report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.patientDiagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = (format: 'csv' | 'email' | 'drive') => {
        setIsExportMenuOpen(false);
        switch (format) {
            case 'csv':
                exportReportsToCSV(savedReports, `relatorios_gerais_${new Date().toISOString().split('T')[0]}.csv`);
                break;
            case 'email':
                alert("Funcionalidade 'Enviar por E-mail' ainda não implementada.");
                break;
            case 'drive':
                alert("Funcionalidade 'Salvar no Drive' ainda não implementada.");
                break;
        }
    };
    
    const handleViewDetails = (report: SavedReport) => {
        setSelectedReport(report);
        setIsDetailModalOpen(true);
    };

    const getBradenRisk = (report: SavedReport) => {
        if (!report.braden) return 'N/A';
        const total = Object.values(report.braden).reduce((a, b) => a + b, 0);
        if (total >= 19) return 'Sem risco';
        if (total >= 15) return 'Risco leve';
        if (total >= 13) return 'Risco moderado';
        if (total >= 10) return 'Risco alto';
        return 'Risco muito alto';
    };

    const getMorseRisk = (report: SavedReport) => {
        if (!report.morse) return 'N/A';
        const total = Object.values(report.morse).reduce((a, b) => a + b, 0);
        if (total >= 45) return 'Alto risco';
        if (total >= 25) return 'Médio risco';
        return 'Baixo risco';
    };


    return (
        <>
            <div className="bg-white p-5 rounded-xl shadow">
                <div className="flex justify-between items-center mb-4 border-b pb-2 flex-wrap gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            <i className="fas fa-archive mr-2 text-cyan-600"></i>
                            Relatório Geral (SAD)
                        </h2>
                        <p className="text-sm text-slate-500">
                            Visualize e exporte todos os relatórios de enfermagem salvos.
                        </p>
                    </div>
                    <div className="relative">
                        <button 
                            onClick={() => setIsExportMenuOpen(v => !v)}
                            className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-700 flex items-center gap-2"
                        >
                            <i className="fas fa-file-export"></i>
                            Exportar
                            <i className={`fas fa-chevron-down ml-2 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`}></i>
                        </button>
                        {isExportMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                                    <i className="fas fa-file-csv text-green-600"></i> Exportar para CSV
                                </button>
                                <button onClick={() => handleExport('email')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                                    <i className="fas fa-envelope text-blue-600"></i> Enviar por E-mail
                                </button>
                                 <button onClick={() => handleExport('drive')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                                    <i className="fab fa-google-drive text-yellow-500"></i> Salvar no Drive
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="Buscar por paciente, profissional ou diagnóstico..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-4 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                />

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Paciente</th>
                                <th scope="col" className="px-6 py-3">Profissional</th>
                                <th scope="col" className="px-6 py-3">Risco de LPP (Braden)</th>
                                <th scope="col" className="px-6 py-3">Risco de Queda (Morse)</th>
                                <th scope="col" className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.length > 0 ? filteredReports.map(report => (
                                <tr key={report.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4">{new Date(report.savedAt).toLocaleString('pt-BR')}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900">{report.patientName}</th>
                                    <td className="px-6 py-4">{report.professionalName}</td>
                                    <td className="px-6 py-4">{getBradenRisk(report)}</td>
                                    <td className="px-6 py-4">{getMorseRisk(report)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => handleViewDetails(report)} className="font-medium text-cyan-600 hover:underline" title="Visualizar Detalhes">
                                            <i className="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-500">
                                        Nenhum relatório salvo encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {isDetailModalOpen && selectedReport && (
                <ReportDetailModal
                    report={selectedReport}
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                />
            )}
        </>
    );
};

export default GeneralReportView;
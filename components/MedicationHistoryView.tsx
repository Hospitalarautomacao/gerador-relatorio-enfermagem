
import React from 'react';
import { SavedReport, Medication } from '../types';

interface MedicationHistoryViewProps {
  savedReports: SavedReport[];
  currentPatientName: string;
}

interface GroupedMedications {
  [date: string]: Medication[];
}

const getRouteIcon = (route: string) => {
    if (!route) return 'fa-pills';
    const r = route.toLowerCase();
    if (r.includes('oral')) return 'fa-capsules';
    if (r.includes('intravenosa') || r.includes('iv')) return 'fa-syringe';
    if (r.includes('subcutânea') || r.includes('sc')) return 'fa-syringe';
    if (r.includes('intramuscular') || r.includes('im')) return 'fa-syringe';
    if (r.includes('tópica')) return 'fa-hand-dots';
    if (r.includes('inalatória')) return 'fa-inhaler';
    return 'fa-pills'; // default
};

const MedicationHistoryView: React.FC<MedicationHistoryViewProps> = ({ savedReports, currentPatientName }) => {
    
    const medicationHistory = React.useMemo(() => {
        if (!currentPatientName) return {};

        const patientReports = savedReports.filter(
            report => report.patientName.toLowerCase() === currentPatientName.toLowerCase()
        );
        
        const grouped: GroupedMedications = {};

        patientReports.forEach(report => {
            if (report.medications && report.medications.length > 0) {
                const reportDateStr = new Date(report.savedAt).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                });

                if (!grouped[reportDateStr]) {
                    grouped[reportDateStr] = [];
                }
                
                grouped[reportDateStr].push(...report.medications);
            }
        });

        // Sort medications within each day by time
        for (const date in grouped) {
            grouped[date].sort((a, b) => (a.administrationTime || '00:00').localeCompare(b.administrationTime || '00:00'));
        }
        
        return grouped;
    }, [savedReports, currentPatientName]);

    const sortedDates = React.useMemo(() => {
        const dateMap = new Map<string, number>();
        savedReports.forEach(report => {
            if (report.medications && report.medications.length > 0) {
                 const reportDateStr = new Date(report.savedAt).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                });
                const timestamp = new Date(report.savedAt).getTime();
                if (!dateMap.has(reportDateStr) || timestamp > dateMap.get(reportDateStr)!) {
                    dateMap.set(reportDateStr, timestamp);
                }
            }
        });
        return Object.keys(medicationHistory).sort((a, b) => (dateMap.get(b) || 0) - (dateMap.get(a) || 0));
    }, [medicationHistory, savedReports]);


    if (!currentPatientName) {
        return (
            <div className="bg-white p-5 rounded-xl shadow text-center">
                <i className="fas fa-user-slash text-4xl text-slate-300 mb-4"></i>
                <h2 className="text-xl font-bold text-slate-700">Nenhum Paciente Selecionado</h2>
                <p className="text-slate-500 mt-2">Por favor, preencha as informações do paciente na aba 'Identificação' para ver o histórico de medicação.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
                <i className="fas fa-clock-rotate-left mr-2 text-cyan-600"></i>
                Histórico de Medicação de <span className="text-cyan-700">{currentPatientName}</span>
            </h2>

            {sortedDates.length === 0 ? (
                 <div className="text-center py-10">
                    <i className="fas fa-pills text-4xl text-slate-300 mb-4"></i>
                    <p className="text-slate-500">Nenhum medicamento registrado para este paciente.</p>
                </div>
            ) : (
                <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
                    {sortedDates.map(date => (
                        <div key={date}>
                            <h3 className="font-bold text-lg text-slate-700 mb-3 bg-slate-100 p-2 rounded-md sticky top-0 z-10">
                                {date}
                            </h3>
                            <ul className="space-y-2">
                                {medicationHistory[date].map((med, index) => {
                                    const routeIcon = getRouteIcon(med.route);
                                    return (
                                        <li key={`${med.id}-${index}`} className="p-3 border rounded-lg bg-slate-50/50 flex items-start">
                                            <div className="w-16 text-center">
                                                <span className="text-sm font-semibold text-cyan-700 bg-cyan-100 px-2 py-1 rounded-full block">
                                                    <i className="fas fa-clock mr-1"></i>
                                                    {med.administrationTime}
                                                </span>
                                            </div>
                                            <div className="ml-4 flex-grow">
                                                <p className="font-bold text-slate-800 flex items-center">
                                                    <i className={`fas ${routeIcon} mr-3 text-slate-500`} title={`Via ${med.route}`}></i>
                                                    {med.name}
                                                </p>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    <span className="font-semibold">Dose:</span> {med.dose} | <span className="font-semibold">Via:</span> {med.route} | <span className="font-semibold">Frequência:</span> {med.frequency}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
  };

  export default MedicationHistoryView;
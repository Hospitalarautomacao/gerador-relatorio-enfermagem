
import React, { useMemo, ReactNode } from 'react';
import { SavedReport } from '../types';

interface FamilyPortalViewProps {
  savedReports: SavedReport[];
  currentPatientName: string;
}

// FIX: Added explicit types for the component's props to fix TypeScript inference errors.
const InfoCard: React.FC<{ icon: string; title: string; children: ReactNode; colorClass?: string }> = ({ icon, title, children, colorClass = 'bg-cyan-500' }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
            <span className={`w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center mr-3`}>
                <i className={`fas ${icon}`}></i>
            </span>
            {title}
        </h3>
        <div className="text-sm text-slate-600 flex-grow">{children}</div>
    </div>
);

const CommunicationLog = () => (
    <div className="space-y-4">
        {/* Sample Messages */}
        <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">ENF</div>
            <div>
                <p className="font-bold text-slate-800">Enf. Maria Souza <span className="text-xs font-normal text-slate-500 ml-2">Hoje, 09:15</span></p>
                <div className="bg-slate-100 p-3 rounded-lg mt-1">
                    <p>Bom dia, Sra. Ana. O paciente passou a noite bem, sem queixas de dor. A pressão arterial está estável em 125/82 mmHg. Estamos à disposição para qualquer dúvida.</p>
                </div>
            </div>
        </div>
        <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">AS</div>
            <div>
                <p className="font-bold text-slate-800">Ana Silva (Familiar) <span className="text-xs font-normal text-slate-500 ml-2">Hoje, 09:22</span></p>
                <div className="bg-indigo-50 p-3 rounded-lg mt-1">
                    <p>Obrigada pela atualização, Maria! Fico muito mais tranquila. Ele aceitou bem o café da manhã?</p>
                </div>
            </div>
        </div>
        {/* Message Input */}
        <div className="pt-4 mt-4 border-t">
             <textarea
                placeholder="Digite sua mensagem aqui..."
                className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                rows={3}
            ></textarea>
            <button className="mt-2 w-full md:w-auto float-right px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700">
                <i className="fas fa-paper-plane mr-2"></i>
                Enviar Mensagem
            </button>
        </div>
    </div>
);


const FamilyPortalView: React.FC<FamilyPortalViewProps> = ({ savedReports, currentPatientName }) => {

    const patientReports = useMemo(() => {
        if (!currentPatientName) return [];
        return savedReports
            .filter(report => report.patientName.toLowerCase() === currentPatientName.toLowerCase())
            .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    }, [savedReports, currentPatientName]);

    const latestReport = patientReports[0];

    if (!currentPatientName) {
        return (
            <div className="bg-white p-5 rounded-xl shadow text-center">
                <i className="fas fa-user-slash text-4xl text-slate-300 mb-4"></i>
                <h2 className="text-xl font-bold text-slate-700">Nenhum Paciente Selecionado</h2>
                <p className="text-slate-500 mt-2">Por favor, preencha as informações do paciente na aba 'Identificação' para visualizar o portal.</p>
            </div>
        );
    }

    if (!latestReport) {
        return (
             <div className="bg-white p-5 rounded-xl shadow text-center">
                <i className="fas fa-file-alt text-4xl text-slate-300 mb-4"></i>
                <h2 className="text-xl font-bold text-slate-700">Nenhum Relatório Encontrado</h2>
                <p className="text-slate-500 mt-2">Ainda não há relatórios salvos para <span className="font-bold">{currentPatientName}</span>.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow">
                <h2 className="text-2xl font-bold text-slate-800">
                    <i className="fas fa-hospital-user mr-3 text-cyan-600"></i>
                    Portal do Paciente: <span className="text-cyan-700">{currentPatientName}</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Informações atualizadas sobre o cuidado e bem-estar do paciente.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <InfoCard icon="fa-notes-medical" title="Resumo do Dia">
                    <p className="font-semibold">Estado Geral: <span className="font-normal">{latestReport.generalState || 'Não informado'}</span></p>
                    <p className="font-semibold">Nível de Consciência: <span className="font-normal">{latestReport.consciousness?.join(', ') || 'Não informado'}</span></p>
                    <p className="font-semibold">Dor: <span className="font-normal">{latestReport.pain?.includes('nega queixas álgicas') ? 'Nega dor' : 'Presente'}</span></p>
                    <p className="font-semibold">Dieta: <span className="font-normal">{latestReport.nutrition?.dietType || 'Não informada'}</span></p>
                </InfoCard>

                 <InfoCard icon="fa-heart-pulse" title="Últimos Sinais Vitais" colorClass="bg-rose-500">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <p><strong>PA:</strong> {latestReport.bloodPressure || '--'}</p>
                        <p><strong>Pulso:</strong> {latestReport.pulse || '--'} bpm</p>
                        <p><strong>Temp:</strong> {latestReport.temperature || '--'} °C</p>
                        <p><strong>Sat O₂:</strong> {latestReport.saturation || '--'} %</p>
                    </div>
                </InfoCard>

                <InfoCard icon="fa-info-circle" title="Informações Gerais">
                    <p><strong>Leito:</strong> {latestReport.patientBed}</p>
                    <p><strong>Diagnóstico:</strong> {latestReport.patientDiagnosis}</p>
                    <p><strong>Profissional:</strong> {latestReport.professionalName}</p>
                </InfoCard>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InfoCard icon="fa-comments" title="Comunicações" colorClass="bg-indigo-500">
                    <CommunicationLog />
                </InfoCard>
                <InfoCard icon="fa-history" title="Últimos Relatórios" colorClass="bg-slate-500">
                    <ul className="space-y-3">
                        {patientReports.slice(0, 5).map(report => (
                             <li key={report.id} className="p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                <p className="font-bold text-slate-800">
                                    Relatório de {new Date(report.savedAt).toLocaleString('pt-BR')}
                                </p>
                                <p className="text-xs text-slate-500">por {report.professionalName}</p>
                            </li>
                        ))}
                    </ul>
                </InfoCard>
             </div>
        </div>
    );
};

export default FamilyPortalView;
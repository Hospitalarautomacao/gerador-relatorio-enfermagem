

import React from 'react';
import { SavedReport } from '../types';
import Modal from './Modal';

interface ReportDetailModalProps {
    report: SavedReport;
    isOpen: boolean;
    onClose: () => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode; isEmpty?: boolean }> = ({ title, children, isEmpty = false }) => {
    if (isEmpty) return null;
    return (
        <div>
            <h4 className="text-md font-bold text-cyan-700 mb-2 border-b border-cyan-100 pb-1">{title}</h4>
            <div className="text-sm text-slate-700 space-y-1">{children}</div>
        </div>
    );
};

const DetailItem: React.FC<{ label: string; value?: string | string[] | null }> = ({ label, value }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return <p><span className="font-semibold">{label}:</span> {displayValue}</p>;
};


const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Detalhes do Relatório - ${report.patientName}`}
            footer={<button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Fechar</button>}
        >
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <DetailSection title="Identificação">
                    <DetailItem label="Paciente" value={report.patientName} />
                    <DetailItem label="Idade" value={`${report.patientAge} anos`} />
                    <DetailItem label="Leito" value={report.patientBed} />
                    <DetailItem label="Diagnóstico" value={report.patientCid ? `${report.patientDiagnosis} (CID: ${report.patientCid})` : report.patientDiagnosis} />
                    <DetailItem label="Admissão" value={new Date(`${report.dataAdmissao}T${report.horaAdmissao}`).toLocaleString('pt-BR')} />
                    <DetailItem label="Profissional" value={`${report.professionalName} (${report.coren})`} />
                    <DetailItem label="Observações" value={report.patientObservations} />
                </DetailSection>

                <DetailSection title="Avaliação Clínica">
                    <DetailItem label="Estado Geral" value={report.generalState} />
                    <DetailItem label="Consciência" value={report.consciousness} />
                    <DetailItem label="Respiração" value={report.respiration} />
                    <DetailItem label="Pele e Mucosas" value={report.skin} />
                    <DetailItem label="Deambulação" value={report.mobility} />
                    <DetailItem label="Dor (Intensidade)" value={report.pain} />
                    <DetailItem label="Dor (Localização)" value={report.painLocation} />
                    <DetailItem label="Dor (Agravantes)" value={report.painAggravating} />
                    <DetailItem label="Dor (Aliviantes)" value={report.painAlleviating} />
                    <DetailItem label="Eliminações" value={report.eliminations} />
                </DetailSection>

                <DetailSection title="Sinais Vitais">
                    <DetailItem label="PA" value={report.bloodPressure} />
                    <DetailItem label="Pulso" value={report.pulse} />
                    <DetailItem label="FC" value={report.heartRate} />
                    <DetailItem label="Temperatura" value={report.temperature} />
                    <DetailItem label="Saturação O₂" value={report.saturation} />
                    <DetailItem label="O₂ (L/min)" value={report.oxygen ? `${report.oxygen} via ${report.oxygenSupportType || 'N/A'}` : null} />
                    <DetailItem label="Glicemia" value={report.glycemia} />
                </DetailSection>

                <DetailSection title="Procedimentos" isEmpty={report.procedures.length === 0}>
                    <ul className="list-disc pl-5">
                        {report.procedures.map((proc, i) => <li key={i}>{proc}</li>)}
                    </ul>
                </DetailSection>

                <DetailSection title="Materiais Consumidos" isEmpty={!report.consumedStock || report.consumedStock.length === 0}>
                    <ul className="list-disc pl-5">
                        {report.consumedStock?.map((item, i) => (
                            <li key={i}>{item.itemName}: {item.quantityConsumed} {item.unit}</li>
                        ))}
                    </ul>
                </DetailSection>
            </div>
        </Modal>
    );
};

export default ReportDetailModal;
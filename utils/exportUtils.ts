

import { SavedReport, ConsumptionLog } from '../types';

const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) {
        return '';
    }
    const str = String(value);
    // If the string contains a comma, double quote, or newline, wrap it in double quotes
    // and escape any existing double quotes by doubling them.
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};


export const exportReportsToCSV = (reports: SavedReport[], filename: string): void => {
    if (reports.length === 0) {
        alert("Não há relatórios para exportar.");
        return;
    }

    const headers = [
        'ID', 'Data_Salvamento', 'Paciente_Nome', 'Paciente_Idade', 'Leito',
        'Diagnostico', 'CID', 'Data_Admissao', 'Hora_Admissao', 'Profissional_Nome', 'COREN',
        'Estado_Geral', 'Consciencia', 'Respiracao', 'Pele_Mucosas', 'Deambulacao',
        'Eliminacoes', 'Dor_Intensidade', 'Dor_Localizacao', 'Dor_Agravantes', 'Dor_Aliviantes',
        'PA', 'Pulso', 'FC', 'Temp', 'SatO2', 'O2', 'CO2', 'Glicemia',
        'Dieta_Tipo', 'Medicamentos', 'Dispositivos', 'Procedimentos', 
        'Braden_Score', 'Braden_Risco', 'Morse_Score', 'Morse_Risco', 'PPS', 'ABEMID_Score', 'ABEMID_Classificacao',
        'Materiais_Consumidos'
    ];

    const csvRows = [headers.join(',')];

    for (const report of reports) {
        let bradenTotal = '', bradenRisk = '';
        if (report.braden) {
            bradenTotal = String(Object.values(report.braden).reduce((a, b) => a + b, 0));
            const total = Number(bradenTotal);
            if (total >= 19) bradenRisk = 'Sem risco';
            else if (total >= 15) bradenRisk = 'Risco leve';
            else if (total >= 13) bradenRisk = 'Risco moderado';
            else if (total >= 10) bradenRisk = 'Risco alto';
            else bradenRisk = 'Risco muito alto';
        }
        
        let morseTotal = '', morseRisk = '';
        if (report.morse) {
            morseTotal = String(Object.values(report.morse).reduce((a, b) => a + b, 0));
            const total = Number(morseTotal);
            if (total >= 45) morseRisk = 'Alto risco';
            else if (total >= 25) morseRisk = 'Médio risco';
            else morseRisk = 'Baixo risco';
        }

        const consumedStockString = report.consumedStock
            .map(c => `${c.itemName} (${c.quantityConsumed} ${c.unit})`)
            .join('; ');

        const row = [
            report.id,
            new Date(report.savedAt).toLocaleString('pt-BR'),
            report.patientName,
            report.patientAge,
            report.patientBed,
            report.patientDiagnosis,
            report.patientCid,
            report.dataAdmissao,
            report.horaAdmissao,
            report.professionalName,
            report.coren,
            report.generalState,
            report.consciousness.join('; '),
            report.respiration,
            report.skin.join('; '),
            report.mobility.join('; '),
            report.eliminations.join('; '),
            report.pain.join('; '),
            report.painLocation.join('; '),
            report.painAggravating.join('; '),
            report.painAlleviating.join('; '),
            report.bloodPressure,
            report.pulse,
            report.heartRate,
            report.temperature,
            report.saturation,
            report.oxygen,
            report.co2,
            report.glycemia,
            report.nutrition.dietType,
            report.medications.map(m => m.name).join('; '),
            report.devices.map(d => d.name).join('; '),
            report.procedures.join('; '),
            bradenTotal,
            bradenRisk,
            morseTotal,
            morseRisk,
            report.pps,
            report.abemid?.score || '',
            report.abemid?.classification || '',
            consumedStockString,
        ].map(escapeCSV);
        csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const exportConsumptionHistoryToCSV = (history: ConsumptionLog[], filename: string): void => {
    if (history.length === 0) {
        alert("Não há histórico para exportar.");
        return;
    }

    const headers = ['Data_Hora', 'Item_Nome', 'Quantidade_Consumida', 'Unidade', 'Usuario'];
    const csvRows = [headers.join(',')];

    for (const log of history) {
        const row = [
            new Date(log.timestamp).toLocaleString('pt-BR'),
            log.itemName,
            log.quantityConsumed,
            log.unit,
            log.user
        ].map(escapeCSV);
        csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
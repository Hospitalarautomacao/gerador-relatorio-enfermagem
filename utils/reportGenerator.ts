
import { ReportData } from '../types';

export const generateFullReportText = (data: ReportData): string => {
    const parts: string[] = [];
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // 1. Cabeçalho / Admissão
    let header = `Plantão iniciado às ${timestamp}. Paciente ${data.patientName || 'não identificado'}`;
    if (data.patientBed) header += `, leito ${data.patientBed}`;
    if (data.patientDiagnosis) header += `, HD: ${data.patientDiagnosis}`;
    if (data.generalState) header += `. Encontra-se em ${data.generalState} estado geral`;
    if (data.consciousness && data.consciousness.length > 0) header += `, ${data.consciousness.join(', ').toLowerCase()}`;
    parts.push(header + '.');

    // 2. Sinais Vitais (Prioridade)
    const vitals: string[] = [];
    if (data.bloodPressure) vitals.push(`PA: ${data.bloodPressure} mmHg`);
    if (data.heartRate) vitals.push(`FC: ${data.heartRate} bpm`);
    if (data.temperature) vitals.push(`Tax: ${data.temperature}°C`);
    if (data.saturation) vitals.push(`SatO2: ${data.saturation}%`);
    if (data.oxygen) vitals.push(`em uso de O2 (${data.oxygen} L/min via ${data.oxygenSupportType || 'dispositivo não especificado'})`);
    else if (data.saturation) vitals.push('em ar ambiente');
    if (data.glycemia) vitals.push(`HGT: ${data.glycemia} mg/dL`);
    
    if (vitals.length > 0) {
        parts.push(`Sinais vitais mantidos: ${vitals.join(', ')}.`);
    }

    // 3. Exame Físico Específico
    const physical: string[] = [];
    if (data.respiration) physical.push(`Padrão respiratório: ${data.respiration}`);
    if (data.skin && data.skin.length > 0) physical.push(`Pele/Mucosas: ${data.skin.join(', ').toLowerCase()}`);
    if (data.pupils && data.pupils.length > 0) physical.push(`Pupilas: ${data.pupils.join(', ').toLowerCase()}`);
    if (data.pain && data.pain.length > 0 && !data.pain.includes('nega queixas álgicas')) {
        let painText = `Queixa álgica: ${data.pain.join(', ').toLowerCase()}`;
        if (data.painLocation.length > 0) painText += ` em ${data.painLocation.join(', ')}`;
        physical.push(painText);
    } else if (data.pain.includes('nega queixas álgicas')) {
        physical.push("Nega queixas álgicas no momento");
    }
    
    if (data.eliminations && data.eliminations.length > 0) {
        // Removido "presentes" para acomodar termos como "Ausência de diurese"
        physical.push(`Eliminações: ${data.eliminations.join(', ').toLowerCase()}`);
    }
    
    if (physical.length > 0) {
        parts.push(physical.join('. ') + '.');
    }

    // 4. Nutrição
    if (data.nutrition) {
        let nutritionText = '';
        if (data.nutrition.dietType) nutritionText += `Dieta: ${data.nutrition.dietType}`;
        const consumedMeals = data.nutrition.meals.filter(m => m.completed);
        if (consumedMeals.length > 0) {
            nutritionText += `. Refeições ofertadas: ${consumedMeals.map(m => `${m.name} (Aceitação: ${m.acceptance}%)`).join(', ')}`;
        }
        if (nutritionText) parts.push(nutritionText + '.');
    }

    // 5. Procedimentos e Cuidados
    const procedures: string[] = [];
    
    if (data.procedures && data.procedures.length > 0) {
        procedures.push(`Procedimentos realizados: ${data.procedures.join(', ')}`);
    }
    
    // Lista detalhada de medicamentos com observações
    if (data.medications && data.medications.length > 0) {
        const medsList = data.medications.map(m => {
            let details = `${m.name} ${m.dose || ''} ${m.route || ''}`.trim();
            if (m.observation) {
                details += ` (Obs: ${m.observation})`;
            }
            return details;
        }).join(', ');
        procedures.push(`Medicações administradas: ${medsList}`);
    }
    
    if (data.devices && data.devices.length > 0) {
        procedures.push(`Mantido dispositivos: ${data.devices.map(d => d.name).join(', ')}`);
    }
    
    if (procedures.length > 0) {
        parts.push(procedures.join('. ') + '.');
    }

    // 6. Observações Livres
    if (data.customNotes) {
        parts.push(data.customNotes);
    }

    // 7. Fechamento
    parts.push("Segue sob cuidados de enfermagem.");

    return parts.join('\n\n');
};

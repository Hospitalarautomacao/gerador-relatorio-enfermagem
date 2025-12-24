
import { ReportData } from "../types";

export type VitalSignStatus = 'normal' | 'warning' | 'critical';

export interface VitalSignAnalysis {
    status: VitalSignStatus;
    message?: string;
}

export const analyzeVitalSign = (id: keyof ReportData, value: string): VitalSignAnalysis => {
    if (!value) return { status: 'normal' };

    // Helper to clean numbers (replace comma with dot)
    // Now also handles potential multiple dots if user messes up, taking the first valid float part
    const getNum = (val: string) => {
        if (!val) return NaN;
        const normalized = val.replace(',', '.');
        const parsed = parseFloat(normalized);
        return parsed;
    };

    switch (id) {
        case 'bloodPressure': {
            const parts = value.split('/');
            if (parts.length !== 2) return { status: 'normal' };
            // Need to handle potential spaces or non-numeric chars
            const sys = parseInt(parts[0].replace(/\D/g, ''), 10);
            const dia = parseInt(parts[1].replace(/\D/g, ''), 10);
            
            if (isNaN(sys) || isNaN(dia)) return { status: 'normal' };

            // Critical Ranges (Hypertensive Crisis / Severe Hypotension)
            if (sys >= 180 || dia >= 110) return { status: 'critical', message: 'Crise Hipertensiva' };
            if (sys < 80 || dia < 50) return { status: 'critical', message: 'Hipotensão Severa' };
            
            // Warning Ranges
            if (sys >= 140 || dia >= 90) return { status: 'warning', message: 'Hipertensão (Sistólica > 140 ou Diastólica > 90)' };
            if (sys < 100 || dia < 60) return { status: 'warning', message: 'Hipotensão' };

            return { status: 'normal' };
        }
        case 'pulse':
        case 'heartRate': {
            const num = getNum(value); // Use getNum instead of parseInt to be safe with formats
            if (isNaN(num)) return { status: 'normal' };

            // Critical
            if (num > 140) return { status: 'critical', message: 'Taquicardia Severa/Instável (> 140 bpm)' };
            if (num < 40) return { status: 'critical', message: 'Bradicardia Severa (< 40 bpm)' };

            // Warning
            if (num > 100) return { status: 'warning', message: 'Taquicardia (> 100 bpm)' };
            if (num < 60) return { status: 'warning', message: 'Bradicardia (< 60 bpm)' };

            return { status: 'normal' };
        }
        case 'temperature': {
            const num = getNum(value);
            if (isNaN(num)) return { status: 'normal' };

            // Critical
            if (num > 39.5) return { status: 'critical', message: 'Hipertermia/Febre Alta (> 39.5°C)' };
            if (num < 35) return { status: 'critical', message: 'Hipotermia (< 35°C)' };

            // Warning
            if (num >= 37.8) return { status: 'warning', message: 'Estado Febril/Febre' };
            if (num < 36) return { status: 'warning', message: 'Hipotermia Leve' };

            return { status: 'normal' };
        }
        case 'saturation': {
            const num = getNum(value);
            if (isNaN(num)) return { status: 'normal' };

            if (num < 85) return { status: 'critical', message: 'Hipoxemia Grave (< 85%)' };
            if (num < 92) return { status: 'warning', message: 'Hipoxemia / Dessaturação (< 92%)' };

            return { status: 'normal' };
        }
        case 'glycemia': {
            const num = getNum(value);
            if (isNaN(num)) return { status: 'normal' };

            if (num < 50) return { status: 'critical', message: 'Hipoglicemia Severa (< 50 mg/dL)' };
            if (num > 400) return { status: 'critical', message: 'Hiperglicemia Severa (> 400 mg/dL)' };
            
            if (num < 70) return { status: 'warning', message: 'Hipoglicemia' };
            if (num > 200) return { status: 'warning', message: 'Hiperglicemia' };

            return { status: 'normal' };
        }
        case 'co2': {
            const num = getNum(value);
            if (isNaN(num)) return { status: 'normal' };

            if (num < 25 || num > 55) return { status: 'warning', message: 'EtCO₂ fora da faixa normal (35-45)' };
            
            return { status: 'normal' };
        }
        case 'oxygen': {
            const num = getNum(value);
            if (isNaN(num)) return { status: 'normal' };
            
            if (num > 10) return { status: 'warning', message: 'Alto fluxo de O₂ (> 10 L/min)' };
            
            return { status: 'normal' };
        }
        default:
            return { status: 'normal' };
    }
};

// Deprecated: kept for backward compatibility if needed, but redirects to new logic
export const isValueCritical = (id: keyof ReportData, value: string): boolean => {
    const analysis = analyzeVitalSign(id, value);
    return analysis.status === 'critical';
};

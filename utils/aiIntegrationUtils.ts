
import { REPORT_OPTIONS, WOUND_CARE_OPTIONS } from '../constants';

export const generateSystemSchema = () => {
  // Base Schema Structure (OpenAPI 3.0 / JSON Schema Draft 7 Compatible)
  const schema = {
    title: "NursingReportSystem_API",
    description: "Definição completa da estrutura de dados para o Gerador de Relatório de Enfermagem. Utilize este schema para validar payloads de entrada ou configurar Agentes de IA.",
    version: "2.0.0",
    type: "object",
    required: ["patientIdentification", "vitalSigns", "clinicalAssessment"],
    properties: {
      patientIdentification: {
        type: "object",
        description: "Dados de identificação e admissão do paciente",
        properties: {
          patientName: { type: "string", description: "Nome completo ou iniciais", example: "J.S.A." },
          patientAge: { type: "string", description: "Idade", example: "45" },
          patientBed: { type: "string", description: "Leito ou Quarto", example: "204-B" },
          patientDiagnosis: { type: "string", description: "Diagnóstico médico principal", example: "Pneumonia Comunitária" },
          patientCid: { type: "string", description: "Código CID-10", example: "J18.9" },
          professionalName: { type: "string", description: "Nome do responsável técnico" },
          coren: { type: "string", description: "Registro no conselho de classe" }
        },
        required: ["patientName", "patientBed"]
      },
      vitalSigns: {
        type: "object",
        description: "Dados vitais aferidos no momento",
        properties: {
          bloodPressure: { type: "string", pattern: "^\\d{2,3}/\\d{2,3}$", description: "Pressão Arterial (mmHg)", example: "120/80" },
          heartRate: { type: "number", description: "Frequência Cardíaca (bpm)", minimum: 0, maximum: 300 },
          respiratoryRate: { type: "number", description: "Frequência Respiratória (irpm)", minimum: 0, maximum: 100 },
          temperature: { type: "number", description: "Temperatura Axilar (°C)", minimum: 25, maximum: 45 },
          saturation: { type: "number", description: "Saturação de Oxigênio (%)", minimum: 0, maximum: 100 },
          glycemia: { type: "number", description: "Glicemia Capilar (mg/dL)", minimum: 0, maximum: 1000 },
          painLevel: { 
            type: "string", 
            enum: ["Sem Dor", "Dor Leve", "Dor Moderada", "Dor Intensa"],
            description: "Nível de dor relatado"
          }
        }
      },
      clinicalAssessment: {
        type: "object",
        description: "Avaliação clínica padronizada baseada em seletores",
        properties: {} as any
      },
      safetyProtocols: {
        type: "object",
        description: "Checklist de Metas Internacionais de Segurança",
        properties: {
          patientIdentified: { type: "boolean", description: "Pulseira de identificação conferida" },
          allergyBracelet: { type: "boolean", description: "Sinalização de alergia presente" },
          fallRiskIdentified: { type: "boolean", description: "Risco de queda sinalizado" },
          sideRailsUp: { type: "boolean", description: "Grades elevadas" },
          handHygiene: { type: "boolean", description: "Higienização das mãos realizada" }
        }
      },
      fluidBalance: {
        type: "object",
        description: "Controle de ingeridos e eliminados (ml)",
        properties: {
          intakeTotal: { type: "number", description: "Soma de Oral + Parenteral" },
          outputTotal: { type: "number", description: "Soma de Diurese + Drenos + Emese" },
          balance: { type: "number", description: "Resultado (Ganhos - Perdas)" }
        }
      },
      medications: {
        type: "array",
        description: "Lista de medicamentos administrados",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Nome do fármaco" },
            dose: { type: "string", description: "Dosagem" },
            route: { type: "string", enum: ["VO", "EV", "IM", "SC", "Topica", "Ocular", "SNE"], description: "Via de administração" },
            frequency: { type: "string", description: "Intervalo (ex: 8/8h)" },
            time: { type: "string", description: "Horário da administração" }
          }
        }
      },
      scales: {
        type: "object",
        description: "Scores de escalas técnicas",
        properties: {
          bradenScore: { type: "number", min: 6, max: 23, description: "Risco de Lesão por Pressão" },
          morseScore: { type: "number", min: 0, max: 125, description: "Risco de Queda" },
          glasgowScore: { type: "number", min: 3, max: 15, description: "Nível de Consciência (se aplicável)" }
        }
      }
    }
  };

  // Dinamicamente popula os Enums baseados nas constantes do sistema (types.ts/constants.ts)
  // Isso garante que o Schema esteja sempre sincronizado com as opções da UI.
  REPORT_OPTIONS.forEach(option => {
    schema.properties.clinicalAssessment.properties[option.id] = {
      type: option.type === 'multi' ? "array" : "string",
      description: option.title,
      // Se for multi-select, os itens são strings de um enum. Se for single, o próprio campo é enum.
      ...(option.type === 'single' ? { enum: option.options.map(o => o.value) } : {}),
      items: option.type === 'multi' ? { type: "string", enum: option.options.map(o => o.value) } : undefined
    };
  });

  return JSON.stringify(schema, null, 2);
};

export const generateSystemPrompt = () => {
  let prompt = `ATUE COMO UM ASSISTENTE DE ENFERMAGEM SÊNIOR ESPECIALIZADO EM DOCUMENTAÇÃO CLÍNICA.
  
SUA BASE DE CONHECIMENTO (REGRAS DO SISTEMA):

1. TERMOS CLÍNICOS VÁLIDOS (Use estritamente estes valores para categorização):
`;

  REPORT_OPTIONS.forEach(cat => {
    prompt += `\n[${cat.title.toUpperCase()}]:\n`;
    cat.options.forEach(opt => {
      prompt += `  - "${opt.value}" (Contexto: ${opt.label})\n`;
    });
  });

  prompt += `\n2. PROTOCOLOS DE CURATIVO:
  - Agentes de Limpeza aceitos: ${WOUND_CARE_OPTIONS.cleansing.join(', ')}
  - Coberturas disponíveis: ${WOUND_CARE_OPTIONS.application.join(', ')}
  
3. LÓGICA DE ALERTAS CRÍTICOS (Sinais Vitais):
  - PA Sistólica: > 180 (Crise Hipertensiva) ou < 90 (Hipotensão) -> CRÍTICO.
  - Freq. Cardíaca: > 130 ou < 50 -> CRÍTICO.
  - Saturação O2: < 92% -> ALERTA (Verificar O2 suplementar).
  - Temperatura: > 37.8 (Febril) ou < 35 (Hipotermia).
  - Glicemia: < 70 (Hipoglicemia) ou > 250 (Hiperglicemia).

4. ESCALAS DE RISCO:
  - Braden <= 12: ALTO RISCO de lesão por pressão. Ação: "Mudança de decúbito rigorosa".
  - Morse >= 45: ALTO RISCO de queda. Ação: "Grades elevadas e supervisão".

SUA TAREFA:
- Receber anotações clínicas não estruturadas (texto livre ou transcrição de voz).
- Converter para o formato JSON estruturado definido no Schema.
- Corrigir ortografia de termos técnicos (ex: "Eupneico" em vez de "eupneico").
- Se faltar um dado vital (ex: PA), sinalize como "missing".
`;

  return prompt;
};

export const generateSupabaseFunctionTemplate = () => {
    return `
// supabase/functions/ai_nursing_handler/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Interface baseada no Schema do Sistema
interface NursingReportPayload {
  action: 'validate' | 'ingest' | 'analyze';
  data: any; // Mapeado para o JSON Schema
}

serve(async (req) => {
  const { action, data } = await req.json() as NursingReportPayload;

  // 1. Validação de Segurança (Schema Check)
  if (action === 'validate') {
    const alerts = [];
    
    // Regra de Negócio: Checagem de Sinais Vitais
    if (data.vitalSigns?.bloodPressure) {
        const [sys, dia] = data.vitalSigns.bloodPressure.split('/').map(Number);
        if (sys > 180 || dia > 110) alerts.push("ALERTA CRÍTICO: Paciente em Crise Hipertensiva. Notificar Médico.");
    }
    
    // Regra de Negócio: Checagem de Alergia
    if (data.patientIdentification?.patientAllergies && data.medications?.length > 0) {
        // Lógica simulada de interação medicamentosa
        alerts.push("AVISO: Verificar alergias cruzadas com as medicações administradas.");
    }

    return new Response(JSON.stringify({ 
      valid: true, 
      alerts,
      timestamp: new Date().toISOString() 
    }), { headers: { "Content-Type": "application/json" } })
  }

  // 2. Ingestão de Dados (Ex: Vindo de um Agente de Voz ou WhatsApp)
  if (action === 'ingest') {
    // Aqui você conectaria com o banco real:
    // const { error } = await supabase.from('reports').insert(data);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Relatório salvo no prontuário.",
      reportId: crypto.randomUUID()
    }), { headers: { "Content-Type": "application/json" } })
  }

  return new Response(JSON.stringify({ error: "Action not supported" }), { status: 400 })
})
    `;
}

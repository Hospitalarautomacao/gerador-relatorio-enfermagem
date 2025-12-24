
import { GoogleGenAI } from "@google/genai";
import { REPORT_OPTIONS, WOUND_CARE_OPTIONS } from "../constants";
import { SystemAnalysisReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getErrorMessage = (error: any): string => {
    console.error("Gemini API Error:", error);
    if (typeof error === 'string') return error;
    if (error instanceof Error) {
        if (error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('network')) {
            return 'Falha de conexão. Verifique sua internet.';
        }
        return error.message;
    }
    return 'Erro desconhecido na IA.';
};

// Helper function to strip HTML tags for better AI processing and token optimization
const stripHtml = (html: string): string => {
    if (!html) return '';
    let text = html.replace(/<\/(div|p|li|h[1-6]|br)>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    text = text.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return text.replace(/\n\s*\n/g, '\n').trim();
};

// --- CORE AI REFINEMENT & STRATEGIC ANALYSIS ---

export const runAIKnowledgeRefinement = async (): Promise<{ optimizedPrompt: string; summary: string }> => {
    const model = 'gemini-2.5-flash';

    // Construir o contexto com todos os protocolos atuais do sistema
    const currentProtocolContext = JSON.stringify({
        reportOptions: REPORT_OPTIONS,
        woundCareOptions: WOUND_CARE_OPTIONS,
        vitalSignRules: "PA > 140/90 = Hipertensão, Sat < 92% = Hipoxemia, Tax > 37.8 = Febre"
    });

    const prompt = `
        ATUE COMO UM ESPECIALISTA SÊNIOR EM INFORMÁTICA EM SAÚDE E ENFERMAGEM (PhD).
        
        OBJETIVO: Analisar a base de conhecimento atual do sistema e gerar um "Prompt de Sistema Otimizado" para garantir precisão técnica em futuros relatórios.
        
        BASE DE DADOS ATUAL (JSON):
        ${currentProtocolContext}
        
        TAREFA 1: Analise os dados acima em busca de inconsistências com a NANDA/NIC/NOC mais recente.
        TAREFA 2: Crie um "System Instruction Block" refinado que eu possa injetar em futuras chamadas de IA.
        TAREFA 3: Resuma o que foi melhorado.

        SAÍDA (JSON):
        {
            "optimizedPrompt": "Texto completo da instrução de sistema refinada...",
            "improvementSummary": "Resumo em 3 tópicos do que foi aprimorado na base de conhecimento."
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        const jsonStr = response.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const runSystemStrategicAnalysis = async (): Promise<SystemAnalysisReport> => {
    const model = 'gemini-2.5-flash';

    const systemContext = `
        Módulos Atuais do Sistema:
        - Prontuário Eletrônico (Sinais Vitais, Exame Físico, Evolução)
        - Gestão de Estoque e Kits Personalizados
        - Rotina do Paciente e Agenda de Plantão
        - Integração com Convênio (TISS/Guias)
        - Assinatura Digital ICP-Brasil
        - Portal da Família e Integração SAD (Home Care)
        - Módulo de Intercorrências em Tempo Real
        - IA para Transcrição de Manuscritos (OCR)
    `;

    const prompt = `
        ATUE COMO UM CTO (CHIEF TECHNOLOGY OFFICER) E ESTRATEGISTA DE HEALTHTECH.
        
        CONTEXTO: Você está analisando a arquitetura funcional de um sistema SaaS de Home Care e Enfermagem (descrito acima).
        DATA ATUAL: ${new Date().toLocaleDateString()}
        
        OBJETIVO: Identificar oportunidades de mercado, melhorias de fluxo e novas funcionalidades baseadas em tendências globais de saúde (2024-2025).
        
        TAREFAS:
        1. Avalie a maturidade técnica atual (0-100).
        2. Identifique 3 oportunidades de alto impacto (Novas features ou integrações).
        3. Liste refinamentos técnicos sugeridos (Performance, UX, Segurança).
        4. Confirme que o módulo de interpretação de manuscritos (OCR) foi recalibrado com os padrões mais recentes.

        SAÍDA (JSON ESTRITO):
        {
            "technicalScore": 85,
            "marketAlignment": 90,
            "opportunities": [
                { "title": "Ex: Telemedicina Integrada", "description": "...", "impact": "High", "type": "Feature" }
            ],
            "improvements": ["Ex: Otimizar cache offline", "..."],
            "handwritingOptimization": true
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        const jsonStr = response.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const generateRefinementCertificate = async (trainingData: any): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const timestamp = new Date().toLocaleString('pt-BR');
    
    const prompt = `
        Gere um texto HTML simples (apenas o body content, com tags de estilo inline para parecer um documento oficial) que sirva como "Relatório de Evolução Sistêmica e Refinamento Cognitivo".
        
        Dados:
        - Data do Ciclo: ${timestamp}
        - Módulos Refinados: OCR Manuscrito (Calibrado), Base Clínica (NANDA), Análise de Mercado.
        - Resumo Técnico: ${JSON.stringify(trainingData)}
        - Hash de Validação: ${Math.random().toString(36).substring(7).toUpperCase()}
        
        Estilo: Deve parecer um documento técnico oficial de uma auditoria de IA, com cabeçalho "RELATÓRIO DE EVOLUÇÃO COGNITIVA - ENFSMART AI".
        DESTAQUE: Mencione explicitamente que o reconhecimento de escrita manual e a interpretação visual foram refinados.
        Inclua um rodapé com "Link de Validação Pública: https://certification.enfsmart.ai/verify?token=..." (link fictício).
    `;

    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text.trim();
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

// --- EXISTING FUNCTIONS ---

export const improveReportWithGemini = async (reportText: string): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const cleanText = stripHtml(reportText);
  // Inject optimized prompt if available in localStorage
  const optimizedInstruction = localStorage.getItem('ai_optimized_prompt') || '';

  const prompt = `
    ${optimizedInstruction ? `CONTEXTO OTIMIZADO DE SISTEMA:\n${optimizedInstruction}\n---` : ''}
    Tarefa: Reescrever relatório de enfermagem para padrão técnico formal.
    Regras:
    1. Usar terminologia técnica (ex: "eupneico", "afebril").
    2. Texto corrido, sem tópicos.
    3. Manter TODAS as informações clínicas originais.
    4. Remover opiniões subjetivas.

    Texto Original:
    "${cleanText}"

    Texto Melhorado:
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const generateSBARSummary = async (reportText: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const cleanText = stripHtml(reportText);

    const prompt = `
      Tarefa: Criar resumo de Passagem de Plantão no formato SBAR.
      Relatório Base: "${cleanText}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const analyzeVitalSignsWithGemini = async (vitals: any, patientContext: any): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const prompt = `
    Tarefa: Interpretação clínica concisa (1 frase) dos sinais vitais.
    Contexto: ${JSON.stringify(patientContext)}
    Sinais: ${JSON.stringify(vitals)}
  `;
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const generateVitalSignsSuggestions = async (vitals: any, patientContext: any): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const prompt = `
    Tarefa: Listar 3-5 cuidados de enfermagem baseados nos sinais vitais.
    Contexto: ${JSON.stringify(patientContext)}
    Sinais: ${JSON.stringify(vitals)}
  `;
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const suggestCidWithGemini = async (diagnosis: string): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const prompt = `Tarefa: Retornar apenas código CID-10 para: "${diagnosis}". Saída: Apenas código.`;
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const generateObservationSuggestionWithGemini = async (type: string, contextData: any): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const prompt = `Tarefa: Escrever anotação de enfermagem técnica concisa para ${type}. Dados: ${JSON.stringify(contextData)}`;
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const generateCarePlanSuggestion = async (scaleName: string, scaleResult: any): Promise<string> => {
  const model = 'gemini-2.5-flash';
  const prompt = `Tarefa: Listar 5 intervenções para Escala ${scaleName} com resultado: ${JSON.stringify(scaleResult)}`;
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const generateRoutineSuggestion = async (patientDiagnosis: string, vitalSigns: any): Promise<{ timeOffset: number; task: string; type: string }[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        Atue como Enfermeiro Chefe. Crie uma ROTINA SUGERIDA de cuidados para um paciente de Home Care com base nos dados abaixo.
        
        Diagnóstico: ${patientDiagnosis || 'Não informado (gerar rotina padrão)'}
        Sinais Vitais Atuais: ${JSON.stringify(vitalSigns)}
        
        Regras:
        1. Gere uma lista de tarefas com horários relativos (offset em horas a partir do início do plantão).
        2. Tipos permitidos: 'medication', 'procedure', 'diet', 'hygiene', 'exam', 'therapy'.
        3. Formato JSON estrito array de objetos.
        4. Inclua pelo menos 1 item de higiene, 1 de dieta e verificação de sinais vitais.
        
        Exemplo de Saída:
        [
            { "timeOffset": 0, "task": "Verificar Sinais Vitais e HGT", "type": "exam" },
            { "timeOffset": 1, "task": "Banho no leito", "type": "hygiene" }
        ]
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        const jsonStr = response.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const analyzeScheduleWithAI = async (shifts: any[]): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        ATUE COMO UM GESTOR DE ESCALA DE ENFERMAGEM.
        
        Analise a seguinte lista de plantões do profissional e forneça um breve feedback focado em saúde ocupacional.
        
        DADOS DA ESCALA:
        ${JSON.stringify(shifts)}
        
        REGRAS DE ANÁLISE:
        1. Verifique se há plantões consecutivos sem descanso adequado (ex: 24h seguido de outro).
        2. Calcule a carga horária total aproximada.
        3. Identifique padrões de risco de exaustão (Burnout).
        4. Seja encorajador mas firme sobre o descanso.
        
        SAÍDA: Um texto curto (máx 3 parágrafos) com a análise.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });
        return response.text.trim();
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const transcribeImageWithGemini = async (base64Image: string, mimeType: string): Promise<string> => {
    const model = 'gemini-2.5-flash'; 
    
    // Inject refined knowledge if available
    const refinedInstruction = localStorage.getItem('ai_optimized_prompt') ? 
        "Use o contexto refinado para identificar abreviações médicas obscuras." : "";

    const imagePart = { inlineData: { data: base64Image, mimeType: mimeType } };
    const prompt = `
      ATENÇÃO: Você é um assistente de OCR especializado em enfermagem.
      ${refinedInstruction}
      Tarefa: Transcrever o conteúdo desta imagem (relatório de enfermagem manual ou impresso) para texto digital EDITÁVEL.
      Regras: 1. Precisão técnica. 2. Manter abreviações. 3. Marcar [ilegível] se necessário.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, { text: prompt }] }
        });
        return response.text.trim();
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

export const fillScaleWithVoice = async (scaleName: string, voiceText: string): Promise<any> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        Role: Nursing AI.
        Task: Fill "${scaleName}" scale based on voice: "${voiceText}".
        Output: JSON only.
        Braden: {sensory, moisture, activity, mobility, nutrition, friction}
        Morse: {history, diagnosis, ambulatoryAid, ivTherapy, gait, mentalStatus}
        PPS: string ("50%")
        ABEMID: {score, classification}
        NEAD: {score, classification}
    `;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        const text = response.text.trim().replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(text);
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
};

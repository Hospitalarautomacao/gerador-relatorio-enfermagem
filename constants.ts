
import { ReportOptionCategory, ReportData } from './types';

export const initialReportData: ReportData = {
  patientName: '', patientAge: '', patientBed: '', patientDiagnosis: '', 
  professionalName: '', coren: '', dataAdmissao: '', horaAdmissao: '', 
  patientAllergies: '', patientObservations: '',
  // History Fields
  patientHistory: '', patientCid: '', comorbidities: [], mainComplaint: '',
  // Vitals
  bloodPressure: '', pulse: '', heartRate: '', temperature: '', saturation: '', 
  glycemia: '', oxygen: '', co2: '',
  previousBloodPressure: '', previousPulse: '', previousHeartRate: '', 
  previousTemperature: '', previousSaturation: '', previousGlycemia: '', 
  previousOxygen: '', previousCo2: '',
  vitalSignsHistory: '', oxygenSupportType: '', vitalSignsAlerts: '', 
  oxygenUsageSummary: '', vitalSignsEvolution: '',
  generalState: '', consciousness: [], pupils: [], respiration: '', skin: [], 
  mobility: [], eliminations: [], pain: [], painLocation: [], 
  painAggravating: [], painAlleviating: [], painSummary: '',
  fluidBalance: {
    intakeOral: '', intakeParenteral: '', intakeOther: '', 
    outputUrine: '', outputEmesis: '', outputDrains: '', 
    outputStool: '', balanceTotal: 0
  },
  nutrition: {
    dietType: '', meals: [], generalObservations: '', dietHistory: [], dietHistoryObservations: ''
  },
  safetyProtocols: {
    patientIdentified: false, allergyBracelet: false, fallRiskIdentified: false, 
    pressureUlcerRiskIdentified: false, sideRailsUp: false, bedBrakesLocked: false, 
    callBellReach: false, handHygiene: false
  },
  medications: [], devices: [], procedures: [], procedureObservations: {}, 
  customNotes: '', braden: null, morse: null, pps: '', abemid: null, nead: null,
  bedBathChecklist: null, woundCare: null, currentConsumedStock: []
};

export const REPORT_OPTIONS: ReportOptionCategory[] = [
  {
    id: 'generalState',
    title: 'Estado Geral',
    type: 'single',
    options: [
      { label: 'Bom', value: 'bom', status: 'normal' },
      { label: 'Regular', value: 'regular', status: 'alert' },
      { label: 'Ruim', value: 'ruim', status: 'critical' },
      { label: 'Crítico', value: 'crítico', status: 'critical' },
    ],
  },
  {
    id: 'consciousness',
    title: 'Nível de Consciência',
    type: 'multi',
    options: [
      { label: 'Lúcido', value: 'lúcido', status: 'normal' },
      { label: 'Orientado', value: 'orientado em tempo e espaço', status: 'normal' },
      { label: 'Confuso', value: 'confuso', status: 'alert' },
      { label: 'Sonolento', value: 'sonolento', status: 'alert' },
      { label: 'Comatoso', value: 'comatoso', status: 'critical' },
      { label: 'Sedado', value: 'sedado', status: 'info' },
    ],
  },
  {
    id: 'pupils',
    title: 'Avaliação Pupilar (Neurológico)',
    type: 'multi',
    options: [
      { label: 'Isocóricas', value: 'pupilas isocóricas', status: 'normal' },
      { label: 'Anisocóricas', value: 'pupilas anisocóricas', status: 'critical' },
      { label: 'Mióticas', value: 'pupilas mióticas', status: 'alert' },
      { label: 'Midriáticas', value: 'pupilas midriáticas', status: 'alert' },
      { label: 'Fotorreagentes', value: 'fotorreagentes', status: 'normal' },
      { label: 'Não Fotorreagentes', value: 'não fotorreagentes', status: 'critical' },
    ],
  },
  {
    id: 'respiration',
    title: 'Respiração',
    type: 'single',
    options: [
      { label: 'Eupnéico em AA', value: 'eupnéico em ar ambiente, sem queixas respiratórias', status: 'normal' },
      { label: 'Dispneico', value: 'apresenta dispneia', status: 'alert' },
      { label: 'Com O2', value: 'em uso de oxigênio suplementar por cateter nasal', status: 'info' },
      { label: 'Tosse', value: 'apresenta tosse produtiva', status: 'info' },
    ],
  },
  {
    id: 'skin',
    title: 'Pele e Mucosas',
    type: 'multi',
    options: [
      { label: 'Íntegra', value: 'íntegra', status: 'normal' },
      { label: 'Ressecada', value: 'ressecada', status: 'info' },
      { label: 'Oleosa', value: 'oleosa', status: 'info' },
      { label: 'Lesões', value: 'lesões', status: 'alert' },
      { label: 'Equimoses', value: 'equimoses', status: 'info' },
      { label: 'Petéquias', value: 'petéquias', status: 'info' },
      { label: 'Icterícia', value: 'ictérica', status: 'alert' },
      { label: 'Palidez', value: 'pálida', status: 'info' },
    ],
  },
  {
    id: 'mobility',
    title: 'Deambulação',
    type: 'multi',
    options: [
      { label: 'Deambula', value: 'deambula', status: 'normal' },
      { label: 'Com ajuda', value: 'deambula com ajuda', status: 'alert' },
      { label: 'Cadeirante', value: 'cadeirante', status: 'info' },
      { label: 'Acamado', value: 'acamado', status: 'alert' },
      { label: 'Usa andador', value: 'em uso de andador', status: 'info' },
      { label: 'Usa bengala', value: 'em uso de bengala', status: 'info' },
    ],
  },
  {
    id: 'eliminations',
    title: 'Eliminações',
    type: 'multi',
    options: [
      // Urina
      { label: 'Diurese: Espontânea/Clara', value: 'diurese espontânea de aspecto claro', icon: 'fa-droplet', status: 'normal' },
      { label: 'Diurese: Concentrada (Escura)', value: 'diurese concentrada', icon: 'fa-droplet', status: 'alert' },
      { label: 'Diurese: Com Sangue (Hematúria)', value: 'hematúria macroscópica', icon: 'fa-droplet', status: 'critical' },
      { label: 'Diurese: Com Pus/Turva (Piúria)', value: 'diurese com piúria/turbidez', icon: 'fa-virus', status: 'alert' },
      { label: 'Diurese: SVD/SVA', value: 'diurese por sonda', icon: 'fa-catheter', status: 'info' },
      { label: 'Ausência de Diurese (Anúria)', value: 'anúria/retencão urinária', icon: 'fa-ban', status: 'critical' },
      
      // Fezes
      { label: 'Evacuação: Presente/Pastosa', value: 'evacuação presente de aspecto pastoso', icon: 'fa-poo', status: 'normal' },
      { label: 'Evacuação: Líquida (Diarreia)', value: 'episódio diarreico', icon: 'fa-poo-storm', status: 'alert' },
      { label: 'Evacuação: Com Sangue (Melena/Enterorragia)', value: 'evacuação com presença de sangue', icon: 'fa-triangle-exclamation', status: 'critical' },
      { label: 'Evacuação: Endurecida', value: 'fezes endurecidas', icon: 'fa-align-justify', status: 'alert' },
      { label: 'Ausência de Evacuação (+3 dias)', value: 'constipação intestinal', icon: 'fa-ban', status: 'alert' },
    ],
  },
  {
    id: 'procedures',
    title: 'Procedimentos Realizados',
    type: 'multi',
    options: [
      { label: 'Banho de Aspersão', value: 'banho de aspersão', icon: 'fa-shower' },
      { label: 'Banho no Leito', value: 'banho no leito', icon: 'fa-bath' },
      { label: 'Mudança de Decúbito', value: 'mudança de decúbito', icon: 'fa-arrows-left-right-to-line' },
      { label: 'Curativo', value: 'Curativo', icon: 'fa-bandage' },
      { label: 'Medicação', value: 'administração de medicação conforme prescrição', icon: 'fa-pills' },
      { label: 'Aferição de PVC', value: 'aferição de Pressão Venosa Central', icon: 'fa-heart-pulse' },
      { label: 'Coleta de Gasometria', value: 'coleta de gasometria arterial', icon: 'fa-vial-circle-check' },
      { label: 'Passagem de Sonda Vesical', value: 'passagem de sonda vesical', icon: 'fa-catheter' },
    ],
  },
];

export const WOUND_CARE_OPTIONS = {
  cleansing: ['Água', 'Solução Fisiológica', 'Sabão', 'Clorexidina Degermante', 'Clorexidina Alcoólica', 'Clorexidina Aquosa'],
  application: ['Hidrocolóides', 'Alginato de cálcio', 'Carvão ativado com prata', 'Papaína Gel', 'Hidrogel', 'Colagenase', 'Espumas de poliuretano', 'AGE (Ácidos Graxos Essenciais)'],
  frequency: ['1 vez ao dia', '2 vezes ao dia', '3 vezes ao dia', 'A cada 12 horas', 'A cada 8 horas', 'SOS (se necessário)'],
  location: ['Cabeça (Occipital)', 'Face', 'Couro cabeludo', 'MMSS (Membros Superiores)', 'Tórax', 'Costas', 'Cotovelo', 'Sacral', 'MMII (Membros Inferiores)', 'Calcâneo'],
  type: ['Úlcera por Pressão', 'Cirúrgica', 'Corte contuso', 'Traumática', 'Lacerante'],
  aspect: ['Tecido de Granulação', 'Esfacelos', 'Necrótica'],
  odor: ['Sem odor', 'Fétido'],
  secretion: ['Sem secreção', 'Serosa', 'Purulenta', 'Sanguinolenta', 'Serosanguinolenta', 'Esverdeada'],
  exudateAmount: ['Nenhuma', 'Escassa', 'Pequena', 'Moderada', 'Abundante'],
  surroundingSkin: ['Íntegra', 'Hiperemiada', 'Macerada', 'Edemaciada', 'Com descamação', 'Ressecada'],
  tolerance: ['Bem tolerado, sem queixas', 'Queixa de dor leve', 'Queixa de dor moderada', 'Queixa de dor intensa', 'Agitação/Inquietação'],
};

export const MATERIALS_LIST = ['Bacia', 'Cuba', 'Esponja', 'Espátulas', 'Atadura', 'Gaze', 'Luvas', 'Pinça', 'Tesoura', 'Soro fisiológico', 'Micropore'];
export const UNITS_LIST = ['unidade', 'ml', 'gramas', 'metros', 'pares', 'frascos'];

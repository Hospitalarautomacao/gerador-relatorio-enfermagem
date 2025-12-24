
export type SectionId = 
  'identification' | 
  'assessments' | // Anamnesis merged here
  'scales' |
  'stock' | 
  'auditTrail' |
  'patientHistory' |
  'generalReport' |
  'companyNotification' |
  'medicationHistory' |
  'exams' |
  'familyPortal' |
  'accessManagement' |
  'systemConnector' |
  'digitalReport' |
  'insurance' |
  'sharingSettings' |
  'patientRoutine' | 
  'customKit' | 
  'departmentView' |
  'intercorrencias' |
  'sinais-vitais' |
  'agenda' |
  'minhaAgenda' | 
  'meuPonto' |
  'pontoCerto' | 
  'integrations';

export type AssessmentSubSectionId =
  'history' | // NEW: Histórico Integrado
  'general' |
  'vitals' |
  'fluidBalance' |
  'nutrition' |
  'meds-devices' |
  'procedures' |
  'safety';

export interface DatabaseConfig {
  type: 'local' | 'supabase' | 'hybrid'; // Hybrid allows syncing to multiple
  supabaseUrl?: string;
  supabaseKey?: string;
  // Future integrations
  mysqlConfig?: {
    endpoint: string;
    user?: string;
    password?: string; // Note: In frontend apps, avoid storing real DB passwords directly
    enabled: boolean;
  };
  googleDriveConfig?: {
    clientId?: string;
    apiKey?: string;
    folderId?: string;
    enabled: boolean;
  };
}

// NEW: Alert Configuration
export interface VitalAlertSettings {
    monitoringInterval: number; // hours
    limits: {
        sysBpHigh: number;
        sysBpLow: number;
        diaBpHigh: number;
        diaBpLow: number;
        hrHigh: number;
        hrLow: number;
        tempHigh: number;
        tempLow: number;
        satLow: number;
        glycemiaHigh: number;
        glycemiaLow: number;
    };
    autoCreateIntercorrencia: boolean;
    audioAlerts: boolean;
}

// NEW: Sync Queue Item
export interface SyncQueueItem {
    id: string;
    type: 'intercorrencia' | 'sinal_vital' | 'relatorio';
    payload: any;
    timestamp: string;
    status: 'pending' | 'synced' | 'failed';
    retryCount: number;
}

export interface SyncStatus {
    status: 'synced' | 'syncing' | 'error' | 'offline';
    lastSync: string;
    pendingItems: number;
}

// NEW: External Service Configuration
export interface ExternalServiceConfig {
    id: string;
    name: string;
    provider: string; // 'OpenAI', 'Google', 'Anthropic', etc.
    type: 'AI' | 'Map' | 'Communication' | 'Other';
    description: string;
    apiKey?: string;
    endpoint?: string;
    isEnabled: boolean;
    icon: string;
    color: string;
    docsUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO String
  user: string;
  action: 'create' | 'update' | 'delete';
  field: string;
  oldValue: any;
  newValue: any;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  administrationTime: string;
  observation?: string; // New field
}

export interface PrescribedMedication {
  id: string; // Unique ID from the prescription system
  name: string;
  dose: string;
  route: string;
  frequency: string;
}

export interface Device {
  id: string;
  name: string;
  details: string; // Ex: Calibre, local de inserção
}

export interface MealItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  observation: string;
  consumed: boolean;
}

export interface Meal {
  id: 'breakfast' | 'lunch' | 'afternoonSnack' | 'dinner';
  name: string;
  icon: string;
  defaultTime: string;
  completed: boolean;
  time: string;
  acceptance: number; // 0-100
  acceptanceMode: 'auto' | 'manual';
  items: MealItem[];
  difficulty: boolean;
  observations: string;
}

export interface NutritionData {
  dietType: 'Oral' | 'SNE' | 'NPT' | 'Jejum' | '';
  meals: Meal[];
  generalObservations: string;
  dietHistory: string[];
  dietHistoryObservations: string;
}

export interface FluidBalanceData {
  intakeOral: string;
  intakeParenteral: string;
  intakeOther: string;
  outputUrine: string;
  outputEmesis: string;
  outputDrains: string;
  outputStool: string; // Aspecto ou quantidade estimada
  balanceTotal: number; // Calculated field
}

export interface SafetyProtocolsData {
  patientIdentified: boolean;
  allergyBracelet: boolean;
  fallRiskIdentified: boolean;
  pressureUlcerRiskIdentified: boolean;
  sideRailsUp: boolean;
  bedBrakesLocked: boolean; // NEW: Critical safety item
  callBellReach: boolean;
  handHygiene: boolean;
}

export interface BradenData {
  sensory: number;
  moisture: number;
  activity: number;
  mobility: number;
  nutrition: number;
  friction: number;
}

export interface MorseData {
  history: number;
  diagnosis: number;
  ambulatoryAid: number;
  ivTherapy: number;
  gait: number;
  mentalStatus: number;
}

export interface AbemidData {
  score: string;
  classification: string;
}

export interface NeadData {
  score: string;
  classification: string;
}

export interface BedBathChecklist {
  skinIntegrity: boolean;
  hyperemia: boolean;
  lesions: boolean;
  lesionsLocation: string;
  hydration: 'hidratada' | 'ressecada' | '';
  tolerance: 'boa tolerância, calmo e colaborativo' | 'agitação/inquietação' | 'queixa de dor' | '';
  oralHygiene: boolean;
  perinealCare: boolean;
  linenChange: boolean;
  repositioned: boolean;
  observations: string;
  additionalCares: string[];
  additionalCaresOther: string;
}

export interface WoundCareMaterial {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface WoundCareData {
  cleansing: string[];
  application: string[];
  materials: WoundCareMaterial[];
  frequency: string[];
  startDate?: string;
  startTime?: string;
  location: string[];
  type: string[];
  aspect: string[];
  odor: string[];
  secretion: string[];
  exudateAmount: string[];
  surroundingSkin: string[];
  tolerance: string[];
  observations: string;
}

// NEW: Stock Item Interface
export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
}

// NEW: Consumed Stock in current report
export interface ConsumedStock {
    itemName: string;
    quantityConsumed: number;
    unit: string;
}

// NEW: Digital Signature Structure
export interface DigitalSignature {
  signed: boolean;
  signerName: string;
  signerCoren: string;
  timestamp: string;
  hash: string; // Fake hash for simulation
  certificateType: 'A1' | 'A3' | 'Cloud';
}

// NEW: Sharing Settings for Family App
export interface PatientSharingSettings {
  shareVitals: boolean;
  shareMedications: boolean;
  shareGeneralState: boolean;
  shareNotes: boolean;
  realtimeUpdates: boolean;
}

// NEW: Insurance Authorization Guide
export interface InsuranceGuide {
  id: string;
  guideNumber: string; // TISS
  type: 'Internação' | 'SADT' | 'Prorrogação';
  status: 'Em Análise' | 'Autorizado' | 'Negado' | 'Glosa Parcial';
  requestDate: string;
  lastUpdate: string;
  items: string[];
}

// NEW: Patient Routine Item
export interface RoutineItem {
  id: string;
  time: string;
  task: string;
  // Enhanced types for better color coding
  type: 'medication' | 'procedure' | 'diet' | 'hygiene' | 'exam' | 'therapy' | 'admin' | 'attendance';
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  requiredStockItem?: string; // Links to StockItem.id
  notes?: string;
  professional?: string;
  isRecurring?: boolean;
  recurrenceEndDate?: string;
}

// NEW: Access Control User
export type AccessRole = 'Empresa' | 'Enfermeiro' | 'Técnico' | 'Cuidador' | 'Paciente' | 'Família' | 'Admin';

export interface AccessUser extends PortalUser {
  role: AccessRole;
  startDate: string;
  endDate: string;
  active: boolean;
  department?: 'Farmácia' | 'Nutrição' | 'Enfermagem' | 'Geral';
}

// NEW: Intercorrencia (Critical Issue)
export interface Intercorrencia {
  id: string;
  paciente_id: string; // Should match reportData.patientName or similar unique ID
  data: string; // ISO String
  motivo: string;
  acompanhamento: 'Enfermagem' | 'Fisioterapia' | 'Nutrição' | 'Médico';
  status: 'Aberta' | 'Finalizado';
  descricao: string;
  conduta_realizada: string;
  profissional_id: string;
  data_criacao: string; // ISO String
  data_atualizacao: string; // ISO String
}

// NEW: Shift (Plantão)
export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  patientName: string;
  patientAddress: string;
  status: 'Confirmado' | 'Pendente' | 'Cancelado';
  type: 'Diurno' | 'Noturno' | '24h';
}

// NEW: AI Training Status
export interface AITrainingStatus {
    lastRun: string | null;
    version: string;
    optimizationLevel: number; // 0-100
    modulesTrained: string[];
    nextScheduledRun: string;
    autoTrain: boolean; // NEW
}

// NEW: System Analysis Report
export interface SystemAnalysisReport {
    technicalScore: number;
    marketAlignment: number;
    opportunities: {
        title: string;
        description: string;
        impact: 'High' | 'Medium' | 'Low';
        type: 'Feature' | 'Optimization' | 'Integration';
    }[];
    improvements: string[];
    handwritingOptimization: boolean;
}

export interface ReportData {
  // Identification
  patientName: string;
  patientAge: string;
  patientBed: string;
  patientDiagnosis: string;
  professionalName: string;
  coren: string;
  dataAdmissao: string;
  horaAdmissao: string;
  patientAllergies: string;
  patientObservations: string;

  // Anamnesis / History (Simplificado)
  comorbidities: string[]; // NEW: Structured List
  mainComplaint: string;   // NEW: Queixa principal curta
  patientCid: string;
  patientHistory: string; // Mantido para legado/texto livre se necessário
  
  // Vitals
  bloodPressure: string;
  pulse: string;
  heartRate: string;
  temperature: string;
  saturation: string;
  glycemia: string;
  oxygen: string;
  co2: string;
  previousBloodPressure: string;
  previousPulse: string;
  previousHeartRate: string;
  previousTemperature: string;
  previousSaturation: string;
  previousGlycemia: string;
  previousOxygen: string;
  previousCo2: string;
  vitalSignsHistory: string;
  oxygenSupportType: string;
  vitalSignsAlerts: string;
  oxygenUsageSummary: string;
  vitalSignsEvolution: string;
  
  // Alerts Config
  alertSettings?: VitalAlertSettings;

  // Clinical Assessment
  generalState: string;
  consciousness: string[];
  pupils: string[]; // NEW: Pupillary Assessment
  respiration: string;
  skin: string[];
  mobility: string[];
  eliminations: string[]; // Keep for compatibility, but FluidBalance is more detailed
  pain: string[];
  painLocation: string[];
  painAggravating: string[];
  painAlleviating: string[];
  painSummary: string;

  // Fluid Balance & Nutrition
  fluidBalance: FluidBalanceData;
  nutrition: NutritionData;

  // Safety
  safetyProtocols: SafetyProtocolsData;

  // Medications & Devices
  medications: Medication[];
  devices: Device[];
  
  // Procedures & Notes
  procedures: string[];
  procedureObservations: Record<string, string>;
  customNotes: string;

  // Scales
  braden: BradenData | null;
  morse: MorseData | null;
  pps: string;
  abemid: AbemidData | null;
  nead: NeadData | null;

  // Checklists
  bedBathChecklist: BedBathChecklist | null;
  woundCare: WoundCareData | null;

  // Transient state for current report
  currentConsumedStock: { itemId: string; quantityConsumed: number }[];

  // NEW: Signature
  digitalSignature?: DigitalSignature;
  
  // NEW: Routine
  routine?: RoutineItem[];
}

export interface SavedReport extends Omit<ReportData, 'currentConsumedStock'> {
  id: string;
  savedAt: string; // ISO String
  consumedStock: ConsumedStock[];
}


export interface ReportOption {
  label: string;
  value: string;
  icon?: string; // Adicionado para ícones visuais
  tooltip?: string;
  status?: 'normal' | 'alert' | 'critical' | 'info';
}

export interface ReportOptionCategory {
  id: keyof ReportData;
  title: string;
  type: 'single' | 'multi';
  options: ReportOption[];
}

// Error Types for Validation
export interface MedicationError {
  id: string;
  name?: string;
  dose?: string;
  route?: string;
  frequency?: string;
}

export interface DeviceError {
  id: string;
  name?: string;
  details?: string;
}

export type FormErrors = Partial<Record<keyof Omit<ReportData, 'medications' | 'devices' | 'fluidBalance' | 'safetyProtocols'>, string>> & {
  medications?: MedicationError[];
  devices?: DeviceError[];
};

export interface ConsumptionLog {
  id: string;
  timestamp: string; // ISO String
  itemId: string;
  itemName: string;
  category?: string; // Saved snapshot of category
  quantityConsumed: number;
  unit: string;
  user: string;
}

export interface ExamResult {
    id: string;
    patientName: string;
    name: string;
    type: 'lab' | 'imaging';
    date: string; // YYYY-MM-DD format
    result: string;
}

export interface CompanyNotification {
  protocolo: string;
  versao: string;
  metadata: {
    timestamp: string;
    origem: {
      sistema: string;
      setor: string;
      agente: string;
    };
  };
  evento: {
    tipo: 'alerta' | 'solicitacao' | 'relatorio' | '';
    prioridade: 'baixa' | 'media' | 'alta' | 'critica' | '';
    titulo: string;
    descricao: string;
  };
  solicitacao: {
    tipo_resposta_esperada: 'orientacao' | 'analise' | 'acao' | '';
    prazo: 'imediato' | '24h' | '48h' | '';
    pergunta_especifica: string;
  };
  flags: {
    requer_resposta: boolean;
  };
}

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  relationship: 'Familiar' | 'Convênio' | 'Outro';
  patientName: string;
  status: 'Pendente' | 'Ativo';
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'zapier';
  url: string;
  token?: string;
  events: string[];
  status: 'active' | 'inactive';
}

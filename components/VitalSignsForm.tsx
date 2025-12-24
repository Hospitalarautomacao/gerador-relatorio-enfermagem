
import React, { useEffect, useState } from 'react';
import type { ReportData, FormErrors, SavedReport, VitalAlertSettings } from '../types';
import { analyzeVitalSign, VitalSignAnalysis } from '../utils/vitalSignsUtils';
import Accordion from './ui/Accordion';
import VitalSignsChart from './VitalSignsChart';
import AISuggestionButton from './AISuggestionButton';
import VitalSignsConfigModal from './VitalSignsConfigModal';
import { syncCriticalVitals, syncIntercorrencia } from '../services/hospitalSyncService';

type Trend = 'up' | 'down' | 'stable' | 'none';

// Helper function to compare two numbers and return a trend
const compareValues = (current: number, previous: number): Trend => {
  if (isNaN(current) || isNaN(previous)) return 'none';
  if (Math.abs(current - previous) < 0.1) return 'stable';
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'stable';
};

const getTrend = (currentStr: string, previousStr: string, type: 'bp' | 'number'): Trend => {
  if (!currentStr || !previousStr) return 'none';
  try {
    if (type === 'bp') {
      const currentSystolic = parseInt(currentStr.split('/')[0], 10);
      const previousSystolic = parseInt(previousStr.split('/')[0], 10);
      return compareValues(currentSystolic, previousSystolic);
    } else {
      const currentNum = parseFloat(currentStr.replace(',', '.'));
      const previousNum = parseFloat(previousStr.replace(',', '.'));
      return compareValues(currentNum, previousNum);
    }
  } catch {
    return 'none';
  }
};

const TrendIcon: React.FC<{ trend: Trend }> = ({ trend }) => {
  switch (trend) {
    case 'up': return <i className="fas fa-arrow-trend-up text-red-500 animate-pulse" title="Tendência de Alta"></i>;
    case 'down': return <i className="fas fa-arrow-trend-down text-blue-500 animate-pulse" title="Tendência de Baixa"></i>;
    case 'stable': return <i className="fas fa-minus text-slate-400" title="Estável"></i>;
    default: return null;
  }
};

interface VitalSignsFormProps {
  data: Pick<ReportData, 'bloodPressure' | 'pulse' | 'heartRate' | 'temperature' | 'saturation' | 'glycemia' | 'oxygen' | 'co2' | 'previousBloodPressure' | 'previousPulse' | 'previousHeartRate' | 'previousTemperature' | 'previousSaturation' | 'previousGlycemia' | 'previousOxygen' | 'previousCo2' | 'vitalSignsHistory' | 'oxygenSupportType' | 'vitalSignsAlerts' | 'oxygenUsageSummary' | 'vitalSignsEvolution' | 'patientDiagnosis' | 'patientName' | 'alertSettings'>;
  onInputChange: (field: keyof ReportData, value: any) => void;
  errors: FormErrors;
  onAnalyze: () => void;
  interpretation: string | null;
  suggestions: string | null;
  isAnalyzing: boolean;
  patientHistory: SavedReport[];
  isDarkMode: boolean;
  isMonitorMode?: boolean;
  onNotifyCentral?: () => void;
}

const VitalSignInput: React.FC<{ id: keyof ReportData; label: string; placeholder: string; value: string; error?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onBlur?: () => void; trend?: Trend; analysis?: VitalSignAnalysis }> = ({ id, label, placeholder, value, error, onChange, onBlur, trend, analysis }) => {
    const status = analysis?.status || 'normal';
    const message = analysis?.message;
    const combinedBorderClass = () => {
        if (status === 'critical') return 'bg-red-50 border-red-500 text-red-900 focus:ring-red-500 dark:bg-red-900/30 dark:border-red-500';
        if (status === 'warning') return 'bg-amber-50 border-amber-400 text-amber-900 focus:ring-amber-500 dark:bg-amber-900/20 dark:border-amber-500';
        if (error) return 'border-red-500 focus:ring-red-500';
        return 'border-slate-300 focus:ring-cyan-500 dark:border-slate-600';
    };

    return (
        <div className="mb-1">
            <label htmlFor={id} className="flex items-center justify-between text-sm font-medium text-slate-600 mb-1 dark:text-slate-400">
                <div className="flex items-center gap-1">
                    <span className={status === 'critical' ? 'text-red-600 font-bold' : status === 'warning' ? 'text-amber-600 font-bold' : ''}>{label}</span>
                </div>
                {trend && trend !== 'none' && <div className="flex items-center gap-1 text-xs"><TrendIcon trend={trend} /></div>}
            </label>
            <div className="relative group">
                {status !== 'normal' && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <i className={`fas ${status === 'critical' ? 'fa-triangle-exclamation text-red-500 animate-pulse' : 'fa-exclamation-circle text-amber-500'}`}></i>
                    </div>
                )}
                <input type="text" id={id} name={id} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} className={`w-full p-2 pr-2 rounded-md transition-all ${status !== 'normal' ? 'pl-9 font-semibold' : ''} ${combinedBorderClass()}`} />
            </div>
            {message && <p className={`text-xs mt-1 font-bold flex items-center gap-1 ${status === 'critical' ? 'text-red-600' : 'text-amber-600'}`}><i className="fas fa-info-circle"></i>{message}</p>}
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        </div>
    );
};

const MonitorDisplay: React.FC<{ data: any; onNotifyCentral?: () => void; }> = ({ data, onNotifyCentral }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-black p-6 rounded-xl border-4 border-slate-800 shadow-2xl font-mono relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10px] w-full animate-[scan_3s_linear_infinite] pointer-events-none"></div>
        {/* Heart Rate */}
        <div className="text-center flex flex-col justify-center items-center relative">
            <i className="fas fa-heart text-green-600 absolute top-2 right-4 text-xs animate-pulse"></i>
            <span className="text-green-600 text-[10px] uppercase font-bold tracking-widest block mb-1">FC (bpm)</span>
            <span className="text-5xl md:text-6xl font-bold text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">{data.heartRate || '--'}</span>
        </div>
        {/* Saturation */}
        <div className="text-center flex flex-col justify-center items-center border-l border-slate-800">
            <span className="text-cyan-500 text-[10px] uppercase font-bold tracking-widest block mb-1">SpO₂ (%)</span>
            <span className="text-5xl md:text-6xl font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">{data.saturation || '--'}</span>
        </div>
        {/* BP */}
        <div className="text-center flex flex-col justify-center items-center border-l border-slate-800">
            <span className="text-red-500 text-[10px] uppercase font-bold tracking-widest block mb-1">PNI (mmHg)</span>
            <span className="text-4xl md:text-5xl font-bold text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">{data.bloodPressure || '--/--'}</span>
        </div>
        {/* Temp */}
        <div className="text-center flex flex-col justify-center items-center border-l border-slate-800">
            <span className="text-yellow-500 text-[10px] uppercase font-bold tracking-widest block mb-1">Temp (°C)</span>
            <span className="text-4xl md:text-5xl font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">{data.temperature || '--'}</span>
        </div>
        <div className="col-span-2 md:col-span-4 mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> MONITOR CONECTADO</span>
            <div className="flex items-center gap-4">
                <span>O2: {data.oxygen ? `${data.oxygen} L/min` : 'AA'}</span>
                {onNotifyCentral && (
                    <button onClick={onNotifyCentral} className="text-red-500 hover:text-red-400 font-bold flex items-center gap-1 uppercase tracking-widest transition-colors">
                        <i className="fas fa-bell"></i> Notificar Central
                    </button>
                )}
            </div>
        </div>
    </div>
);

const VitalSignsForm: React.FC<VitalSignsFormProps> = ({ 
    data, onInputChange, errors, onAnalyze, interpretation, 
    suggestions, isAnalyzing, patientHistory, isDarkMode, isMonitorMode = false, onNotifyCentral 
}) => {
  const [activeTab, setActiveTab] = useState<'input' | 'charts'>('input');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Alert Logic
  useEffect(() => {
      // Basic critical check logic
      const isCritical = (
          (parseInt(data.heartRate || '0') > 130) ||
          (parseInt(data.saturation || '100') < 88) ||
          (parseFloat(data.temperature?.replace(',', '.') || '36') > 39)
      );

      if (isCritical) {
          // If auto create intercorrencia is enabled (check settings in real app)
          if (data.alertSettings?.autoCreateIntercorrencia) {
              // Debounce logic would go here to avoid duplicates
              console.log("Critical Value Detected - Auto Creating Intercorrencia");
              syncIntercorrencia({
                  id: Date.now().toString(),
                  paciente_id: data.patientName,
                  motivo: 'Sinal Vital Crítico',
                  descricao: `Valores críticos detectados. FC: ${data.heartRate}, Sat: ${data.saturation}`,
                  status: 'Aberta',
                  data: new Date().toISOString(),
                  acompanhamento: 'Médico',
                  data_criacao: new Date().toISOString(),
                  data_atualizacao: new Date().toISOString(),
                  conduta_realizada: 'Monitoramento intensificado',
                  profissional_id: 'Sistema'
              });
          }
          // Sync Criticals
          syncCriticalVitals(data);
      }
  }, [data.heartRate, data.saturation, data.temperature, data.bloodPressure, data.alertSettings]);

  return (
    <div className="bg-white p-5 rounded-xl shadow dark:bg-slate-800">
      
      {isMonitorMode ? (
          <MonitorDisplay data={data} onNotifyCentral={onNotifyCentral} />
      ) : (
          <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                <i className="fas fa-heart-pulse mr-2 text-cyan-600"></i>
                Sinais Vitais
              </h2>
              <div className="flex gap-2">
                  <button onClick={() => setActiveTab('input')} className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${activeTab === 'input' ? 'bg-cyan-100 text-cyan-800' : 'text-slate-500'}`}>Registrar</button>
                  <button onClick={() => setActiveTab('charts')} className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${activeTab === 'charts' ? 'bg-cyan-100 text-cyan-800' : 'text-slate-500'}`}>Gráficos</button>
                  <button onClick={() => setIsConfigOpen(true)} className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"><i className="fas fa-cog"></i></button>
              </div>
          </div>
      )}

      {activeTab === 'charts' && (
          <VitalSignsChart history={patientHistory} isDarkMode={isDarkMode} />
      )}

      {activeTab === 'input' && (
          <div className="space-y-6">
            {/* HEMODYNAMICS */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-md font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center border-b pb-2"><i className="fas fa-heartbeat mr-2 text-red-500"></i> Hemodinâmica & Temperatura</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="space-y-4">
                        <VitalSignInput id="bloodPressure" label="PA (mmHg)" placeholder="120/80" value={data.bloodPressure} onChange={(e) => onInputChange('bloodPressure', e.target.value)} error={errors.bloodPressure} trend={getTrend(data.bloodPressure, data.previousBloodPressure, 'bp')} analysis={analyzeVitalSign('bloodPressure', data.bloodPressure)} />
                        <VitalSignInput id="previousBloodPressure" label="PA Anterior" placeholder="130/85" value={data.previousBloodPressure} onChange={(e) => onInputChange('previousBloodPressure', e.target.value)} error={errors.previousBloodPressure} />
                    </div>
                    <div className="space-y-4">
                        <VitalSignInput id="pulse" label="Pulso (bpm)" placeholder="75" value={data.pulse} onChange={(e) => onInputChange('pulse', e.target.value)} error={errors.pulse} trend={getTrend(data.pulse, data.previousPulse, 'number')} analysis={analyzeVitalSign('pulse', data.pulse)} />
                        <VitalSignInput id="previousPulse" label="Pulso Anterior" placeholder="80" value={data.previousPulse} onChange={(e) => onInputChange('previousPulse', e.target.value)} error={errors.previousPulse} />
                    </div>
                    <div className="space-y-4">
                        <VitalSignInput id="heartRate" label="FC (bpm)" placeholder="78" value={data.heartRate} onChange={(e) => onInputChange('heartRate', e.target.value)} error={errors.heartRate} trend={getTrend(data.heartRate, data.previousHeartRate, 'number')} analysis={analyzeVitalSign('heartRate', data.heartRate)} />
                        <VitalSignInput id="previousHeartRate" label="FC Anterior" placeholder="80" value={data.previousHeartRate} onChange={(e) => onInputChange('previousHeartRate', e.target.value)} error={errors.previousHeartRate} />
                    </div>
                    <div className="space-y-4">
                        <VitalSignInput id="temperature" label="Temp (°C)" placeholder="36,5" value={data.temperature} onChange={(e) => onInputChange('temperature', e.target.value)} error={errors.temperature} trend={getTrend(data.temperature, data.previousTemperature, 'number')} analysis={analyzeVitalSign('temperature', data.temperature)} />
                        <VitalSignInput id="previousTemperature" label="Temp Anterior" placeholder="37,0" value={data.previousTemperature} onChange={(e) => onInputChange('previousTemperature', e.target.value)} error={errors.previousTemperature} />
                    </div>
                </div>
            </div>

            {/* RESPIRATORY */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-md font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center border-b pb-2"><i className="fas fa-lungs mr-2 text-cyan-500"></i> Padrão Respiratório</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="space-y-4">
                        <VitalSignInput id="saturation" label="Sat O₂ (%)" placeholder="98" value={data.saturation} onChange={(e) => onInputChange('saturation', e.target.value)} error={errors.saturation} trend={getTrend(data.saturation, data.previousSaturation, 'number')} analysis={analyzeVitalSign('saturation', data.saturation)} />
                        <VitalSignInput id="previousSaturation" label="Sat O₂ Anterior" placeholder="97" value={data.previousSaturation} onChange={(e) => onInputChange('previousSaturation', e.target.value)} error={errors.previousSaturation} />
                    </div>
                    <div className="sm:col-span-1 lg:col-span-1 space-y-2">
                        <label htmlFor="oxygenSupportType" className="block text-sm font-medium text-slate-600 mb-1 dark:text-slate-400">Via de O₂</label>
                        <select id="oxygenSupportType" value={data.oxygenSupportType || ''} onChange={(e) => onInputChange('oxygenSupportType', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                            <option value="">Ar Ambiente / N/A</option>
                            {['Cateter nasal', 'Máscara não reinalizante', 'Máscara de Venturi', 'CPAP', 'Ventilação Mecânica'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div className="space-y-4">
                        <VitalSignInput id="oxygen" label="O₂ (L/min)" placeholder="2" value={data.oxygen} onChange={(e) => onInputChange('oxygen', e.target.value)} error={errors.oxygen} trend={getTrend(data.oxygen, data.previousOxygen, 'number')} analysis={analyzeVitalSign('oxygen', data.oxygen)} />
                    </div>
                    <div className="space-y-4">
                        <VitalSignInput id="co2" label="CO₂ (mmHg)" placeholder="40" value={data.co2} onChange={(e) => onInputChange('co2', e.target.value)} error={errors.co2} trend={getTrend(data.co2, data.previousCo2, 'number')} analysis={analyzeVitalSign('co2', data.co2)} />
                    </div>
                </div>
            </div>

            {/* METABOLIC */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-md font-bold text-slate-700 dark:text-slate-300 flex items-center"><i className="fas fa-cubes-stacked mr-2 text-yellow-500"></i> Metabólico</h3>
                    <AISuggestionButton contextType="glicemia" contextData={{ glicemia_atual: data.glycemia }} onSuggestion={(text) => onInputChange('vitalSignsEvolution', (data.vitalSignsEvolution || '') + '\n' + text)} disabled={!data.glycemia} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="space-y-4">
                        <VitalSignInput id="glycemia" label="Glicemia (mg/dL)" placeholder="90" value={data.glycemia} onChange={(e) => onInputChange('glycemia', e.target.value)} error={errors.glycemia} trend={getTrend(data.glycemia, data.previousGlycemia, 'number')} analysis={analyzeVitalSign('glycemia', data.glycemia)} />
                    </div>
                </div>
            </div>

            {/* AI Analysis Section */}
            <div className="mt-6 border-t pt-4 dark:border-slate-700">
                <button onClick={onAnalyze} disabled={isAnalyzing} className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all transform active:scale-95">
                    {isAnalyzing ? <><i className="fas fa-spinner fa-spin mr-2"></i> Processando Análise Clínica...</> : <><i className="fas fa-wand-magic-sparkles mr-2 text-yellow-300"></i> Realizar Análise de Inteligência Artificial</>}
                </button>
                {interpretation && (
                    <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm dark:bg-indigo-900/30 dark:border-indigo-800">
                        <h4 className="font-bold flex items-center text-indigo-900 dark:text-indigo-200 mb-2"><div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600"><i className="fas fa-brain"></i></div> Interpretação Clínica (IA)</h4>
                        <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed pl-11">{interpretation}</p>
                    </div>
                )}
            </div>
          </div>
      )}

      <VitalSignsConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        currentSettings={data.alertSettings} 
        onSave={(settings) => onInputChange('alertSettings', settings)} 
      />
    </div>
  );
};

export default VitalSignsForm;


import React, { useMemo } from 'react';
import { ReportData } from '../types';
import BradenScale from './scales/BradenScale';
import MorseScale from './scales/MorseScale';
import PpsScale from './scales/PpsScale';
import AbemidScale from './scales/AbemidScale';
import NeadScale from './scales/NeadScale';
import ScaleCard from './scales/ScaleCard';
import { fillScaleWithVoice } from '../services/geminiService';

interface ScalesFormProps {
  data: ReportData;
  onInputChange: (field: keyof ReportData, value: any) => void;
}

// Mapeamento de URLs de referência para cada escala
const scaleReferences = {
  braden: 'https://www.scielo.br/j/reben/a/cfVbfn49g9j7mQ8W7p3Cw3g/?lang=pt',
  morse: 'https://www.pfizer.com.br/sua-saude/corpo-em-movimento/prevencao-de-quedas/escala-de-morse',
  pps: 'https://www.paliativo.org.br/wp-content/uploads/2014/10/PPSv2-portugues.pdf',
  abemid: 'https://abemid.org.br/tabela-abemid/',
  nead: 'https://docs.bvsalud.org/biblioref/2021/04/1183378/escala-nead.pdf'
};

const ResultPill: React.FC<{ score: number | string; risk: string; color: string }> = ({ score, risk, color }) => {
    if (!risk || risk === 'N/A' || risk === 'Não preenchido') return null;
    return (
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
            <span className="font-semibold text-slate-500 text-xs uppercase tracking-wide">Resultado:</span>
            <span className={`px-2 py-0.5 text-xs font-bold text-white ${color} rounded`}>
                {score}
            </span>
            <span className="text-xs font-medium text-slate-700">{risk}</span>
        </div>
    );
};

const ScalesForm: React.FC<ScalesFormProps> = ({ data, onInputChange }) => {

  const bradenResult = useMemo(() => {
    if (!data.braden) return null;
    const total = (data.braden.sensory || 0) + (data.braden.moisture || 0) + (data.braden.activity || 0) + (data.braden.mobility || 0) + (data.braden.nutrition || 0) + (data.braden.friction || 0);
    if (total === 0) return null;

    let risk = 'N/A';
    let color = 'bg-slate-400';
    if (total >= 19) { risk = 'Sem Risco'; color = 'bg-green-500'; }
    else if (total >= 15) { risk = 'Risco Leve'; color = 'bg-yellow-500'; }
    else if (total >= 13) { risk = 'Risco Moderado'; color = 'bg-orange-500'; }
    else if (total >= 10) { risk = 'Risco Alto'; color = 'bg-red-500'; }
    else { risk = 'Risco Muito Alto'; color = 'bg-red-700'; }

    return { score: total, risk, color };
  }, [data.braden]);

  const morseResult = useMemo(() => {
    if (!data.morse) return null;
    const total = (data.morse.history || 0) + (data.morse.diagnosis || 0) + (data.morse.ambulatoryAid || 0) + (data.morse.ivTherapy || 0) + (data.morse.gait || 0) + (data.morse.mentalStatus || 0);
    if (total === 0 && !Object.values(data.morse).some(v => v === 0)) return null;

    let risk = 'Baixo Risco';
    let color = 'bg-green-500';
    if (total >= 45) { risk = 'Alto Risco'; color = 'bg-red-500'; }
    else if (total >= 25) { risk = 'Médio Risco'; color = 'bg-orange-500'; }
    
    return { score: total, risk, color };
  }, [data.morse]);

  // AI Handlers
  const handleVoiceScale = async (scaleName: string, text: string) => {
      try {
          const result = await fillScaleWithVoice(scaleName, text);
          if (scaleName === 'Braden') onInputChange('braden', result);
          if (scaleName === 'Morse') onInputChange('morse', result);
          if (scaleName === 'PPS') onInputChange('pps', result);
          if (scaleName === 'ABEMID') onInputChange('abemid', result);
          if (scaleName === 'NEAD') onInputChange('nead', result);
      } catch (e) {
          console.error(e);
          alert("Não foi possível preencher automaticamente. Tente novamente.");
      }
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-bold text-slate-800 mb-2 border-b pb-2">
            <i className="fas fa-chart-line mr-2 text-cyan-600"></i>
            Tabelas de Avaliação
          </h2>
          <p className="text-sm text-slate-500">
            Clique no microfone para preencher com IA ou expanda para preencher manualmente.
          </p>
      </div>

      <ScaleCard 
        title="Escala de Braden (Pele)" 
        icon="fa-bed-pulse"
        referenceUrl={scaleReferences.braden}
        colorTheme="mint"
        result={bradenResult && <ResultPill score={bradenResult.score} risk={bradenResult.risk} color={bradenResult.color} />}
        onVoiceInput={(text) => handleVoiceScale('Braden', text)}
      >
        <BradenScale 
          data={data.braden}
          onChange={(value) => onInputChange('braden', value)}
        />
      </ScaleCard>

       <ScaleCard 
        title="Escala de Morse (Queda)" 
        icon="fa-person-falling"
        referenceUrl={scaleReferences.morse}
        colorTheme="amber"
        result={morseResult && <ResultPill score={morseResult.score} risk={morseResult.risk} color={morseResult.color} />}
        onVoiceInput={(text) => handleVoiceScale('Morse', text)}
      >
        <MorseScale 
          data={data.morse}
          onChange={(value) => onInputChange('morse', value)}
        />
      </ScaleCard>

       <ScaleCard 
        title="Escala PPS (Paliativo)" 
        icon="fa-hand-holding-heart"
        referenceUrl={scaleReferences.pps}
        colorTheme="indigo"
        result={data.pps && <ResultPill score={data.pps} risk="" color="bg-indigo-500" />}
        onVoiceInput={(text) => handleVoiceScale('PPS', text)}
      >
        <PpsScale
          value={data.pps}
          onChange={(value) => onInputChange('pps', value)}
        />
      </ScaleCard>

       <ScaleCard 
        title="Escala ABEMID" 
        icon="fa-sitemap"
        referenceUrl={scaleReferences.abemid}
        colorTheme="sky"
        result={data.abemid?.classification && <ResultPill score={data.abemid.score} risk={data.abemid.classification} color="bg-sky-500" />}
        onVoiceInput={(text) => handleVoiceScale('ABEMID', text)}
      >
        <AbemidScale
          data={data.abemid}
          onChange={(value) => onInputChange('abemid', value)}
        />
      </ScaleCard>
      
       <ScaleCard 
        title="Escala NEAD" 
        icon="fa-star-of-life"
        referenceUrl={scaleReferences.nead}
        colorTheme="rose"
        result={data.nead?.classification && <ResultPill score={data.nead.score} risk={data.nead.classification} color="bg-rose-500" />}
        onVoiceInput={(text) => handleVoiceScale('NEAD', text)}
      >
        <NeadScale
          data={data.nead}
          onChange={(value) => onInputChange('nead', value)}
        />
      </ScaleCard>
    </div>
  );
};

export default ScalesForm;

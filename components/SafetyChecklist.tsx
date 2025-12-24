
import React from 'react';
import { SafetyProtocolsData } from '../types';
import Checkbox from './ui/Checkbox';

interface SafetyChecklistProps {
  data: SafetyProtocolsData;
  onChange: (data: SafetyProtocolsData) => void;
}

const SafetyChecklist: React.FC<SafetyChecklistProps> = ({ data, onChange }) => {
  const handleCheck = (field: keyof SafetyProtocolsData, value: boolean) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow border-l-4 border-amber-500">
      <h2 className="text-xl font-bold text-slate-800 mb-2 border-b pb-2">
        <i className="fas fa-shield-halved mr-2 text-amber-500"></i>
        Protocolos de Segurança do Paciente
      </h2>
      <p className="text-sm text-slate-500 mb-4">Verifique as metas internacionais de segurança.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Checkbox 
            label="Paciente Identificado" 
            description="Pulseira presente, legível e conferida."
            checked={data.patientIdentified} 
            onChange={(v) => handleCheck('patientIdentified', v)} 
        />
        <Checkbox 
            label="Pulseira de Alergia" 
            description="Identificação de alergia presente se aplicável."
            checked={data.allergyBracelet} 
            onChange={(v) => handleCheck('allergyBracelet', v)} 
        />
        <Checkbox 
            label="Risco de Queda Identificado" 
            description="Pulseira ou sinalização de risco presente."
            checked={data.fallRiskIdentified} 
            onChange={(v) => handleCheck('fallRiskIdentified', v)} 
        />
        <Checkbox 
            label="Risco de LPP Identificado" 
            description="Medidas preventivas (mudança de decúbito) implementadas."
            checked={data.pressureUlcerRiskIdentified} 
            onChange={(v) => handleCheck('pressureUlcerRiskIdentified', v)} 
        />
        <Checkbox 
            label="Grades Elevadas" 
            description="Grades do leito mantidas elevadas."
            checked={data.sideRailsUp} 
            onChange={(v) => handleCheck('sideRailsUp', v)} 
        />
        <Checkbox 
            label="Rodas da Cama Travadas" 
            description="Rodas do leito travadas para prevenir movimentação acidental."
            checked={data.bedBrakesLocked} 
            onChange={(v) => handleCheck('bedBrakesLocked', v)} 
        />
         <Checkbox 
            label="Campainha ao Alcance" 
            description="Dispositivo de chamada acessível ao paciente."
            checked={data.callBellReach} 
            onChange={(v) => handleCheck('callBellReach', v)} 
        />
        <Checkbox 
            label="Higienização das Mãos" 
            description="Protocolo de higiene das mãos respeitado antes/após contato."
            checked={data.handHygiene} 
            onChange={(v) => handleCheck('handHygiene', v)} 
        />
      </div>
    </div>
  );
};

export default SafetyChecklist;

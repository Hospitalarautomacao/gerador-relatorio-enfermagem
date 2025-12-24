
import React from 'react';
import { BedBathChecklist as BedBathChecklistData } from '../types';
import ScaleCard from './scales/ScaleCard';
import Checkbox from './ui/Checkbox';
import AISuggestionButton from './AISuggestionButton';

interface BedBathChecklistProps {
  data: BedBathChecklistData | null;
  onChange: (data: BedBathChecklistData) => void;
}

const initialState: BedBathChecklistData = {
  skinIntegrity: false,
  hyperemia: false,
  lesions: false,
  lesionsLocation: '',
  hydration: '',
  tolerance: '',
  oralHygiene: false,
  perinealCare: false,
  linenChange: false,
  repositioned: false,
  observations: '',
  additionalCares: [],
  additionalCaresOther: '',
};

const RadioGroupField: React.FC<{ label: string; name: string; options: {value: string; label: string}[]; selectedValue: string; onChange: (value: string) => void; description?: string; }> = ({ label, name, options, selectedValue, onChange, description}) => (
    <div>
        <h4 className="text-sm font-semibold text-slate-600">{label}</h4>
        {description && <p className="text-xs text-slate-500 mb-2 mt-1">{description}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
            {options.map(opt => (
                <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={selectedValue === opt.value}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
            ))}
        </div>
    </div>
)


const BedBathChecklist: React.FC<BedBathChecklistProps> = ({ data, onChange }) => {

  const currentData = data || initialState;

  const handleChange = (field: keyof BedBathChecklistData, value: any) => {
    onChange({
      ...currentData,
      [field]: value,
    });
  };

  return (
    <ScaleCard title="Checklist do Banho no Leito" icon="fa-bath">
      <div className="space-y-6">
        
        {/* Skin Condition */}
        <div>
          <h3 className="font-bold text-slate-800 mb-3">Condição da Pele</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox label="Pele Íntegra" checked={currentData.skinIntegrity} onChange={v => handleChange('skinIntegrity', v)} description="Avaliar se toda a extensão da pele se apresenta sem rupturas, lesões abertas, fissuras ou escoriações." />
            <Checkbox label="Hiperemia" checked={currentData.hyperemia} onChange={v => handleChange('hyperemia', v)} description="Inspecionar proeminências ósseas (sacro, calcâneos, cotovelos) em busca de áreas de vermelhidão. Pressionar a área para verificar se é branqueável ou não." />
            <Checkbox label="Lesões" checked={currentData.lesions} onChange={v => handleChange('lesions', v)} description="Documentar a existência de lesões por pressão, feridas cirúrgicas, dermatites ou outras alterações. Se presente, descrever a localização no campo abaixo." />
          </div>
          {currentData.lesions && (
            <div className="mt-3">
              <input
                type="text"
                value={currentData.lesionsLocation}
                onChange={(e) => handleChange('lesionsLocation', e.target.value)}
                placeholder="Ex: região sacra, calcâneo direito"
                className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 text-sm"
              />
            </div>
          )}
          <div className="mt-4">
            <Checkbox
              label="Hidratação da Pele"
              checked={currentData.hydration !== ''}
              onChange={(isChecked) => {
                handleChange('hydration', isChecked ? 'hidratada' : '');
              }}
              description="Marque para avaliar o estado de hidratação da pele."
            />
            {currentData.hydration !== '' && (
              <div className="mt-3 pl-6">
                <RadioGroupField
                  label="Estado da Hidratação"
                  name="hydration"
                  description="Observar o turgor e a elasticidade da pele. Registrar se a pele tem aparência hidratada ou ressecada."
                  selectedValue={currentData.hydration}
                  onChange={(v) => handleChange('hydration', v)}
                  options={[
                    { value: 'hidratada', label: 'Pele Hidratada' },
                    { value: 'ressecada', label: 'Pele Ressecada' },
                  ]}
                />
              </div>
            )}
          </div>
        </div>

        {/* Patient Tolerance */}
         <div>
          <h3 className="font-bold text-slate-800 mb-3">Tolerância do Paciente</h3>
            <RadioGroupField 
                label="Comportamento"
                name="tolerance"
                description="Registrar a resposta do paciente ao procedimento. Observar sinais verbais e não verbais de dor, agitação, desconforto ou se o paciente se manteve calmo e colaborativo."
                selectedValue={currentData.tolerance}
                onChange={v => handleChange('tolerance', v)}
                options={[
                    {value: 'boa tolerância, calmo e colaborativo', label: 'Calmo e colaborativo'},
                    {value: 'agitação/inquietação', label: 'Agitado / Inquieto'},
                    {value: 'queixa de dor', label: 'Apresentou dor'},
                ]}
            />
        </div>

        {/* Cares */}
         <div>
          <h3 className="font-bold text-slate-800 mb-3">Cuidados Realizados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Checkbox label="Higiene Oral" checked={currentData.oralHygiene} onChange={v => handleChange('oralHygiene', v)} description="Confirmar que foi realizada a higiene da cavidade oral, incluindo dentes/próteses, gengivas e língua, utilizando os materiais adequados." />
             <Checkbox label="Higiene Íntima" checked={currentData.perinealCare} onChange={v => handleChange('perinealCare', v)} description="Confirmar que a higiene perineal foi realizada, removendo sujidades e secreções para prevenir infecções e promover conforto." />
             <Checkbox label="Troca de Roupa de Cama" checked={currentData.linenChange} onChange={v => handleChange('linenChange', v)} description="Assegurar que toda a roupa de cama (lençóis, fronha, traçado) foi trocada por peças limpas e secas, sem rugas." />
             <Checkbox label="Reposicionado" checked={currentData.repositioned} onChange={v => handleChange('repositioned', v)} description="Certificar que, ao final do procedimento, o paciente foi posicionado de forma segura e confortável no leito, utilizando coxins de apoio se necessário." />
          </div>
        </div>

        {/* Additional Cares */}
        <div>
          <h3 className="font-bold text-slate-800 mb-3">Cuidados Adicionais</h3>
          <div className="space-y-2">
            {['Aplicação de creme/pomada', 'Compressas frias/quentes', 'Massagem terapêutica', 'Outros (especificar)'].map(care => (
              <Checkbox
                key={care}
                label={care}
                checked={currentData.additionalCares.includes(care)}
                onChange={() => {
                  const currentCares = currentData.additionalCares;
                  const newCares = currentCares.includes(care)
                    ? currentCares.filter(c => c !== care)
                    : [...currentCares, care];
                  handleChange('additionalCares', newCares);
                }}
              />
            ))}
          </div>
          {currentData.additionalCares.includes('Outros (especificar)') && (
            <div className="mt-3 pl-6">
               <label htmlFor="additionalCaresOther" className="block text-sm font-medium text-slate-600 mb-1">
                 Outros Cuidados
               </label>
              <input
                id="additionalCaresOther"
                type="text"
                value={currentData.additionalCaresOther}
                onChange={(e) => handleChange('additionalCaresOther', e.target.value)}
                placeholder="Especifique o cuidado adicional"
                className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500 text-sm"
              />
            </div>
          )}
        </div>

         {/* Observations */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-slate-800">Observações Adicionais</h3>
            <AISuggestionButton
                contextType="bedBath"
                contextData={{
                    condicao_pele: [
                        currentData.skinIntegrity ? 'Pele Íntegra' : null,
                        currentData.hyperemia ? 'Apresenta Hiperemia' : null,
                        currentData.lesions ? `Lesões em ${currentData.lesionsLocation}` : null,
                        currentData.hydration ? `Pele ${currentData.hydration}` : null
                    ].filter(Boolean).join(', ') || 'Sem alterações significativas citadas',
                    tolerancia_paciente: currentData.tolerance || 'Não informada',
                    cuidados_realizados: [
                        currentData.oralHygiene ? 'Higiene Oral' : null,
                        currentData.perinealCare ? 'Higiene Íntima' : null,
                        currentData.linenChange ? 'Troca de Roupa de Cama' : null,
                        currentData.repositioned ? 'Reposicionamento' : null,
                        ...currentData.additionalCares
                    ].filter(Boolean).join(', '),
                    outros: currentData.additionalCaresOther
                }}
                onSuggestion={(suggestion) => handleChange('observations', suggestion)}
            />
          </div>
          <p className="text-xs text-slate-500 mb-2">Descreva aqui outras intercorrências ou detalhes importantes não cobertos pelas opções.</p>
           <textarea
              value={currentData.observations}
              onChange={(e) => handleChange('observations', e.target.value)}
              placeholder="Ex: Durante o banho, paciente referiu dor leve em MID. Realizada aplicação de creme barreira em região sacra. Segue calmo e confortável no leito."
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              rows={3}
          ></textarea>
        </div>

      </div>
    </ScaleCard>
  );
};

export default BedBathChecklist;


import React, { useState } from 'react';
import { ReportData, BedBathChecklist, WoundCareData, StockItem, Medication } from '../types';
import { REPORT_OPTIONS } from '../constants';
import OptionCategory from './OptionCategory';
import BedBathChecklistComponent from './BedBathChecklist';
import WoundCareForm from './WoundCareForm';
import AISuggestionButton from './AISuggestionButton';

interface ProceduresFormProps {
  data: Pick<ReportData, 'procedures' | 'bedBathChecklist' | 'woundCare' | 'procedureObservations' | 'currentConsumedStock' | 'mobility' | 'skin' | 'braden'>;
  onProcedureSelect: (value: string) => void;
  onBedBathChecklistChange: (data: BedBathChecklist | null) => void;
  onWoundCareChange: (data: WoundCareData | null) => void;
  onProcedureObservationChange: (procedure: string, observation: string) => void;
  onOpenModal: (type: 'addMedication' | 'addDevice') => void;
  stockItems: StockItem[];
  consumedStock: { itemId: string; quantityConsumed: number }[];
  onConsumedStockChange: (itemId: string, quantity: number) => void;
  onAddMedication: (medication: Medication) => void;
}

const ConsumedItemRow: React.FC<{
    item: StockItem;
    consumedQuantity: number;
    onQuantityChange: (quantity: number) => void;
}> = ({ item, consumedQuantity, onQuantityChange }) => {
    
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 0) {
            value = 0;
        }
        if (value > item.quantity) {
            value = item.quantity;
        }
        onQuantityChange(value);
    };
    
    return (
        <div className="grid grid-cols-12 gap-4 items-center p-2 hover:bg-slate-100 rounded-md">
            <div className="col-span-6">
                <p className="font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">Em estoque: {item.quantity} {item.unit}</p>
            </div>
            <div className="col-span-6 flex items-center justify-end gap-2">
                 <input
                    type="number"
                    value={consumedQuantity}
                    onChange={handleQuantityChange}
                    min="0"
                    max={item.quantity}
                    className="w-20 p-2 text-center bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                    aria-label={`Quantidade consumida de ${item.name}`}
                />
                <span className="text-sm text-slate-600">{item.unit}</span>
            </div>
        </div>
    );
};


const ProceduresForm: React.FC<ProceduresFormProps> = ({ 
    data, onProcedureSelect, onBedBathChecklistChange, onWoundCareChange, 
    onProcedureObservationChange, onOpenModal,
    stockItems, consumedStock, onConsumedStockChange, onAddMedication
}) => {
  const [newMed, setNewMed] = useState({ name: '', dose: '', route: '', frequency: '', observation: '' });

  const proceduresCategory = REPORT_OPTIONS.find(c => c.id === 'procedures');

  if (!proceduresCategory) return null;

  const proceduresWithObservations = data.procedures.filter(
    p => p !== 'banho no leito' && p !== 'Curativo'
  );

  const medicationProcedureValue = 'administração de medicação conforme prescrição';

  const handleAddInlineMed = () => {
      if (!newMed.name) return;
      const med: Medication = {
          id: Date.now().toString(),
          name: newMed.name,
          dose: newMed.dose,
          route: newMed.route,
          frequency: newMed.frequency,
          administrationTime: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
          observation: newMed.observation // Modified to allow empty observation without default text
      };
      onAddMedication(med);
      setNewMed({ name: '', dose: '', route: '', frequency: '', observation: '' });
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-xl font-bold text-slate-800 mb-2 border-b pb-2">
            <i className="fas fa-briefcase-medical mr-2 text-cyan-600"></i>
            Procedimentos e Materiais
          </h2>
          <p className="text-sm text-slate-500">
            Selecione os procedimentos prestados e registre os materiais consumidos durante o atendimento.
          </p>
      </div>

      <OptionCategory
        options={proceduresCategory.options}
        selection={data.procedures}
        type="multi"
        onSelect={onProcedureSelect}
      />
      
      {data.procedures.includes(medicationProcedureValue) && (
        <div className="bg-white p-4 rounded-xl shadow border border-cyan-200">
             <div className="bg-cyan-50 p-4 rounded-lg space-y-3 mb-3">
                <h4 className="font-bold text-cyan-800 text-sm flex items-center">
                    <i className="fas fa-pills mr-2"></i>
                    Registrar Medicação Administrada
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                        type="text" 
                        placeholder="Nome (ex: Dipirona)" 
                        className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-cyan-500"
                        value={newMed.name}
                        onChange={e => setNewMed({...newMed, name: e.target.value})}
                    />
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Dose (ex: 1g)" 
                            className="w-1/2 p-2 text-sm border rounded-md"
                            value={newMed.dose}
                            onChange={e => setNewMed({...newMed, dose: e.target.value})}
                        />
                        <input 
                            type="text" 
                            placeholder="Via (ex: EV)" 
                            className="w-1/2 p-2 text-sm border rounded-md"
                            value={newMed.route}
                            onChange={e => setNewMed({...newMed, route: e.target.value})}
                        />
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <input 
                        type="text" 
                        placeholder="Frequência (ex: 6/6h)" 
                        className="w-1/4 p-2 text-sm border rounded-md"
                        value={newMed.frequency}
                        onChange={e => setNewMed({...newMed, frequency: e.target.value})}
                    />
                    <input 
                        type="text" 
                        placeholder="Obs: Diluição/Preparo (Opcional)" 
                        className="flex-1 p-2 text-sm border rounded-md"
                        value={newMed.observation}
                        onChange={e => setNewMed({...newMed, observation: e.target.value})}
                    />
                    <button 
                        onClick={handleAddInlineMed}
                        className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-700 text-sm shadow-sm"
                        disabled={!newMed.name}
                    >
                        Adicionar
                    </button>
                </div>
             </div>
             
             <div className="text-center">
                <button
                    onClick={() => onOpenModal('addMedication')}
                    className="text-xs text-slate-500 hover:text-cyan-700 underline"
                >
                    Ou use o formulário avançado (Modal)
                </button>
            </div>
        </div>
      )}


      {proceduresWithObservations.length > 0 && (
        <div className="bg-white p-5 rounded-xl shadow space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
            <i className="fas fa-notes-medical mr-2 text-cyan-600"></i>
            Observações dos Procedimentos
          </h3>
          {proceduresWithObservations.map(procedure => {
              const isChangeOfDecubitus = procedure.toLowerCase().includes('mudança de decúbito');
    
              // Build context based on procedure type
              const contextData = isChangeOfDecubitus 
                  ? {
                      name: procedure,
                      observation: data.procedureObservations[procedure] || '',
                      // Pass patient context for a smarter suggestion
                      mobility: data.mobility,
                      skin: data.skin,
                      braden: data.braden,
                  }
                  : { 
                      name: procedure, 
                      observation: data.procedureObservations[procedure] || '' 
                  };

              return (
                <div key={procedure}>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor={`obs-${procedure}`} className="block text-sm font-medium text-slate-700">
                      {procedure.charAt(0).toUpperCase() + procedure.slice(1)}
                    </label>
                    <AISuggestionButton
                        contextType="procedure"
                        contextData={contextData}
                        onSuggestion={(suggestion) => onProcedureObservationChange(procedure, suggestion)}
                    />
                  </div>
                  <textarea
                    id={`obs-${procedure}`}
                    value={data.procedureObservations[procedure] || ''}
                    onChange={(e) => onProcedureObservationChange(procedure, e.target.value)}
                    placeholder={`Descreva detalhes sobre ${procedure.toLowerCase()}...`}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    rows={2}
                  />
                </div>
              );
          })}
        </div>
      )}

      {data.procedures.includes('banho no leito') && (
        <BedBathChecklistComponent
          data={data.bedBathChecklist}
          onChange={onBedBathChecklistChange}
        />
      )}

      {data.procedures.includes('Curativo') && (
        <WoundCareForm
          data={data.woundCare}
          onChange={onWoundCareChange}
        />
      )}

      <div className="bg-white p-5 rounded-xl shadow space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
                <i className="fas fa-dolly mr-2 text-cyan-600"></i>
                Materiais Utilizados no Atendimento
            </h3>
            <div className="space-y-2 p-2 bg-slate-50 rounded-lg max-h-80 overflow-y-auto">
                 {stockItems.length > 0 ? stockItems.map(item => {
                    const consumed = consumedStock.find(c => c.itemId === item.id);
                    return (
                        <ConsumedItemRow 
                            key={item.id}
                            item={item}
                            consumedQuantity={consumed?.quantityConsumed || 0}
                            onQuantityChange={(q) => onConsumedStockChange(item.id, q)}
                        />
                    );
                 }) : (
                    <p className="text-sm text-center text-slate-500 py-4">Nenhum item no estoque. Adicione itens na seção 'Estoque'.</p>
                 )}
            </div>
      </div>
    </div>
  );
};

export default ProceduresForm;




import React, { useCallback, useId, useEffect } from 'react';
import { NutritionData, Meal, MealItem } from '../types';
import AISuggestionButton from './AISuggestionButton';

interface MealItemRowProps {
    item: MealItem;
    onChange: (updatedItem: MealItem) => void;
    onRemove: () => void;
}

const MealItemRow: React.FC<MealItemRowProps> = ({ item, onChange, onRemove }) => {
    const handleFieldChange = (field: keyof Omit<MealItem, 'id'>, value: string | boolean) => {
        onChange({ ...item, [field]: value });
    };

    return (
        <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1 flex justify-center">
                <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    checked={item.consumed}
                    onChange={(e) => handleFieldChange('consumed', e.target.checked)}
                    aria-label={`Consumido: ${item.name}`}
                />
            </div>
            <div className="col-span-3">
                <input type="text" value={item.name} onChange={(e) => handleFieldChange('name', e.target.value)} placeholder="Item" className="w-full p-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-cyan-500" />
            </div>
            <div className="col-span-1">
                <input type="text" value={item.quantity} onChange={(e) => handleFieldChange('quantity', e.target.value)} placeholder="Qtd." className="w-full p-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-cyan-500" />
            </div>
            <div className="col-span-2">
                <input type="text" value={item.unit} onChange={(e) => handleFieldChange('unit', e.target.value)} placeholder="Unidade" className="w-full p-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-cyan-500" />
            </div>
            <div className="col-span-4">
                <input type="text" value={item.observation} onChange={(e) => handleFieldChange('observation', e.target.value)} placeholder="Observação" className="w-full p-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-cyan-500" />
            </div>
            <div className="col-span-1 flex justify-end">
                <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-1" aria-label={`Remover item ${item.name}`}>
                    <i className="fas fa-times-circle"></i>
                </button>
            </div>
        </div>
    );
};


interface MealCardProps {
    meal: Meal;
    onMealChange: (updatedMeal: Meal) => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onMealChange }) => {
    const uniqueId = useId();

    useEffect(() => {
        // Automatically calculate acceptance if in 'auto' mode and items change.
        if (meal.acceptanceMode === 'auto') {
            const consumedItems = meal.items.filter(item => item.consumed).length;
            const totalItems = meal.items.length;
            const newAcceptance = totalItems > 0 ? Math.round((consumedItems / totalItems) * 100) : 0;
            
            if (newAcceptance !== meal.acceptance) {
                onMealChange({ ...meal, acceptance: newAcceptance });
            }
        }
    }, [meal.items, meal.acceptanceMode, meal.acceptance, onMealChange]);

    const handleFieldChange = (field: keyof Meal, value: any) => {
        onMealChange({ ...meal, [field]: value });
    };

    const handleItemChange = (updatedItem: MealItem) => {
        const newItems = meal.items.map(item => item.id === updatedItem.id ? updatedItem : item);
        handleFieldChange('items', newItems);
    };

    const handleAddItem = () => {
        const newItem: MealItem = {
            id: Date.now().toString(),
            name: '',
            quantity: '',
            unit: '',
            observation: '',
            consumed: false
        };
        handleFieldChange('items', [...meal.items, newItem]);
    };

    const handleRemoveItem = (itemId: string) => {
        const newItems = meal.items.filter(item => item.id !== itemId);
        handleFieldChange('items', newItems);
    };

    const handleSwitchToManual = () => {
        onMealChange({ ...meal, acceptanceMode: 'manual' });
    };

    const handleSwitchToAuto = () => {
        const consumedItems = meal.items.filter(item => item.consumed).length;
        const totalItems = meal.items.length;
        const newAcceptance = totalItems > 0 ? Math.round((consumedItems / totalItems) * 100) : 0;
        onMealChange({ ...meal, acceptanceMode: 'auto', acceptance: newAcceptance });
    };

    const handleManualAcceptanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onMealChange({ ...meal, acceptance: parseInt(e.target.value, 10) });
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                    <i className={`fas ${meal.icon} text-cyan-600`}></i>
                    {meal.name}
                </h3>
                <span className="text-sm text-slate-500 font-medium">Responsável: Enfermagem 24h</span>
            </div>

            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={meal.completed}
                        onChange={e => handleFieldChange('completed', e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="font-semibold text-slate-700">Refeição realizada</span>
                </label>
                <input
                    type="time"
                    value={meal.time}
                    onChange={e => handleFieldChange('time', e.target.value)}
                    className="p-2 border border-slate-300 rounded-md text-sm"
                    disabled={!meal.completed}
                />
            </div>

            <div className="mb-4">
                <label htmlFor={`acceptance-${uniqueId}`} className="block text-sm font-medium text-slate-600 mb-1">Aceitação da Refeição</label>
                 <div className="flex items-center gap-4">
                    {meal.acceptanceMode === 'manual' ? (
                        <>
                            <input
                                id={`acceptance-${uniqueId}`}
                                type="range"
                                min="0" max="100" step="1"
                                value={meal.acceptance}
                                onChange={handleManualAcceptanceChange}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                disabled={!meal.completed}
                            />
                            <span className="font-bold text-cyan-700 w-16 text-center">{meal.acceptance}%</span>
                            <button onClick={handleSwitchToAuto} title="Voltar para cálculo automático" className="text-sm text-cyan-600 hover:underline"><i className="fas fa-calculator mr-1"></i>Auto</button>
                        </>
                    ) : (
                        <>
                            <div className="w-full bg-slate-200 rounded-full h-4 relative">
                                <div className="bg-cyan-600 h-4 rounded-full transition-all duration-300" style={{ width: `${meal.acceptance}%` }}></div>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white tracking-wider">{meal.acceptance}%</span>
                            </div>
                            <span className="font-bold text-cyan-700 w-16 text-center">{/* Placeholder */}</span>
                            <button onClick={handleSwitchToManual} title="Ajustar manualmente" className="text-sm text-slate-500 hover:text-slate-700" disabled={!meal.completed}><i className="fas fa-edit mr-1"></i>Manual</button>
                        </>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-slate-600">Itens da Refeição</h4>
                    <button onClick={handleAddItem} className="px-3 py-1 text-xs bg-cyan-100 text-cyan-800 font-semibold rounded-md hover:bg-cyan-200">
                        <i className="fas fa-plus mr-1"></i> Item Personalizado
                    </button>
                </div>
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
                    {meal.items.length > 0 ? meal.items.map(item => (
                        <MealItemRow
                            key={item.id}
                            item={item}
                            onChange={handleItemChange}
                            onRemove={() => handleRemoveItem(item.id)}
                        />
                    )) : <p className="text-sm text-slate-500 text-center py-2">Nenhum item adicionado.</p>}
                </div>
            </div>

            <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={meal.difficulty}
                        onChange={e => handleFieldChange('difficulty', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                     <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><i className="fas fa-exclamation-triangle text-amber-500"></i> Apresentou dificuldades para se alimentar</span>
                </label>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor={`obs-${uniqueId}`} className="block text-sm font-medium text-slate-600">Observações</label>
                        <AISuggestionButton
                            contextType="meal"
                            contextData={meal}
                            onSuggestion={(suggestion) => handleFieldChange('observations', suggestion)}
                            disabled={!meal.completed}
                        />
                    </div>
                    <textarea
                        id={`obs-${uniqueId}`}
                        value={meal.observations}
                        onChange={e => handleFieldChange('observations', e.target.value)}
                        placeholder={`Observações sobre a refeição...`}
                        className="w-full p-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        rows={2}
                    ></textarea>
                </div>
            </div>

        </div>
    );
};



interface NutritionFormProps {
  data: NutritionData;
  onInputChange: (data: NutritionData) => void;
}

const NutritionForm: React.FC<NutritionFormProps> = ({ data, onInputChange }) => {
  
  const handleDietTypeChange = (value: NutritionData['dietType']) => {
    onInputChange({ ...data, dietType: value });
  };
  
  const handleGeneralObsChange = (value: string) => {
    onInputChange({ ...data, generalObservations: value });
  };

  const handleMealChange = useCallback((updatedMeal: Meal) => {
    const newMeals = data.meals.map(m => m.id === updatedMeal.id ? updatedMeal : m);
    onInputChange({ ...data, meals: newMeals });
  }, [data, onInputChange]);

  const handleDietHistoryToggle = (option: string) => {
    const currentHistory = data.dietHistory || [];
    const newHistory = currentHistory.includes(option)
      ? currentHistory.filter(item => item !== option)
      : [...currentHistory, option];
    onInputChange({ ...data, dietHistory: newHistory });
  };

  const handleDietHistoryObsChange = (value: string) => {
    onInputChange({ ...data, dietHistoryObservations: value });
  };

  const dietHistoryOptions = ['Oral', 'SNE', 'NPT', 'Jejum'];

  const isMealSectionDisabled = data.dietType === 'Jejum' || data.dietType === 'NPT' || data.dietType === '';

  return (
    <div className="space-y-6">
       <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">
                <i className="fas fa-utensils mr-2 text-cyan-600"></i>
                Nutrição e Hidratação
            </h2>
             <div>
                <label htmlFor="dietType" className="block text-sm font-medium text-slate-600 mb-1">Dieta Atual / Via de Administração</label>
                <select
                    id="dietType"
                    value={data.dietType}
                    onChange={(e) => handleDietTypeChange(e.target.value as NutritionData['dietType'])}
                    className="w-full md:w-1/2 p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                >
                    <option value="">Selecione...</option>
                    <option value="Oral">Oral</option>
                    <option value="SNE">Sonda Nasoenteral (SNE)</option>
                    <option value="NPT">Nutrição Parenteral Total (NPT)</option>
                    <option value="Jejum">Jejum</option>
                </select>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Histórico de Dieta (Opcional)</h4>
                <div className="flex flex-wrap gap-2">
                    {dietHistoryOptions.map(option => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => handleDietHistoryToggle(option)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                (data.dietHistory || []).includes(option)
                                ? 'bg-cyan-600 text-white'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                <div className="mt-4">
                    <label htmlFor="dietHistoryObs" className="block text-sm font-medium text-slate-600 mb-1">Observações sobre o Histórico</label>
                    <textarea
                        id="dietHistoryObs"
                        value={data.dietHistoryObservations || ''}
                        onChange={e => handleDietHistoryObsChange(e.target.value)}
                        placeholder="Ex: Paciente esteve em NPT por 5 dias após cirurgia, evoluindo para dieta oral líquida."
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        rows={2}
                    ></textarea>
                </div>
            </div>
       </div>

       <div className={`space-y-6 transition-opacity ${isMealSectionDisabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {data.meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} onMealChange={handleMealChange} />
            ))}
       </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-lg font-semibold text-slate-700 mb-3">Observações Gerais da Dieta Atual</h3>
         <textarea
            value={data.generalObservations}
            onChange={(e) => handleGeneralObsChange(e.target.value)}
            placeholder="Observações gerais sobre a dieta atual do paciente..."
            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            rows={4}
        ></textarea>
      </div>

    </div>
  );
};

export default NutritionForm;

import React, { useState, useRef, useEffect } from 'react';
import { WoundCareData, WoundCareMaterial } from '../types';
import { WOUND_CARE_OPTIONS, MATERIALS_LIST, UNITS_LIST } from '../constants';
import AISuggestionButton from './AISuggestionButton';

interface WoundCareFormProps {
  data: WoundCareData | null;
  onChange: (data: WoundCareData) => void;
}

type CategoryKey = keyof typeof WOUND_CARE_OPTIONS;

const ChipSelector: React.FC<{ title: string; options: string[]; selected: string[]; onToggle: (value: string) => void; onAdd: (value: string) => void; icon?: string; }> = ({ title, options, selected, onToggle, onAdd, icon }) => {
  const [customValue, setCustomValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAdd = () => {
    if (customValue.trim() && !options.includes(customValue.trim()) && !selected.includes(customValue.trim())) {
      onAdd(customValue.trim());
    }
    setCustomValue('');
    setShowInput(false);
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-600 mb-2 flex items-center">
        {icon && <i className={`fas ${icon} mr-2 text-cyan-600`}></i>}
        <span>{title}</span>
      </h4>
      <div className="flex flex-wrap gap-2 items-center">
        {options.map(option => (
          <button key={option} onClick={() => onToggle(option)} className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${selected.includes(option) ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
            {option}
          </button>
        ))}
        {showInput ? (
          <div className="flex gap-1">
            <input 
              type="text" 
              value={customValue} 
              onChange={e => setCustomValue(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Novo item..." 
              className="p-1.5 text-sm border-slate-300 rounded-md"
              autoFocus
            />
            <button onClick={handleAdd} className="px-3 py-1.5 text-sm font-medium rounded-md bg-green-500 text-white hover:bg-green-600"><i className="fas fa-check"></i></button>
            <button onClick={() => setShowInput(false)} className="px-3 py-1.5 text-sm font-medium rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300"><i className="fas fa-times"></i></button>
          </div>
        ) : (
          <button onClick={() => setShowInput(true)} className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300">+</button>
        )}
      </div>
    </div>
  );
};

interface MaterialItemRowProps {
  item: WoundCareMaterial;
  onChange: (updatedItem: WoundCareMaterial) => void;
  onRemove: () => void;
}

const MaterialItemRow: React.FC<MaterialItemRowProps> = ({ item, onChange, onRemove }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleFieldChange = (field: keyof Omit<WoundCareMaterial, 'id'>, value: string) => {
        onChange({ ...item, [field]: value });
    };
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleFieldChange('name', value);

        if (value.trim().length > 0) {
            const filteredSuggestions = MATERIALS_LIST.filter(material =>
                material.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
            setIsSuggestionsVisible(true);
        } else {
            setIsSuggestionsVisible(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleFieldChange('name', suggestion);
        setIsSuggestionsVisible(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsSuggestionsVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-6 relative" ref={wrapperRef}>
                <input 
                    type="text" 
                    value={item.name} 
                    onChange={handleNameChange} 
                    onFocus={handleNameChange} // Show suggestions on focus if there's text
                    placeholder="Nome do material" 
                    className="w-full p-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-cyan-500" 
                />
                {isSuggestionsVisible && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-slate-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {suggestions.map(suggestion => (
                            <li 
                                key={suggestion} 
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="p-2 text-sm text-slate-700 hover:bg-cyan-50 cursor-pointer"
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="col-span-2">
                <input 
                    type="number"
                    min="1"
                    value={item.quantity} 
                    onChange={(e) => handleFieldChange('quantity', e.target.value)} 
                    placeholder="Qtd." 
                    className="w-full p-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-cyan-500" 
                />
            </div>
            <div className="col-span-3">
                 <select
                    value={item.unit}
                    onChange={(e) => handleFieldChange('unit', e.target.value)}
                    className="w-full p-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-cyan-500"
                >
                    {UNITS_LIST.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </div>
            <div className="col-span-1 flex justify-end">
                <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-1" aria-label={`Remover item ${item.name}`}>
                    <i className="fas fa-times-circle"></i>
                </button>
            </div>
        </div>
    );
};


const WoundCareForm: React.FC<WoundCareFormProps> = ({ data, onChange }) => {
  const currentData = data || { cleansing: [], application: [], materials: [], frequency: [], location: [], type: [], aspect: [], odor: [], secretion: [], observations: '', startDate: '', startTime: '', exudateAmount: [], surroundingSkin: [], tolerance: [] };
  const [errors, setErrors] = useState<{ startDate?: string }>({});

  useEffect(() => {
    const newErrors: { startDate?: string } = {};
    if (currentData.startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Ignore time part for comparison

      // Add T00:00:00 to avoid timezone issues when parsing the date string
      const startDate = new Date(`${currentData.startDate}T00:00:00`);

      if (startDate > today) {
        newErrors.startDate = 'A data de início não pode ser futura.';
      }
    }
    setErrors(newErrors);
  }, [currentData.startDate]);

  const handleToggle = (category: CategoryKey, value: string) => {
    const currentSelection = (currentData[category] as string[]) || [];
    const newSelection = currentSelection.includes(value)
      ? currentSelection.filter(item => item !== value)
      : [...currentSelection, value];
    onChange({ ...currentData, [category]: newSelection });
  };

  const handleAddCustom = (category: CategoryKey, value: string) => {
     const currentSelection = (currentData[category] as string[]) || [];
     onChange({ ...currentData, [category]: [...currentSelection, value] });
  };
  
    const handleInputChange = (field: 'startDate' | 'startTime', value: string) => {
        onChange({ ...currentData, [field]: value });
    };

  const handleMaterialChange = (updatedItem: WoundCareMaterial) => {
    const newMaterials = currentData.materials.map(item => item.id === updatedItem.id ? updatedItem : item);
    onChange({ ...currentData, materials: newMaterials });
  };

  const handleAddMaterial = () => {
    const newMaterial: WoundCareMaterial = {
      id: Date.now().toString(),
      name: '',
      quantity: '1',
      unit: 'unidade',
    };
    onChange({ ...currentData, materials: [...currentData.materials, newMaterial] });
  };
  
  const handleRemoveMaterial = (id: string) => {
    onChange({ ...currentData, materials: currentData.materials.filter(m => m.id !== id) });
  };
  
  const categories: { key: CategoryKey, title: string, icon?: string }[] = [
      { key: 'location', title: 'Localização da Lesão', icon: 'fa-map-marker-alt' },
      { key: 'type', title: 'Tipo de Lesão' },
      { key: 'aspect', title: 'Aspecto da Lesão' },
      { key: 'surroundingSkin', title: 'Pele Perilesional' },
      { key: 'odor', title: 'Odor' },
      { key: 'secretion', title: 'Tipo de Secreção' },
      { key: 'exudateAmount', title: 'Quantidade de Exsudato' },
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow space-y-6">
       <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
         <i className="fas fa-bandage mr-2 text-cyan-600"></i>
         Dados do Curativo
       </h2>
        
        <div>
            <ChipSelector 
                title="Frequência do Curativo"
                options={WOUND_CARE_OPTIONS['frequency']}
                selected={currentData['frequency']}
                onToggle={(value) => handleToggle('frequency', value)}
                onAdd={(value) => handleAddCustom('frequency', value)}
             />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pl-1">
                <div>
                    <label htmlFor="wound-start-date" className="text-sm font-semibold text-slate-600 mb-1 block">Data de início</label>
                    <input
                        type="date"
                        id="wound-start-date"
                        value={currentData.startDate || ''}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className={`w-full p-2 text-sm bg-white border rounded-md focus:ring-1 ${errors.startDate ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-cyan-500'}`}
                        aria-invalid={!!errors.startDate}
                        aria-describedby={errors.startDate ? 'wound-start-date-error' : undefined}
                    />
                    {errors.startDate && <p id="wound-start-date-error" className="text-red-600 text-xs mt-1">{errors.startDate}</p>}
                </div>
                <div>
                    <label htmlFor="wound-start-time" className="text-sm font-semibold text-slate-600 mb-1 block">Horário de início</label>
                    <input
                        type="time"
                        id="wound-start-time"
                        value={currentData.startTime || ''}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        className="w-full p-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-cyan-500"
                    />
                </div>
            </div>
        </div>

        {categories.map(cat => (
             <ChipSelector 
                key={cat.key}
                title={cat.title}
                icon={cat.icon}
                options={WOUND_CARE_OPTIONS[cat.key]}
                selected={currentData[cat.key] || []}
                onToggle={(value) => handleToggle(cat.key, value)}
                onAdd={(value) => handleAddCustom(cat.key, value)}
             />
        ))}

        <div className="bg-slate-50 p-4 rounded-lg space-y-4">
            <h3 className="font-bold text-slate-800">Conduta</h3>
             <ChipSelector title="Lavar com" options={WOUND_CARE_OPTIONS.cleansing} selected={currentData.cleansing} onToggle={(v) => handleToggle('cleansing', v)} onAdd={(v) => handleAddCustom('cleansing', v)} />
             <ChipSelector title="Aplicar" options={WOUND_CARE_OPTIONS.application} selected={currentData.application} onToggle={(v) => handleToggle('application', v)} onAdd={(v) => handleAddCustom('application', v)} />
        </div>
        
        <ChipSelector 
            title="Tolerância ao Procedimento"
            options={WOUND_CARE_OPTIONS.tolerance}
            selected={currentData.tolerance}
            onToggle={(value) => handleToggle('tolerance', value)}
            onAdd={(value) => handleAddCustom('tolerance', value)}
        />

        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800">Materiais Gastos</h3>
                <button onClick={handleAddMaterial} className="px-3 py-1.5 text-sm bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700">
                    <i className="fas fa-plus mr-2"></i> Adicionar Material
                </button>
            </div>
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
                {currentData.materials.length > 0 ? (
                  currentData.materials.map(mat => (
                    <MaterialItemRow
                        key={mat.id}
                        item={mat}
                        onChange={handleMaterialChange}
                        onRemove={() => handleRemoveMaterial(mat.id)}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-2">Nenhum material adicionado.</p>
                )}
            </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-slate-800">Observações Gerais</h3>
                 <AISuggestionButton
                    contextType="wound"
                    contextData={{
                        localizacao: currentData.location.join(', ') || 'Não informado',
                        tipo_lesao: currentData.type.join(', ') || 'Não informado',
                        aspecto: currentData.aspect.join(', ') || 'Não informado',
                        secrecao: currentData.secretion.join(', ') || 'Ausente',
                        quantidade_exsudato: currentData.exudateAmount.join(', ') || 'N/A',
                        odor: currentData.odor.join(', ') || 'Ausente',
                        pele_perilesional: currentData.surroundingSkin.join(', ') || 'Íntegra',
                        limpeza: currentData.cleansing.join(', '),
                        cobertura: currentData.application.join(', '),
                        tolerancia: currentData.tolerance.join(', ') || 'Boa'
                    }}
                    onSuggestion={(suggestion) => onChange({ ...currentData, observations: suggestion })}
                />
            </div>
            <textarea
                value={currentData.observations || ''}
                onChange={(e) => onChange({ ...currentData, observations: e.target.value })}
                placeholder="Descreva aqui intercorrências, tolerância do paciente ao procedimento, ou outros detalhes importantes..."
                className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                rows={4}
            ></textarea>
        </div>
    </div>
  );
};

export default WoundCareForm;

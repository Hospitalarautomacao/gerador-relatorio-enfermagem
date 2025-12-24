
import React, { useState, useMemo } from 'react';
import { StockItem } from '../types';
import Modal from './Modal';
import InputField from './ui/InputField';

interface CustomKitBuilderProps {
    stockItems: StockItem[];
    onSaveKit: (items: any[]) => void;
    patientDiagnosis: string;
}

interface KitTemplate {
    id: string;
    title: string;
    icon: string;
    color: string;
    items: string[];
}

// Modelos Iniciais com linguagem simples e direta
const INITIAL_PRESETS: KitTemplate[] = [
    {
        id: 'kit-higiene',
        title: 'Banho no Leito',
        icon: 'fa-bath',
        color: 'cyan',
        items: ['Sabonete Líquido', 'Luva de Banho', 'Hidratante', 'Fralda Geriátrica', 'Lençol', 'Toalha de Banho']
    },
    {
        id: 'kit-curativo',
        title: 'Curativo Simples',
        icon: 'fa-bandage',
        color: 'amber',
        items: ['Pacote de Gaze', 'Soro Fisiológico 0.9%', 'Luva de Procedimento', 'Esparadrapo', 'Micropore', 'Pinça Anatômica']
    },
    {
        id: 'kit-acesso',
        title: 'Acesso Venoso',
        icon: 'fa-syringe',
        color: 'green',
        items: ['Jelco 20G', 'Seringa 10ml', 'Agulha 40x12', 'Garrote', 'Algodão', 'Álcool 70%', 'Fixador de Cateter']
    },
    {
        id: 'kit-hgt',
        title: 'Glicemia (HGT)',
        icon: 'fa-droplet',
        color: 'rose',
        items: ['Fita HGT', 'Lanceta', 'Algodão', 'Álcool 70%', 'Luva de Procedimento']
    },
    {
        id: 'kit-nebu',
        title: 'Nebulização',
        icon: 'fa-lungs',
        color: 'blue',
        items: ['Máscara de Nebulização', 'Soro Fisiológico 5ml', 'Medicação (conforme prescrição)']
    },
    {
        id: 'kit-sonda',
        title: 'Sondagem Vesical',
        icon: 'fa-faucet-drip',
        color: 'purple',
        items: ['Sonda Foley', 'Bolsa Coletora', 'Xilocaína Gel', 'Seringa 20ml', 'Água Destilada', 'Luva Estéril', 'Campo Fenestrado']
    }
];

const ICONS = [
    { class: 'fa-box', label: 'Caixa' },
    { class: 'fa-bath', label: 'Banho' },
    { class: 'fa-bandage', label: 'Curativo' },
    { class: 'fa-syringe', label: 'Seringa' },
    { class: 'fa-pills', label: 'Remédios' },
    { class: 'fa-droplet', label: 'Gota' },
    { class: 'fa-lungs', label: 'Pulmão' },
    { class: 'fa-faucet-drip', label: 'Sonda' },
    { class: 'fa-user-nurse', label: 'Cuidados' }
];

const COLORS = [
    { value: 'blue', label: 'Azul' },
    { value: 'green', label: 'Verde' },
    { value: 'amber', label: 'Laranja' },
    { value: 'rose', label: 'Vermelho' },
    { value: 'purple', label: 'Roxo' },
    { value: 'cyan', label: 'Ciano' },
    { value: 'teal', label: 'Verde Água' },
    { value: 'slate', label: 'Cinza' }
];

const getColorClasses = (color: string) => {
    switch (color) {
        case 'blue': return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
        case 'green': return 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100';
        case 'amber': return 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100';
        case 'cyan': return 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100';
        case 'rose': return 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100';
        case 'purple': return 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100';
        case 'teal': return 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100';
        default: return 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
    }
};

const CustomKitBuilder: React.FC<CustomKitBuilderProps> = ({ stockItems, onSaveKit, patientDiagnosis }) => {
    const [presets, setPresets] = useState<KitTemplate[]>(INITIAL_PRESETS);
    const [kitItems, setKitItems] = useState<{item: StockItem, qty: number}[]>([]);
    const [activeTab, setActiveTab] = useState<'todos' | 'materiais' | 'medicamentos'>('todos');
    const [searchTerm, setSearchTerm] = useState('');

    // State do Modal de Edição
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingKit, setEditingKit] = useState<KitTemplate | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const [editItemIndex, setEditItemIndex] = useState<number | null>(null);

    // --- Helpers de Inteligência ---

    const isItemRecommended = (itemName: string) => {
        if (!patientDiagnosis) return false;
        const diag = patientDiagnosis.toLowerCase();
        const name = itemName.toLowerCase();
        
        if (name.includes('luva') || name.includes('alcool') || name.includes('algodao')) return false; 
        
        if ((diag.includes('diabet') || diag.includes('dm')) && (name.includes('hgt') || name.includes('fita') || name.includes('lanceta') || name.includes('insulina') || name.includes('glicemia'))) return true;
        if ((diag.includes('resp') || diag.includes('asma') || diag.includes('pneumonia')) && (name.includes('nebul') || name.includes('mascara') || name.includes('o2') || name.includes('cateter'))) return true;
        if ((diag.includes('ferida') || diag.includes('ulcera') || diag.includes('lpp') || diag.includes('lesao')) && (name.includes('gaze') || name.includes('atadura') || name.includes('curativo') || name.includes('cobertura') || name.includes('dersani'))) return true;
        if ((diag.includes('urinaria') || diag.includes('retencao')) && (name.includes('sonda') || name.includes('coletor') || name.includes('foley'))) return true;
        if ((diag.includes('venoso') || diag.includes('soro')) && (name.includes('jelco') || name.includes('scalp') || name.includes('seringa') || name.includes('equipo'))) return true;

        return false;
    };

    const checkRecommendation = (kit: KitTemplate) => {
        if (!patientDiagnosis) return false;
        const diag = patientDiagnosis.toLowerCase();
        const title = kit.title.toLowerCase();
        
        if (title.includes('hgt') && (diag.includes('diabet') || diag.includes('dm'))) return true;
        if (title.includes('nebu') && (diag.includes('asma') || diag.includes('resp') || diag.includes('pneumonia'))) return true;
        if (title.includes('curativo') && (diag.includes('ferida') || diag.includes('ulcera') || diag.includes('lpp'))) return true;
        if (title.includes('sonda') && (diag.includes('urinaria') || diag.includes('retencao'))) return true;
        if (title.includes('acesso') && (diag.includes('hidrata') || diag.includes('soro'))) return true;
        
        return false;
    };

    const getStockStatus = (items: string[]) => {
        let found = 0;
        let missing = 0;
        items.forEach(presetItem => {
            const stockItem = stockItems.find(s => 
                s.name.toLowerCase().includes(presetItem.toLowerCase()) || 
                presetItem.toLowerCase().includes(s.name.toLowerCase())
            );
            if (stockItem && stockItem.quantity > 0) found++;
            else missing++;
        });
        return { found, missing, total: items.length };
    };

    const addToKit = (item: StockItem, quantity = 1) => {
        setKitItems(prev => {
            const exists = prev.find(i => i.item.id === item.id);
            if (exists) {
                return prev.map(i => i.item.id === item.id ? {...i, qty: i.qty + quantity} : i);
            }
            return [...prev, { item, qty: quantity }];
        });
    };

    const applyPreset = (presetItems: string[]) => {
        let addedCount = 0;
        let missingItems = [];

        presetItems.forEach(presetName => {
            const stockItem = stockItems.find(s => 
                s.name.toLowerCase().includes(presetName.toLowerCase()) || 
                presetName.toLowerCase().includes(s.name.toLowerCase())
            );

            if (stockItem) {
                addToKit(stockItem);
                addedCount++;
            } else {
                missingItems.push(presetName);
            }
        });

        if (addedCount === 0) {
            alert('Nenhum item deste kit foi encontrado no estoque atual.');
        } else if (missingItems.length > 0) {
            // Toast notificaiton ideal here, using simple alert for now if needed or just logging
            // console.log(`Itens faltantes: ${missingItems.join(', ')}`);
        }
    };

    const removeFromKit = (id: string) => {
        setKitItems(prev => prev.filter(i => i.item.id !== id));
    };

    const handleOpenEdit = (e: React.MouseEvent, kit?: KitTemplate) => {
        e.stopPropagation();
        setNewItemName('');
        setEditItemIndex(null);
        if (kit) {
            setEditingKit({ ...kit });
        } else {
            setEditingKit({
                id: '',
                title: '',
                icon: 'fa-box',
                color: 'blue',
                items: []
            });
        }
        setIsEditModalOpen(true);
    };

    const handleDeletePreset = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Excluir este modelo de kit?')) {
            setPresets(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleSavePreset = () => {
        if (!editingKit?.title) return;
        setPresets(prev => {
            if (editingKit.id) {
                return prev.map(p => p.id === editingKit.id ? editingKit : p);
            } else {
                return [...prev, { ...editingKit, id: Date.now().toString() }];
            }
        });
        setIsEditModalOpen(false);
        setEditingKit(null);
    };

    const addOrUpdateDraftItem = () => {
        if (newItemName.trim() && editingKit) {
            const newItems = [...editingKit.items];
            if (editItemIndex !== null && editItemIndex >= 0) {
                newItems[editItemIndex] = newItemName.trim();
            } else {
                newItems.push(newItemName.trim());
            }
            setEditingKit({ ...editingKit, items: newItems });
            setNewItemName('');
            setEditItemIndex(null);
        }
    };

    const handleEditItemInList = (index: number) => {
        if (editingKit) {
            setNewItemName(editingKit.items[index]);
            setEditItemIndex(index);
        }
    };

    const removeDraftItem = (index: number) => {
        if (editingKit) {
            const newItems = [...editingKit.items];
            newItems.splice(index, 1);
            setEditingKit({ ...editingKit, items: newItems });
            if (editItemIndex === index) {
                setEditItemIndex(null);
                setNewItemName('');
            }
        }
    };

    // Organized Stock Lists
    const { recommendedStock, generalStock } = useMemo(() => {
        const filtered = stockItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTab = 
                activeTab === 'todos' ? true :
                activeTab === 'medicamentos' ? item.category === 'Medicamentos' :
                item.category !== 'Medicamentos'; 
            return matchesSearch && matchesTab;
        });

        const recommended: StockItem[] = [];
        const general: StockItem[] = [];

        filtered.forEach(item => {
            if (isItemRecommended(item.name)) recommended.push(item);
            else general.push(item);
        });

        // Sort alphabetical
        recommended.sort((a,b) => a.name.localeCompare(b.name));
        general.sort((a,b) => a.name.localeCompare(b.name));

        return { recommendedStock: recommended, generalStock: general };
    }, [stockItems, searchTerm, activeTab, patientDiagnosis]);

    return (
        <div className="flex flex-col h-full space-y-6">
            
            {/* 1. Header & Presets */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center">
                            <i className="fas fa-wand-magic-sparkles mr-2 text-purple-600"></i>
                            Modelos de Kits Rápidos
                        </h2>
                        <p className="text-xs text-slate-500">Sugestões baseadas no diagnóstico e estoque.</p>
                    </div>
                    <button 
                        onClick={(e) => handleOpenEdit(e)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm"
                    >
                        <i className="fas fa-plus-circle"></i> Novo Modelo
                    </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {presets.map(kit => {
                        const styleClass = getColorClasses(kit.color);
                        const isRec = checkRecommendation(kit);
                        const stockStatus = getStockStatus(kit.items);
                        const isUnavailable = stockStatus.missing > 0 && stockStatus.found === 0;
                        const isPartial = stockStatus.missing > 0 && stockStatus.found > 0;

                        return (
                            <div
                                key={kit.id}
                                className={`relative group flex flex-col justify-between p-3 rounded-xl border-2 transition-all ${styleClass} ${isRec ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
                            >
                                {isRec && (
                                    <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10 animate-bounce">
                                        Indicado
                                    </div>
                                )}
                                
                                <div 
                                    className="w-full flex flex-col items-center cursor-pointer pb-8 flex-grow justify-center"
                                    onClick={() => applyPreset(kit.items)}
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center mb-2 shadow-sm">
                                        <i className={`fas ${kit.icon} text-lg`}></i>
                                    </div>
                                    <span className="text-xs font-bold text-center leading-tight mb-1">{kit.title}</span>
                                    
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] opacity-75">{kit.items.length} itens</span>
                                        {isUnavailable ? (
                                            <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded mt-1 font-bold">Indisponível</span>
                                        ) : isPartial ? (
                                            <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded mt-1 font-bold">Parcial ({stockStatus.found}/{stockStatus.total})</span>
                                        ) : (
                                            <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded mt-1 font-bold">Disponível</span>
                                        )}
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 flex border-t border-black/5 divide-x divide-black/5 bg-white/40 rounded-b-[10px] overflow-hidden">
                                    <button 
                                        onClick={(e) => handleOpenEdit(e, kit)}
                                        className="flex-1 py-2 text-[10px] font-bold text-slate-600 hover:bg-white/80 hover:text-blue-600 transition-colors"
                                    >
                                        EDITAR
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeletePreset(e, kit.id)}
                                        className="flex-1 py-2 text-[10px] font-bold text-slate-600 hover:bg-white/80 hover:text-red-600 transition-colors"
                                    >
                                        EXCLUIR
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
                
                {/* 2. Lista de Estoque */}
                <div className="md:col-span-7 flex flex-col bg-white rounded-xl shadow overflow-hidden">
                    <div className="p-4 border-b bg-slate-50">
                        <div className="flex gap-2 mb-3">
                            <button onClick={() => setActiveTab('todos')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${activeTab === 'todos' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300'}`}>Todos</button>
                            <button onClick={() => setActiveTab('materiais')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${activeTab === 'materiais' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-600 border-slate-300'}`}>Materiais</button>
                            <button onClick={() => setActiveTab('medicamentos')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${activeTab === 'medicamentos' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300'}`}>Medicamentos</button>
                        </div>
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-2.5 text-slate-400"></i>
                            <input 
                                type="text" 
                                placeholder="Buscar item no estoque..." 
                                className="w-full pl-9 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
                        {recommendedStock.length > 0 && (
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-purple-700 uppercase tracking-wider px-2 flex items-center">
                                    <i className="fas fa-star mr-1"></i> Sugestões Inteligentes ({patientDiagnosis})
                                </h3>
                                {recommendedStock.map(item => (
                                    <button 
                                        key={item.id}
                                        onClick={() => addToKit(item)}
                                        className="w-full flex justify-between items-center p-3 border border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-lg group transition-all text-left shadow-sm"
                                    >
                                        <div>
                                            <span className="text-sm font-bold text-purple-800 block">{item.name}</span>
                                            <span className="text-[10px] text-purple-600 uppercase">{item.category} • Disp: {item.quantity}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <i className="fas fa-plus"></i>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="space-y-1">
                            {recommendedStock.length > 0 && <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mt-2">Estoque Geral</h3>}
                            {generalStock.length > 0 ? generalStock.map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => addToKit(item)}
                                    className="w-full flex justify-between items-center p-3 border border-transparent hover:border-slate-200 hover:bg-slate-50 rounded-lg group transition-all text-left"
                                >
                                    <div>
                                        <span className="text-sm font-semibold text-slate-700 block group-hover:text-cyan-700">{item.name}</span>
                                        <span className="text-[10px] text-slate-400 uppercase">{item.category} • Disp: {item.quantity}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors">
                                        <i className="fas fa-plus"></i>
                                    </div>
                                </button>
                            )) : (
                                recommendedStock.length === 0 && <div className="text-center py-10 text-slate-400"><p>Nenhum item encontrado.</p></div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Kit em Construção (Direita) */}
                <div className="md:col-span-5 flex flex-col bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-bold text-slate-700 flex items-center gap-2">
                            <i className="fas fa-box-open text-cyan-600"></i>
                            Itens do Kit
                        </h3>
                        <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2 py-1 rounded-full">{kitItems.length} itens</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 mb-4 custom-scrollbar pr-1">
                        {kitItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                <i className="fas fa-arrow-left text-2xl mb-2 hidden md:block"></i>
                                <i className="fas fa-arrow-up text-2xl mb-2 md:hidden"></i>
                                <p className="text-sm text-center">Selecione itens ou use um modelo.</p>
                            </div>
                        ) : (
                            kitItems.map((k) => (
                                <div key={k.item.id} className="flex justify-between items-center p-2 bg-white shadow-sm rounded-lg border border-slate-200">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <span className="text-sm font-bold text-slate-800 truncate block" title={k.item.name}>{k.item.name}</span>
                                        <span className="text-[10px] text-slate-500">{k.item.unit}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={k.qty} 
                                            min="1"
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if(val > 0) addToKit(k.item, val - k.qty);
                                            }}
                                            className="w-14 p-1 text-center border rounded text-sm font-bold text-slate-700 focus:ring-cyan-500"
                                        />
                                        <button onClick={() => removeFromKit(k.item.id)} className="text-red-400 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 transition-colors">
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <button 
                        onClick={() => onSaveKit(kitItems)}
                        className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all active:scale-95"
                        disabled={kitItems.length === 0}
                    >
                        <i className="fas fa-save"></i>
                        Salvar Kit no Prontuário
                    </button>
                </div>
            </div>

            {/* Modal de Edição */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={editingKit?.id ? "Editar Modelo" : "Criar Novo Modelo"}
                footer={
                    <>
                        <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                        <button onClick={handleSavePreset} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700">Salvar Modelo</button>
                    </>
                }
            >
                {editingKit && (
                    <div className="space-y-4">
                        <InputField 
                            id="kitTitle" 
                            label="Nome do Modelo" 
                            value={editingKit.title} 
                            onChange={(e) => setEditingKit({...editingKit, title: e.target.value})} 
                            placeholder="Ex: Kit Curativo Pós-Op"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Cor</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => setEditingKit({...editingKit, color: c.value})}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${editingKit.color === c.value ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: `var(--color-${c.value}-500)` }} 
                                        >
                                            <div className={`w-full h-full rounded-full ${getColorClasses(c.value).split(' ')[0].replace('50', '500')}`}></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Ícone</label>
                                <div className="flex flex-wrap gap-2">
                                    {ICONS.map(icon => (
                                        <button
                                            key={icon.class}
                                            onClick={() => setEditingKit({...editingKit, icon: icon.class})}
                                            className={`w-8 h-8 rounded-lg border transition-all flex items-center justify-center ${editingKit.icon === icon.class ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
                                        >
                                            <i className={`fas ${icon.class}`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">
                                {editItemIndex !== null ? 'Editar Item' : 'Adicionar Item (Busca no Estoque)'}
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input 
                                    list="stock-suggestions"
                                    type="text" 
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addOrUpdateDraftItem()}
                                    placeholder="Digite o nome do item..."
                                    className="flex-1 p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    autoFocus
                                />
                                <datalist id="stock-suggestions">
                                    {stockItems.map(s => <option key={s.id} value={s.name} />)}
                                </datalist>
                                <button onClick={addOrUpdateDraftItem} className="px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold">
                                    <i className={`fas ${editItemIndex !== null ? 'fa-check' : 'fa-plus'}`}></i>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 min-h-[80px] max-h-[150px] overflow-y-auto">
                                {editingKit.items.length === 0 && <span className="text-xs text-slate-400 italic w-full text-center mt-4">Nenhum item adicionado.</span>}
                                {editingKit.items.map((item, idx) => (
                                    <span 
                                        key={idx} 
                                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors ${idx === editItemIndex ? 'bg-blue-100 border border-blue-300 text-blue-700' : 'bg-white border border-slate-300 hover:bg-blue-50'}`}
                                        onClick={() => handleEditItemInList(idx)}
                                    >
                                        {item}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeDraftItem(idx); }}
                                            className="text-red-400 hover:text-red-600 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50"
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CustomKitBuilder;

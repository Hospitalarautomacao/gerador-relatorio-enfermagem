
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StockItem, ConsumptionLog } from '../types';
import Modal from './Modal';
import InputField from './ui/InputField';
import { exportConsumptionHistoryToCSV } from '../utils/exportUtils';
import { saveStockItem, deleteStockItem, logConsumption } from '../services/databaseService';

const CategoryManagerModal = ({ isOpen, onClose, categories, stockItems, onAdd, onEdit, onDelete, onReorder }) => {
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    // Reset error when input changes
    useEffect(() => {
        setError(null);
    }, [newCategory, editValue]);

    const handleAdd = () => {
        const trimmedCategory = newCategory.trim();
        if (!trimmedCategory) {
            setError("O nome da categoria não pode estar vazio.");
            return;
        }
        if (categories.some(c => c.toLowerCase() === trimmedCategory.toLowerCase())) {
            setError("Esta categoria já existe.");
            return;
        }
        onAdd(trimmedCategory);
        setNewCategory('');
        setError(null);
    };

    const startEditing = (category: string) => {
        setEditingCategory(category);
        setEditValue(category);
        setError(null);
    };

    const cancelEditing = () => {
        setEditingCategory(null);
        setEditValue('');
        setError(null);
    };

    const saveEditing = () => {
        const trimmedValue = editValue.trim();
        if (!trimmedValue) {
             setError("O nome não pode estar vazio.");
             return;
        }
        if (trimmedValue !== editingCategory) {
             if (categories.some(c => c.toLowerCase() === trimmedValue.toLowerCase())) {
                setError("Já existe uma categoria com este nome.");
                return;
            }
            onEdit(editingCategory, trimmedValue);
        }
        setEditingCategory(null);
        setEditValue('');
        setError(null);
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItemIndex(index);
        // Required for Firefox
        e.dataTransfer.effectAllowed = "move"; 
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedItemIndex === null) return;
        if (draggedItemIndex === dropIndex) {
            setDraggedItemIndex(null);
            return;
        }

        const newCategories = [...categories];
        const draggedItem = newCategories[draggedItemIndex];
        
        // Remove item from old position
        newCategories.splice(draggedItemIndex, 1);
        // Insert item at new position
        newCategories.splice(dropIndex, 0, draggedItem);

        onReorder(newCategories);
        setDraggedItemIndex(null);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Gerenciar Categorias de Estoque"
            footer={<button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Fechar</button>}
        >
            <div className="space-y-6">
                 <div>
                    <h4 className="font-semibold text-slate-700 mb-2">Adicionar Nova Categoria</h4>
                    <div className="flex gap-2 items-start">
                        <div className="flex-grow">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                placeholder="Nome da nova categoria"
                                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 outline-none ${error && !editingCategory ? 'border-red-500' : 'border-slate-300'}`}
                            />
                            {error && !editingCategory && <p className="text-xs text-red-600 mt-1">{error}</p>}
                        </div>
                        <button onClick={handleAdd} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700 h-[42px]">Adicionar</button>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-slate-700 mb-2 flex justify-between items-center">
                        <span>Categorias Existentes</span>
                        <span className="text-xs font-normal text-slate-500 italic">Arraste para reordenar</span>
                    </h4>
                    <ul className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2 bg-slate-50 custom-scrollbar">
                        {categories.length > 0 ? categories.map((cat, index) => {
                            const usageCount = stockItems.filter(i => i.category === cat).length;
                            const isBeingEdited = editingCategory === cat;
                            const isDragging = draggedItemIndex === index;

                            return (
                                <li 
                                    key={cat} 
                                    className={`flex justify-between items-center p-2 bg-white rounded shadow-sm border border-slate-100 transition-opacity ${isDragging ? 'opacity-50 border-cyan-300 bg-cyan-50' : ''}`}
                                    draggable={!isBeingEdited}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={(e) => handleDrop(e, index)}
                                >
                                    {isBeingEdited ? (
                                        <div className="flex-grow">
                                            <div className="flex gap-2 items-center">
                                                <input 
                                                    type="text" 
                                                    value={editValue} 
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className={`flex-grow p-1 border rounded text-sm outline-none ${error ? 'border-red-500' : 'border-slate-300'}`}
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEditing();
                                                        if (e.key === 'Escape') cancelEditing();
                                                    }}
                                                />
                                                <button onClick={saveEditing} className="text-green-600 hover:text-green-800 px-2" title="Salvar">
                                                    <i className="fas fa-check"></i>
                                                </button>
                                                <button onClick={cancelEditing} className="text-slate-500 hover:text-slate-700 px-2" title="Cancelar">
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="cursor-move text-slate-300 hover:text-slate-500 p-1">
                                                    <i className="fas fa-grip-vertical"></i>
                                                </div>
                                                <span className="text-slate-800 font-medium">{cat}</span>
                                                {usageCount > 0 && (
                                                    <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1" title="Esta categoria está vinculada a itens do estoque">
                                                        <i className="fas fa-link"></i>
                                                        Em uso ({usageCount})
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => startEditing(cat)} className="text-blue-500 hover:text-blue-700 p-1.5 rounded hover:bg-blue-50" title={`Editar ${cat}`}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                {usageCount > 0 ? (
                                                    <button 
                                                        disabled 
                                                        className="text-slate-300 cursor-not-allowed p-1.5" 
                                                        title={`Categoria em uso por ${usageCount} item(s). Remova ou altere os itens vinculados antes de excluir.`}
                                                    >
                                                        <i className="fas fa-lock"></i>
                                                    </button>
                                                ) : (
                                                    <button onClick={() => onDelete(cat)} className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50" title={`Excluir ${cat}`}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </li>
                            );
                        }) : <p className="text-center text-slate-500 p-3">Nenhuma categoria adicionada.</p>}
                    </ul>
                </div>
            </div>
        </Modal>
    );
};


const StockItemModal = ({ isOpen, onClose, onSave, item, stockCategories }) => {
    const [formData, setFormData] = useState<{
        name: string;
        category: string;
        quantity: number | string;
        unit: string;
        lowStockThreshold: number | string;
    }>({
        name: '',
        category: stockCategories[0] || '',
        quantity: 0,
        unit: 'unidade',
        lowStockThreshold: 10,
    });
    const [errors, setErrors] = useState<{ quantity?: string; lowStockThreshold?: string; }>({});

    useEffect(() => {
        if (isOpen) {
            if (item) {
                setFormData({
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    unit: item.unit,
                    lowStockThreshold: item.lowStockThreshold,
                });
            } else {
                setFormData({
                    name: '',
                    category: stockCategories[0] || '',
                    quantity: 0,
                    unit: 'unidade',
                    lowStockThreshold: 10,
                });
            }
            setErrors({}); // Always reset errors when modal opens
        }
    }, [item, isOpen, stockCategories]);


    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value,
        }));
    };
    
    const validate = () => {
        const newErrors: { quantity?: string; lowStockThreshold?: string } = {};

        // Validar Quantidade
        if (formData.quantity === '' || formData.quantity === null || formData.quantity === undefined) {
             newErrors.quantity = 'A quantidade é obrigatória.';
        } else if (!Number.isInteger(Number(formData.quantity)) || Number(formData.quantity) < 0) {
            newErrors.quantity = 'A quantidade deve ser um número inteiro não negativo.';
        }

        // Validar Limite Baixo
        if (formData.lowStockThreshold === '' || formData.lowStockThreshold === null || formData.lowStockThreshold === undefined) {
             newErrors.lowStockThreshold = 'O limite de alerta é obrigatório.';
        } else if (!Number.isInteger(Number(formData.lowStockThreshold)) || Number(formData.lowStockThreshold) < 0) {
            newErrors.lowStockThreshold = 'O alerta deve ser um número inteiro não negativo.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.unit) {
            alert("Nome do item e unidade são obrigatórios.");
            return;
        }
        if (validate()) {
            onSave({ ...formData, id: item?.id });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={item ? "Editar Item do Estoque" : "Adicionar Item ao Estoque"}
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                    <button onClick={handleSubmit} type="submit" form="stock-item-form" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700">Salvar</button>
                </>
            }
        >
            <form id="stock-item-form" onSubmit={handleSubmit} className="space-y-4">
                <InputField id="name" name="name" label="Nome do Item" value={formData.name} onChange={handleChange} required placeholder="Ex: Gaze Estéril" />
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-cyan-500">
                        {stockCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <InputField id="quantity" name="quantity" label="Quantidade" type="number" value={String(formData.quantity)} onChange={handleChange} required min="0" error={errors.quantity} />
                    <InputField id="unit" name="unit" label="Unidade" value={formData.unit} onChange={handleChange} required placeholder="Ex: pacotes" />
                </div>
                <div>
                    <InputField id="lowStockThreshold" name="lowStockThreshold" label="Alerta de Estoque Baixo (Qtd. Mínima)" type="number" value={String(formData.lowStockThreshold)} onChange={handleChange} required min="0" error={errors.lowStockThreshold} />
                    <p className="text-xs text-slate-500 mt-1">O sistema irá alertar quando a quantidade for igual ou inferior a este valor.</p>
                </div>
            </form>
        </Modal>
    );
};

const ConsumptionModal = ({ isOpen, onClose, onSave, item }) => {
    const [quantity, setQuantity] = useState('1');

    useEffect(() => {
        if (isOpen) {
            setQuantity('1'); // Reset on open
        }
    }, [isOpen]);

    if (!item) return null;

    const handleSave = () => {
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            alert("Por favor, insira uma quantidade válida.");
            return;
        }
        if (numQuantity > item.quantity) {
             alert("A quantidade consumida não pode ser maior que o estoque atual.");
            return;
        }
        onSave(item.id, numQuantity);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Registrar Consumo de ${item.name}`}
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700">Registrar</button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="p-3 bg-slate-100 rounded-md">
                    <p className="text-sm font-medium text-slate-600">Em estoque: <span className="font-bold text-slate-800">{item.quantity} {item.unit}</span></p>
                </div>
                <div>
                    <label htmlFor="quantityConsumed" className="block text-sm font-medium text-slate-600 mb-1">Quantidade Consumida</label>
                    <input
                        id="quantityConsumed"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        max={item.quantity}
                        className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-cyan-500"
                        autoFocus
                    />
                </div>
            </div>
        </Modal>
    );
};

interface StockManagerProps {
    stockItems: StockItem[];
    setStockItems: React.Dispatch<React.SetStateAction<StockItem[]>>;
    consumptionHistory: ConsumptionLog[];
    setConsumptionHistory: React.Dispatch<React.SetStateAction<ConsumptionLog[]>>;
    stockCategories: string[];
    setStockCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const StockManager: React.FC<StockManagerProps> = ({ stockItems, setStockItems, consumptionHistory, setConsumptionHistory, stockCategories, setStockCategories }) => {
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<StockItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<'All' | string>('All');

    const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
    const [itemForConsumption, setItemForConsumption] = useState<StockItem | null>(null);
    const [historyFilters, setHistoryFilters] = useState({
        dateStart: '',
        dateEnd: '',
        itemNameSearch: '', // Changed from itemId to text search
        user: 'All',
        category: 'All',
    });

    // Filtering logic
    const filteredItems = useMemo(() => {
        return stockItems.filter(item => {
            const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [stockItems, searchTerm, filterCategory]);

    // Suggestion logic
    const suggestedItems = useMemo(() => {
        return stockItems
            .filter(item => item.quantity <= item.lowStockThreshold)
            .sort((a, b) => a.quantity - b.quantity); // Sorts out-of-stock items (quantity 0) first
    }, [stockItems]);
    
    const handleHistoryFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setHistoryFilters(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const historyUsers = useMemo(() => {
        return ['All', ...Array.from(new Set(consumptionHistory.map(log => log.user)))];
    }, [consumptionHistory]);
    
    const filteredHistory = useMemo(() => {
        return consumptionHistory.filter(log => {
            const logDate = new Date(log.timestamp);
            logDate.setMinutes(logDate.getMinutes() + logDate.getTimezoneOffset()); // Adjust for timezone

            const matchesDateStart = !historyFilters.dateStart || logDate >= new Date(historyFilters.dateStart);
            const matchesDateEnd = !historyFilters.dateEnd || logDate <= new Date(new Date(historyFilters.dateEnd).setHours(23, 59, 59, 999));
            const matchesItem = log.itemName.toLowerCase().includes(historyFilters.itemNameSearch.toLowerCase());
            const matchesUser = historyFilters.user === 'All' || log.user === historyFilters.user;
            
            // Use saved category if available, otherwise try to find current category
            const currentItem = stockItems.find(item => item.id === log.itemId);
            const logCategory = log.category || (currentItem ? currentItem.category : null);
            
            const matchesCategory = historyFilters.category === 'All' || (logCategory === historyFilters.category);

            return matchesDateStart && matchesDateEnd && matchesItem && matchesUser && matchesCategory;
        });
    }, [consumptionHistory, historyFilters, stockItems]);
    
    // Modal handlers
    const handleOpenItemModal = (item: StockItem | null = null) => {
        setCurrentItem(item);
        setIsItemModalOpen(true);
    };

    const handleCloseItemModal = () => {
        setIsItemModalOpen(false);
        setCurrentItem(null);
    };

    const handleSaveItem = async (itemToSave: Omit<StockItem, 'id'> & { id?: string }) => {
        let newItem: StockItem;
        if (itemToSave.id) { // Editing
            newItem = { ...itemToSave } as StockItem; // id is present
            setStockItems(prev => prev.map(item => item.id === newItem.id ? newItem : item));
        } else { // Adding
            newItem = {
                ...itemToSave,
                id: Date.now().toString(),
            } as StockItem;
            setStockItems(prev => [...prev, newItem]);
        }
        await saveStockItem(newItem); // Persist to DB/Local
        handleCloseItemModal();
    };

    const handleDeleteItem = async (id: string) => {
        if (window.confirm("Tem certeza que deseja remover este item do estoque?")) {
            setStockItems(prev => prev.filter(item => item.id !== id));
            await deleteStockItem(id); // Persist delete
        }
    };

    const handleAddCategory = (newCategory: string) => {
        setStockCategories(prev => [...prev, newCategory]);
    };

    const handleEditCategory = async (oldCategory: string, newCategory: string) => {
        // 1. Update the categories list
        setStockCategories(prev => prev.map(c => c === oldCategory ? newCategory : c));
        
        // 2. Find affected items
        const itemsToUpdate = stockItems.filter(item => item.category === oldCategory);
        
        // 3. Update local state
        setStockItems(prev => prev.map(item => {
            if (item.category === oldCategory) {
                return { ...item, category: newCategory };
            }
            return item;
        }));

        // 4. Persist changes to each item in DB
        for (const item of itemsToUpdate) {
            await saveStockItem({ ...item, category: newCategory });
        }
    };

    const handleDeleteCategory = (categoryToDelete: string) => {
        const isCategoryInUse = stockItems.some(item => item.category === categoryToDelete);
        if (isCategoryInUse) {
            alert(`A categoria "${categoryToDelete}" não pode ser excluída pois está em uso.`);
            return;
        }
        if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoryToDelete}"?`)) {
            setStockCategories(prev => prev.filter(c => c !== categoryToDelete));
        }
    };

    // Consumption handlers
    const handleOpenConsumptionModal = (item: StockItem) => {
        setItemForConsumption(item);
        setIsConsumptionModalOpen(true);
    };

    const handleCloseConsumptionModal = () => {
        setIsConsumptionModalOpen(false);
        setItemForConsumption(null);
    };

    const handleSaveConsumption = async (itemId: string, quantityConsumed: number) => {
        const itemToUpdate = stockItems.find(i => i.id === itemId);
        if (!itemToUpdate || quantityConsumed <= 0) return;

        const newQuantity = itemToUpdate.quantity - quantityConsumed;

        // 1. Update stock item quantity
        setStockItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
        await saveStockItem({ ...itemToUpdate, quantity: newQuantity }); // Persist update

        // 2. Add to consumption history
        const newLog: ConsumptionLog = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            itemId: itemId,
            itemName: itemToUpdate.name,
            category: itemToUpdate.category, // Save current category
            quantityConsumed: quantityConsumed,
            unit: itemToUpdate.unit,
            user: 'Enfermeiro(a)', // Placeholder user
        };
        setConsumptionHistory(prevHistory => [newLog, ...prevHistory]);
        await logConsumption(newLog); // Persist log

        handleCloseConsumptionModal();
    };

    const handleExportHistory = () => {
        exportConsumptionHistoryToCSV(filteredHistory, `consumo_estoque_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const getStatus = (item: StockItem) => {
        if (item.quantity <= 0) {
            return { text: 'Esgotado', className: 'bg-red-100 text-red-800' };
        }
        if (item.quantity <= item.lowStockThreshold) {
            return { text: 'Estoque Baixo', className: 'bg-amber-100 text-amber-800' };
        }
        return { text: 'Em Estoque', className: 'bg-green-100 text-green-800' };
    };

    return (
        <>
            <div className="bg-white p-5 rounded-xl shadow">
                {/* Header and actions */}
                <div className="flex justify-between items-center mb-4 border-b pb-2 flex-wrap gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            <i className="fas fa-boxes-stacked mr-2 text-cyan-600"></i>
                            Gestão de Estoque
                        </h2>
                        <p className="text-sm text-slate-500">
                            Controle de medicamentos e materiais.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 flex items-center gap-2">
                            <i className="fas fa-tags"></i>
                            Gerenciar Categorias
                        </button>
                        <button onClick={() => handleOpenItemModal()} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700 flex items-center gap-2">
                            <i className="fas fa-plus"></i>
                            Adicionar Item
                        </button>
                    </div>
                </div>
                
                {/* Filters */}
                <div className="flex items-center gap-4 mb-4">
                    <input 
                        type="text"
                        placeholder="Buscar item..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                    />
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="All">Todas as Categorias</option>
                        {stockCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                {/* Suggestion Section */}
                {suggestedItems.length > 0 && (
                    <div className="my-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h3 className="text-lg font-bold text-amber-800 mb-3">
                            <i className="fas fa-lightbulb mr-2"></i>
                            Sugestões de Reposição
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {suggestedItems.map(item => {
                                const status = getStatus(item);
                                return (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-md border shadow-sm">
                                        <div>
                                            <p className="font-semibold text-slate-800 flex items-center gap-2">
                                                {item.name}
                                                {item.quantity <= 0 ? (
                                                    <i className="fas fa-circle-exclamation text-red-500" title="Esgotado"></i>
                                                ) : (
                                                    <i className="fas fa-triangle-exclamation text-amber-500" title="Estoque Baixo"></i>
                                                )}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                Restam: {item.quantity} {item.unit} (Alerta: ≤ {item.lowStockThreshold})
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.className}`}>
                                            {status.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}


                {/* Stock Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Item</th>
                                <th scope="col" className="px-6 py-3">Categoria</th>
                                <th scope="col" className="px-6 py-3 text-center">Quantidade</th>
                                <th scope="col" className="px-6 py-3 text-center">Status</th>
                                <th scope="col" className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length > 0 ? filteredItems.map(item => (
                                <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {item.name}
                                            {item.quantity <= 0 ? (
                                                <i className="fas fa-circle-exclamation text-red-500" title="Item Esgotado"></i>
                                            ) : item.quantity <= item.lowStockThreshold ? (
                                                <i className="fas fa-triangle-exclamation text-amber-500" title={`Estoque Baixo (Mín: ${item.lowStockThreshold})`}></i>
                                            ) : null}
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">{item.category}</td>
                                    <td className="px-6 py-4 text-center">{item.quantity} {item.unit}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatus(item).className}`}>
                                            {getStatus(item).text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => handleOpenConsumptionModal(item)} className="font-medium text-blue-600 hover:underline" title="Registrar Consumo" aria-label={`Registrar consumo de ${item.name}`}><i className="fas fa-dolly"></i></button>
                                        <button onClick={() => handleOpenItemModal(item)} className="font-medium text-cyan-600 hover:underline" title="Editar Item" aria-label={`Editar ${item.name}`}><i className="fas fa-edit"></i></button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="font-medium text-red-600 hover:underline" title="Excluir Item" aria-label={`Excluir ${item.name}`}><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-500">
                                        Nenhum item encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
             {/* Consumption History Section */}
            <div className="bg-white p-5 rounded-xl shadow mt-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold text-slate-800">
                        <i className="fas fa-history mr-2 text-cyan-600"></i>
                        Histórico de Consumo
                    </h2>
                    <button
                        onClick={handleExportHistory}
                        disabled={filteredHistory.length === 0}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        title="Exportar dados filtrados para CSV"
                    >
                        <i className="fas fa-file-csv"></i>
                        Exportar CSV
                    </button>
                </div>
                {/* History Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 bg-slate-50 rounded-lg border">
                    <div>
                        <label htmlFor="dateStart" className="block text-sm font-medium text-slate-600 mb-1">De:</label>
                        <input type="date" name="dateStart" id="dateStart" value={historyFilters.dateStart} onChange={handleHistoryFilterChange} className="w-full p-2 bg-white border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="dateEnd" className="block text-sm font-medium text-slate-600 mb-1">Até:</label>
                        <input type="date" name="dateEnd" id="dateEnd" value={historyFilters.dateEnd} onChange={handleHistoryFilterChange} className="w-full p-2 bg-white border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="itemNameSearch" className="block text-sm font-medium text-slate-600 mb-1">Filtrar por Item (Nome):</label>
                        <input 
                            type="text" 
                            name="itemNameSearch" 
                            id="itemNameSearch" 
                            value={historyFilters.itemNameSearch} 
                            onChange={handleHistoryFilterChange} 
                            placeholder="Buscar nome..."
                            className="w-full p-2 bg-white border border-slate-300 rounded-md" 
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-600 mb-1">Filtrar por Categoria:</label>
                        <select name="category" id="category" value={historyFilters.category} onChange={handleHistoryFilterChange} className="w-full p-2 bg-white border border-slate-300 rounded-md">
                            <option value="All">Todas</option>
                            {stockCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="user" className="block text-sm font-medium text-slate-600 mb-1">Usuário:</label>
                        <select name="user" id="user" value={historyFilters.user} onChange={handleHistoryFilterChange} className="w-full p-2 bg-white border border-slate-300 rounded-md">
                            {historyUsers.map(user => <option key={user} value={user}>{user === 'All' ? 'Todos os Usuários' : user}</option>)}
                        </select>
                    </div>
                </div>

                {/* History Table */}
                <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Data/Hora</th>
                                <th scope="col" className="px-6 py-3">Item</th>
                                <th scope="col" className="px-6 py-3 text-center">Quantidade</th>
                                <th scope="col" className="px-6 py-3 text-center">Unidade</th>
                                <th scope="col" className="px-6 py-3">Usuário</th>
                            </tr>
                        </thead>
                         <tbody>
                            {filteredHistory.length > 0 ? filteredHistory.map(log => (
                                <tr key={log.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{log.itemName}</th>
                                    <td className="px-6 py-4 text-center font-bold text-slate-700">{log.quantityConsumed}</td>
                                    <td className="px-6 py-4 text-center">{log.unit}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {log.user.charAt(0).toUpperCase()}
                                            </div>
                                            {log.user}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-500">Nenhum registro de consumo encontrado para os filtros selecionados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <StockItemModal 
                isOpen={isItemModalOpen}
                onClose={handleCloseItemModal}
                onSave={handleSaveItem}
                item={currentItem}
                stockCategories={stockCategories}
            />

            <CategoryManagerModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categories={stockCategories}
                stockItems={stockItems}
                onAdd={handleAddCategory}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onReorder={setStockCategories}
            />
            
            {isConsumptionModalOpen && (
                <ConsumptionModal 
                    isOpen={isConsumptionModalOpen}
                    onClose={handleCloseConsumptionModal}
                    onSave={handleSaveConsumption}
                    item={itemForConsumption}
                />
            )}
        </>
    );
};

export default StockManager;


import React, { useRef, useEffect, useState } from 'react';
import { ReportData, FormErrors, AssessmentSubSectionId, StockItem, SavedReport, Medication } from '../types';
import VitalSignsForm from './VitalSignsForm';
import NutritionForm from './NutritionForm';
import MedicationManager from './MedicationManager';
import DeviceManager from './DeviceManager';
import ProceduresForm from './ProceduresForm';
import FluidBalanceForm from './FluidBalanceForm';
import SafetyChecklist from './SafetyChecklist';
import OptionCategory from './OptionCategory';
import QuickHistoryForm from './QuickHistoryForm';
import { REPORT_OPTIONS } from '../constants';
import Accordion from './ui/Accordion';
import { useNavigation } from '../contexts/NavigationContext';
import { suggestCidWithGemini, getErrorMessage } from '../services/geminiService';
import Modal from './Modal';
import Checkbox from './ui/Checkbox';

interface AssessmentViewProps {
    data: ReportData;
    errors: FormErrors;
    onInputChange: (field: keyof ReportData, value: any) => void;
    onMultiSelect: (field: keyof ReportData, value: string) => void;
    onProcedureObservationChange: (procedure: string, observation: string) => void;
    onOpenModal: (type: 'addMedication' | 'addDevice') => void;
    onOpenPrescriptionModal: () => void;
    onAnalyzeVitals: () => void;
    vitalSignsInterpretation: string | null;
    vitalSignsSuggestions: string | null;
    isAnalyzingVitals: boolean;
    stockItems: StockItem[];
    onConsumedStockChange: (itemId: string, quantity: number) => void;
    patientHistory: SavedReport[];
    isDarkMode: boolean;
}

// Configuração de Visibilidade Padrão
const defaultVisibleSections: Record<AssessmentSubSectionId, boolean> = {
    vitals: true,
    general: true,
    'meds-devices': true,
    nutrition: true,
    procedures: true,
    fluidBalance: true,
    safety: true,
    history: true,
};

const SubNavButton: React.FC<{
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-none md:flex-1 flex flex-col items-center justify-center p-3 text-sm font-medium border-b-4 transition-colors duration-200 min-w-[90px] ${
            isActive
                ? 'border-cyan-600 text-cyan-700 bg-cyan-50 dark:bg-cyan-900/50 dark:text-cyan-300'
                : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
        }`}
        role="tab"
        aria-selected={isActive}
    >
        <i className={`fas ${icon} text-xl mb-1`}></i>
        <span className="text-xs md:text-sm text-center">{label}</span>
    </button>
);

const AssessmentView: React.FC<AssessmentViewProps> = ({
    data, errors, onInputChange, onMultiSelect,
    onProcedureObservationChange, onOpenModal, onOpenPrescriptionModal,
    onAnalyzeVitals, vitalSignsInterpretation, vitalSignsSuggestions, isAnalyzingVitals,
    stockItems, onConsumedStockChange,
    patientHistory, isDarkMode
}) => {
    const { activeSubSection, setActiveSubSection } = useNavigation();
    const [isSuggestingCid, setIsSuggestingCid] = useState(false);
    const [showNeuroDetails, setShowNeuroDetails] = useState(false);
    
    // Gerenciamento de Visibilidade
    const [visibleSections, setVisibleSections] = useState(defaultVisibleSections);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // Create a ref for each accordion section wrapper
    const sectionRefs = {
        vitals: useRef<HTMLDivElement>(null),
        general: useRef<HTMLDivElement>(null),
        'meds-devices': useRef<HTMLDivElement>(null),
        nutrition: useRef<HTMLDivElement>(null),
        procedures: useRef<HTMLDivElement>(null),
        fluidBalance: useRef<HTMLDivElement>(null),
        safety: useRef<HTMLDivElement>(null),
        history: useRef<HTMLDivElement>(null),
    };
    
    // Scroll to the active accordion when it changes
    useEffect(() => {
        const element = sectionRefs[activeSubSection]?.current;
        if (element) {
           element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [activeSubSection]);

    const handleAccordionToggle = (subSectionId: AssessmentSubSectionId) => {
        const newActiveSubSection = activeSubSection === subSectionId ? '' as AssessmentSubSectionId : subSectionId;
        setActiveSubSection(newActiveSubSection);
    };

    const handleSuggestCid = async () => {
        if (!data.patientDiagnosis) return;
        setIsSuggestingCid(true);
        try {
          const cid = await suggestCidWithGemini(data.patientDiagnosis);
          onInputChange('patientCid', cid);
        } catch (e) {
          alert(getErrorMessage(e));
        } finally {
          setIsSuggestingCid(false);
        }
    };

    const handleAddMedication = (med: Medication) => {
        onInputChange('medications', [...data.medications, med]);
    };

    const toggleSectionVisibility = (id: AssessmentSubSectionId) => {
        setVisibleSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // ORDEM LÓGICA DE TRABALHO
    const allSections: { id: AssessmentSubSectionId; label: string; icon: string, ref: React.RefObject<HTMLDivElement> }[] = [
        { id: 'vitals', label: 'Sinais Vitais', icon: 'fa-heart-pulse', ref: sectionRefs.vitals },
        { id: 'general', label: 'Exame Físico', icon: 'fa-user-nurse', ref: sectionRefs.general },
        { id: 'meds-devices', label: 'Meds & Disp.', icon: 'fa-pills', ref: sectionRefs['meds-devices'] },
        { id: 'nutrition', label: 'Nutrição', icon: 'fa-utensils', ref: sectionRefs.nutrition },
        { id: 'procedures', label: 'Procedimentos', icon: 'fa-briefcase-medical', ref: sectionRefs.procedures },
        { id: 'fluidBalance', label: 'Balanço Híd.', icon: 'fa-faucet-drip', ref: sectionRefs.fluidBalance },
        { id: 'safety', label: 'Segurança', icon: 'fa-shield-halved', ref: sectionRefs.safety },
        { id: 'history', label: 'Histórico', icon: 'fa-file-medical-alt', ref: sectionRefs.history },
    ];

    const activeSectionsList = allSections.filter(sec => visibleSections[sec.id]);
    
    // Split options into Basic and Advanced (Neuro)
    const generalAssessmentOptions = REPORT_OPTIONS.filter(c => c.id !== 'procedures');
    const basicOptions = generalAssessmentOptions.filter(c => c.id !== 'pupils');
    const neuroOptions = generalAssessmentOptions.filter(c => c.id === 'pupils');

    return (
        <div className="space-y-6 relative">
            <div className="bg-white p-5 rounded-xl shadow dark:bg-slate-800 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2 dark:text-slate-200">
                        <i className="fas fa-stethoscope mr-2 text-cyan-600 dark:text-cyan-400"></i>
                        Avaliações & Evolução
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Fluxo de trabalho otimizado. Preencha as seções na ordem clínica.
                    </p>
                </div>
                <button 
                    onClick={() => setIsConfigOpen(true)}
                    className="text-xs flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-semibold transition-colors"
                >
                    <i className="fas fa-sliders"></i>
                    Configurar Exibição
                </button>
            </div>
            
            {/* Sticky Navigation Bar */}
            <div className="sticky top-0 z-40 bg-slate-50 py-3 -mx-4 md:-mx-8 px-4 md:px-8 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700 shadow-md">
                <div className="bg-white rounded-xl shadow-sm overflow-x-auto border border-slate-200 dark:bg-slate-800 dark:border-slate-700 custom-scrollbar">
                    <div className="flex min-w-max md:min-w-0" role="tablist" aria-label="Seções de Avaliação">
                        {activeSectionsList.map(sec => (
                            <SubNavButton
                                key={sec.id}
                                label={sec.label}
                                icon={sec.icon}
                                isActive={activeSubSection === sec.id}
                                onClick={() => setActiveSubSection(sec.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-6">
                
                {/* 1. Sinais Vitais (Prioridade Máxima) */}
                {visibleSections.vitals && (
                    <div ref={sectionRefs.vitals}>
                        <Accordion
                            id="vitals"
                            title="1. Sinais Vitais (Obrigatório)"
                            isOpen={activeSubSection === 'vitals'}
                            onToggle={() => handleAccordionToggle('vitals')}
                        >
                            <VitalSignsForm
                                data={data}
                                onInputChange={onInputChange}
                                errors={errors}
                                onAnalyze={onAnalyzeVitals}
                                interpretation={vitalSignsInterpretation}
                                suggestions={vitalSignsSuggestions}
                                isAnalyzing={isAnalyzingVitals}
                                patientHistory={patientHistory}
                                isDarkMode={isDarkMode}
                            />
                        </Accordion>
                    </div>
                )}

                {/* 2. Exame Físico */}
                {visibleSections.general && (
                    <div ref={sectionRefs.general}>
                        <Accordion
                            id="general"
                            title="2. Exame Físico & Neurológico"
                            isOpen={activeSubSection === 'general'}
                            onToggle={() => handleAccordionToggle('general')}
                        >
                            <div className="space-y-6">
                                {/* Pain Assessment */}
                                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <h3 className="text-md font-bold text-slate-700 mb-3 flex items-center dark:text-slate-300">
                                        <i className="fas fa-face-frown-open text-rose-500 mr-2"></i>
                                        Avaliação de Dor
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: 'Sem Dor', value: 'nega queixas álgicas', icon: 'fa-smile', color: 'bg-green-100 text-green-800' },
                                            { label: 'Dor Leve', value: 'refere dor de leve intensidade', icon: 'fa-meh', color: 'bg-yellow-100 text-yellow-800' },
                                            { label: 'Dor Moderada', value: 'refere dor de moderada intensidade', icon: 'fa-frown', color: 'bg-orange-100 text-orange-800' },
                                            { label: 'Dor Intensa', value: 'refere dor de intensa intensidade', icon: 'fa-dizzy', color: 'bg-red-100 text-red-800' },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => onMultiSelect('pain', opt.value)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                                                    data.pain.includes(opt.value) 
                                                    ? 'bg-slate-800 text-white shadow-lg scale-105' 
                                                    : `${opt.color} hover:opacity-80`
                                                }`}
                                            >
                                                <i className={`fas ${opt.icon}`}></i>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Basic Options Loop */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {basicOptions.map(category => (
                                        <div key={category.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                            <h3 className="text-md font-bold text-slate-700 mb-3 dark:text-slate-300 flex items-center gap-2">
                                                {category.title}
                                            </h3>
                                            <OptionCategory
                                                options={category.options}
                                                selection={data[category.id] as string | string[]}
                                                type={category.type}
                                                onSelect={(value) => category.type === 'multi' ? onMultiSelect(category.id, value) : onInputChange(category.id, value)}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Advanced Neuro */}
                                {neuroOptions.length > 0 && (
                                    <div className="border-t pt-4">
                                        <button 
                                            onClick={() => setShowNeuroDetails(!showNeuroDetails)}
                                            className="flex items-center text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"
                                        >
                                            <i className={`fas fa-chevron-${showNeuroDetails ? 'down' : 'right'} mr-2`}></i>
                                            {showNeuroDetails ? 'Ocultar Detalhes Neurológicos' : 'Mostrar Avaliação Neurológica Detalhada (Pupilas)'}
                                        </button>
                                        
                                        {showNeuroDetails && (
                                            <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200 animate-fade-in">
                                                {neuroOptions.map(category => (
                                                    <div key={category.id}>
                                                        <h3 className="text-sm font-bold text-slate-700 mb-3">{category.title}</h3>
                                                        <OptionCategory
                                                            options={category.options}
                                                            selection={data[category.id] as string | string[]}
                                                            type={category.type}
                                                            onSelect={(value) => category.type === 'multi' ? onMultiSelect(category.id, value) : onInputChange(category.id, value)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div>
                                    <h3 className="text-md font-bold text-slate-700 mb-3 dark:text-slate-300">Anotações Adicionais</h3>
                                    <textarea
                                        value={data.customNotes}
                                        onChange={(e) => onInputChange('customNotes', e.target.value)}
                                        placeholder="Descreva aqui intercorrências, observações específicas ou cuidados realizados que não estão nas opções..."
                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400"
                                        rows={5}
                                    ></textarea>
                                </div>
                            </div>
                        </Accordion>
                    </div>
                )}

                {/* 3. Medicações e Dispositivos */}
                {visibleSections['meds-devices'] && (
                    <div ref={sectionRefs['meds-devices']}>
                        <Accordion
                            id="meds-devices"
                            title="3. Medicação e Dispositivos"
                            isOpen={activeSubSection === 'meds-devices'}
                            onToggle={() => handleAccordionToggle('meds-devices')}
                        >
                            <div className="space-y-6">
                                <MedicationManager
                                    medications={data.medications}
                                    onUpdate={(meds) => onInputChange('medications', meds)}
                                    onAdd={() => onOpenModal('addMedication')}
                                    onOpenPrescriptionModal={onOpenPrescriptionModal}
                                />
                                <DeviceManager
                                    devices={data.devices}
                                    onUpdate={(devs) => onInputChange('devices', devs)}
                                    onAdd={() => onOpenModal('addDevice')}
                                />
                            </div>
                        </Accordion>
                    </div>
                )}

                {/* 4. Nutrição */}
                {visibleSections.nutrition && (
                    <div ref={sectionRefs.nutrition}>
                        <Accordion
                            id="nutrition"
                            title="4. Nutrição"
                            isOpen={activeSubSection === 'nutrition'}
                            onToggle={() => handleAccordionToggle('nutrition')}
                        >
                            <NutritionForm
                                data={data.nutrition}
                                onInputChange={(value) => onInputChange('nutrition', value)}
                            />
                        </Accordion>
                    </div>
                )}

                {/* 5. Procedimentos */}
                {visibleSections.procedures && (
                    <div ref={sectionRefs.procedures}>
                        <Accordion
                            id="procedures"
                            title="5. Procedimentos"
                            isOpen={activeSubSection === 'procedures'}
                            onToggle={() => handleAccordionToggle('procedures')}
                        >
                            <ProceduresForm
                                data={data}
                                onProcedureSelect={(value) => onMultiSelect('procedures', value)}
                                onBedBathChecklistChange={(checklistData) => onInputChange('bedBathChecklist', checklistData)}
                                onWoundCareChange={(woundCareData) => onInputChange('woundCare', woundCareData)}
                                onProcedureObservationChange={onProcedureObservationChange}
                                onOpenModal={onOpenModal}
                                stockItems={stockItems}
                                consumedStock={data.currentConsumedStock}
                                onConsumedStockChange={onConsumedStockChange}
                                onAddMedication={handleAddMedication}
                            />
                        </Accordion>
                    </div>
                )}

                {/* 6. Balanço Hídrico */}
                {visibleSections.fluidBalance && (
                    <div ref={sectionRefs.fluidBalance}>
                        <Accordion
                            id="fluidBalance"
                            title="6. Balanço Hídrico"
                            isOpen={activeSubSection === 'fluidBalance'}
                            onToggle={() => handleAccordionToggle('fluidBalance')}
                        >
                            <FluidBalanceForm
                                data={data.fluidBalance}
                                onChange={(val) => onInputChange('fluidBalance', val)}
                            />
                        </Accordion>
                    </div>
                )}

                {/* 7. Segurança (Baixa Interação) */}
                {visibleSections.safety && (
                    <div ref={sectionRefs.safety}>
                        <Accordion
                            id="safety"
                            title="7. Segurança do Paciente"
                            isOpen={activeSubSection === 'safety'}
                            onToggle={() => handleAccordionToggle('safety')}
                        >
                            <SafetyChecklist 
                                data={data.safetyProtocols}
                                onChange={(val) => onInputChange('safetyProtocols', val)}
                            />
                        </Accordion>
                    </div>
                )}

                {/* 8. Histórico (Referência) */}
                {visibleSections.history && (
                    <div ref={sectionRefs.history}>
                        <Accordion
                            id="history"
                            title="8. Histórico e Alertas"
                            isOpen={activeSubSection === 'history'}
                            onToggle={() => handleAccordionToggle('history')}
                        >
                            <QuickHistoryForm 
                                data={data}
                                onInputChange={onInputChange}
                                onSuggestCid={handleSuggestCid}
                                isSuggestingCid={isSuggestingCid}
                            />
                        </Accordion>
                    </div>
                )}
            </div>

            {/* Modal de Configuração de Visualização */}
            <Modal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                title="Personalizar Fluxo de Trabalho"
                footer={<button onClick={() => setIsConfigOpen(false)} className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg">Concluir</button>}
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">Marque as seções que você utiliza no seu plantão. As desmarcadas serão ocultadas para simplificar a tela.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allSections.map(sec => (
                            <Checkbox 
                                key={sec.id}
                                label={sec.label}
                                checked={visibleSections[sec.id]}
                                onChange={() => toggleSectionVisibility(sec.id)}
                            />
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AssessmentView;

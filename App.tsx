
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from './contexts/NavigationContext';
import { ReportData, StockItem, SavedReport, AuditLog, ConsumptionLog, PortalUser, IntegrationConfig, AccessUser, RoutineItem, DigitalSignature, AccessRole, Medication } from './types';
import { initialReportData } from './constants';
import * as db from './services/databaseService';
import * as gemini from './services/geminiService';
import { generateFullReportText } from './utils/reportGenerator';
import { triggerSync } from './services/hospitalSyncService';

// Components
import Header from './components/Header';
import NavigationMenu from './components/NavigationMenu';
import Sidebar from './components/Sidebar';
import PatientContextHeader from './components/PatientContextHeader';
import AssessmentView from './components/AssessmentView';
import StockManager from './components/StockManager';
import ExamResultsView from './components/ExamResultsView';
import MedicationHistoryView from './components/MedicationHistoryView';
import FamilyPortalView from './components/FamilyPortalView';
import AccessManager from './components/AccessManager';
import AccessControlView from './components/AccessControlView';
import CompanyNotificationForm from './components/CompanyNotificationForm';
import GeneralReportView from './components/GeneralReportView';
import AuditTrailView from './components/AuditTrailView';
import DatabaseConfigModal from './components/DatabaseConfigModal';
import SettingsModal from './components/SettingsModal';
import IntercorrenciasPanel from './components/IntercorrenciasPanel';
import DepartmentDashboard from './components/DepartmentDashboard';
import CustomKitBuilder from './components/CustomKitBuilder';
import PatientRoutineView from './components/PatientRoutineView';
import AgendaView from './components/AgendaView';
// Removido MinhaAgenda pois AgendaView cumpre essa função
import MeuPonto from './components/MeuPonto';
import PontoCertoView from './components/PontoCertoView'; 
import IntegrationsView from './components/IntegrationsView';
import PatientSharingSettings from './components/PatientSharingSettings';
import InsuranceIntegration from './components/InsuranceIntegration';
import SystemConnector from './components/SystemConnector';
import ReportPreview from './components/ReportPreview';
import ReportToggleButton from './components/ReportToggleButton';
import PatientInfoForm from './components/PatientInfoForm';
import ScalesForm from './components/ScalesForm';
import ReportImportView from './components/ReportImportView';
import DigitalSignatureModal from './components/DigitalSignatureModal';
import Modal from './components/Modal';
import PrescriptionModal from './components/PrescriptionModal';
import MedicationFormModal from './components/MedicationFormModal';

const App: React.FC = () => {
  const { activeSection, setActiveSection } = useNavigation();
  
  // State
  const [reportData, setReportData] = useState<ReportData>(initialReportData);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockCategories, setStockCategories] = useState<string[]>(['Medicamentos', 'Materiais', 'EPIs', 'Papelaria']);
  const [userRole, setUserRole] = useState<'nurse' | 'admin'>('nurse');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isReportPanelOpen, setIsReportPanelOpen] = useState(false);
  
  // Data State
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [consumptionHistory, setConsumptionHistory] = useState<ConsumptionLog[]>([]);
  const [portalUsers, setPortalUsers] = useState<PortalUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [accessUsers, setAccessUsers] = useState<AccessUser[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]); 

  // UI State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [isDbConfigOpen, setIsDbConfigOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  
  // Gemini AI State
  const [isAnalyzingVitals, setIsAnalyzingVitals] = useState(false);
  const [vitalSignsInterpretation, setVitalSignsInterpretation] = useState<string | null>(null);
  const [vitalSignsSuggestions, setVitalSignsSuggestions] = useState<string | null>(null);
  const [finalReportText, setFinalReportText] = useState('');
  const [improvedReport, setImprovedReport] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState<DigitalSignature | undefined>(undefined);

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      setStockItems(await db.getStock());
      setSavedReports(await db.getReports());
      setConsumptionHistory(await db.getConsumptionHistory());
      setAccessUsers(await db.getAccessUsers());
      setPortalUsers(await db.getPortalUsers());
      setAuditLogs(await db.getAuditLogs());
      setIntegrations(await db.getIntegrations());
      setExamResults(await db.getExams());
    };
    loadData();
    
    // Initial Sync Trigger
    if (navigator.onLine) {
        triggerSync();
    }
  }, []);

  // Theme Handling
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handlers
  const handleInputChange = (field: keyof ReportData, value: any) => {
    setReportData(prev => {
        const newData = { ...prev, [field]: value };
        // Log changes for specific fields
        if (['patientName', 'medications', 'procedures'].includes(field)) {
            const log: AuditLog = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                user: userRole === 'admin' ? 'Admin' : 'Enfermeiro(a)',
                action: 'update',
                field: field,
                oldValue: prev[field],
                newValue: value
            };
            db.saveAuditLog(log);
            setAuditLogs(curr => [log, ...curr]);
        }
        return newData;
    });
    setAutoSaveStatus('saved');
    setTimeout(() => setAutoSaveStatus('idle'), 2000);
  };

  const handleMultiSelect = (field: keyof ReportData, value: string) => {
    setReportData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleUpdateRoutine = (updatedRoutine: RoutineItem[]) => {
      handleInputChange('routine', updatedRoutine);
  };

  const handleConsumedStockChange = (itemId: string, quantity: number) => {
      const currentConsumed = reportData.currentConsumedStock || [];
      const existingIndex = currentConsumed.findIndex(c => c.itemId === itemId);
      let newConsumed = [...currentConsumed];

      if (existingIndex >= 0) {
          if (quantity > 0) {
              newConsumed[existingIndex] = { itemId, quantityConsumed: quantity };
          } else {
              newConsumed.splice(existingIndex, 1);
          }
      } else if (quantity > 0) {
          newConsumed.push({ itemId, quantityConsumed: quantity });
      }
      handleInputChange('currentConsumedStock', newConsumed);
  };

  const handleRoutineStockConsumption = (itemId: string, qty: number) => {
      const currentList = reportData.currentConsumedStock || [];
      const itemIndex = currentList.findIndex(c => c.itemId === itemId);
      const currentQty = itemIndex >= 0 ? currentList[itemIndex].quantityConsumed : 0;
      handleConsumedStockChange(itemId, currentQty + qty);
  };


  // Funcao de validacao de dados do relatorio
  const validateReportData = (): string[] => {
    const errors: string[] = [];

    if (!reportData.patientName || reportData.patientName.trim().length < 3) errors.push('Nome do Paciente');
    if (!reportData.patientAge) errors.push('Idade do Paciente');
    if (!reportData.patientBed) errors.push('Leito');
    if (!reportData.bloodPressure) errors.push('Pressão Arterial');
    if (!reportData.heartRate) errors.push('Frequência Cardíaca');
    if (!reportData.temperature) errors.push('Temperatura');
    if (!reportData.saturation) errors.push('Saturação');
    if (!reportData.professionalName) errors.push('Nome do Profissional');

    return errors;
  };

  const handleGenerateReport = () => {
      const validationErrors = validateReportData();

      if (validationErrors.length > 0) {
          alert(`Por favor, preencha os seguintes campos obrigatórios antes de gerar o relatório:\n\n• ${validationErrors.join('\n• ')}`);
          return;
      }

      const fullText = generateFullReportText(reportData);
      setFinalReportText(fullText);
      setIsReportPanelOpen(true);
  };

  const handleAddManualMedication = (med: Omit<Medication, 'id'>) => {
      const newMedication: Medication = {
          ...med,
          id: Date.now().toString()
      };
      handleInputChange('medications', [...reportData.medications, newMedication]);
  };

  // Update final report text whenever reportData changes IF panel is open
  useEffect(() => {
      if (isReportPanelOpen) {
          const fullText = generateFullReportText(reportData);
          setFinalReportText(fullText);
      }
  }, [reportData, isReportPanelOpen]);

  const handleAnalyzeVitals = async () => {
      setIsAnalyzingVitals(true);
      try {
          const interpretation = await gemini.analyzeVitalSignsWithGemini(
              { bp: reportData.bloodPressure, hr: reportData.heartRate, sat: reportData.saturation, temp: reportData.temperature },
              { patientHistory: reportData.patientHistory, patientObservations: reportData.patientObservations }
          );
          setVitalSignsInterpretation(interpretation);
          
          const suggestions = await gemini.generateVitalSignsSuggestions(
              { bp: reportData.bloodPressure, hr: reportData.heartRate, sat: reportData.saturation, temp: reportData.temperature },
              { patientHistory: reportData.patientHistory, patientObservations: reportData.patientObservations }
          );
          setVitalSignsSuggestions(suggestions);
      } catch (error) {
          console.error(error);
          alert('Erro na análise de IA.');
      } finally {
          setIsAnalyzingVitals(false);
      }
  };

  const handleImproveReport = async () => {
      if (!finalReportText) return;
      setIsImproving(true);
      try {
          const improved = await gemini.improveReportWithGemini(finalReportText);
          setImprovedReport(improved);
      } catch (error) {
          alert('Erro ao melhorar relatório.');
      } finally {
          setIsImproving(false);
      }
  };

  const handleGenerateSbar = async () => {
       if (!finalReportText) return;
       setIsImproving(true);
       try {
           const sbar = await gemini.generateSBARSummary(finalReportText);
           setImprovedReport(sbar);
       } catch (error) {
           alert('Erro ao gerar SBAR.');
       } finally {
           setIsImproving(false);
       }
  };

  const handleSaveReport = async () => {
      if (!reportData.patientName) {
          alert('Nome do paciente é obrigatório.');
          return;
      }
      const newReport: SavedReport = {
          ...reportData,
          customNotes: finalReportText, // Save the generated full text as the main note/report
          id: Date.now().toString(),
          savedAt: new Date().toISOString(),
          consumedStock: (reportData.currentConsumedStock || []).map(c => {
              const item = stockItems.find(s => s.id === c.itemId);
              return {
                  itemName: item?.name || 'Item Desconhecido',
                  quantityConsumed: c.quantityConsumed,
                  unit: item?.unit || 'un'
              };
          })
      };
      await db.saveReport(newReport);
      setSavedReports(prev => [newReport, ...prev]);
      alert('Relatório salvo com sucesso!');
  };

  const handleSign = (signature: DigitalSignature) => {
      setDigitalSignature(signature);
      setIsSignatureModalOpen(false);
      setReportData(prev => ({ ...prev, digitalSignature: signature }));
  };

  // Render Content based on activeSection
  const renderContent = () => {
      switch (activeSection) {
          case 'identification':
              return (
                  <PatientInfoForm
                      data={reportData}
                      onInputChange={handleInputChange}
                      errors={{}}
                      onSuggestCid={async () => {
                          if (reportData.patientDiagnosis) {
                              const cid = await gemini.suggestCidWithGemini(reportData.patientDiagnosis);
                              handleInputChange('patientCid', cid);
                          }
                      }}
                  />
              );
          case 'assessments':
              return (
                  <AssessmentView
                      data={reportData}
                      errors={{}}
                      onInputChange={handleInputChange}
                      onMultiSelect={handleMultiSelect}
                      onProcedureObservationChange={(proc, obs) => {
                          setReportData(prev => ({
                              ...prev,
                              procedureObservations: { ...prev.procedureObservations, [proc]: obs }
                          }));
                      }}
                      onOpenModal={(type) => {
                          if (type === 'addMedication') setIsMedicationModalOpen(true);
                          // Handle other modal types if necessary
                      }}
                      onOpenPrescriptionModal={() => setIsPrescriptionModalOpen(true)}
                      onAnalyzeVitals={handleAnalyzeVitals}
                      vitalSignsInterpretation={vitalSignsInterpretation}
                      vitalSignsSuggestions={vitalSignsSuggestions}
                      isAnalyzingVitals={isAnalyzingVitals}
                      stockItems={stockItems}
                      onConsumedStockChange={handleConsumedStockChange}
                      patientHistory={savedReports}
                      isDarkMode={isDarkMode}
                  />
              );
          case 'scales':
              return <ScalesForm data={reportData} onInputChange={handleInputChange} />;
          case 'patientRoutine':
              return (
                  <PatientRoutineView
                      routine={reportData.routine || []}
                      onUpdateRoutine={handleUpdateRoutine}
                      userRole={userRole}
                      stockItems={stockItems}
                      onConsumeStock={handleRoutineStockConsumption}
                      patientDiagnosis={reportData.patientDiagnosis}
                      vitalSigns={{
                          bloodPressure: reportData.bloodPressure,
                          heartRate: reportData.heartRate,
                          temperature: reportData.temperature,
                          saturation: reportData.saturation,
                          glycemia: reportData.glycemia
                      }}
                  />
              );
          case 'minhaAgenda':
              return <AgendaView />; // Usando AgendaView para Minha Agenda
          case 'meuPonto':
              return <MeuPonto />;
          case 'pontoCerto': 
              return <PontoCertoView />;
          case 'integrations':
              return <IntegrationsView />;
          case 'sinais-vitais':
              return (
                  <div className="space-y-4">
                      <AssessmentView 
                          data={reportData}
                          errors={{}}
                          onInputChange={handleInputChange}
                          onMultiSelect={handleMultiSelect}
                          onProcedureObservationChange={() => {}}
                          onOpenModal={() => {}}
                          onOpenPrescriptionModal={() => {}}
                          onAnalyzeVitals={handleAnalyzeVitals}
                          vitalSignsInterpretation={vitalSignsInterpretation}
                          vitalSignsSuggestions={vitalSignsSuggestions}
                          isAnalyzingVitals={isAnalyzingVitals}
                          stockItems={stockItems}
                          onConsumedStockChange={handleConsumedStockChange}
                          patientHistory={savedReports}
                          isDarkMode={isDarkMode}
                      />
                  </div>
              );
          case 'stock':
              return (
                  <StockManager
                      stockItems={stockItems}
                      setStockItems={setStockItems}
                      consumptionHistory={consumptionHistory}
                      setConsumptionHistory={setConsumptionHistory}
                      stockCategories={stockCategories}
                      setStockCategories={setStockCategories}
                  />
              );
          case 'customKit':
              return (
                  <CustomKitBuilder
                      stockItems={stockItems}
                      onSaveKit={(items) => {
                          alert(`Kit com ${items.length} itens adicionado (Simulação)`);
                      }}
                      patientDiagnosis={reportData.patientDiagnosis}
                  />
              );
          case 'intercorrencias':
              return (
                  <IntercorrenciasPanel
                      patientName={reportData.patientName}
                      professionalName={reportData.professionalName}
                  />
              );
          case 'agenda':
              return <AgendaView />;
          case 'departmentView':
              return (
                  <DepartmentDashboard
                      reportData={reportData}
                      stockItems={stockItems}
                      activeSector={'Geral'}
                      onSectorChange={() => {}}
                  />
              );
          case 'accessManagement':
              return (
                  <AccessControlView
                      users={accessUsers}
                      onUpdateUser={async (u) => { await db.saveAccessUser(u); setAccessUsers(await db.getAccessUsers()); }}
                      onDeleteUser={(id) => { /* impl delete */ }}
                  />
              );
          case 'familyPortal':
              return (
                  <div className="space-y-6">
                      <FamilyPortalView savedReports={savedReports} currentPatientName={reportData.patientName} />
                      <AccessManager users={portalUsers} setUsers={setPortalUsers} patientNames={[reportData.patientName]} />
                  </div>
              );
          case 'patientHistory':
              return <AuditTrailView logs={auditLogs} />; 
          case 'medicationHistory':
              return <MedicationHistoryView savedReports={savedReports} currentPatientName={reportData.patientName} />;
          case 'exams':
              return (
                  <ExamResultsView
                      exams={examResults}
                      onSave={async (exam) => { await db.saveExam(exam as any); setExamResults(await db.getExams()); }}
                      onDelete={async (id) => { await db.deleteExam(id); setExamResults(await db.getExams()); }}
                      currentPatientName={reportData.patientName}
                  />
              );
          case 'generalReport':
              return <GeneralReportView savedReports={savedReports} />;
          case 'companyNotification':
              return <CompanyNotificationForm patientName={reportData.patientName} professionalName={reportData.professionalName} />;
          case 'auditTrail':
              return <AuditTrailView logs={auditLogs} />;
          case 'systemConnector':
              return (
                  <SystemConnector
                      integrations={integrations}
                      onSave={async (config) => { await db.saveIntegration(config); setIntegrations(await db.getIntegrations()); }}
                      onDelete={async (id) => { await db.deleteIntegration(id); setIntegrations(await db.getIntegrations()); }}
                  />
              );
          case 'insurance':
              return <InsuranceIntegration />;
          case 'sharingSettings':
              return <PatientSharingSettings />;
          default:
              return <div className="p-10 text-center text-slate-500">Seção em desenvolvimento ou não encontrada.</div>;
      }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 z-40 transform ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto lg:flex transition-transform duration-300 ease-in-out`}>
        <Sidebar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)}>
            <NavigationMenu
                isOpen={isNavOpen}
                onClose={() => setIsNavOpen(false)}
                userRole={userRole}
            />
        </Sidebar>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
            onToggleNavMenu={() => setIsNavOpen(!isNavOpen)}
            userRole={userRole}
            onToggleUserRole={() => setUserRole(prev => prev === 'nurse' ? 'admin' : 'nurse')}
            autoSaveStatus={autoSaveStatus}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onOpenDbConfig={() => setIsDbConfigOpen(true)}
            reportData={reportData}
        />

        <PatientContextHeader
            patientName={reportData.patientName}
            patientAge={reportData.patientAge}
            patientBed={reportData.patientBed}
            patientDiagnosis={reportData.patientDiagnosis}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative">
            <div className="max-w-7xl mx-auto">
                {renderContent()}
            </div>
        </main>
      </div>

      {/* Right Sidebar - Report Preview */}
      <div className={`fixed inset-y-0 right-0 z-40 w-full md:w-[600px] bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isReportPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                      <i className="fas fa-file-contract mr-2"></i> Documento Oficial
                  </h3>
                  <button onClick={() => setIsReportPanelOpen(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500">
                      <i className="fas fa-times text-lg"></i>
                  </button>
              </div>
              <div className="flex-1 overflow-hidden">
                  <ReportPreview
                      originalReport={finalReportText} // Uses the generated full text
                      improvedReport={improvedReport}
                      isImproving={isImproving}
                      onGenerate={handleGenerateReport}
                      onImprove={handleImproveReport}
                      onSbar={handleGenerateSbar}
                      onReset={() => setReportData(initialReportData)}
                      onSave={handleSaveReport}
                      onSign={() => setIsSignatureModalOpen(true)}
                      digitalSignature={digitalSignature}
                  />
              </div>
          </div>
      </div>

      {/* Toggle Button for Report Panel */}
      <ReportToggleButton
          isOpen={isReportPanelOpen}
          onClick={() => {
              if(!isReportPanelOpen) handleGenerateReport(); 
              else setIsReportPanelOpen(false);
          }}
      />

      {/* Modals */}
      <DatabaseConfigModal
          isOpen={isDbConfigOpen}
          onClose={() => setIsDbConfigOpen(false)}
      />
      
      <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
      />

      <PrescriptionModal
          isOpen={isPrescriptionModalOpen}
          onClose={() => setIsPrescriptionModalOpen(false)}
          onAddMedications={(meds) => {
              const newMeds = meds.map(m => ({ ...m, id: Date.now().toString() + Math.random(), administrationTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }));
              handleInputChange('medications', [...reportData.medications, ...newMeds]);
              setIsPrescriptionModalOpen(false);
          }}
          patientName={reportData.patientName}
      />

      <MedicationFormModal
          isOpen={isMedicationModalOpen}
          onClose={() => setIsMedicationModalOpen(false)}
          onSave={handleAddManualMedication}
      />

      <DigitalSignatureModal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          onSign={handleSign}
          professionalName={reportData.professionalName}
          coren={reportData.coren}
      />

    </div>
  );
};

export default App;

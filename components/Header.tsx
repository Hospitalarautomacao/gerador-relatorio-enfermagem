
import React, { useEffect, useState } from 'react';
import { getDbType } from '../services/databaseService';
import { ReportData } from '../types';
import { useNavigation } from '../contexts/NavigationContext';
import { getSyncStatus, triggerSync } from '../services/hospitalSyncService';

interface HeaderProps {
  onToggleNavMenu: () => void;
  userRole: 'nurse' | 'admin';
  onToggleUserRole: () => void;
  autoSaveStatus: 'idle' | 'saved';
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenDbConfig: () => void;
  reportData?: ReportData;
}

const SyncIndicator: React.FC = () => {
    const [status, setStatus] = useState(getSyncStatus());

    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(getSyncStatus());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSyncClick = () => {
        triggerSync();
        setStatus(getSyncStatus());
    };

    if (!status.isOnline) {
        return (
            <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200" title="Modo Offline">
                <i className="fas fa-wifi text-slate-400"></i>
                <span className="hidden sm:inline">Offline</span>
            </div>
        );
    }

    if (status.pending > 0) {
        return (
            <button onClick={handleSyncClick} className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full border border-amber-200 animate-pulse" title="Sincronizando...">
                <i className="fas fa-rotate text-amber-600 fa-spin"></i>
                <span className="hidden sm:inline">Sincronizando ({status.pending})</span>
            </button>
        );
    }

    return (
        <div className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full border border-green-200" title="Tudo sincronizado">
            <i className="fas fa-check-circle text-green-600"></i>
            <span className="hidden sm:inline">Sincronizado</span>
        </div>
    );
};

const UserProfileSwitcher: React.FC<{ role: 'nurse' | 'admin'; onToggle: () => void }> = ({ role, onToggle }) => (
  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-100 border border-slate-200 dark:bg-slate-700 dark:border-slate-600">
    <div className="text-right hidden sm:block">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Perfil (Simulado)</span>
      <p className="font-bold text-cyan-700 dark:text-cyan-400">{role === 'admin' ? 'Admin Master' : 'Enfermeiro(a)'}</p>
    </div>
    <button
      onClick={onToggle}
      className="px-4 py-2 bg-cyan-600 text-white text-xs font-semibold rounded-md hover:bg-cyan-700 transition-colors shadow-sm"
      title="Alternar perfil para testar o acesso de administrador"
    >
      <i className="fas fa-right-left mr-1 sm:mr-2"></i>
      <span className="hidden sm:inline">Trocar</span>
    </button>
  </div>
);

const DarkModeToggle: React.FC<{ isDarkMode: boolean; onToggle: () => void }> = ({ isDarkMode, onToggle }) => (
    <button
        onClick={onToggle}
        className="w-12 h-7 sm:w-14 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
        <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                isDarkMode ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
            }`}
        >
            <i className={`fas ${isDarkMode ? 'fa-moon' : 'fa-sun'} text-xs sm:text-sm flex items-center justify-center h-full w-full ${isDarkMode ? 'text-cyan-400' : 'text-amber-500'}`}></i>
        </div>
    </button>
);


const Header: React.FC<HeaderProps> = ({ onToggleNavMenu, userRole, onToggleUserRole, autoSaveStatus, isDarkMode, onToggleDarkMode, onOpenDbConfig, reportData }) => {
  const dbType = getDbType();
  const { activeSection, setActiveSection } = useNavigation();
  
  const handleWhatsAppShare = () => {
    if (!reportData) return;

    const lines = [
        `*Atualização de Atendimento*`,
        `*Paciente:* ${reportData.patientName || 'Não Identificado'}`,
        `*Leito:* ${reportData.patientBed || 'N/A'}`,
        `*Diagnóstico:* ${reportData.patientDiagnosis || 'N/A'}`,
        `*Estado Geral:* ${reportData.generalState || 'N/A'}`,
        `*PA:* ${reportData.bloodPressure || '-'} | *FC:* ${reportData.heartRate || '-'} | *Sat:* ${reportData.saturation || '-'}%`,
        `*Profissional:* ${reportData.professionalName || 'N/A'}`
    ];
    
    const text = lines.join('\n');
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const isHome = activeSection === 'identification';

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 dark:bg-slate-800 dark:border-b dark:border-slate-700">
      <div className="container mx-auto px-4 py-3 md:px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
           {/* Mobile Menu Toggle */}
           <button 
            onClick={onToggleNavMenu}
            className="md:hidden text-slate-600 hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-400 p-2"
            aria-label="Abrir menu de navegação"
          >
            <i className="fas fa-bars text-2xl"></i>
          </button>

          {/* Quick Back Button (if not on home) */}
          {!isHome && (
             <button 
                onClick={() => setActiveSection('identification')}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Voltar ao Início"
             >
                <i className="fas fa-arrow-left"></i>
             </button>
          )}

          <div>
            <h1 className="text-xl md:text-3xl font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
              <i className="fa-solid fa-file-medical hidden sm:inline"></i>
              <span className="hidden sm:inline">Relatório de Enfermagem</span>
              <span className="sm:hidden">Relatório</span>
            </h1>
             <div className="flex items-center gap-3">
                <SyncIndicator />
                {autoSaveStatus === 'saved' && (
                    <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full hidden md:flex items-center gap-1.5 transition-opacity duration-500 animate-fade-in dark:bg-green-900/50 dark:text-green-300" style={{ animationDuration: '500ms' }}>
                        <i className="fas fa-check-circle"></i>
                        <span>Salvo</span>
                    </div>
                )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
            {!isHome && (
                <button
                    onClick={() => setActiveSection('identification')}
                    className="hidden lg:flex px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-xs font-bold items-center gap-2"
                >
                    <i className="fas fa-arrow-left"></i> Início
                </button>
            )}

            <button
                onClick={handleWhatsAppShare}
                className="p-2 rounded-full text-green-600 bg-green-50 hover:bg-green-100 transition-colors"
                title="Enviar atualização rápida via WhatsApp para a base"
            >
                <i className="fab fa-whatsapp text-lg md:text-xl"></i>
            </button>
            <button
                onClick={onOpenDbConfig}
                className={`p-2 rounded-full transition-colors ${dbType === 'supabase' ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                title={dbType === 'supabase' ? 'Configurações e Ajuda (Conectado)' : 'Configurações e Ajuda (Local)'}
            >
                <i className="fas fa-cog text-lg"></i>
            </button>
            <DarkModeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
            <UserProfileSwitcher role={userRole} onToggle={onToggleUserRole} />
        </div>
      </div>
    </header>
  );
};

export default Header;

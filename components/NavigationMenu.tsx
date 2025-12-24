import React from 'react';
import type { SectionId } from '../types';
import { useNavigation } from '../contexts/NavigationContext';

interface NavItemProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isDisabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, isDisabled }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`
      group flex items-center w-full text-left px-4 py-3 mx-2 my-1 rounded-xl transition-all duration-200
      ${isActive
        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-200 dark:shadow-none'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
      }
      ${isDisabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : 'max-w-[calc(100%-16px)]'}
    `}
  >
    <div className={`
        w-6 h-6 flex items-center justify-center mr-3 transition-colors
        ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400'}
    `}>
        <i className={`fas ${icon} text-lg`}></i>
    </div>
    <span className={`font-medium text-sm ${isActive ? 'font-bold' : ''}`}>{label}</span>
    {isDisabled && <i className="fas fa-lock ml-auto text-slate-300 text-xs"></i>}
  </button>
);

const NavSectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <div className="px-6 py-3 mt-4 mb-1">
        <h2 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">
            {title}
        </h2>
    </div>
);

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'nurse' | 'admin';
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ isOpen, onClose, userRole }) => {
  const { activeSection, setActiveSection } = useNavigation();

  const handleSelectSection = (section: SectionId) => {
    setActiveSection(section);
    if (window.innerWidth < 1024) {
        onClose();
    }
  };

  const navItems: { id: SectionId; label: string; icon: string }[] = [
    { id: 'minhaAgenda', label: 'Minha Agenda', icon: 'fa-calendar-days' },
    { id: 'pontoCerto', label: '⏰ Ponto Certo', icon: 'fa-clock' },
    { id: 'patientRoutine', label: 'Rotina do Dia', icon: 'fa-calendar-check' },
    { id: 'identification', label: 'Dados do Paciente', icon: 'fa-id-card-clip' },
    { id: 'assessments', label: 'Evolução (Passo a Passo)', icon: 'fa-notes-medical' },
    { id: 'scales', label: 'Calculadoras de Risco', icon: 'fa-chart-bar' }, 
  ];
  
  const toolNavItems: { id: SectionId; label: string; icon: string }[] = [
    { id: 'sinais-vitais', label: 'Monitor Sinais Vitais', icon: 'fa-heart-pulse' }, 
    { id: 'intercorrencias', label: 'Intercorrências', icon: 'fa-triangle-exclamation' }, 
    { id: 'stock', label: 'Estoque e Materiais', icon: 'fa-boxes-stacked' },
    { id: 'customKit', label: 'Montar Kit', icon: 'fa-box-open' },
    { id: 'patientHistory', label: 'Histórico Completo', icon: 'fa-file-waveform' },
    { id: 'medicationHistory', label: 'Histórico de Remédios', icon: 'fa-clock-rotate-left' },
    { id: 'exams', label: 'Exames', icon: 'fa-vial' },
    { id: 'familyPortal', label: 'Portal da Família', icon: 'fa-users' },
    { id: 'companyNotification', label: 'Avisar Empresa', icon: 'fa-bell' },
  ];

  const adminNavItems: { id: SectionId; label: string; icon: string }[] = [
    { id: 'departmentView', label: 'Visão Geral (Setores)', icon: 'fa-sitemap' },
    { id: 'integrations', label: 'Integrações de Sistema', icon: 'fa-network-wired' }, 
    { id: 'accessManagement', label: 'Controle de Acessos', icon: 'fa-user-lock' },
    { id: 'insurance', label: 'Convênio e Faturamento', icon: 'fa-file-invoice-dollar' },
    { id: 'sharingSettings', label: 'Configurar Compartilhamento', icon: 'fa-share-nodes' },
    { id: 'auditTrail', label: 'Auditoria (Logs)', icon: 'fa-clipboard-check' },
    { id: 'systemConnector', label: 'Conectores (Dev)', icon: 'fa-plug' }
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm">
         {/* Logo Area */}
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center">
                <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-cyan-200 dark:shadow-none mr-3">
                    <i className="fa-solid fa-heart-pulse text-xl"></i>
                </div>
                <span className="font-bold text-lg text-slate-800 dark:text-white tracking-tight hidden lg:block">
                    Enf<span className="text-cyan-600">Smart</span>
                </span>
                <span className="font-bold text-lg text-slate-800 dark:text-white tracking-tight lg:hidden">
                    Menu
                </span>
            </div>
            
            <button 
                onClick={onClose}
                className="lg:hidden p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                title="Fechar Menu"
            >
                <i className="fas fa-times text-lg"></i>
            </button>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
            <div className="px-2 mb-2">
                 <button
                    onClick={() => handleSelectSection('identification')}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200 font-bold py-3 rounded-xl flex items-center justify-center transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    <i className="fas fa-home mr-2"></i>
                    Início
                </button>
            </div>

            <NavSectionHeader title="Dia a Dia" />
            <div className="space-y-0.5">
                {navItems.map(item => (
                <NavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={activeSection === item.id}
                    onClick={() => handleSelectSection(item.id)}
                />
                ))}
            </div>

            <NavSectionHeader title="Ferramentas" />
            <div className="space-y-0.5">
                 {toolNavItems.map(item => (
                    <NavItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeSection === item.id}
                        onClick={() => handleSelectSection(item.id)}
                    />
                ))}
            </div>

            <NavSectionHeader title="Administrativo" />
            <div className="space-y-0.5 pb-6">
                {adminNavItems.map(item => {
                    const isDisabled = userRole !== 'admin';
                    return (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            isActive={activeSection === item.id}
                            onClick={() => handleSelectSection(item.id)}
                            isDisabled={isDisabled}
                        />
                    );
                })}
            </div>
         </div>
         
         <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    <i className="fas fa-user"></i>
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{userRole === 'admin' ? 'Administrador' : 'Enfermeiro(a)'}</p>
                    <p className="text-[10px] text-slate-400 truncate">Online</p>
                </div>
            </div>
         </div>
    </div>
  );
};

export default NavigationMenu;
import React from 'react';

interface ReportToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const ReportToggleButton: React.FC<ReportToggleButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 ease-in-out transform hover:scale-110 lg:hidden"
      aria-label={isOpen ? 'Fechar Relatório' : 'Ver Relatório'}
      title={isOpen ? 'Fechar Relatório' : 'Ver Relatório'}
      aria-expanded={isOpen}
      aria-controls="sidebar-panel"
    >
      <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-file-waveform'} text-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}></i>
    </button>
  );
};

export default ReportToggleButton;
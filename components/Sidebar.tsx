
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, children }) => {
  return (
    <>
      {/* Backdrop for mobile/tablet ONLY */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Sidebar Content */}
      {/* Note: In the new App layout, the sidebar container is handled by the parent grid. 
          This component now mainly serves to wrap content if needed, but the main sliding logic 
          is in the parent class to allow for a static sidebar on desktop. 
      */}
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
        {/* Mobile Header (Only visible if inside a drawer context usually, but keeping generic) */}
        <header className="flex items-center justify-between p-4 border-b bg-white dark:bg-slate-800 dark:border-slate-700 lg:hidden">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Painel Lateral
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </header>
        
        <div className="flex-grow overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

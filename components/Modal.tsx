
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b">
          <h2 id="modal-title" className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <i className="fas fa-plus-circle text-cyan-600"></i>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 transition-colors rounded-full w-8 h-8 flex items-center justify-center hover:bg-slate-100"
            aria-label="Fechar modal"
          >
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </header>
        <main className="p-6">
          {children}
        </main>
        <footer className="flex justify-end items-center p-4 bg-slate-50 rounded-b-xl border-t gap-3">
          {footer}
        </footer>
      </div>
    </div>
  );
};

export default Modal;
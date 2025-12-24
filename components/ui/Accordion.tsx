
import React, { ReactNode } from 'react';

interface AccordionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ id, title, isOpen, onToggle, children }) => {
  const contentId = `accordion-content-${id}`;
  const headerId = `accordion-header-${id}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <h2>
        <button
          type="button"
          onClick={onToggle}
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="w-full flex justify-between items-center p-4 text-left text-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span>{title}</span>
          <i className={`fas fa-chevron-down text-slate-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>
      </h2>
      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="p-5 border-t border-slate-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accordion;

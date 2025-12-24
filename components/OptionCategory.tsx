
import React from 'react';
import type { ReportOption } from '../types';

interface OptionCategoryProps {
  options: ReportOption[];
  selection: string | string[];
  type: 'single' | 'multi';
  onSelect: (value: string) => void;
}

const getStatusIcon = (status: ReportOption['status']) => {
  switch (status) {
    case 'normal':
      return { icon: 'fa-check-circle', color: 'text-green-500' };
    case 'alert':
      return { icon: 'fa-exclamation-triangle', color: 'text-amber-500' };
    case 'critical':
      return { icon: 'fa-times-circle', color: 'text-red-600' };
    case 'info':
      return { icon: 'fa-file-lines', color: 'text-slate-500' };
    default:
      return null;
  }
};

const OptionCategory: React.FC<OptionCategoryProps> = ({ options, selection, type, onSelect }) => {
  
  const isSelected = (value: string): boolean => {
    if (type === 'single') {
      return selection === value;
    }
    return Array.isArray(selection) && selection.includes(value);
  };
  
  const titleId = `category-title-${Math.random()}`;

  return (
      <div 
        className="space-y-3"
        role={type === 'single' ? 'radiogroup' : 'group'}
        aria-labelledby={titleId}
      >
        {options.map(option => {
           const optionId = `${titleId}-${option.value}`;
           const statusInfo = getStatusIcon(option.status);

           return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={`
                flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-150 text-left
                ${isSelected(option.value)
                  ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-400 shadow'
                  : 'bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                }
              `}
            >
              <input
                type={type === 'single' ? 'radio' : 'checkbox'}
                id={optionId}
                name={titleId} // group radios for single choice
                checked={isSelected(option.value)}
                onChange={() => onSelect(option.value)}
                className="h-5 w-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
               {statusInfo ? (
                 <i className={`fas ${statusInfo.icon} ${statusInfo.color} text-lg mx-3 w-6 text-center`}></i>
               ) : (
                 // Fallback for options without status, like 'eliminations'
                 option.icon && <i className={`fas ${option.icon} text-slate-600 text-lg mx-3 w-6 text-center`}></i>
               )}
              <span className="flex-1 text-sm font-medium text-slate-700">{option.label}</span>
            </label>
           );
        })}
      </div>
  );
};

export default OptionCategory;

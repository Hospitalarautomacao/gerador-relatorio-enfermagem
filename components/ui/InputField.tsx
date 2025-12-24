
import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, error, className, ...props }) => (
    <div>
        <label htmlFor={id} className="flex items-center text-sm font-medium text-slate-600 mb-1 dark:text-slate-400">
            <span>{label}</span>
        </label>
        <div className="relative">
            <input
                id={id}
                name={id}
                className={`w-full p-2 bg-white border rounded-md transition duration-150 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500 pr-10 dark:border-red-600' : 'border-slate-300 focus:ring-cyan-500 focus:border-cyan-500 dark:border-slate-600 dark:focus:border-cyan-500'} ${className || ''}`}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                {...props}
            />
             {error && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <i className="fas fa-exclamation-triangle text-red-500" title={error}></i>
                </div>
            )}
        </div>
        {error && <p id={`${id}-error`} className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
);

export default InputField;
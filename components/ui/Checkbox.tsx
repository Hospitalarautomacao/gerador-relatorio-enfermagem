import React from 'react';

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    description?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, description }) => (
    <div>
        <label className="flex items-center space-x-2 cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </label>
        {description && <p className="text-xs text-slate-500 ml-6 mt-1">{description}</p>}
    </div>
);

export default Checkbox;

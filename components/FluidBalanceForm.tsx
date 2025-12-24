
import React, { useEffect } from 'react';
import { FluidBalanceData } from '../types';

interface FluidBalanceFormProps {
  data: FluidBalanceData;
  onChange: (data: FluidBalanceData) => void;
}

const FluidBalanceForm: React.FC<FluidBalanceFormProps> = ({ data, onChange }) => {

  const calculateBalance = (updatedData: FluidBalanceData) => {
    const intake = (parseFloat(updatedData.intakeOral) || 0) + 
                   (parseFloat(updatedData.intakeParenteral) || 0) + 
                   (parseFloat(updatedData.intakeOther) || 0);
                   
    const output = (parseFloat(updatedData.outputUrine) || 0) + 
                   (parseFloat(updatedData.outputEmesis) || 0) + 
                   (parseFloat(updatedData.outputDrains) || 0);
                   
    return intake - output;
  };

  const handleChange = (field: keyof FluidBalanceData, value: string) => {
    const newData = { ...data, [field]: value };
    const newBalance = calculateBalance(newData);
    onChange({ ...newData, balanceTotal: newBalance });
  };

  const balanceColor = data.balanceTotal > 0 ? 'text-green-600' : data.balanceTotal < 0 ? 'text-red-600' : 'text-slate-600';
  const balanceSign = data.balanceTotal > 0 ? '+' : '';

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-bold text-slate-800 mb-2 border-b pb-2">
        <i className="fas fa-faucet-drip mr-2 text-cyan-600"></i>
        Balanço Hídrico (Turno Atual)
      </h2>
      <p className="text-sm text-slate-500 mb-6">Registre os volumes em ml.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GANHOS */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-bold text-green-800 mb-4 flex items-center">
                <i className="fas fa-arrow-down mr-2"></i> Ganhos (Infusões/Ingestão)
            </h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Oral / SNE / Enteral</label>
                    <div className="flex items-center">
                        <input type="number" value={data.intakeOral} onChange={(e) => handleChange('intakeOral', e.target.value)} placeholder="0" className="w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500" />
                        <span className="ml-2 text-xs font-bold text-slate-500">ml</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Parenteral (Soro/Medicações)</label>
                    <div className="flex items-center">
                        <input type="number" value={data.intakeParenteral} onChange={(e) => handleChange('intakeParenteral', e.target.value)} placeholder="0" className="w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500" />
                        <span className="ml-2 text-xs font-bold text-slate-500">ml</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Outros</label>
                    <div className="flex items-center">
                        <input type="number" value={data.intakeOther} onChange={(e) => handleChange('intakeOther', e.target.value)} placeholder="0" className="w-full p-2 border rounded-md focus:ring-green-500 focus:border-green-500" />
                        <span className="ml-2 text-xs font-bold text-slate-500">ml</span>
                    </div>
                </div>
            </div>
        </div>

        {/* PERDAS */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
             <h3 className="font-bold text-red-800 mb-4 flex items-center">
                <i className="fas fa-arrow-up mr-2"></i> Perdas (Eliminações/Drenos)
            </h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Diurese</label>
                    <div className="flex items-center">
                        <input type="number" value={data.outputUrine} onChange={(e) => handleChange('outputUrine', e.target.value)} placeholder="0" className="w-full p-2 border rounded-md focus:ring-red-500 focus:border-red-500" />
                        <span className="ml-2 text-xs font-bold text-slate-500">ml</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Emese / Resíduo Gástrico</label>
                    <div className="flex items-center">
                        <input type="number" value={data.outputEmesis} onChange={(e) => handleChange('outputEmesis', e.target.value)} placeholder="0" className="w-full p-2 border rounded-md focus:ring-red-500 focus:border-red-500" />
                        <span className="ml-2 text-xs font-bold text-slate-500">ml</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Drenos</label>
                    <div className="flex items-center">
                        <input type="number" value={data.outputDrains} onChange={(e) => handleChange('outputDrains', e.target.value)} placeholder="0" className="w-full p-2 border rounded-md focus:ring-red-500 focus:border-red-500" />
                        <span className="ml-2 text-xs font-bold text-slate-500">ml</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Aspecto das Fezes (Obs)</label>
                    <input type="text" value={data.outputStool} onChange={(e) => handleChange('outputStool', e.target.value)} placeholder="Ex: Pastosas, enegrecidas..." className="w-full p-2 border rounded-md focus:ring-red-500 focus:border-red-500" />
                </div>
            </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 flex items-center gap-4">
              <span className="text-slate-600 font-semibold uppercase tracking-wider text-sm">Balanço Total:</span>
              <span className={`text-3xl font-bold ${balanceColor}`}>
                  {balanceSign}{data.balanceTotal} ml
              </span>
          </div>
      </div>
    </div>
  );
};

export default FluidBalanceForm;

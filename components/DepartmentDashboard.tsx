
import React from 'react';
import { ReportData, StockItem } from '../types';

interface DepartmentDashboardProps {
    reportData: ReportData;
    stockItems: StockItem[];
    activeSector: 'Farmácia' | 'Nutrição' | 'Equipamentos' | 'Geral';
    onSectorChange: (sector: any) => void;
}

const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({ reportData, stockItems, activeSector, onSectorChange }) => {
    
    // Filter logic based on sector
    const pharmacyItems = stockItems.filter(i => i.category === 'Medicamentos');
    const deviceItems = stockItems.filter(i => i.category === 'Materiais' || i.category === 'EPIs');
    const dietItems = stockItems.filter(i => i.category === 'Dieta'); // Assuming 'Dieta' category exists

    const renderPharmacyView = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-800 mb-2">Prescrição Atual</h3>
                    <ul className="list-disc pl-5 text-sm text-blue-900">
                        {reportData.medications.length > 0 ? reportData.medications.map(m => (
                            <li key={m.id}>{m.name} ({m.dose}) - {m.frequency}</li>
                        )) : <li>Sem medicações registradas.</li>}
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">Estoque Crítico (Farmácia)</h3>
                    <ul className="space-y-1">
                        {pharmacyItems.filter(i => i.quantity <= i.lowStockThreshold).map(i => (
                            <li key={i.id} className="text-xs flex justify-between items-center text-red-600 bg-red-50 p-1 rounded">
                                <span>{i.name}</span>
                                <span className="font-bold">{i.quantity} un</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

    const renderNutritionView = () => (
        <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 mb-4">Plano Nutricional</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase text-green-600">Tipo de Dieta</p>
                        <p className="text-lg font-bold text-green-900">{reportData.nutrition.dietType || 'Não definida'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-green-600">Via de Acesso</p>
                        <p className="text-lg font-bold text-green-900">{reportData.nutrition.dietType === 'Oral' ? 'Oral' : 'Sonda/Parenteral'}</p>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-xs font-bold uppercase text-green-600 mb-2">Refeições do Dia</p>
                    <div className="space-y-2">
                        {reportData.nutrition.meals.map(m => (
                            <div key={m.id} className="flex justify-between text-sm border-b border-green-200 pb-1">
                                <span>{m.name}</span>
                                <span className={m.completed ? 'text-green-700 font-bold' : 'text-slate-400'}>
                                    {m.completed ? `Aceitação: ${m.acceptance}%` : 'Pendente'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEquipmentView = () => (
        <div className="space-y-6">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-bold text-amber-800 mb-2">Dispositivos em Uso</h3>
                <ul className="space-y-2">
                    {reportData.devices.length > 0 ? reportData.devices.map(d => (
                        <li key={d.id} className="bg-white p-2 rounded shadow-sm flex justify-between items-center">
                            <span className="font-bold text-slate-700">{d.name}</span>
                            <span className="text-xs text-slate-500">{d.details}</span>
                        </li>
                    )) : <p className="text-sm text-amber-700">Nenhum dispositivo registrado.</p>}
                </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-2">Manutenção Preventiva (Simulação)</h3>
                <table className="w-full text-xs text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="py-1">Equipamento</th>
                            <th className="py-1">Próx. Manutenção</th>
                            <th className="py-1">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-1">Bomba Infusora #01</td>
                            <td className="py-1">15/11/2023</td>
                            <td className="text-green-600">OK</td>
                        </tr>
                        <tr>
                            <td className="py-1">Monitor Multipar.</td>
                            <td className="py-1">20/10/2023</td>
                            <td className="text-red-500 font-bold">Vencida</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-5 rounded-xl shadow">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">
                        <i className="fas fa-sitemap mr-2 text-cyan-600"></i>
                        Painel por Setor
                    </h2>
                    <p className="text-sm text-slate-500">Fragmentação de dados para equipes especializadas.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {['Geral', 'Farmácia', 'Nutrição', 'Equipamentos'].map((sector) => (
                        <button
                            key={sector}
                            onClick={() => onSectorChange(sector)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeSector === sector ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {sector}
                        </button>
                    ))}
                </div>
            </div>

            <div className="animate-fade-in">
                {activeSector === 'Geral' && (
                    <div className="text-center py-10 text-slate-400">
                        <i className="fas fa-layer-group text-4xl mb-4"></i>
                        <p>Selecione um setor acima para ver os dados filtrados.</p>
                    </div>
                )}
                {activeSector === 'Farmácia' && renderPharmacyView()}
                {activeSector === 'Nutrição' && renderNutritionView()}
                {activeSector === 'Equipamentos' && renderEquipmentView()}
            </div>
        </div>
    );
};

export default DepartmentDashboard;

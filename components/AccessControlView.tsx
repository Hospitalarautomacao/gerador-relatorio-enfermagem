
import React, { useState } from 'react';
import { AccessUser, AccessRole } from '../types';
import InputField from './ui/InputField';

interface AccessControlViewProps {
    users: AccessUser[];
    onUpdateUser: (user: AccessUser) => void;
    onDeleteUser: (id: string) => void;
}

const AccessControlView: React.FC<AccessControlViewProps> = ({ users, onUpdateUser, onDeleteUser }) => {
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<AccessUser>>({});

    const handleEdit = (user: AccessUser) => {
        setIsEditing(user.id);
        setEditForm(user);
    };

    const handleSave = () => {
        if (isEditing && editForm.id) {
            // Check active status based on dates
            const now = new Date();
            const start = new Date(editForm.startDate!);
            const end = new Date(editForm.endDate!);
            const isActive = now >= start && now <= end;

            onUpdateUser({ ...editForm, active: isActive } as AccessUser);
            setIsEditing(null);
        }
    };

    const getRoleBadge = (role: AccessRole) => {
        const styles: Record<AccessRole, string> = {
            'Admin': 'bg-red-100 text-red-800',
            'Empresa': 'bg-slate-800 text-white',
            'Enfermeiro': 'bg-cyan-100 text-cyan-800',
            'Técnico': 'bg-blue-100 text-blue-800',
            'Cuidador': 'bg-green-100 text-green-800',
            'Paciente': 'bg-purple-100 text-purple-800',
            'Família': 'bg-pink-100 text-pink-800'
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[role] || 'bg-slate-100'}`}>{role}</span>;
    };

    const isExpired = (date: string) => new Date(date) < new Date();

    return (
        <div className="bg-white p-5 rounded-xl shadow">
            <div className="mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-slate-800">
                    <i className="fas fa-id-badge mr-2 text-cyan-600"></i>
                    Controle de Acesso (RBAC)
                </h2>
                <p className="text-sm text-slate-500">Gerencie permissões, vigência de contratos e acessos de colaboradores. <span className="text-xs bg-yellow-100 text-yellow-800 px-2 rounded ml-2">Conformidade LGPD</span></p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-4 py-3">Colaborador</th>
                            <th className="px-4 py-3">Perfil (Role)</th>
                            <th className="px-4 py-3">Vigência (Início - Fim)</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-900">
                                    {isEditing === user.id ? (
                                        <input className="border p-1 rounded w-full" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                    ) : (
                                        <div>
                                            <p>{user.name}</p>
                                            <p className="text-xs text-slate-400">{user.email}</p>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {isEditing === user.id ? (
                                        <select className="border p-1 rounded" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value as any})}>
                                            <option>Enfermeiro</option><option>Técnico</option><option>Cuidador</option><option>Empresa</option>
                                        </select>
                                    ) : getRoleBadge(user.role)}
                                </td>
                                <td className="px-4 py-3">
                                    {isEditing === user.id ? (
                                        <div className="flex gap-1">
                                            <input type="date" className="border p-1 rounded text-xs" value={editForm.startDate?.split('T')[0]} onChange={e => setEditForm({...editForm, startDate: e.target.value})} />
                                            <input type="date" className="border p-1 rounded text-xs" value={editForm.endDate?.split('T')[0]} onChange={e => setEditForm({...editForm, endDate: e.target.value})} />
                                        </div>
                                    ) : (
                                        <div className="text-xs">
                                            <p className="text-green-700">Início: {new Date(user.startDate).toLocaleDateString()}</p>
                                            <p className={`${isExpired(user.endDate) ? 'text-red-600 font-bold' : 'text-slate-600'}`}>Fim: {new Date(user.endDate).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {user.active && !isExpired(user.endDate) ? (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">Ativo</span>
                                    ) : (
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">Expirado/Inativo</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {isEditing === user.id ? (
                                        <button onClick={handleSave} className="text-green-600 hover:text-green-800 font-bold mr-2"><i className="fas fa-save"></i></button>
                                    ) : (
                                        <button onClick={() => handleEdit(user)} className="text-cyan-600 hover:text-cyan-800 mr-2"><i className="fas fa-edit"></i></button>
                                    )}
                                    <button onClick={() => onDeleteUser(user.id)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccessControlView;

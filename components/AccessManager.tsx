
import React, { useState, useMemo } from 'react';
import { PortalUser } from '../types';
import Modal from './Modal';
import InputField from './ui/InputField';

const AccessModal = ({ isOpen, onClose, onSave, user, patientNames }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        relationship: user?.relationship || 'Familiar',
        patientName: user?.patientName || (patientNames.length > 0 ? patientNames[0] : ''),
    });
    const [errors, setErrors] = useState<{ email?: string; name?: string }>({});

    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                name: user?.name || '',
                email: user?.email || '',
                relationship: user?.relationship || 'Familiar',
                patientName: user?.patientName || (patientNames.length > 0 ? patientNames[0] : ''),
            });
            setErrors({});
        }
    }, [user, isOpen, patientNames]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors: { email?: string; name?: string } = {};
        if (!formData.name.trim()) newErrors.name = 'O nome é obrigatório.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Formato de e-mail inválido.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave({ ...formData, id: user?.id });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={user ? "Editar Acesso" : "Convidar para o Portal"}
            footer={
                <>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                    <button onClick={handleSubmit} type="submit" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700">Salvar</button>
                </>
            }
        >
            <form id="access-form" onSubmit={handleSubmit} className="space-y-4">
                <InputField id="name" name="name" label="Nome Completo" value={formData.name} onChange={handleChange} required error={errors.name} />
                <InputField id="email" name="email" label="E-mail" type="email" value={formData.email} onChange={handleChange} required error={errors.email} />
                 <div>
                    <label htmlFor="patientName" className="block text-sm font-medium text-slate-600 mb-1">Paciente Vinculado</label>
                    <select id="patientName" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md">
                        {patientNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="relationship" className="block text-sm font-medium text-slate-600 mb-1">Relação/Tipo</label>
                    <select id="relationship" name="relationship" value={formData.relationship} onChange={handleChange} className="w-full p-2 bg-white border border-slate-300 rounded-md">
                        <option value="Familiar">Familiar</option>
                        <option value="Convênio">Convênio</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>
            </form>
        </Modal>
    );
};


interface AccessManagerProps {
    users: PortalUser[];
    setUsers: React.Dispatch<React.SetStateAction<PortalUser[]>>;
    patientNames: string[];
}

const AccessManager: React.FC<AccessManagerProps> = ({ users, setUsers, patientNames }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<PortalUser | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.patientName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);
    
    const handleOpenModal = (user: PortalUser | null = null) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleSaveUser = (userToSave: Omit<PortalUser, 'id' | 'status'> & { id?: string }) => {
        if (userToSave.id) { // Editing
            setUsers(prev => prev.map(u => u.id === userToSave.id ? { ...u, ...userToSave } as PortalUser : u));
        } else { // Adding
            const newUser: PortalUser = {
                ...userToSave,
                id: Date.now().toString(),
                status: 'Pendente'
            };
            setUsers(prev => [...prev, newUser]);
        }
        handleCloseModal();
    };

    const handleDeleteUser = (id: string) => {
        if (window.confirm("Tem certeza que deseja remover o acesso deste usuário?")) {
            setUsers(prev => prev.filter(u => u.id !== id));
        }
    };

    const getStatusChip = (status: PortalUser['status']) => {
        const styles = {
            'Ativo': 'bg-green-100 text-green-800',
            'Pendente': 'bg-amber-100 text-amber-800',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };


    return (
        <>
            <div className="bg-white p-5 rounded-xl shadow">
                 <div className="flex justify-between items-center mb-4 border-b pb-2 flex-wrap gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            <i className="fas fa-user-shield mr-2 text-cyan-600"></i>
                            Gerenciar Acessos ao Portal
                        </h2>
                        <p className="text-sm text-slate-500">
                            Convide e gerencie o acesso de familiares e convênios.
                        </p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700 flex items-center gap-2">
                        <i className="fas fa-user-plus"></i>
                        Convidar Usuário
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Buscar por nome, e-mail ou paciente..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-4 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                />

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                         <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome / E-mail</th>
                                <th scope="col" className="px-6 py-3">Paciente</th>
                                <th scope="col" className="px-6 py-3">Relação</th>
                                <th scope="col" className="px-6 py-3 text-center">Status</th>
                                <th scope="col" className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </td>
                                    <td className="px-6 py-4">{user.patientName}</td>
                                    <td className="px-6 py-4">{user.relationship}</td>
                                    <td className="px-6 py-4 text-center">{getStatusChip(user.status)}</td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button className="font-medium text-blue-600 hover:underline" title="Reenviar Convite" aria-label={`Reenviar convite para ${user.name}`}><i className="fas fa-paper-plane"></i></button>
                                        <button onClick={() => handleOpenModal(user)} className="font-medium text-cyan-600 hover:underline" title="Editar Usuário" aria-label={`Editar ${user.name}`}><i className="fas fa-edit"></i></button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="font-medium text-red-600 hover:underline" title="Remover Acesso" aria-label={`Remover acesso de ${user.name}`}><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-500">Nenhum usuário encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
            {isModalOpen && (
                <AccessModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveUser}
                    user={currentUser}
                    patientNames={patientNames}
                />
            )}
        </>
    );
};

export default AccessManager;

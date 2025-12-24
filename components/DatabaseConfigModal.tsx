
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { DatabaseConfig } from '../types';
import { saveDbConfig, getDefaultCredentials } from '../services/databaseService';
import InputField from './ui/InputField';
import Checkbox from './ui/Checkbox';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<DatabaseConfig>({ type: 'local', supabaseUrl: '', supabaseKey: '' });
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dbConfig');
    if (stored) {
      const parsedConfig = JSON.parse(stored);
      setConfig(parsedConfig);
    } else {
        // Se não houver config salva, preenche com as credenciais padrão do serviço
        const defaults = getDefaultCredentials();
        setConfig({
            type: 'supabase', // Padrão solicitado
            supabaseUrl: defaults.url,
            supabaseKey: defaults.key
        });
    }
  }, [isOpen]);

  const handleSave = () => {
    saveDbConfig(config);
    onClose();
  };

  const handleConfigChange = (section: 'mysqlConfig' | 'googleDriveConfig', field: string, value: any) => {
      setConfig(prev => ({
          ...prev,
          [section]: {
              ...(prev[section] || {}),
              [field]: value
          }
      }));
  };

  const toggleIntegration = (section: 'mysqlConfig' | 'googleDriveConfig', enabled: boolean) => {
      setConfig(prev => ({
          ...prev,
          [section]: {
              ...(prev[section] || {}),
              enabled
          }
      }));
  };

  const sqlScript = `
-- Execute este script no SQL Editor do Supabase para criar as tabelas necessárias.

-- 1. Criação das Tabelas
create table if not exists reports (
  id text primary key,
  "savedAt" timestamp with time zone,
  "patientName" text,
  "professionalName" text,
  "patientDiagnosis" text,
  "patientBed" text,
  data jsonb
);

create table if not exists stock_items (
  id text primary key,
  name text,
  category text,
  quantity integer,
  unit text,
  "lowStockThreshold" integer
);

create table if not exists consumption_logs (
  id text primary key,
  timestamp timestamp with time zone,
  "itemId" text,
  "itemName" text,
  "category" text,
  "quantityConsumed" integer,
  unit text,
  "user" text
);

create table if not exists exam_results (
  id text primary key,
  "patientName" text,
  name text,
  type text,
  date date,
  result text
);

create table if not exists portal_users (
  id text primary key,
  name text,
  email text,
  relationship text,
  "patientName" text,
  status text
);

create table if not exists audit_logs (
  id text primary key,
  timestamp timestamp with time zone,
  "user" text,
  action text,
  field text,
  "oldValue" jsonb,
  "newValue" jsonb
);

create table if not exists intercorrencias (
  id text primary key,
  paciente_id text,
  profissional_id text,
  data timestamp with time zone,
  status text,
  motivo text,
  descricao text,
  conduta_realizada text,
  acompanhamento text,
  data_criacao timestamp with time zone,
  data_atualizacao timestamp with time zone
);

create table if not exists shifts (
  id text primary key,
  date text,
  "startTime" text,
  "endTime" text,
  "patientName" text,
  "patientAddress" text,
  status text,
  type text
);

create table if not exists access_users (
  id text primary key,
  name text,
  email text,
  role text,
  status text,
  active boolean,
  "startDate" timestamp with time zone,
  "endDate" timestamp with time zone
);

create table if not exists integrations (
  id text primary key,
  name text,
  type text,
  url text,
  status text,
  events text[]
);

-- 2. Habilitar Realtime para tabelas críticas
alter publication supabase_realtime add table stock_items;
alter publication supabase_realtime add table intercorrencias;
alter publication supabase_realtime add table reports;
alter publication supabase_realtime add table shifts;

-- 3. Políticas de Segurança Simplificadas (Acesso Público para Demo)
-- ATENÇÃO: Em produção, configure Row Level Security (RLS) adequadamente.
alter table reports enable row level security;
create policy "Public Access Reports" on reports for all using (true);

alter table stock_items enable row level security;
create policy "Public Access Stock" on stock_items for all using (true);

alter table consumption_logs enable row level security;
create policy "Public Access Logs" on consumption_logs for all using (true);

alter table intercorrencias enable row level security;
create policy "Public Access Intercorrencias" on intercorrencias for all using (true);

alter table shifts enable row level security;
create policy "Public Access Shifts" on shifts for all using (true);
  `;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuração de Dados e Integrações"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-sm hover:bg-cyan-700">Salvar e Recarregar</button>
        </>
      }
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Armazenamento Principal */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-700 mb-3 flex items-center">
                <i className="fas fa-database mr-2 text-cyan-600"></i> Banco de Dados Principal
            </h4>
            <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 flex-1">
                <input 
                    type="radio" 
                    name="dbType" 
                    value="local" 
                    checked={config.type === 'local'} 
                    onChange={() => setConfig({ ...config, type: 'local' })}
                    className="text-cyan-600 focus:ring-cyan-500"
                />
                <span className="font-semibold text-sm">Local (Offline)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 flex-1">
                <input 
                    type="radio" 
                    name="dbType" 
                    value="supabase" 
                    checked={config.type === 'supabase'} 
                    onChange={() => setConfig({ ...config, type: 'supabase' })}
                    className="text-cyan-600 focus:ring-cyan-500"
                />
                <span className="font-semibold text-sm">Nuvem (Supabase)</span>
                </label>
            </div>

            {config.type === 'supabase' && (
            <div className="space-y-4 animate-fade-in bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h5 className="font-bold text-slate-700 text-xs uppercase">Credenciais do Projeto</h5>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Educacional</span>
                </div>
                <InputField
                    id="supabaseUrl"
                    label="Project URL"
                    value={config.supabaseUrl || ''}
                    onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
                    placeholder="https://xyz.supabase.co"
                />
                <InputField
                    id="supabaseKey"
                    label="API Key (Anon Public)"
                    value={config.supabaseKey || ''}
                    onChange={(e) => setConfig({ ...config, supabaseKey: e.target.value })}
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                />
                
                <div className="mt-2">
                    <button 
                        onClick={() => setShowSql(!showSql)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
                    >
                        {showSql ? 'Ocultar Script SQL' : 'Mostrar Script SQL para criar tabelas'}
                    </button>
                    
                    {showSql && (
                        <div className="mt-2">
                            <p className="text-xs text-slate-500 mb-1">Copie e cole no SQL Editor do seu painel Supabase:</p>
                            <textarea 
                                readOnly
                                className="w-full h-40 text-[10px] font-mono bg-slate-800 text-green-400 p-2 rounded-md"
                                value={sqlScript}
                            />
                        </div>
                    )}
                </div>
            </div>
            )}
        </div>

        {/* Integrações Extras (MySQL / Drive) */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-700 mb-3 flex items-center">
                <i className="fas fa-plug mr-2 text-purple-600"></i> Integrações Adicionais
            </h4>
            
            {/* MySQL Config */}
            <div className="mb-4 pb-4 border-b border-slate-100">
                <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox"
                            checked={config.mysqlConfig?.enabled || false}
                            onChange={(e) => toggleIntegration('mysqlConfig', e.target.checked)}
                            className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-semibold text-sm text-slate-700">Sincronizar com MySQL (Legado)</span>
                    </label>
                    <i className="fas fa-database text-slate-400"></i>
                </div>
                {config.mysqlConfig?.enabled && (
                    <div className="grid grid-cols-1 gap-3 pl-6 animate-fade-in">
                        <InputField
                            id="mysqlEndpoint"
                            label="API Endpoint (Middleware)"
                            value={config.mysqlConfig?.endpoint || ''}
                            onChange={(e) => handleConfigChange('mysqlConfig', 'endpoint', e.target.value)}
                            placeholder="https://api.meuhospital.com/v1/sync/mysql"
                        />
                        <p className="text-[10px] text-slate-500">
                            *Conexão direta não suportada por navegadores. Requer API intermediária.
                        </p>
                    </div>
                )}
            </div>

            {/* Google Drive Config */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox"
                            checked={config.googleDriveConfig?.enabled || false}
                            onChange={(e) => toggleIntegration('googleDriveConfig', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-sm text-slate-700">Backup no Google Drive</span>
                    </label>
                    <i className="fab fa-google-drive text-slate-400"></i>
                </div>
                {config.googleDriveConfig?.enabled && (
                    <div className="grid grid-cols-1 gap-3 pl-6 animate-fade-in">
                        <InputField
                            id="driveFolderId"
                            label="Folder ID (Opcional)"
                            value={config.googleDriveConfig?.folderId || ''}
                            onChange={(e) => handleConfigChange('googleDriveConfig', 'folderId', e.target.value)}
                            placeholder="1A2B3C..."
                        />
                        <InputField
                            id="driveClientId"
                            label="OAuth Client ID"
                            value={config.googleDriveConfig?.clientId || ''}
                            onChange={(e) => handleConfigChange('googleDriveConfig', 'clientId', e.target.value)}
                            placeholder="apps.googleusercontent.com"
                        />
                    </div>
                )}
            </div>
        </div>

      </div>
    </Modal>
  );
};

export default DatabaseConfigModal;

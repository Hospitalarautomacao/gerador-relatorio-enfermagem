
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { DatabaseConfig, SavedReport, StockItem, ConsumptionLog, ExamResult, PortalUser, AuditLog, IntegrationConfig, AccessUser, Intercorrencia, Shift } from '../types';

let supabase: SupabaseClient | null = null;
let dbType: 'local' | 'supabase' | 'hybrid' = 'local';

// --- CREDENCIAIS PADRÃO (SUPABASE EDUCACIONAL) ---
const DEFAULT_SUPABASE_URL = 'https://whcqfemvlzpuivqxmtua.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoY3FmZW12bHpwdWl2cXhtdHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTg1NDQsImV4cCI6MjA3OTc5NDU0NH0.Va7vQl4VE2PXiby2S5cH_YKGcKVcNkqUqX3BIdu91OM';

// Initialize based on saved config or defaults
try {
    const storedConfig = localStorage.getItem('dbConfig');
    
    if (storedConfig) {
      const config: DatabaseConfig = JSON.parse(storedConfig);
      if (config.type === 'supabase' && config.supabaseUrl && config.supabaseKey) {
        if(config.supabaseUrl.trim() !== '' && config.supabaseKey.trim() !== '') {
            supabase = createClient(config.supabaseUrl, config.supabaseKey, {
                auth: { persistSession: true, autoRefreshToken: true }
            });
            dbType = 'supabase';
        }
      } else if (config.type === 'local') {
          dbType = 'local';
      }
    } else {
        // --- FIRST TIME LOAD: AUTO-CONNECT TO EDUCATIONAL SUPABASE ---
        console.log("Inicializando conexão padrão com Supabase Educacional...");
        supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY, {
            auth: { persistSession: true, autoRefreshToken: true }
        });
        dbType = 'supabase';
    }
} catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    dbType = 'local';
    supabase = null;
}

export const getDbType = () => dbType;

export const getDefaultCredentials = () => ({
    url: DEFAULT_SUPABASE_URL,
    key: DEFAULT_SUPABASE_KEY
});

export const saveDbConfig = (config: DatabaseConfig) => {
  localStorage.setItem('dbConfig', JSON.stringify(config));
  
  // Reset state
  supabase = null;
  dbType = 'local';

  try {
      if (config.type === 'supabase' && config.supabaseUrl && config.supabaseKey) {
        supabase = createClient(config.supabaseUrl, config.supabaseKey);
        dbType = 'supabase';
      }
  } catch (error) {
      console.error("Error re-initializing Supabase:", error);
      alert("Erro ao conectar com Supabase. Verifique as credenciais.");
  }
  
  window.location.reload();
};

const safeLocalStorageSet = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            alert("ERRO CRÍTICO: O armazenamento local do navegador está cheio.");
        } else {
            console.error("Erro ao salvar no LocalStorage:", e);
        }
    }
};

// Helper: Tratamento de erros do Supabase (Tabela inexistente)
const handleSupabaseError = (error: any, context: string) => {
    const msg = error.message || '';
    // Códigos comuns de tabela inexistente:
    // 42P01: undefined_table
    // PGRST200: Could not find the table in the schema cache
    const isTableMissing = 
        error.code === '42P01' || 
        error.code === 'PGRST200' ||
        msg.includes('does not exist') || 
        msg.includes('Could not find the table');

    if (isTableMissing) {
        console.warn(`[Supabase] Tabela ainda não criada em '${context}'. Retornando lista vazia.`);
        return []; 
    }
    
    console.error(`[Supabase Error] ${context}:`, error);
    // Fail safe: return empty array instead of crashing app
    return [];
};

// --- EXTERNAL INTEGRATIONS ENDPOINTS (Placeholders) ---

export const syncToMySQL = async (data: any, mysqlConfig: any) => {
    if (!mysqlConfig?.enabled) return { success: false, message: 'MySQL desativado' };
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: 'Dados enviados para API MySQL (Simulação)' };
    } catch (error) {
        return { success: false, error };
    }
};

export const uploadToGoogleDrive = async (fileBlob: Blob, fileName: string, driveConfig: any) => {
    if (!driveConfig?.enabled) return { success: false, message: 'Google Drive desativado' };
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, fileId: 'simulated_drive_file_id_123' };
    } catch (error) {
        return { success: false, error };
    }
};


// --- REALTIME SUBSCRIPTION ---
export const subscribeToReports = (onUpdate: (payload: any) => void): RealtimeChannel | null => {
    if (dbType === 'supabase' && supabase) {
        return supabase.channel('realtime-reports')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, onUpdate)
            .subscribe((status, err) => {
                if(status === 'CHANNEL_ERROR') console.warn("Erro no Realtime Reports (Provável tabela inexistente):", err);
            });
    }
    return null;
};

export const subscribeToStock = (onUpdate: (payload: any) => void): RealtimeChannel | null => {
    if (dbType === 'supabase' && supabase) {
        return supabase.channel('realtime-stock')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_items' }, onUpdate)
            .subscribe((status, err) => {
                if (status === 'CHANNEL_ERROR') console.warn("Erro no Realtime Stock (Provável tabela inexistente).");
            });
    }
    return null;
};

export const subscribeToIntercorrencias = (onUpdate: (payload: any) => void, patientId?: string): RealtimeChannel | null => {
    if (dbType === 'supabase' && supabase) {
        return supabase.channel('realtime-intercorrencias')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'intercorrencias' }, (payload) => {
                if (patientId && payload.new && 'paciente_id' in payload.new) {
                    if (payload.new.paciente_id !== patientId) return;
                }
                onUpdate(payload);
            })
            .subscribe((status, err) => {
                if(status === 'CHANNEL_ERROR') console.warn("Erro no Realtime Intercorrencias (Provável tabela inexistente).");
            });
    }
    return null;
};

export const subscribeToShifts = (onUpdate: (payload: any) => void): RealtimeChannel | null => {
    if (dbType === 'supabase' && supabase) {
        return supabase.channel('realtime-shifts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts' }, onUpdate)
            .subscribe((status, err) => {
                if(status === 'CHANNEL_ERROR') console.warn("Erro no Realtime Shifts (Provável tabela inexistente).");
            });
    }
    return null;
};

// REPORTS
export const saveReport = async (report: SavedReport): Promise<void> => {
  if (dbType === 'supabase' && supabase) {
    const { error } = await supabase.from('reports').insert([report]);
    if (error) {
        if(error.code === '42P01' || error.code === 'PGRST200') {
            console.warn("Tabela 'reports' não existe. Execute o SQL no Supabase.");
            alert("Erro: Tabela 'reports' não encontrada. Configure o banco de dados.");
            return;
        }
        throw new Error(error.message);
    }
  } else {
    const reports = await getReports();
    const updated = [report, ...reports];
    safeLocalStorageSet('savedReports', JSON.stringify(updated));
  }
};

export const getReports = async (): Promise<SavedReport[]> => {
  if (dbType === 'supabase' && supabase) {
    const { data, error } = await supabase.from('reports').select('*').order('savedAt', { ascending: false });
    if (error) return handleSupabaseError(error, 'getReports') as SavedReport[];
    return data as SavedReport[];
  } else {
    const stored = localStorage.getItem('savedReports');
    return stored ? JSON.parse(stored) : [];
  }
};

// STOCK
export const getStock = async (): Promise<StockItem[]> => {
    if (dbType === 'supabase' && supabase) {
        const { data, error } = await supabase.from('stock_items').select('*');
        if (error) return handleSupabaseError(error, 'getStock') as StockItem[];
        return data as StockItem[];
    } else {
        const stored = localStorage.getItem('stockItems');
        return stored ? JSON.parse(stored) : [];
    }
};

export const saveStockItem = async (item: StockItem): Promise<void> => {
    if (dbType === 'supabase' && supabase) {
        const { error } = await supabase.from('stock_items').upsert([item]);
        if (error) {
             if (error.code === '42P01' || error.code === 'PGRST200' || error.message?.includes('Could not find the table')) {
                 console.warn("Tabela 'stock_items' não existe. Item não salvo no Supabase.");
                 return;
             }
             throw new Error(error.message);
        }
    } else {
        const items = await getStock();
        const index = items.findIndex(i => i.id === item.id);
        if (index >= 0) items[index] = item;
        else items.push(item);
        safeLocalStorageSet('stockItems', JSON.stringify(items));
    }
};

export const updateStockQuantity = async (itemId: string, newQuantity: number): Promise<void> => {
    if (dbType === 'supabase' && supabase) {
        const { error } = await supabase.from('stock_items').update({ quantity: newQuantity }).eq('id', itemId);
        if (error && error.code !== '42P01' && error.code !== 'PGRST200') throw new Error(error.message);
    } else {
         const items = await getStock();
         const index = items.findIndex(i => i.id === itemId);
         if (index >= 0) {
             items[index].quantity = newQuantity;
             safeLocalStorageSet('stockItems', JSON.stringify(items));
         }
    }
}

export const deleteStockItem = async (id: string): Promise<void> => {
     if (dbType === 'supabase' && supabase) {
        const { error } = await supabase.from('stock_items').delete().eq('id', id);
        if (error && error.code !== '42P01' && error.code !== 'PGRST200') throw new Error(error.message);
    } else {
        const items = await getStock();
        const updated = items.filter(i => i.id !== id);
        safeLocalStorageSet('stockItems', JSON.stringify(updated));
    }
}

// CONSUMPTION HISTORY
export const getConsumptionHistory = async (): Promise<ConsumptionLog[]> => {
    if (dbType === 'supabase' && supabase) {
        const { data, error } = await supabase.from('consumption_logs').select('*').order('timestamp', { ascending: false });
        if (error) return handleSupabaseError(error, 'getConsumptionHistory') as ConsumptionLog[];
        return data as ConsumptionLog[];
    } else {
        const stored = localStorage.getItem('consumptionHistory');
        return stored ? JSON.parse(stored) : [];
    }
}

export const logConsumption = async (log: ConsumptionLog): Promise<void> => {
     if (dbType === 'supabase' && supabase) {
        const { error } = await supabase.from('consumption_logs').insert([log]);
        if (error && error.code !== '42P01' && error.code !== 'PGRST200') throw new Error(error.message);
    } else {
        const history = await getConsumptionHistory();
        const updated = [log, ...history];
        safeLocalStorageSet('consumptionHistory', JSON.stringify(updated));
    }
}


// EXAMS
export const getExams = async (): Promise<ExamResult[]> => {
     if (dbType === 'supabase' && supabase) {
        const { data, error } = await supabase.from('exam_results').select('*').order('date', { ascending: false });
        if (error) return handleSupabaseError(error, 'getExams') as ExamResult[];
        return data as ExamResult[];
    } else {
        const stored = localStorage.getItem('examResults');
        return stored ? JSON.parse(stored) : [];
    }
}

export const saveExam = async (exam: ExamResult): Promise<void> => {
     if (dbType === 'supabase' && supabase) {
        const { error } = await supabase.from('exam_results').upsert([exam]);
        if (error && error.code !== '42P01' && error.code !== 'PGRST200') throw new Error(error.message);
    } else {
        const exams = await getExams();
         const index = exams.findIndex(e => e.id === exam.id);
        if (index >= 0) exams[index] = exam;
        else exams.unshift(exam);
        safeLocalStorageSet('examResults', JSON.stringify(exams));
    }
}

export const deleteExam = async (id: string): Promise<void> => {
     if (dbType === 'supabase' && supabase) {
         const { error } = await supabase.from('exam_results').delete().eq('id', id);
        if (error && error.code !== '42P01' && error.code !== 'PGRST200') throw new Error(error.message);
    } else {
        const exams = await getExams();
        const updated = exams.filter(e => e.id !== id);
        safeLocalStorageSet('examResults', JSON.stringify(updated));
    }
}

// PORTAL USERS / ACCESS CONTROL
export const getAccessUsers = async (): Promise<AccessUser[]> => {
     if (dbType === 'supabase' && supabase) {
        const { data, error } = await supabase.from('access_users').select('*');
        if (error) return handleSupabaseError(error, 'getAccessUsers') as AccessUser[];
        return data as AccessUser[];
    } else {
        const stored = localStorage.getItem('accessUsers');
        return stored ? JSON.parse(stored) : [];
    }
}

export const saveAccessUser = async (user: AccessUser): Promise<void> => {
     if (dbType === 'supabase' && supabase) {
        const { error } = await supabase.from('access_users').upsert([user]);
        if (error && error.code !== '42P01' && error.code !== 'PGRST200') throw new Error(error.message);
    } else {
        const users = await getAccessUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index >= 0) users[index] = user;
        else users.push(user);
        safeLocalStorageSet('accessUsers', JSON.stringify(users));
    }
}

export const getPortalUsers = async (): Promise<PortalUser[]> => {
    return (await getAccessUsers()).map(u => ({...u, relationship: 'Familiar'}));
}

// AUDIT LOGS (PERSISTENCE)
export const getAuditLogs = async (): Promise<AuditLog[]> => {
    if (dbType === 'supabase' && supabase) {
       const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
       if (error) return handleSupabaseError(error, 'getAuditLogs') as AuditLog[];
       return data as AuditLog[];
   } else {
       const stored = localStorage.getItem('auditLogs');
       return stored ? JSON.parse(stored) : [];
   }
}

export const saveAuditLog = async (log: AuditLog): Promise<void> => {
    if (dbType === 'supabase' && supabase) {
       const { error } = await supabase.from('audit_logs').insert([log]);
       if(error && error.code !== '42P01' && error.code !== 'PGRST200') console.error("Error saving audit log:", error);
   } else {
       try {
           const stored = localStorage.getItem('auditLogs');
           const logs = stored ? JSON.parse(stored) : [];
           const updated = [log, ...logs].slice(0, 1000); 
           localStorage.setItem('auditLogs', JSON.stringify(updated));
       } catch (e) {
           console.error("Error saving audit log locally:", e);
       }
   }
}

// INTEGRATIONS
export const getIntegrations = async (): Promise<IntegrationConfig[]> => {
    if (dbType === 'supabase' && supabase) {
        const { data, error } = await supabase.from('integrations').select('*');
        if (error) return handleSupabaseError(error, 'getIntegrations') as IntegrationConfig[];
        return data as IntegrationConfig[];
    } else {
        const stored = localStorage.getItem('integrations');
        return stored ? JSON.parse(stored) : [];
    }
}

export const saveIntegration = async (config: IntegrationConfig): Promise<void> => {
     if (dbType === 'supabase' && supabase) {
        const { error } = await supabase.from('integrations').upsert([config]);
        if (error && error.code !== '42P01' && error.code !== 'PGRST200') throw new Error(error.message);
    } else {
        const integrations = await getIntegrations();
        const index = integrations.findIndex(i => i.id === config.id);
        if (index >= 0) integrations[index] = config;
        else integrations.push(config);
        safeLocalStorageSet('integrations', JSON.stringify(integrations));
    }
}

export const deleteIntegration = async (id: string): Promise<void> => {
    if (dbType === 'supabase' && supabase) {
         const { error } = await supabase.from('integrations').delete().eq('id', id);
        if (error && error.code !== '42P01' && error.code !== 'PGRST200') throw new Error(error.message);
    } else {
        const integrations = await getIntegrations();
        const updated = integrations.filter(i => i.id !== id);
        safeLocalStorageSet('integrations', JSON.stringify(updated));
    }
}

// INTERCORRENCIAS (CRITICAL ISSUES)
export const getIntercorrenciasHistorico = async (patientId?: string): Promise<Intercorrencia[]> => {
    if (dbType === 'supabase' && supabase) {
        let query = supabase.from('intercorrencias').select('*').order('data_criacao', { ascending: false });
        if (patientId) {
            query = query.eq('paciente_id', patientId);
        }
        const { data, error } = await query;
        if (error) return handleSupabaseError(error, 'getIntercorrenciasHistorico') as Intercorrencia[];
        return data as Intercorrencia[];
    } else {
        const stored = localStorage.getItem('intercorrencias');
        const all: Intercorrencia[] = stored ? JSON.parse(stored) : [];
        if (patientId) {
            return all.filter(i => i.paciente_id === patientId).sort((a,b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime());
        }
        return all.sort((a,b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime());
    }
}

export const createIntercorrencia = async (data: Intercorrencia): Promise<void> => {
    if (dbType === 'supabase' && supabase) {
        const { error } = await supabase.from('intercorrencias').insert([data]);
        if (error && error.code !== '42P01' && error.code !== 'PGRST200') throw new Error(error.message);
    } else {
        const stored = localStorage.getItem('intercorrencias');
        const all: Intercorrencia[] = stored ? JSON.parse(stored) : [];
        const updated = [data, ...all];
        safeLocalStorageSet('intercorrencias', JSON.stringify(updated));
    }
}

export const updateIntercorrencia = async (id: string, updates: Partial<Intercorrencia>): Promise<void> => {
    if (dbType === 'supabase' && supabase) {
        const { error } = await supabase.from('intercorrencias').update(updates).eq('id', id);
        if (error && error.code !== '42P01' && error.code !== 'PGRST200') throw new Error(error.message);
    } else {
        const stored = localStorage.getItem('intercorrencias');
        let all: Intercorrencia[] = stored ? JSON.parse(stored) : [];
        all = all.map(i => i.id === id ? { ...i, ...updates, data_atualizacao: new Date().toISOString() } : i);
        safeLocalStorageSet('intercorrencias', JSON.stringify(all));
    }
}

// SHIFTS / AGENDA
export const getShifts = async (): Promise<Shift[]> => {
    if (dbType === 'supabase' && supabase) {
        const { data, error } = await supabase.from('shifts').select('*');
        if (error) return handleSupabaseError(error, 'getShifts') as Shift[];
        return data as Shift[];
    } else {
        const stored = localStorage.getItem('my_shifts');
        return stored ? JSON.parse(stored) : [];
    }
};

export const saveShift = async (shift: Shift): Promise<void> => {
    if (dbType === 'supabase' && supabase) {
        const { error } = await supabase.from('shifts').upsert([shift]);
        if (error && error.code !== '42P01' && error.code !== 'PGRST200') throw new Error(error.message);
    } else {
        const shifts = await getShifts();
        const index = shifts.findIndex(s => s.id === shift.id);
        if (index >= 0) shifts[index] = shift;
        else shifts.push(shift);
        safeLocalStorageSet('my_shifts', JSON.stringify(shifts));
    }
};

export const deleteShift = async (id: string): Promise<void> => {
    if (dbType === 'supabase' && supabase) {
        const { error } = await supabase.from('shifts').delete().eq('id', id);
        if (error && error.code !== '42P01' && error.code !== 'PGRST200') throw new Error(error.message);
    } else {
        const shifts = await getShifts();
        const updated = shifts.filter(s => s.id !== id);
        safeLocalStorageSet('my_shifts', JSON.stringify(updated));
    }
};

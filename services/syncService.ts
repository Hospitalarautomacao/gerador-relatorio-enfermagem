
import { ReportData, StockItem, AccessUser } from '../types';

// Mock responses for SAD integration
const SAD_API_DELAY = 1500;

export const syncDataWithSAD = async (
    patientId: string, 
    data: Partial<ReportData>, 
    stock: StockItem[]
): Promise<{ success: boolean; message: string; timestamp: string }> => {
    console.log(`[SYNC-SAD] Iniciando sincronização para paciente ${patientId}...`);
    
    // Simulating API Latency
    await new Promise(resolve => setTimeout(resolve, SAD_API_DELAY));

    // Simulate basic validation
    if (!data.patientName) {
        return { success: false, message: 'Dados incompletos do paciente', timestamp: new Date().toISOString() };
    }

    // Logic: Send stock requisitions if low
    const lowStockItems = stock.filter(item => item.quantity <= item.lowStockThreshold);
    if (lowStockItems.length > 0) {
        console.log(`[SYNC-SAD] Enviando requisição de compra para ${lowStockItems.length} itens.`);
    }

    console.log(`[SYNC-SAD] Dados clínicos enviados: Sinais Vitais, Evolução.`);
    
    return {
        success: true,
        message: 'Sincronizado com Sucesso (SAD/Tasy)',
        timestamp: new Date().toISOString()
    };
};

export const syncPatientApp = async (
    patientId: string,
    publicData: Partial<ReportData> // Only shareable data (LGPD)
): Promise<{ success: boolean; timestamp: string }> => {
    console.log(`[SYNC-APP] Atualizando App do Paciente...`);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate push notification trigger
    console.log(`[SYNC-APP] Push Notification enviada para familiares.`);
    
    return {
        success: true,
        timestamp: new Date().toISOString()
    };
};

export const fetchProfessionalAccess = async (token: string): Promise<AccessUser | null> => {
    // Simulate auth check against SAD
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (token === 'valid_token') {
        return {
            id: 'prof-123',
            name: 'Dra. Ana (SAD Integrado)',
            email: 'ana@sad.com.br',
            role: 'Enfermeiro',
            relationship: 'Outro',
            patientName: 'Todos',
            status: 'Ativo',
            active: true,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
            department: 'Enfermagem'
        };
    }
    return null;
};

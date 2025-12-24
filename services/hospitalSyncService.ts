
import { Intercorrencia, ReportData, SyncQueueItem } from '../types';

const HOSPITAL_API_URL = 'https://api.dashboard-hospitalar.com/v1'; // Mock URL
const QUEUE_STORAGE_KEY = 'sync_queue';

// --- Queue Management ---

const getQueue = (): SyncQueueItem[] => {
    try {
        const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveQueue = (queue: SyncQueueItem[]) => {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
};

const addToQueue = (type: SyncQueueItem['type'], payload: any) => {
    const queue = getQueue();
    const newItem: SyncQueueItem = {
        id: Date.now().toString() + Math.random(),
        type,
        payload,
        timestamp: new Date().toISOString(),
        status: 'pending',
        retryCount: 0
    };
    saveQueue([...queue, newItem]);
    triggerSync(); // Try to sync immediately
};

// --- Sync Logic ---

const processQueueItem = async (item: SyncQueueItem): Promise<boolean> => {
    // Simulate API calls
    const endpoints = {
        intercorrencia: '/intercorrencias',
        sinal_vital: '/sinais-vitais-criticos',
        relatorio: '/relatorios'
    };

    console.log(`[SYNC] Sending ${item.type} to Hospital Dashboard...`, item.payload);

    try {
        // Simulate network delay and potential success
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock success (In real app, fetch/axios here)
        // const response = await fetch(`${HOSPITAL_API_URL}${endpoints[item.type]}`, {
        //     method: 'POST',
        //     body: JSON.stringify(item.payload),
        //     headers: { 'Content-Type': 'application/json' }
        // });
        // if (!response.ok) throw new Error('API Error');

        return true;
    } catch (error) {
        console.error(`[SYNC] Failed to sync ${item.type}:`, error);
        return false;
    }
};

export const triggerSync = async (): Promise<void> => {
    if (!navigator.onLine) return; // Do not try if offline

    const queue = getQueue();
    const pending = queue.filter(i => i.status === 'pending');

    if (pending.length === 0) return;

    let updatedQueue = [...queue];

    for (const item of pending) {
        const success = await processQueueItem(item);
        
        if (success) {
            // Remove success items or mark as synced
            updatedQueue = updatedQueue.filter(i => i.id !== item.id);
        } else {
            // Update retry count
            updatedQueue = updatedQueue.map(i => 
                i.id === item.id 
                ? { ...i, retryCount: i.retryCount + 1 } 
                : i
            );
        }
    }

    saveQueue(updatedQueue);
};

// --- Public Methods ---

export const syncIntercorrencia = async (data: Intercorrencia) => {
    addToQueue('intercorrencia', data);
};

export const syncCriticalVitals = async (reportData: Partial<ReportData>) => {
    const criticalPayload = {
        patientId: reportData.patientName, // Assuming name as ID for mock
        timestamp: new Date().toISOString(),
        bp: reportData.bloodPressure,
        hr: reportData.heartRate,
        sat: reportData.saturation,
        temp: reportData.temperature,
        glycemia: reportData.glycemia
    };
    addToQueue('sinal_vital', criticalPayload);
};

export const fetchTherapeuticPlan = async (patientId: string): Promise<any | null> => {
    // Mock fetch
    try {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            updatedAt: new Date().toISOString(),
            instructions: "Manter cabeceira elevada 30°. Dieta hipossódica."
        };
    } catch {
        return null;
    }
};

export const getSyncStatus = (): { pending: number, isOnline: boolean } => {
    const queue = getQueue();
    return {
        pending: queue.filter(i => i.status === 'pending').length,
        isOnline: navigator.onLine
    };
};
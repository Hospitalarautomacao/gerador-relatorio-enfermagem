import { PrescribedMedication } from '../types';

const mockPrescriptions: PrescribedMedication[] = [
  {
    id: 'presc-1',
    name: 'Dipirona',
    dose: '500mg',
    route: 'Via Oral',
    frequency: '6/6h se dor ou febre',
  },
  {
    id: 'presc-2',
    name: 'Captopril',
    dose: '25mg',
    route: 'Via Oral',
    frequency: '12/12h',
  },
  {
    id: 'presc-3',
    name: 'Insulina NPH',
    dose: '10 UI',
    route: 'Subcutânea',
    frequency: 'Antes do café da manhã',
  },
  {
    id: 'presc-4',
    name: 'Ceftriaxona',
    dose: '1g',
    route: 'Intravenosa',
    frequency: '24/24h',
  },
];


export const fetchPrescriptionsForPatient = async (patientName: string): Promise<PrescribedMedication[]> => {
  console.log(`Buscando prescrições para o paciente: ${patientName}... (Simulação)`);
  
  // Simula a latência da rede
  await new Promise(resolve => setTimeout(resolve, 750));

  // Em uma aplicação real, aqui seria feita uma chamada a uma API externa.
  // ex: const response = await fetch(`https://api.pep.com/prescriptions?patientId=${...}`);
  
  // Retorna os dados mockados
  return mockPrescriptions;
};

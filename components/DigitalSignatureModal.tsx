
import React, { useState } from 'react';
import Modal from './Modal';
import InputField from './ui/InputField';
import { DigitalSignature } from '../types';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signature: DigitalSignature) => void;
  professionalName: string;
  coren: string;
}

const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({ 
  isOpen, onClose, onSign, professionalName, coren 
}) => {
  const [pin, setPin] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    if (pin.length < 4) {
      setError("PIN inválido. Mínimo 4 dígitos.");
      return;
    }

    setIsSigning(true);
    setError(null);

    // Simulate API call to Certification Authority (ICP-Brasil/COFEN)
    setTimeout(() => {
      // Mock validation
      if (pin === '1234') { // Mock PIN for demo
        const mockSignature: DigitalSignature = {
          signed: true,
          signerName: professionalName,
          signerCoren: coren,
          timestamp: new Date().toISOString(),
          hash: `SHA256-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`,
          certificateType: 'A3'
        };
        onSign(mockSignature);
        setPin('');
        setIsSigning(false);
      } else {
        setError("PIN incorreto. Tente novamente.");
        setIsSigning(false);
      }
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assinatura Digital COFEN"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
          <button 
            onClick={handleSign} 
            disabled={isSigning || !professionalName}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 disabled:bg-slate-400 flex items-center gap-2"
          >
            {isSigning ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Processando...
              </>
            ) : (
              <>
                <i className="fas fa-file-signature"></i> Assinar Documento
              </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-start gap-3">
          <i className="fas fa-shield-alt text-2xl text-green-600 mt-1"></i>
          <div>
            <h4 className="font-bold text-green-800">Certificado Digital (Lei 14.063/2020)</h4>
            <p className="text-sm text-green-700 mt-1">
              Esta ação anexa uma assinatura eletrônica qualificada ao relatório, garantindo validade jurídica e integridade conforme normas do COFEN (Resolução 754/2024).
            </p>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-slate-50">
          <p className="text-sm font-semibold text-slate-600 mb-2">Dados do Signatário:</p>
          <div className="flex justify-between items-center bg-white p-3 rounded border">
            <div>
              <p className="font-bold text-slate-800">{professionalName || 'Profissional não identificado'}</p>
              <p className="text-xs text-slate-500">{coren || 'COREN não informado'}</p>
            </div>
            <i className="fas fa-user-nurse text-slate-300 text-xl"></i>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">PIN do Certificado (Simulado: 1234)</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full p-3 text-center text-2xl tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            maxLength={6}
            placeholder="• • • •"
            autoFocus
          />
          {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default DigitalSignatureModal;

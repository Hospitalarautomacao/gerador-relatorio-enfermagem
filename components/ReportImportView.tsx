
import React, { useState, useRef } from 'react';
import { transcribeImageWithGemini, getErrorMessage } from '../services/geminiService';
import RichTextEditor from './ui/RichTextEditor';
import Modal from './Modal';

interface ReportImportViewProps {
  onImportText: (text: string) => void;
}

const ReportImportView: React.FC<ReportImportViewProps> = ({ onImportText }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setMimeType(file.type);
        setTranscribedText(''); // Reset previous transcription
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTranscribe = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = selectedImage.split(',')[1];
      const text = await transcribeImageWithGemini(base64Data, mimeType);
      setTranscribedText(text);
      setIsReviewModalOpen(true);
    } catch (error) {
      alert(`Erro na transcrição: ${getErrorMessage(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    onImportText(transcribedText);
    setIsReviewModalOpen(false);
    setSelectedImage(null);
    setTranscribedText('');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow min-h-[600px] flex flex-col">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <i className="fas fa-camera text-cyan-600"></i>
          Digitalizar Relatório Manual
        </h2>
        <p className="text-slate-500 mt-2">
          Tire uma foto de um relatório manuscrito ou impresso e use a IA para transformá-lo em texto editável.
        </p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center space-y-8">
        {!selectedImage ? (
          <div className="w-full max-w-lg p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-center hover:bg-slate-100 transition-colors">
            <i className="fas fa-cloud-upload-alt text-5xl text-slate-400 mb-4"></i>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Carregar Imagem ou Foto</h3>
            <p className="text-sm text-slate-500 mb-6">Suporta JPG, PNG e WEBP (Captura de Câmera)</p>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-md hover:bg-cyan-700 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-folder-open"></i>
                Selecionar Arquivo
              </button>
              {/* Mobile Camera Trigger */}
              <label className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer">
                <i className="fas fa-camera"></i>
                Câmera
                <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    onChange={handleFileSelect} 
                />
              </label>
            </div>
            
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
            />
          </div>
        ) : (
          <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in">
            <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-lg mb-6 group">
                <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                />
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 shadow-md z-10"
                    title="Remover imagem"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div className="flex gap-4 w-full">
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="flex-1 px-4 py-3 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300"
                >
                    Trocar Imagem
                </button>
                <button 
                    onClick={handleTranscribe}
                    disabled={isProcessing}
                    className="flex-[2] px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Processando com IA...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-wand-magic-sparkles"></i>
                            Transcrever Texto
                        </>
                    )}
                </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Revisão da Transcrição (IA)"
        footer={
            <>
                <button onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
                <button onClick={handleConfirmImport} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700">
                    <i className="fas fa-check mr-2"></i>
                    Confirmar e Importar
                </button>
            </>
        }
      >
        <div className="space-y-4">
            <p className="text-sm text-slate-600 bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                A IA transcreveu o texto abaixo. Verifique se há erros e faça as correções necessárias antes de importar.
            </p>
            <RichTextEditor 
                value={transcribedText} 
                onChange={setTranscribedText} 
                placeholder="Texto transcrito..." 
                className="min-h-[300px]"
            />
        </div>
      </Modal>
    </div>
  );
};

export default ReportImportView;

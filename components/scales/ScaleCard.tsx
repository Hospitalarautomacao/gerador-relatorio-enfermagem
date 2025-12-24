
import React, { useState, ReactNode } from 'react';

interface ScaleCardProps {
  title: string;
  icon: string;
  children: ReactNode;
  referenceUrl?: string;
  result?: ReactNode;
  colorTheme?: 'mint' | 'sky' | 'indigo' | 'rose' | 'amber'; // New prop for peaceful colors
  onVoiceInput?: (text: string) => void; // New prop for voice capability
}

const isValidUrl = (urlString?: string): boolean => {
    if (!urlString) return false;
    try {
        new URL(urlString);
        return true;
    } catch (_) {
        return false;
    }
};

const getColorClasses = (theme: string = 'sky') => {
    switch (theme) {
        case 'mint': return { bg: 'bg-teal-50', border: 'border-teal-100', icon: 'text-teal-600', hover: 'hover:bg-teal-100', accent: 'bg-teal-100' };
        case 'indigo': return { bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'text-indigo-600', hover: 'hover:bg-indigo-100', accent: 'bg-indigo-100' };
        case 'rose': return { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'text-rose-600', hover: 'hover:bg-rose-100', accent: 'bg-rose-100' };
        case 'amber': return { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600', hover: 'hover:bg-amber-100', accent: 'bg-amber-100' };
        case 'sky': 
        default: return { bg: 'bg-sky-50', border: 'border-sky-100', icon: 'text-sky-600', hover: 'hover:bg-sky-100', accent: 'bg-sky-100' };
    }
};

const ScaleCard: React.FC<ScaleCardProps> = ({ title, icon, children, referenceUrl, result, colorTheme = 'sky', onVoiceInput }) => {
  const [isOpen, setIsOpen] = useState(false); // Default to collapsed
  const [isListening, setIsListening] = useState(false);
  
  const colors = getColorClasses(colorTheme);

  const handleMicClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!onVoiceInput) return;

      if (!('webkitSpeechRecognition' in window)) {
          const text = prompt("Seu navegador não suporta voz. Digite o quadro clínico para a IA preencher:");
          if (text) onVoiceInput(text);
          return;
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      
      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onVoiceInput(transcript);
          setIsListening(false);
          setIsOpen(true); // Open card to show results
      };

      recognition.onerror = () => {
          setIsListening(false);
          alert("Erro ao capturar áudio. Tente novamente.");
      };

      recognition.onend = () => setIsListening(false);

      recognition.start();
  };

  return (
    <div className={`rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${isOpen ? 'bg-white border-slate-200' : `${colors.bg} ${colors.border}`}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center p-4 cursor-pointer transition-colors ${isOpen ? 'bg-white border-b border-slate-100' : ''} ${colors.hover}`}
        role="button"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors.accent} ${colors.icon} shadow-sm`}>
                <i className={`fas ${icon} text-lg`}></i>
            </div>
            <div>
                <h3 className={`text-base font-bold ${colors.icon} flex items-center gap-2`}>
                    {title}
                    {isValidUrl(referenceUrl) && (
                        <a
                            href={referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-normal text-slate-400 hover:text-slate-600 no-underline"
                            title="Ver referência técnica"
                        >
                            <i className="fas fa-external-link-alt"></i>
                        </a>
                    )}
                </h3>
                {!isOpen && result && (
                    <div className="mt-1 opacity-90 scale-95 origin-left">
                        {result}
                    </div>
                )}
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            {onVoiceInput && (
                <button 
                    onClick={handleMicClick}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-400 hover:text-cyan-600 shadow-sm'}`}
                    title="Preencher com Voz (IA)"
                >
                    <i className={`fas ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
                </button>
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/50 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <i className="fas fa-chevron-down"></i>
            </div>
        </div>
      </div>
      
      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 bg-white">
            {isOpen && result && <div className="mb-6 pb-4 border-b border-slate-100 flex justify-end">{result}</div>}
            {children}
        </div>
      </div>
    </div>
  );
};

export default ScaleCard;

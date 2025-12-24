
import React, { useState } from 'react';
import { generateObservationSuggestionWithGemini } from '../services/geminiService';

interface AISuggestionButtonProps {
  contextType: 'meal' | 'wound' | 'procedure' | 'bedBath' | 'glicemia';
  contextData: any;
  onSuggestion: (suggestion: string) => void;
  disabled?: boolean;
}

const AISuggestionButton: React.FC<AISuggestionButtonProps> = ({ contextType, contextData, onSuggestion, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const suggestion = await generateObservationSuggestionWithGemini(contextType, contextData);
      onSuggestion(suggestion);
    } catch (e: any) {
      setError(e.message || 'Erro ao gerar sugestão.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const title = `Gerar sugestão de observação com base nos dados preenchidos`;

  return (
    <div className="flex flex-col items-end">
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading || disabled}
          className="px-3 py-1 text-xs bg-indigo-100 text-indigo-800 font-semibold rounded-md hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-wait transition-colors"
          title={title}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-1"></i>
              Gerando...
            </>
          ) : (
            <>
              <i className="fas fa-wand-magic-sparkles mr-1"></i>
              Sugestão IA
            </>
          )}
        </button>
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default AISuggestionButton;

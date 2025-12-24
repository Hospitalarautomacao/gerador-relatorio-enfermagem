
import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, readOnly = false, className }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
        // Only update if value is significantly different to prevent cursor jumping
        // This is a basic check; for production, more robust diffing might be needed
        if (value === '' && editorRef.current.innerHTML === '<br>') {
            return;
        }
        editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleCommand = (command: string) => {
    if (readOnly) return;
    document.execCommand(command, false, undefined);
    editorRef.current?.focus();
  };

  const ToolbarButton: React.FC<{ command: string; icon: string; title: string }> = ({ command, icon, title }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); handleCommand(command); }}
      className={`p-2 rounded hover:bg-slate-200 text-slate-600 transition-colors ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={title}
      disabled={readOnly}
    >
      <i className={`fas ${icon}`}></i>
    </button>
  );

  return (
    <div className={`border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500 transition duration-150 bg-white ${readOnly ? 'bg-slate-50' : ''} ${className}`}>
      {!readOnly && (
          <div className="toolbar flex items-center gap-1 p-2 border-b bg-slate-50 rounded-t-lg">
            <ToolbarButton command="bold" icon="fa-bold" title="Negrito" />
            <ToolbarButton command="italic" icon="fa-italic" title="Itálico" />
            <ToolbarButton command="insertUnorderedList" icon="fa-list-ul" title="Lista não ordenada" />
            <ToolbarButton command="insertOrderedList" icon="fa-list-ol" title="Lista ordenada" />
          </div>
      )}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        className={`w-full p-3 min-h-[120px] outline-none overflow-auto prose prose-sm max-w-none ${readOnly ? 'text-slate-600 cursor-default' : 'text-slate-800'}`}
        data-placeholder={placeholder}
        style={{ minHeight: '120px' }} // Garante altura mínima
      />
    </div>
  );
};

export default RichTextEditor;

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Square, ArrowUp } from 'lucide-react';

interface InputAreaProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
}

const InputArea = ({ onSend, isLoading, onStop }: InputAreaProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full px-4 py-4" style={{ backgroundColor: 'var(--color-gpt-dark)' }}>
      <div className="max-w-3xl mx-auto">
        <div 
          className="relative flex items-end rounded-2xl transition-colors"
          style={{ 
            backgroundColor: 'var(--color-gpt-dark-input)',
            border: '1px solid var(--color-gpt-dark-border)'
          }}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message CatBot..."
            className="flex-1 bg-transparent text-white resize-none px-4 py-3 pr-12 focus:outline-none max-h-52 overflow-y-auto"
            style={{ color: 'white' }}
            rows={1}
            disabled={isLoading}
          />

          {/* Send / Stop Button */}
          <div className="absolute right-2 bottom-2">
            {isLoading ? (
              <button
                onClick={onStop}
                className="p-2 rounded-lg hover:bg-white transition-colors"
                style={{ 
                  backgroundColor: 'var(--color-gpt-gray-light)',
                  color: 'var(--color-gpt-dark)'
                }}
                title="Stop generating"
              >
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: input.trim() ? 'white' : 'var(--color-gpt-dark-hover)',
                  color: input.trim() ? 'var(--color-gpt-dark)' : 'var(--color-gpt-gray)',
                  cursor: input.trim() ? 'pointer' : 'not-allowed'
                }}
                title="Send message"
              >
                <ArrowUp size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs mt-2" style={{ color: 'var(--color-gpt-gray)' }}>
          CatBot can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
};

export default InputArea;

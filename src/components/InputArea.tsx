import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Square, ArrowUp } from 'lucide-react';

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
    <div className="w-full px-4 py-4 bg-gpt-dark">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end bg-gpt-dark-input rounded-2xl border border-gpt-dark-border focus-within:border-gpt-gray/50 transition-colors">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message CatBot..."
            className="flex-1 bg-transparent text-white placeholder-gpt-gray resize-none 
                       px-4 py-3 pr-12 focus:outline-none max-h-52 overflow-y-auto"
            rows={1}
            disabled={isLoading}
          />

          {/* Send / Stop Button */}
          <div className="absolute right-2 bottom-2">
            {isLoading ? (
              <button
                onClick={onStop}
                className="p-2 bg-gpt-gray-light text-gpt-dark rounded-lg hover:bg-white transition-colors"
                title="Stop generating"
              >
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className={`p-2 rounded-lg transition-colors ${
                  input.trim()
                    ? 'bg-white text-gpt-dark hover:bg-gpt-gray-lighter'
                    : 'bg-gpt-dark-hover text-gpt-gray cursor-not-allowed'
                }`}
                title="Send message"
              >
                <ArrowUp size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gpt-gray mt-2">
          CatBot can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
};

export default InputArea;

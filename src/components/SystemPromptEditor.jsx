import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Save, RotateCcw, Sparkles } from 'lucide-react';

const DEFAULT_PROMPT = "You are a helpful assistant that summarizes documents and images clearly and concisely. Adapt your responses to be personalized and easy to understand.";

const SystemPromptEditor = () => {
  const { systemPrompt, setSystemPrompt } = useStore();
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalPrompt(systemPrompt);
  }, [systemPrompt]);

  const handleSave = () => {
    setSystemPrompt(localPrompt);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    setLocalPrompt(DEFAULT_PROMPT);
    setSystemPrompt(DEFAULT_PROMPT);
  };

  return (
    <div className="prompt-editor">
      <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={18} style={{ color: 'var(--primary-color)' }} />
          <h3 className="font-semibold text-sm">AI Personality</h3>
        </div>
        <button 
          onClick={handleReset}
          className="btn-ghost"
          style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem' }}
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>
      
      <div className="space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <textarea
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          className="prompt-input"
          style={{ height: '8rem', resize: 'none' }}
          placeholder="Define how the AI should behave..."
        />
        
        <button
          onClick={handleSave}
          className="btn"
          style={{ 
            width: '100%', 
            padding: '0.5rem 1rem', 
            backgroundColor: isSaved ? '#22c55e' : 'var(--primary-color)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {isSaved ? (
            <>Saved!</>
          ) : (
            <>
              <Save size={16} /> Save Changes
            </>
          )}
        </button>
      </div>
      
      <p className="text-xs" style={{ color: 'var(--muted-fg)', marginTop: '1rem' }}>
        This prompt will be sent with every message to guide the AI's behavior and tone.
      </p>
    </div>
  );
};

export default SystemPromptEditor;

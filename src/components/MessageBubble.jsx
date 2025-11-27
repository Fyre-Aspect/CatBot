import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, FileText, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className={`message-row ${isUser ? 'user' : 'bot'} group`}>
      <div className="message-container">
        <div className={`avatar ${isUser ? 'user' : 'bot'}`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        <div className="flex flex-col w-full" style={{ alignItems: isUser ? 'flex-end' : 'flex-start' }}>
          <div className="message-content">
            
            {/* Copy Button */}
            {!isUser && (
              <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer', background: 'transparent', border: 'none' }}
                title="Copy to clipboard"
              >
                {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} style={{ color: 'var(--muted-fg)' }} />}
              </button>
            )}

            {/* Attachments Display */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {message.attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    {att.type.startsWith('image/') ? (
                      <ImageIcon size={14} />
                    ) : (
                      <FileText size={14} />
                    )}
                    <span className="truncate max-w-[150px]" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="prose">
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <div className="rounded-md overflow-hidden my-2">
                        <SyntaxHighlighter
                          {...props}
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ margin: 0 }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
          <span className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '0.75rem', color: 'var(--muted-fg)', marginTop: '0.25rem' }}>
            {message.timestamp ? format(new Date(message.timestamp), 'HH:mm') : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

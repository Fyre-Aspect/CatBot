import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Bot } from 'lucide-react';
import type { Message as MessageType } from '../types';
import useStore from '../store/useStore';

interface MessageProps {
  message: MessageType;
}

const Message = ({ message }: MessageProps) => {
  const { user } = useStore();
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className="max-w-3xl mx-auto px-4 flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Role label */}
          <div className="font-semibold text-sm mb-1 text-white">
            {isUser ? 'You' : 'CatBot'}
          </div>

          {/* Message content */}
          <div className="prose prose-invert max-w-none" style={{ color: 'var(--color-gpt-gray-lighter)' }}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;

                  if (!inline && match) {
                    return (
                      <div className="relative group my-4">
                        {/* Language label & copy button */}
                        <div 
                          className="flex items-center justify-between px-4 py-2 rounded-t-md text-xs"
                          style={{ 
                            backgroundColor: 'var(--color-gpt-dark-hover)',
                            color: 'var(--color-gpt-gray-light)'
                          }}
                        >
                          <span>{match[1]}</span>
                          <button
                            onClick={() => handleCopy(codeString, codeId)}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            {copied === codeId ? (
                              <>
                                <Check size={14} />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>Copy code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          {...props}
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            borderBottomLeftRadius: '0.375rem',
                            borderBottomRightRadius: '0.375rem',
                          }}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }
                  return (
                    <code
                      {...props}
                      className="px-1.5 py-0.5 rounded text-sm"
                      style={{ backgroundColor: 'var(--color-gpt-dark-hover)' }}
                    >
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p className="mb-4 last:mb-0 leading-7">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="mb-4 list-disc pl-6 space-y-2">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="mb-4 list-decimal pl-6 space-y-2">{children}</ol>;
                },
                li({ children }) {
                  return <li className="leading-7">{children}</li>;
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;

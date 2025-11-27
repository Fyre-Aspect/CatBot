import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import MessageBubble from './MessageBubble';
import { Send, Menu, StopCircle, ArrowDown } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';
import { saveMessage, createNewChat, updateChatTitle } from '../services/firebaseService';

const ChatInterface = ({ onMenuClick }) => {
  const { 
    user, 
    currentChatId, 
    setCurrentChatId, 
    messages, 
    setMessages, 
    addMessage, 
    systemPrompt,
    addChat,
    updateChatInList
  } = useStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    
    // Clear input immediately
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Create new chat if none exists
    let chatId = currentChatId;
    if (!chatId) {
      try {
        // If user is logged in, create in Firebase
        if (user) {
          chatId = await createNewChat(user.uid, userMessageText.slice(0, 30) + "...");
        } else {
          // Local only
          chatId = crypto.randomUUID();
        }
        
        setCurrentChatId(chatId);
        addChat({ 
          id: chatId, 
          title: userMessageText.slice(0, 30) + "...", 
          updatedAt: new Date(),
          userId: user ? user.uid : 'guest'
        });
      } catch (error) {
        console.error("Failed to create chat", error);
        return;
      }
    }

    // Add user message to UI
    const userMsg = {
      role: 'user',
      content: userMessageText,
      timestamp: new Date().toISOString()
    };
    addMessage(userMsg);
    
    // Save to Firebase if user exists
    if (user) {
      saveMessage(chatId, userMsg);
    }

    setIsLoading(true);

    try {
      // Prepare history for context (exclude current message as it's sent separately)
      // We only send text history for now to save tokens/complexity, 
      // but ideally we'd send previous images too if supported by the model in multi-turn
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const stream = await sendMessageToGemini(userMessageText, history, systemPrompt);
      
      let fullResponse = "";
      const botMsgId = crypto.randomUUID();
      
      // Add initial bot message placeholder
      addMessage({
        id: botMsgId,
        role: 'model',
        content: "",
        timestamp: new Date().toISOString()
      });

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        
        // Update the last message (bot's response)
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'model') {
            lastMsg.content = fullResponse;
          }
          return newMessages;
        });
      }

      // Save complete bot message to Firebase
      if (user) {
        saveMessage(chatId, {
          role: 'model',
          content: fullResponse,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      addMessage({
        role: 'model',
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString(),
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-interface">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="md-hidden btn-ghost btn-icon">
            <Menu size={20} />
          </button>
          <div className="font-semibold text-sm">
            {currentChatId ? 'Current Chat' : 'New Conversation'}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8" style={{ opacity: 0.5 }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Send size={32} style={{ color: 'var(--primary-color)' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
            <p style={{ color: 'var(--muted-fg)', maxWidth: '28rem' }}>
              I can help you answer questions, summarize text, or just have a chat.
            </p>
          </div>
        ) : (
          <div style={{ maxWidth: '48rem', margin: '0 auto', width: '100%' }}>
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="loading-dots" style={{ backgroundColor: 'var(--secondary-bg)', padding: '0.75rem 1rem', borderRadius: '1rem' }}>
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="input-area">
        <div style={{ maxWidth: '48rem', margin: '0 auto', width: '100%' }}>
          
          {/* Input Box */}
          <div className="input-container">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="chat-input"
              rows={1}
              disabled={isLoading}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="btn btn-primary btn-icon"
              style={{ 
                opacity: !input.trim() || isLoading ? 0.5 : 1,
                cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? <StopCircle size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          
          <div className="text-center mt-2">
            <p className="text-[10px]" style={{ color: 'var(--muted-fg)', fontSize: '0.625rem' }}>
              AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

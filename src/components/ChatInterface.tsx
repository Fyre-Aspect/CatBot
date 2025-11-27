import { useRef, useEffect, useState } from 'react';
import useStore from '../store/useStore';
import Message from './Message';
import InputArea from './InputArea';
import { sendMessageToGemini } from '../services/geminiService';
import {
  saveMessage,
  createNewChat,
  getChatMessages,
} from '../services/firebaseService';
import { Sparkles, Menu } from 'lucide-react';
import type { Message as MessageType } from '../types';

const ChatInterface = () => {
  const {
    user,
    currentChatId,
    setCurrentChatId,
    messages,
    setMessages,
    addMessage,
    systemPrompt,
    addChat,
    isSidebarOpen,
    setSidebarOpen,
  } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load messages when chat changes
  useEffect(() => {
    const loadMessages = async () => {
      if (currentChatId) {
        try {
          const chatMessages = await getChatMessages(currentChatId);
          setMessages(chatMessages);
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      } else {
        setMessages([]);
      }
    };
    loadMessages();
  }, [currentChatId, setMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    // Create new chat if needed
    let chatId = currentChatId;
    if (!chatId && user) {
      try {
        const title = messageText.slice(0, 30) + (messageText.length > 30 ? '...' : '');
        chatId = await createNewChat(user.uid, title);
        setCurrentChatId(chatId);
        addChat({
          id: chatId,
          title,
          userId: user.uid,
        });
      } catch (error) {
        console.error('Failed to create chat:', error);
        return;
      }
    }

    // Add user message
    const userMessage: MessageType = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);

    // Save to Firebase
    if (chatId && user) {
      saveMessage(chatId, userMessage);
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      // Get AI response
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      }));

      const stream = await sendMessageToGemini(messageText, history, systemPrompt);

      let fullResponse = '';
      const botMessageId = crypto.randomUUID();

      // Add initial bot message placeholder
      addMessage({
        id: botMessageId,
        role: 'model',
        content: '',
        timestamp: new Date().toISOString(),
      });

      for await (const chunk of stream) {
        // Handle the new @google/genai SDK response format
        const chunkText = chunk.text || '';
        fullResponse += chunkText;

        // Update the last message
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'model') {
            lastMsg.content = fullResponse;
          }
          return newMessages;
        });
      }

      // Save complete bot message
      if (chatId && user) {
        saveMessage(chatId, {
          role: 'model',
          content: fullResponse,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        role: 'model',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: 'var(--color-gpt-dark)' }}
    >
      {/* Mobile Header */}
      <div 
        className="md:hidden flex items-center justify-between p-3"
        style={{ borderBottom: '1px solid var(--color-gpt-dark-border)' }}
      >
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="btn-icon"
          style={{ color: 'var(--color-gpt-gray-light)' }}
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-medium text-white">CatBot</span>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center p-8">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--color-gpt-dark-hover)' }}
            >
              <Sparkles size={32} style={{ color: 'var(--color-gpt-gray-light)' }} />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-2">
              How can I help you today?
            </h1>
            <p className="text-center max-w-md" style={{ color: 'var(--color-gpt-gray)' }}>
              I'm CatBot, your AI assistant. Ask me anything!
            </p>
          </div>
        ) : (
          /* Messages */
          <div className="py-4">
            {messages.map((msg, idx) => (
              <Message key={msg.id || idx} message={msg} />
            ))}
            {isLoading && messages[messages.length - 1]?.role !== 'model' && (
              <div className="message-row assistant">
                <div className="max-w-3xl mx-auto px-4 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center shrink-0">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div className="typing-indicator flex items-center py-4">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <InputArea onSend={handleSend} isLoading={isLoading} onStop={handleStop} />
    </div>
  );
};

export default ChatInterface;

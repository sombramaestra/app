import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          type: 'bot',
          text: '¡Hola! Soy el asistente virtual de PasionCofrade. ¿En qué puedo ayudarte hoy? Puedo informarte sobre tamaños de fotografías, contratos y servicios.',
        },
      ]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/chatbot`, {
        message: userMessage,
        session_id: sessionId,
      });
      setSessionId(data.session_id);
      setMessages((prev) => [...prev, { type: 'bot', text: data.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: 'Lo siento, hubo un error. Por favor, inténtalo de nuevo.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] bg-[#522A4E] hover:bg-[#6D3B68] text-white p-4 rounded-full shadow-lg transition-colors duration-200"
          data-testid="chatbot-open-button"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-[9999] w-full md:w-[400px] h-[600px] glassmorphic bg-[#1A171D]/95 border border-white/10 flex flex-col"
          data-testid="chatbot-window"
          style={{ maxWidth: 'calc(100vw - 48px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#522A4E] rounded-full flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-medium">Asistente Virtual</h3>
                <p className="text-xs text-[#AFA8B3]">PasionCofrade</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#AFA8B3] hover:text-[#F8F7F9] transition-colors duration-200"
              data-testid="chatbot-close-button"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${message.type}-${index}`}
              >
                <div
                  className={`max-w-[80%] p-3 ${
                    message.type === 'user'
                      ? 'bg-[#522A4E] text-white'
                      : 'bg-[#252129] text-[#F8F7F9] border border-white/5'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#252129] border border-white/5 p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#9C6AB0] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#9C6AB0] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#9C6AB0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-[#252129] border border-[#2C2631] text-[#F8F7F9] px-4 py-2 focus:outline-none focus:border-[#9C6AB0]"
                disabled={loading}
                data-testid="chatbot-input"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-[#522A4E] hover:bg-[#6D3B68] disabled:bg-[#252129] disabled:text-[#AFA8B3] text-white px-4 py-2 transition-colors duration-200"
                data-testid="chatbot-send-button"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;

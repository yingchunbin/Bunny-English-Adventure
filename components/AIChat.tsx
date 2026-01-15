import React, { useState, useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Avatar } from './Avatar';

interface AIChatProps {
  grade: number;
}

export const AIChat: React.FC<AIChatProps> = ({ grade }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! Thầy Rùa chào con. Con muốn hỏi gì không? 🐢' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const reply = await getChatResponse([...messages, userMsg], input, grade);
    
    setMessages(prev => [...prev, { role: 'model', text: reply }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 shadow-sm border-b border-gray-200 flex items-center gap-3">
        <Avatar emoji="🐢" bgGradient="bg-gradient-to-br from-green-300 to-emerald-300" size="sm" />
        <div>
           <h2 className="font-bold text-gray-800">Thầy Rùa Thông Thái</h2>
           <p className="text-xs text-green-600 flex items-center gap-1">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
           </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                isUser 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm text-gray-400 text-sm">
                Thầy đang suy nghĩ...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-gray-200 focus-within:border-blue-400 focus-within:bg-white transition-colors">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..." 
            className="flex-1 bg-transparent outline-none text-gray-700"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-full ${input.trim() ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' : 'text-gray-400'}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

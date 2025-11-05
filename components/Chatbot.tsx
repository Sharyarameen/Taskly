import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../App';
import { ChatBubbleOvalLeftEllipsisIcon, XIcon } from './icons/OutlineIcons';
import { PaperAirplaneIcon } from './icons/SolidIcons';
import { LogoIcon } from './icons/LogoIcon';

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle, messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };
  
  const parseMarkdown = (text: string) => {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/`([^`]+)`/g, '<code class="bg-base-200 dark:bg-dark-base-300 px-1 rounded text-sm">$1</code>');
    text = text.replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
    text = text.replace(/(\n<li>)/g, '<li>');
    text = text.replace(/(<\/li>\n)/g, '</li>');
    text = text.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    return { __html: text };
  };

  return (
    <>
      <div className={`fixed bottom-0 right-0 m-6 transition-all duration-300 z-50 ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <button
          onClick={onToggle}
          className="bg-brand-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          aria-label="Open Chatbot"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
        </button>
      </div>

      <div className={`fixed bottom-0 right-0 md:m-6 bg-base-100 dark:bg-dark-base-200 shadow-2xl rounded-lg w-full h-full md:w-96 md:h-[600px] flex flex-col transition-all duration-300 z-50 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-base-200 dark:bg-dark-base-300/50 border-b border-base-300 dark:border-dark-base-300 rounded-t-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 text-brand-primary"><LogoIcon/></div>
            <h3 className="text-lg font-bold ml-2">Zenith Assistant</h3>
          </div>
          <button onClick={onToggle} className="p-1 rounded-full hover:bg-base-300 dark:hover:bg-dark-base-300">
            <XIcon className="w-6 h-6 text-base-content-secondary" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-base-200 dark:bg-dark-base-300 rounded-bl-none'}`}>
                  <p className="text-sm" dangerouslySetInnerHTML={parseMarkdown(msg.parts[0].text)} />
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl bg-base-200 dark:bg-dark-base-300 rounded-bl-none flex items-center space-x-1">
                      <span className="w-2 h-2 bg-base-content-secondary rounded-full animate-pulse delay-75"></span>
                      <span className="w-2 h-2 bg-base-content-secondary rounded-full animate-pulse delay-150"></span>
                      <span className="w-2 h-2 bg-base-content-secondary rounded-full animate-pulse delay-300"></span>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-base-300 dark:border-dark-base-300">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for help..."
              className="flex-1 px-4 py-2 border border-base-300 dark:border-dark-base-300 rounded-full bg-base-100 dark:bg-dark-base-300 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              disabled={isTyping}
            />
            <button
              type="submit"
              className="bg-brand-primary text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center disabled:bg-brand-secondary"
              disabled={isTyping || !input.trim()}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;

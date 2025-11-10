
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, TeamChatMessage, User } from '../types';
import { PaperAirplaneIcon } from './icons/SolidIcons';
import { VideoCameraIcon, PhoneIcon, InformationCircleIcon, UserPlusIcon } from './icons/OutlineIcons';

interface ChatProps {
  currentUser: User;
  users: User[];
  conversations: Conversation[];
  messages: TeamChatMessage[];
  onSendMessage: (conversationId: string, content: string) => void;
}

const Chat: React.FC<ChatProps> = ({ currentUser, users, conversations, messages, onSendMessage }) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversations[0]?.id || null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversationId]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const conversationMessages = messages.filter(m => m.conversationId === selectedConversationId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const getConversationDetails = (conv: Conversation) => {
    if (conv.isGroup) {
      return {
        name: conv.name,
        avatar: `https://picsum.photos/seed/${conv.id}/100`,
      };
    }
    const otherUserId = conv.userIds.find(id => id !== currentUser.id);
    const otherUser = users.find(u => u.id === otherUserId);
    return {
      name: otherUser?.name || 'Unknown User',
      avatar: otherUser?.avatar || 'https://picsum.photos/seed/default/100',
    };
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversationId) {
      onSendMessage(selectedConversationId, newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar with conversations */}
      <div className="w-full md:w-1/3 border-r dark:border-dark-base-300 flex flex-col">
        <div className="p-4 border-b dark:border-dark-base-300">
          <h1 className="text-xl font-bold">Chats</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => {
            const details = getConversationDetails(conv);
            const lastMessage = messages.filter(m => m.conversationId === conv.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            const lastMessageUser = lastMessage ? users.find(u => u.id === lastMessage.userId) : null;

            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`flex items-center p-3 cursor-pointer hover:bg-base-200 dark:hover:bg-dark-base-300 ${selectedConversationId === conv.id ? 'bg-base-200 dark:bg-dark-base-300' : ''}`}
              >
                <img src={details.avatar} alt={details.name} className="w-12 h-12 rounded-full" />
                <div className="ml-3 flex-1 overflow-hidden">
                  <p className="font-semibold">{details.name}</p>
                   <p className="text-sm text-base-content-secondary dark:text-dark-base-content-secondary truncate">
                      {lastMessage ? `${lastMessageUser?.id === currentUser.id ? 'You' : lastMessageUser?.name.split(' ')[0]}: ${lastMessage.content}` : 'No messages yet'}
                   </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main chat window */}
      <div className="hidden md:flex w-2/3 flex-col bg-base-200 dark:bg-dark-base-100">
        {selectedConversation ? (
          <>
            <div className="flex items-center justify-between p-4 border-b dark:border-dark-base-300 bg-base-100 dark:bg-dark-base-200">
              <div className="flex items-center">
                <img src={getConversationDetails(selectedConversation).avatar} alt={getConversationDetails(selectedConversation).name} className="w-10 h-10 rounded-full" />
                <h2 className="text-lg font-bold ml-3">{getConversationDetails(selectedConversation).name}</h2>
              </div>
              <div className="flex items-center space-x-4 text-base-content-secondary dark:text-dark-base-content-secondary">
                  <button className="hover:text-brand-primary"><PhoneIcon className="w-6 h-6"/></button>
                  <button className="hover:text-brand-primary"><VideoCameraIcon className="w-6 h-6"/></button>
                  <button className="hover:text-brand-primary"><UserPlusIcon className="w-6 h-6"/></button>
                  <button className="hover:text-brand-primary"><InformationCircleIcon className="w-6 h-6"/></button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {conversationMessages.map(msg => {
                const user = users.find(u => u.id === msg.userId);
                const isCurrentUser = msg.userId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                    {!isCurrentUser && <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full" />}
                    <div className={`max-w-md p-3 rounded-lg ${isCurrentUser ? 'bg-brand-primary text-white' : 'bg-base-100 dark:bg-dark-base-200'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 text-right ${isCurrentUser ? 'text-indigo-200' : 'text-base-content-secondary'}`}>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-base-100 dark:bg-dark-base-200">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-base-300 dark:border-dark-base-300 rounded-full bg-base-100 dark:bg-dark-base-300 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <button type="submit" className="bg-brand-primary text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center disabled:opacity-50" disabled={!newMessage.trim()}>
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-base-content-secondary">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

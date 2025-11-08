import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Conversation, TeamChatMessage, ConversationType } from '../types';
import { VideoCameraIcon, UserPlusIcon, XIcon } from './icons/OutlineIcons';
import { PaperAirplaneIcon } from './icons/SolidIcons';

interface ChatViewProps {
  currentUser: User;
  users: User[];
  conversations: Conversation[];
  messages: TeamChatMessage[];
  onSendMessage: (conversationId: string, content: string) => void;
  onCreateConversation: (participantIds: string[], name?: string) => string | undefined;
}

const ChatView: React.FC<ChatViewProps> = ({ currentUser, users, conversations, messages, onSendMessage, onCreateConversation }) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversations[0]?.id || null);
  const [messageInput, setMessageInput] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [conversations]);

  const activeConversationMessages = useMemo(() => {
    return messages
      .filter(m => m.conversationId === activeConversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, activeConversationId]);

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationMessages]);

  // Auto-select the first conversation if none is selected
  useEffect(() => {
    if (!activeConversationId && sortedConversations.length > 0) {
      setActiveConversationId(sortedConversations[0].id);
    }
  }, [activeConversationId, sortedConversations]);


  const getConversationDetails = (convo: Conversation) => {
    if (convo.type === ConversationType.GROUP) {
      return { name: convo.name, avatar: convo.groupAvatar, participantUsers: convo.participantIds.map(id => userMap.get(id)).filter(Boolean) as User[] };
    }
    // DM
    const otherUserId = convo.participantIds.find(id => id !== currentUser.id);
    const otherUser = userMap.get(otherUserId!);
    return { name: otherUser?.name, avatar: otherUser?.avatar, participantUsers: [currentUser, otherUser].filter(Boolean) as User[] };
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (messageInput.trim() && activeConversationId) {
          onSendMessage(activeConversationId, messageInput);
          setMessageInput('');
      }
  };

  const handleCreateNewConversation = (participantIds: string[], groupName?: string) => {
      const newConvoId = onCreateConversation(participantIds, groupName);
      if (newConvoId) {
          setActiveConversationId(newConvoId);
      }
      setIsNewChatModalOpen(false);
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeConversationDetails = activeConversation ? getConversationDetails(activeConversation) : null;
  
  return (
    <div className="flex h-full bg-base-100 dark:bg-dark-base-200">
      {isNewChatModalOpen && 
        <NewChatModal 
            currentUser={currentUser}
            users={users}
            onClose={() => setIsNewChatModalOpen(false)}
            onCreate={handleCreateNewConversation}
        />
      }
      {isCallModalOpen && activeConversationDetails &&
        <VideoCallModal
            onClose={() => setIsCallModalOpen(false)}
            details={activeConversationDetails}
        />
      }

      {/* Conversation List */}
      <div className="w-full md:w-1/3 lg:w-1/4 h-full flex flex-col border-r dark:border-dark-base-300">
        <div className="p-4 border-b dark:border-dark-base-300 flex justify-between items-center">
          <h1 className="text-xl font-bold">Chats</h1>
          <button onClick={() => setIsNewChatModalOpen(true)} className="p-2 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300" title="New Chat">
            <UserPlusIcon className="w-6 h-6 text-base-content-secondary" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sortedConversations.map(convo => {
            const details = getConversationDetails(convo);
            const lastMessage = messages.filter(m => m.conversationId === convo.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            const sender = lastMessage ? userMap.get(lastMessage.senderId) : null;

            return (
              <div
                key={convo.id}
                onClick={() => setActiveConversationId(convo.id)}
                className={`p-3 flex items-center cursor-pointer border-l-4 ${activeConversationId === convo.id ? 'border-brand-primary bg-base-200 dark:bg-dark-base-300' : 'border-transparent hover:bg-base-200/50 dark:hover:bg-dark-base-300/50'}`}
              >
                <img src={details?.avatar} alt={details?.name} className="w-12 h-12 rounded-full mr-3" />
                <div className="flex-1 truncate">
                  <p className="font-semibold">{details?.name}</p>
                  <p className="text-sm text-base-content-secondary dark:text-dark-base-content-secondary truncate">
                      {lastMessage && (
                          <>
                           {sender?.id === currentUser.id ? "You: " : sender?.id !== 'user-bot' ? `${sender?.name?.split(' ')[0]}: ` : ''}
                           {lastMessage.content}
                          </>
                      )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className="hidden md:flex flex-1 flex-col h-full">
        {activeConversation && activeConversationDetails ? (
            <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-dark-base-300">
                    <div className="flex items-center">
                        <img src={activeConversationDetails.avatar} alt={activeConversationDetails.name} className="w-10 h-10 rounded-full mr-3" />
                        <h2 className="text-lg font-bold">{activeConversationDetails.name}</h2>
                    </div>
                    <button onClick={() => setIsCallModalOpen(true)} className="p-2 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300 text-base-content-secondary">
                        <VideoCameraIcon className="w-6 h-6" />
                    </button>
                </div>
                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {activeConversationMessages.map(msg => {
                        const sender = userMap.get(msg.senderId);
                        const isCurrentUser = sender?.id === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : ''}`}>
                                {!isCurrentUser && <img src={sender?.avatar} alt={sender?.name} className="w-8 h-8 rounded-full" />}
                                <div>
                                    {!isCurrentUser && activeConversation.type === ConversationType.GROUP && (
                                        <p className="text-xs text-base-content-secondary mb-1 ml-2">{sender?.name}</p>
                                    )}
                                    <div className={`max-w-md px-4 py-2 rounded-2xl ${isCurrentUser ? 'bg-brand-primary text-white rounded-br-none' : sender?.id === 'user-bot' ? 'bg-emerald-100 dark:bg-emerald-900/50 rounded-bl-none' : 'bg-base-200 dark:bg-dark-base-300 rounded-bl-none'}`}>
                                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                {/* Input */}
                <div className="p-4 border-t dark:border-dark-base-300">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-base-300 dark:border-dark-base-300 rounded-full bg-base-100 dark:bg-dark-base-300 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                        <button
                        type="submit"
                        className="bg-brand-primary text-white w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center disabled:bg-brand-secondary"
                        disabled={!messageInput.trim()}
                        >
                        <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-base-content-secondary">
                <p>Select a conversation to start chatting.</p>
            </div>
        )}
      </div>
    </div>
  );
};

// --- New Chat Modal ---
const NewChatModal: React.FC<{
    currentUser: User;
    users: User[];
    onClose: () => void;
    onCreate: (participantIds: string[], groupName?: string) => void;
}> = ({ currentUser, users, onClose, onCreate }) => {
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [groupName, setGroupName] = useState('');

    const availableUsers = useMemo(() => {
        return users.filter(u => u.id !== currentUser.id && u.id !== 'user-bot');
    }, [users, currentUser.id]);

    const handleUserToggle = (userId: string) => {
        setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    const handleCreateClick = () => {
        if (selectedUserIds.length === 0) return;
        if (selectedUserIds.length > 1 && !groupName.trim()) {
            alert("Please enter a name for the group chat.");
            return;
        }
        onCreate(selectedUserIds, groupName);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-base-100 dark:bg-dark-base-200 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-base-300">
                    <h2 className="text-xl font-bold">New Chat</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    {selectedUserIds.length > 1 && (
                        <div>
                            <label className="text-sm font-medium">Group Name</label>
                            <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g., Project Phoenix" className="mt-1 block w-full input-style" />
                        </div>
                    )}
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {availableUsers.map(user => (
                            <label key={user.id} className="flex items-center p-2 rounded-lg hover:bg-base-200 dark:hover:bg-dark-base-300 cursor-pointer">
                                <input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => handleUserToggle(user.id)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mx-3" />
                                <span className="font-semibold">{user.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t dark:border-dark-base-300">
                    <button onClick={handleCreateClick} disabled={selectedUserIds.length === 0} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:bg-gray-400">
                        {selectedUserIds.length > 1 ? 'Create Group Chat' : 'Start Chat'}
                    </button>
                </div>
                <style>{`.input-style { background-color: #fff; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem 0.75rem; width: 100%; color: #111827; } .dark .input-style { background-color: #1f2937; border-color: #4b5563; color: #f9fafb; }`}</style>
            </div>
        </div>
    );
};

// --- Video Call Modal ---
const VideoCallModal: React.FC<{
    onClose: () => void;
    details: { name?: string; avatar?: string; participantUsers: User[] };
}> = ({ onClose, details }) => {
    return (
         <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
             <div className="bg-dark-base-200 rounded-lg shadow-xl w-full max-w-md text-white flex flex-col items-center p-8">
                 <div className="relative mb-4">
                     <img src={details.avatar} alt={details.name} className="w-32 h-32 rounded-full ring-4 ring-white/20"/>
                 </div>
                 <h2 className="text-2xl font-bold">Calling {details.name}...</h2>
                 <div className="flex -space-x-2 overflow-hidden mt-2 mb-8">
                    {details.participantUsers.map(user => 
                        <img key={user.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-dark-base-200" src={user.avatar} title={user.name} alt={user.name}/>
                    )}
                 </div>

                 <button onClick={onClose} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.25 3.111c-2.32-.43-4.621.29-6.388 2.058a.75.75 0 01-1.061 0C8.034 3.4 5.733 2.68 3.413 3.111a.75.75 0 00-.663.744v4.321c0 4.144 2.768 8.01 6.5 9.421a.75.75 0 00.5 0c3.732-1.41 6.5-5.277 6.5-9.421V3.855a.75.75 0 00-.663-.744z" transform="rotate(135 10 10)" />
                    </svg>
                 </button>
             </div>
         </div>
    )
};


export default ChatView;
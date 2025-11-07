
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { User, Role, Task, Department, Attachment, Status, CompanyResource, Notification, RolePermission, Permission, Conversation, TeamChatMessage, ConversationType, Comment } from './types';
import { MOCK_ROLE_PERMISSIONS } from './constants';
import { MOCK_USERS, MOCK_DEPARTMENTS, MOCK_TASKS, MOCK_RESOURCES, MOCK_CONVERSATIONS, MOCK_TEAM_CHAT_MESSAGES, MOCK_NOTIFICATIONS } from './mockData';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard, { Settings } from './components/Dashboard';
import Reports from './components/Reports';
import Organization from './components/DepartmentManagement';
import TaskList from './components/TaskList';
import Resources from './components/Resources';
import Calendar from './components/Calendar';
import ChatView from './components/Chat';
import ForcePasswordChangeModal from './components/ForcePasswordChangeModal';
import { GoogleGenAI, Chat } from '@google/genai';
import { ToastContainer } from './components/Toast';

export type View = 'dashboard' | 'tasks' | 'organization' | 'reports' | 'settings' | 'resources' | 'calendar' | 'chat';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const getConversationDetails = (convo: Conversation, currentUser: User, users: User[]) => {
    const userMap = new Map(users.map(u => [u.id, u]));
    if (convo.type === ConversationType.GROUP) {
      return { name: convo.name || 'Group Chat' };
    }
    const otherUserId = convo.participantIds.find(id => id !== currentUser.id);
    const otherUser = userMap.get(otherUserId!);
    return { name: otherUser?.name || 'DM' };
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [appState, setAppState] = useState<'login' | 'app'>('login');
  
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [resources, setResources] = useState<CompanyResource[]>(MOCK_RESOURCES);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(MOCK_ROLE_PERMISSIONS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [teamChatMessages, setTeamChatMessages] = useState<TeamChatMessage[]>(MOCK_TEAM_CHAT_MESSAGES);
  
  const [appName, setAppName] = useState('Zenith Task Manager');
  const [logoUrl, setLogoUrl] = useState('');

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  
  const [toasts, setToasts] = useState<Notification[]>([]);
  const displayedToastIds = useRef(new Set());

  useEffect(() => {
    document.title = appName;
  }, [appName]);
  
  useEffect(() => {
    if (!currentUser) return;
    const allUserNotifications = [...MOCK_NOTIFICATIONS, ...notifications];
    const newUnread = allUserNotifications.filter(n => n.userId === currentUser.id && !n.isRead && !displayedToastIds.current.has(n.id));

    if (newUnread.length > 0) {
        setToasts(prev => [...prev, ...newUnread]);
        newUnread.forEach(n => displayedToastIds.current.add(n.id));
    }
  }, [notifications, currentUser]);


  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const assistantName = appName.replace(' Task Manager', '');
      const chatInstance = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: `You are ${assistantName} Assistant, an expert in productivity, project management, and business strategy. Help users refine their tasks, brainstorm ideas, and improve their workflow. Be encouraging and provide actionable advice. Format your responses using markdown.`,
        },
      });
      setChat(chatInstance);
    } catch (error) {
        console.error("Could not initialize AI chatbot. AI features will be disabled.", error);
    }
  }, [appName]);
  
  const handleSendMessageToBot = async (message: string) => {
    if (!chat) {
        const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
        const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, the AI Assistant is not available right now. Please check your API key configuration." }] };
        setChatHistory(prev => [...prev, userMessage, errorMessage]);
        return;
    }
    
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    setChatHistory(prev => [...prev, userMessage]);
    setIsBotTyping(true);

    try {
        const result = await chat.sendMessageStream({ message });
        let text = '';
        let lastMessage: ChatMessage | null = null;
        for await (const chunk of result) {
            text += chunk.text;
             setChatHistory(prev => {
                const newHistory = [...prev];
                if (lastMessage && newHistory[newHistory.length-1] === lastMessage) {
                    lastMessage.parts[0].text = text;
                    return newHistory;
                } else {
                    lastMessage = { role: 'model', parts: [{ text }] };
                    return [...newHistory, lastMessage];
                }
            });
        }
    } catch (error) {
        console.error("Chatbot Error:", error);
        const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting right now." }] };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsBotTyping(false);
    }
};
  
  const handleLogin = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string; }> => {
    const user = users.find(u => u.email === email && password === 'password123');
    
    if (user) {
      setCurrentUser(user);
      setAppState('app');
      if (user.forcePasswordChange) {
        setShowPasswordChange(true);
      }
      setNotifications(MOCK_NOTIFICATIONS.filter(n => n.userId === user.id));
      return { success: true, message: '' };
    }
    
    return { success: false, message: 'Invalid credentials. Please use one of the demo accounts.' };
  }, [users]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setAppState('login');
    setIsChatbotOpen(false);
    setChatHistory([]);
  }, []);
  
  const handlePasswordChanged = useCallback((userId: string, newPassword: string) => {
    const updatedUser = { ...currentUser!, forcePasswordChange: false };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    setShowPasswordChange(false);
    setCurrentView('dashboard');
  }, [currentUser]);

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view);
  }, []);
  
  const handleUpdateTask = (updatedTask: Task) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...updatedTask, updatedAt: new Date().toISOString() } : t));
  };
  
  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'reporterId' | 'viewedBy'>) => {
      if(!currentUser) return;
      const newTask: Task = {
          ...newTaskData,
          id: `task-${Date.now()}`,
          reporterId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewedBy: [],
          status: Status.ToDo,
      };
      setTasks(prev => [newTask, ...prev]);

      const newNotifications = newTask.assigneeIds.map((userId, i) => ({
        id: `notif-create-${Date.now()}-${i}`,
        userId,
        message: `You've been assigned a new task: "${newTask.title}"`,
        isRead: false,
        createdAt: new Date().toISOString(),
        link: { type: 'task' as const, id: newTask.id }
      }));
      setNotifications(prev => [...prev, ...newNotifications]);
  };
  
  const handleReactivateTask = (taskId: string, reason: string, newDueDate: string) => {
      setTasks(prev => prev.map(t => t.id === taskId ? {
          ...t,
          status: Status.ToDo,
          completedAt: undefined,
          dueDate: newDueDate,
          viewedBy: [],
          comments: [...(t.comments || []), {id: `comment-${Date.now()}`, userId: currentUser?.id || '', content: `Reactivated: ${reason}`, createdAt: new Date().toISOString()}]
      } : t));
  };

  const handleTaskReadByAssignee = (task: Task) => {
    if (!currentUser || !task.assigneeIds.includes(currentUser.id) || task.viewedBy.includes(currentUser.id)) return;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, viewedBy: [...t.viewedBy, currentUser.id], status: Status.Pending } : t));
  };
  
  const handleUserUpdate = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };
  
  const handleCreateOrUpdateResource = (resource: CompanyResource | Omit<CompanyResource, 'id'>) => {
    if ('id' in resource) {
        setResources(prev => prev.map(r => r.id === resource.id ? resource : r));
    } else {
        setResources(prev => [{ ...resource, id: `res-${Date.now()}` }, ...prev]);
    }
  };

  const handleDeleteResource = (resourceId: string) => {
      setResources(prev => prev.filter(r => r.id !== resourceId));
  };

  const handleMarkNotificationsAsRead = () => {
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
  }

  const handleUpdateRolePermissions = (updatedRolePermissions: RolePermission[]) => {
      setRolePermissions(updatedRolePermissions);
  }

  const handleAppSettingsUpdate = (name: string, url: string) => {
    setAppName(name);
    setLogoUrl(url);
  };
  
  const handleSendTeamMessage = (conversationId: string, content: string) => {
    if (!currentUser) return;
    const newMessage: TeamChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: currentUser.id,
        content,
        createdAt: new Date().toISOString(),
    };
    setTeamChatMessages(prev => [...prev, newMessage]);
    setConversations(prev => prev.map(c => c.id === conversationId ? {...c, lastMessageAt: new Date().toISOString()} : c));

    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
        const convoName = getConversationDetails(conversation, currentUser, users).name;
        const newNotifications = conversation.participantIds
            .filter(id => id !== currentUser.id)
            .map((userId, i) => ({
                id: `notif-msg-${Date.now()}-${i}`,
                userId,
                message: `New message from ${currentUser.name} in "${convoName}"`,
                isRead: false,
                createdAt: new Date().toISOString(),
                link: { type: 'chat' as const, id: conversationId }
            }));
        setNotifications(prev => [...prev, ...newNotifications]);
    }
  };

  const handleCreateConversation = async (participantIds: string[], groupName?: string): Promise<string | undefined> => {
    if (!currentUser) return;
    
    if (participantIds.length === 1) {
      const otherUserId = participantIds[0];
      const existing = conversations.find(c => 
        c.type === ConversationType.DM &&
        c.participantIds.length === 2 &&
        c.participantIds.includes(currentUser.id) &&
        c.participantIds.includes(otherUserId)
      );
      if (existing) return existing.id;
    }
    
    const newConvoId = `convo-${Date.now()}`;
    const newConversation: Conversation = {
        id: newConvoId,
        type: participantIds.length > 1 ? ConversationType.GROUP : ConversationType.DM,
        participantIds: [...participantIds, currentUser.id],
        name: groupName,
        groupAvatar: participantIds.length > 1 ? `https://picsum.photos/seed/group-${Date.now()}/100` : undefined,
        lastMessageAt: new Date().toISOString(),
    };
    setConversations(prev => [newConversation, ...prev]);
    return newConvoId;
  };
  
    const handleCreateOrUpdateUser = async (user: User | Omit<User, 'id' | 'createdAt'>, password?: string) => {
        if ('id' in user) {
            setUsers(prev => prev.map(u => u.id === user.id ? user : u));
        } else {
            if (!password) {
                alert("Password is required for a new user."); return;
            }
            const newUserId = `user-${Date.now()}`;
            const newUser: User = {
                ...user,
                id: newUserId,
                createdAt: new Date().toISOString(),
                avatar: `https://picsum.photos/seed/${newUserId}/100`,
                forcePasswordChange: true,
            };
            setUsers(prev => [newUser, ...prev]);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    const handleCreateOrUpdateDepartment = async (dept: Department | Omit<Department, 'id'>) => {
        if ('id' in dept) {
            setDepartments(prev => prev.map(d => d.id === dept.id ? dept : d));
        } else {
            const newDept: Department = { ...dept, id: `dept-${Date.now()}` };
            setDepartments(prev => [...prev, newDept]);
        }
    };

    const handleDeleteDepartment = async (deptId: string) => {
        if (window.confirm('Are you sure you want to delete this department? This will unassign all users from it.')) {
            setDepartments(prev => prev.filter(d => d.id !== deptId));
            setUsers(prev => prev.map(u => u.departmentId === deptId ? { ...u, departmentId: '' } : u));
        }
    };

  const removeToast = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
        if (notification.link.type === 'chat') navigateTo('chat');
        else if (notification.link.type === 'task') navigateTo('tasks');
    }
    setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, isRead: true} : n));
    removeToast(notification.id);
  };

  const renderContent = () => {
    if (!currentUser) return null;
    let content;
    switch (currentView) {
      case 'dashboard':
        content = <Dashboard currentUser={currentUser} tasks={tasks} users={users} departments={departments} onUpdateTask={handleUpdateTask} onCreateTask={handleCreateTask} onReactivateTask={handleReactivateTask} onTaskRead={handleTaskReadByAssignee} rolePermissions={rolePermissions} />;
        break;
      case 'tasks':
        content = <TaskList currentUser={currentUser} tasks={tasks} users={users} onUpdateTask={handleUpdateTask} onCreateTask={handleCreateTask} onReactivateTask={handleReactivateTask} onTaskRead={handleTaskReadByAssignee} rolePermissions={rolePermissions} />;
        break;
      case 'calendar':
        content = <Calendar currentUser={currentUser} tasks={tasks} users={users} onUpdateTask={handleUpdateTask} onCreateTask={handleCreateTask} onReactivateTask={handleReactivateTask} onTaskRead={handleTaskReadByAssignee} rolePermissions={rolePermissions} />;
        break;
      case 'chat':
        content = <ChatView currentUser={currentUser} users={users} conversations={conversations} messages={teamChatMessages} onSendMessage={handleSendTeamMessage} onCreateConversation={handleCreateConversation} />;
        break;
      case 'organization':
        content = <Organization departments={departments} users={users} currentUser={currentUser} rolePermissions={rolePermissions} onUpdateRolePermissions={handleUpdateRolePermissions} onCreateOrUpdateUser={handleCreateOrUpdateUser} onDeleteUser={handleDeleteUser} onCreateOrUpdateDepartment={handleCreateOrUpdateDepartment} onDeleteDepartment={handleDeleteDepartment} />;
        break;
      case 'resources':
        content = <Resources currentUser={currentUser} resources={resources} onSave={handleCreateOrUpdateResource} onDelete={handleDeleteResource} rolePermissions={rolePermissions} />;
        break;
      case 'reports':
        content = <Reports tasks={tasks} users={users} departments={departments} />;
        break;
      case 'settings':
        content = <Settings currentUser={currentUser} onUserUpdate={handleUserUpdate} appName={appName} logoUrl={logoUrl} onAppSettingsUpdate={handleAppSettingsUpdate} />;
        break;
      default:
        content = <div className="p-8"><h1 className="text-2xl font-bold">Page Not Found</h1></div>;
        break;
    }
    return <div className="animate-fadeInUp" key={currentView}>{content}</div>;
  };

  if (appState === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (showPasswordChange) {
      return <ForcePasswordChangeModal currentUser={currentUser} onPasswordChanged={handlePasswordChanged} />;
  }

  return (
    <>
      <Layout 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          navigateTo={navigateTo} 
          currentView={currentView}
          isChatbotOpen={isChatbotOpen}
          setIsChatbotOpen={setIsChatbotOpen}
          chatHistory={chatHistory}
          onSendMessage={handleSendMessageToBot}
          isBotTyping={isBotTyping}
          notifications={notifications.filter(n => n.userId === currentUser.id)}
          onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
          rolePermissions={rolePermissions}
          appName={appName}
          logoUrl={logoUrl}
      >
        {renderContent()}
      </Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} onNotificationClick={handleNotificationClick} />
    </>
  );
};

export default App;

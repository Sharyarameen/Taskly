
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { User, Role, Task, Department, Attachment, Status, CompanyResource, Notification, RolePermission, Permission, Conversation, TeamChatMessage, ConversationType, Comment } from './types';
import { db } from './database';
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
  
  // This state is used to trigger re-renders when the database changes.
  const [, setDbVersion] = useState(0);

  // Subscribe to database changes
  useEffect(() => {
      const unsubscribe = db.subscribe(() => {
          setDbVersion(v => v + 1);
      });
      return () => unsubscribe();
  }, []);
  
  // Get all data from the database
  const { users, departments, tasks, resources, notifications, rolePermissions, conversations, teamChatMessages } = db.getAllData();
  
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
    const allUserNotifications = notifications;
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
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { ...user, forcePasswordChange: false };
      db.saveUser(updatedUser);
      setCurrentUser(updatedUser);
      setShowPasswordChange(false);
      setCurrentView('dashboard');
    }
  }, [users]);

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view);
  }, []);
  
  const handleUpdateTask = (updatedTask: Task) => {
      db.saveTask(updatedTask, updatedTask.reporterId);
  };
  
  const handleCreateTask = (newTaskData: Omit<Task, 'id' | 'reporterId' | 'viewedBy'>) => {
      if(!currentUser) return;
      db.saveTask(newTaskData, currentUser.id);
      
      const newNotifications = newTaskData.assigneeIds.map((userId, i) => ({
        id: `notif-create-${Date.now()}-${i}`,
        userId,
        message: `You've been assigned a new task: "${newTaskData.title}"`,
        isRead: false,
        createdAt: new Date().toISOString(),
        link: { type: 'task' as const, id: `task-${Date.now()}` } // Not perfect, but a close simulation
      }));
      db.addNotifications(newNotifications);
  };
  
  const handleReactivateTask = (taskId: string, reason: string, newDueDate: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = {
            ...task,
            status: Status.ToDo,
            completedAt: undefined,
            dueDate: newDueDate,
            viewedBy: [],
            comments: [...(task.comments || []), {id: `comment-${Date.now()}`, userId: currentUser?.id || '', content: `Reactivated: ${reason}`, createdAt: new Date().toISOString()}]
        };
        db.saveTask(updatedTask, task.reporterId);
      }
  };

  const handleTaskReadByAssignee = (task: Task) => {
    if (!currentUser || !task.assigneeIds.includes(currentUser.id) || task.viewedBy.includes(currentUser.id)) return;
    const updatedTask = { ...task, viewedBy: [...task.viewedBy, currentUser.id], status: Status.Pending };
    db.saveTask(updatedTask, task.reporterId);
  };
  
  const handleUserUpdate = (updatedUser: User) => {
    db.saveUser(updatedUser);
    if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };
  
  const handleCreateOrUpdateResource = (resource: CompanyResource | Omit<CompanyResource, 'id'>) => {
    db.saveResource(resource);
  };

  const handleDeleteResource = (resourceId: string) => {
      db.deleteResource(resourceId);
  };

  const handleMarkNotificationsAsRead = () => {
      if(currentUser) {
        db.markAllNotificationsAsRead(currentUser.id);
      }
  }

  const handleUpdateRolePermissions = (updatedRolePermissions: RolePermission[]) => {
      db.saveRolePermissions(updatedRolePermissions);
  }

  const handleAppSettingsUpdate = (name: string, url: string) => {
    setAppName(name);
    setLogoUrl(url);
  };
  
  const handleSendTeamMessage = (conversationId: string, content: string) => {
    if (!currentUser) return;
    db.addTeamMessage(conversationId, currentUser.id, content);

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
        db.addNotifications(newNotifications);
    }
  };

  const handleCreateConversation = async (participantIds: string[], groupName?: string): Promise<string | undefined> => {
    if (!currentUser) return;
    return db.createConversation(participantIds, currentUser.id, groupName);
  };
  
    const handleCreateOrUpdateUser = async (user: User | Omit<User, 'id' | 'createdAt'>, password?: string) => {
       db.saveUser(user);
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
            db.deleteUser(userId);
        }
    };

    const handleCreateOrUpdateDepartment = async (dept: Department | Omit<Department, 'id'>) => {
        db.saveDepartment(dept);
    };

    const handleDeleteDepartment = async (deptId: string) => {
        if (window.confirm('Are you sure you want to delete this department? This will unassign all users from it.')) {
            db.deleteDepartment(deptId);
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
    db.markNotificationAsRead(notification.id);
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
  
  const updatedCurrentUser = users.find(u => u.id === currentUser.id) || currentUser;

  if (updatedCurrentUser.forcePasswordChange) {
      return <ForcePasswordChangeModal currentUser={updatedCurrentUser} onPasswordChanged={handlePasswordChanged} />;
  }

  return (
    <>
      <Layout 
          currentUser={updatedCurrentUser} 
          onLogout={handleLogout} 
          navigateTo={navigateTo} 
          currentView={currentView}
          isChatbotOpen={isChatbotOpen}
          setIsChatbotOpen={setIsChatbotOpen}
          chatHistory={chatHistory}
          onSendMessage={handleSendMessageToBot}
          isBotTyping={isBotTyping}
          notifications={notifications.filter(n => n.userId === updatedCurrentUser.id)}
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

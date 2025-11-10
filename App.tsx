
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard, { Settings } from './components/Dashboard';
import TaskList from './components/TaskList';
import Calendar from './components/Calendar';
import Chat from './components/Chat';
import Organization from './components/DepartmentManagement';
import Resources from './components/Resources';
import Reports from './components/Reports';
import LandingPage from './components/LandingPage';
import ForcePasswordChangeModal from './components/ForcePasswordChangeModal';
import { ToastContainer } from './components/Toast';

import { 
    User, 
    Task, 
    Department, 
    Notification,
    CompanyResource,
    RolePermission,
    Conversation,
    TeamChatMessage
} from './types';
import { MOCK_DEPARTMENTS, MOCK_RESOURCES, MOCK_ROLE_PERMISSIONS, MOCK_TASKS, MOCK_USERS, MOCK_CONVERSATIONS, MOCK_TEAM_CHAT_MESSAGES } from './constants';

export type View = 'dashboard' | 'tasks' | 'calendar' | 'chat' | 'organization' | 'resources' | 'reports' | 'settings';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

const App: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);
  
  // App Data State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [resources, setResources] = useState<CompanyResource[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [teamChatMessages, setTeamChatMessages] = useState<TeamChatMessage[]>([]);
  const [appName, setAppName] = useState('Zenith Task Manager');
  const [logoUrl, setLogoUrl] = useState('');

  // UI State
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ role: 'model', parts: [{ text: 'Hello! I am your AI assistant. How can I help you today?' }] }]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  
  const saveData = useCallback(<T,>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, []);

  const loadDataFromStorage = useCallback(() => {
    try {
      setUsers(JSON.parse(localStorage.getItem('smashx_users') || '[]'));
      setTasks(JSON.parse(localStorage.getItem('smashx_tasks') || '[]'));
      setDepartments(JSON.parse(localStorage.getItem('smashx_departments') || '[]'));
      setNotifications(JSON.parse(localStorage.getItem('smashx_notifications') || '[]'));
      setResources(JSON.parse(localStorage.getItem('smashx_resources') || '[]'));
      setRolePermissions(JSON.parse(localStorage.getItem('smashx_role_permissions') || '[]'));
      setConversations(JSON.parse(localStorage.getItem('smashx_conversations') || '[]'));
      setTeamChatMessages(JSON.parse(localStorage.getItem('smashx_team_chat_messages') || '[]'));
      setAppName(JSON.parse(localStorage.getItem('smashx_appName') || '"Zenith Task Manager"'));
      setLogoUrl(JSON.parse(localStorage.getItem('smashx_logoUrl') || '""'));
      
      const loggedInUserId = localStorage.getItem('smashx_currentUser');
      if (loggedInUserId) {
        const allUsers: User[] = JSON.parse(localStorage.getItem('smashx_users') || '[]');
        const user = allUsers.find(u => u.id === loggedInUserId);
        setCurrentUser(user || null);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Might want to clear storage if it's corrupted
    }
  }, []);

  useEffect(() => {
    try {
      const usersExist = localStorage.getItem('smashx_users');
      if (!usersExist || JSON.parse(usersExist).length === 0) {
        saveData('smashx_users', MOCK_USERS);
        saveData('smashx_tasks', MOCK_TASKS);
        saveData('smashx_departments', MOCK_DEPARTMENTS);
        saveData('smashx_notifications', []);
        saveData('smashx_resources', MOCK_RESOURCES);
        saveData('smashx_role_permissions', MOCK_ROLE_PERMISSIONS);
        saveData('smashx_conversations', MOCK_CONVERSATIONS);
        saveData('smashx_team_chat_messages', MOCK_TEAM_CHAT_MESSAGES);
        saveData('smashx_appName', 'Zenith Task Manager');
        saveData('smashx_logoUrl', '');
      }
    } catch (error) {
      console.error("Failed to initialize data", error);
    }
    loadDataFromStorage();
  }, [loadDataFromStorage, saveData]);
  
  // --- Data Persistence ---
  useEffect(() => { saveData('smashx_users', users) }, [users]);
  useEffect(() => { saveData('smashx_tasks', tasks) }, [tasks]);
  useEffect(() => { saveData('smashx_departments', departments) }, [departments]);
  useEffect(() => { saveData('smashx_notifications', notifications) }, [notifications]);
  useEffect(() => { saveData('smashx_resources', resources) }, [resources]);
  useEffect(() => { saveData('smashx_role_permissions', rolePermissions) }, [rolePermissions]);
  useEffect(() => { saveData('smashx_team_chat_messages', teamChatMessages) }, [teamChatMessages]);
  useEffect(() => { saveData('smashx_conversations', conversations) }, [conversations]);
  useEffect(() => { saveData('smashx_appName', appName) }, [appName]);
  useEffect(() => { saveData('smashx_logoUrl', logoUrl) }, [logoUrl]);

  // --- Handlers ---
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    // Note: In a real app, this logic would be on a secure backend.
    const userFromStorage: User[] = JSON.parse(localStorage.getItem('smashx_users') || '[]');
    const user = userFromStorage.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('smashx_currentUser', user.id);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('smashx_currentUser');
    setShowLogin(false); // Go back to landing page
  };
  
  const addNotification = (message: string, link?: Notification['link']) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      message,
      link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [...prev, newNotif]);
    setToasts(prev => [...prev, newNotif]);
  };

  const handleCreateTask = (task: Omit<Task, 'id' | 'reporterId' | 'viewedBy'>) => {
    if (!currentUser) return;
    const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        reporterId: currentUser.id,
        viewedBy: [currentUser.id],
        createdAt: new Date().toISOString(),
        comments: [],
    };
    setTasks(prev => [...prev, newTask]);
    addNotification(`New task created: ${newTask.title}`, { type: 'task', id: newTask.id });
  };
  
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    addNotification(`Task updated: ${updatedTask.title}`, { type: 'task', id: updatedTask.id });
  };

  const handleTaskRead = (task: Task) => {
    if (!currentUser || task.viewedBy.includes(currentUser.id)) return;
    const updatedTask = { ...task, viewedBy: [...task.viewedBy, currentUser.id] };
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };
  
  const handleReactivateTask = (taskId: string, reason: string, newDueDate: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { 
        ...t, 
        status: 'To Do', 
        dueDate: newDueDate,
        completedAt: undefined,
        comments: [...t.comments, { id: `comment-${Date.now()}`, userId: currentUser!.id, content: `Reactivated: ${reason}`, createdAt: new Date().toISOString(), type: 'system' }]
    } : t));
  };

  const handleSendMessage = async (message: string) => {
    setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: message }] }]);
    setIsBotTyping(true);

    try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Given the following chat history: ${JSON.stringify(chatHistory.slice(-5))}, and the user's new message: "${message}", provide a helpful response.`,
      });
      
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
    } catch (error) {
      console.error("Gemini API error:", error);
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I encountered an error. Please try again." }] }]);
    } finally {
      setIsBotTyping(false);
    }
  };
  
   const handlePasswordChanged = (userId: string, newPassword: string) => {
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, password: newPassword, forcePasswordChange: false } : u));
      // Re-set current user to update the state
      setCurrentUser(prev => prev && ({ ...prev, forcePasswordChange: false }));
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser!} tasks={tasks} users={users} departments={departments} onUpdateTask={handleUpdateTask} onCreateTask={handleCreateTask} onReactivateTask={handleReactivateTask} onTaskRead={handleTaskRead} rolePermissions={rolePermissions} />;
      case 'tasks':
        return <TaskList currentUser={currentUser!} tasks={tasks} users={users} onUpdateTask={handleUpdateTask} onCreateTask={handleCreateTask} onReactivateTask={handleReactivateTask} onTaskRead={handleTaskRead} rolePermissions={rolePermissions} />;
      case 'calendar':
        return <Calendar currentUser={currentUser!} tasks={tasks} users={users} onUpdateTask={handleUpdateTask} onCreateTask={handleCreateTask} onReactivateTask={handleReactivateTask} onTaskRead={handleTaskRead} rolePermissions={rolePermissions} />;
      case 'chat':
        return <Chat currentUser={currentUser!} users={users} conversations={conversations} messages={teamChatMessages} onSendMessage={(convId, content) => {
            const newMsg: TeamChatMessage = { id: `msg-${Date.now()}`, conversationId: convId, userId: currentUser!.id, content, createdAt: new Date().toISOString() };
            setTeamChatMessages(prev => [...prev, newMsg]);
        }} />;
      case 'organization':
        return <Organization departments={departments} users={users} setUsers={setUsers} setDepartments={setDepartments} currentUser={currentUser!} rolePermissions={rolePermissions} onUpdateRolePermissions={setRolePermissions} />;
      case 'resources':
        return <Resources currentUser={currentUser!} resources={resources} onSave={(res) => {
            if ('id' in res) {
                setResources(prev => prev.map(r => r.id === res.id ? res as CompanyResource : r));
            } else {
                setResources(prev => [...prev, { ...res, id: `res-${Date.now()}` } as CompanyResource]);
            }
        }} onDelete={(id) => setResources(prev => prev.filter(r => r.id !== id))} rolePermissions={rolePermissions}/>;
      case 'reports':
        return <Reports tasks={tasks} users={users} departments={departments} />;
      case 'settings':
        return <Settings currentUser={currentUser!} onUserUpdate={(user) => {
            setUsers(prev => prev.map(u => u.id === user.id ? user : u));
            if(currentUser?.id === user.id) setCurrentUser(user);
        }} appName={appName} logoUrl={logoUrl} onAppSettingsUpdate={(name, url) => {
            setAppName(name);
            setLogoUrl(url);
        }} />;
      default:
        return <Dashboard currentUser={currentUser!} tasks={tasks} users={users} departments={departments} onUpdateTask={handleUpdateTask} onCreateTask={handleCreateTask} onReactivateTask={handleReactivateTask} onTaskRead={handleTaskRead} rolePermissions={rolePermissions} />;
    }
  };

  if (!currentUser) {
    return showLogin ? <Login onLogin={handleLogin} appName={appName} logoUrl={logoUrl} /> : <LandingPage onShowLogin={() => setShowLogin(true)} appName={appName} />;
  }
  
  if (currentUser.forcePasswordChange) {
      return <ForcePasswordChangeModal currentUser={currentUser} onPasswordChanged={handlePasswordChanged} />;
  }
  
  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      if (notification.link.type === 'task') {
        // This is a simplified navigation. A more robust solution might open the task modal directly.
        setCurrentView('tasks');
      } else if (notification.link.type === 'chat') {
        setCurrentView('chat');
      }
    }
  };
  
  return (
    <>
      <Layout 
        currentUser={currentUser} 
        onLogout={handleLogout}
        navigateTo={setCurrentView}
        currentView={currentView}
        isChatbotOpen={isChatbotOpen}
        setIsChatbotOpen={setIsChatbotOpen}
        chatHistory={chatHistory}
        onSendMessage={handleSendMessage}
        isBotTyping={isBotTyping}
        notifications={notifications}
        onMarkNotificationsAsRead={() => setNotifications(prev => prev.map(n => ({...n, isRead: true})))}
        rolePermissions={rolePermissions}
        appName={appName}
        logoUrl={logoUrl}
      >
        {renderCurrentView()}
      </Layout>
      <ToastContainer 
        toasts={toasts}
        onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
        onNotificationClick={handleNotificationClick}
      />
    </>
  );
};

export default App;

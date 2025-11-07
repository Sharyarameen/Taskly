import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { User, Role, Task, Department, Attachment, Status, CompanyResource, Notification, RolePermission, Permission, Conversation, TeamChatMessage, ConversationType } from './types';
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
import LandingPage from './components/LandingPage';
import Installer from './components/Installer';

import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, updatePassword } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp, query, where, setDoc, writeBatch } from 'firebase/firestore';

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

const convertTimestamps = (data: any) => {
    const fieldsToConvert = ['createdAt', 'updatedAt', 'completedAt', 'dueDate', 'startDate', 'lastMessageAt'];
    const convertedData = { ...data };
    for (const field of fieldsToConvert) {
        if (data[field] && typeof data[field].toDate === 'function') {
            convertedData[field] = data[field].toDate().toISOString();
        }
    }
    return convertedData;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [appState, setAppState] = useState<'landing' | 'login' | 'app'>('landing');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMockMode, setIsMockMode] = useState(false);


  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<CompanyResource[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(MOCK_ROLE_PERMISSIONS);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [teamChatMessages, setTeamChatMessages] = useState<TeamChatMessage[]>([]);
  
  // App Customization State
  const [appName, setAppName] = useState('Zenith Task Manager');
  const [logoUrl, setLogoUrl] = useState('');

  // Chatbot State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  
  // Toast Notification State
  const [toasts, setToasts] = useState<Notification[]>([]);
  const displayedToastIds = useRef(new Set());

  useEffect(() => {
    if (isMockMode) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    const userData = { id: doc.id, ...doc.data() } as User;
                    setCurrentUser(userData);
                    setAppState('app');
                    if (userData.forcePasswordChange) {
                        setShowPasswordChange(true);
                    }
                } else {
                    // User exists in Auth but not Firestore, log them out
                    handleLogout();
                }
                setIsLoading(false);
            });
            return () => unsubscribeUser();
        } else {
            setCurrentUser(null);
            setAppState('landing');
            setIsLoading(false);
        }
    });

    return () => unsubscribe();
  }, [isMockMode]);
  
  useEffect(() => {
      if (!currentUser || isMockMode) return;
  
      const createSubscription = (collectionName: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
          const q = query(collection(db, collectionName));
          return onSnapshot(q, (snapshot) => {
              const data = snapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) }));
              setter(data);
          });
      };
      
      const createMessagesSubscription = (collectionName: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        const q = query(collection(db, collectionName));
        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) }));
            setter(data);
        });
      };

      const subscriptions = [
          createSubscription('users', setUsers),
          createSubscription('departments', setDepartments),
          createSubscription('tasks', setTasks),
          createSubscription('resources', setResources),
          createSubscription('conversations', setConversations),
          createSubscription('teamChatMessages', setTeamChatMessages),
          onSnapshot(query(collection(db, 'notifications'), where('userId', '==', currentUser.id)), (snapshot) => {
              const data = snapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) as Notification }));
              setNotifications(data);
          })
      ];
  
      return () => {
          subscriptions.forEach(unsubscribe => unsubscribe());
      };
  }, [currentUser, isMockMode]);


  useEffect(() => {
    document.title = appName;
  }, [appName]);
  
  useEffect(() => {
    if (!currentUser) return;
    const newUnread = notifications.filter(n => !n.isRead && !displayedToastIds.current.has(n.id));

    if (newUnread.length > 0) {
        setToasts(prev => [...prev, ...newUnread]);
        newUnread.forEach(n => displayedToastIds.current.add(n.id));
    }
  }, [notifications, currentUser]);


  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const assistantName = appName.replace(' Task Manager', '');
    const chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are ${assistantName} Assistant, an expert in productivity, project management, and business strategy. Help users refine their tasks, brainstorm ideas, and improve their workflow. Be encouraging and provide actionable advice. Format your responses using markdown.`,
      },
    });
    setChat(chatInstance);
  }, [appName]);
  
  const handleSendMessageToBot = async (message: string) => {
    if (!chat) return;
    
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    setChatHistory(prev => [...prev, userMessage]);
    setIsBotTyping(true);

    try {
        const result = await chat.sendMessageStream({ message });
        let text = '';
        for await (const chunk of result) {
            text += chunk.text;
             setChatHistory(prev => {
                const newHistory = [...prev];
                const lastMessage = newHistory[newHistory.length - 1];
                if (lastMessage && lastMessage.role === 'model') {
                    lastMessage.parts[0].text = text;
                    return newHistory;
                } else {
                    return [...newHistory, { role: 'model', parts: [{ text }] }];
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
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true, message: '' };
    } catch (error: any) {
        console.error("Login Error:", error);
        if (error.code === 'auth/configuration-not-found') {
            console.log("Firebase config not found. Switching to offline demo mode.");
            setIsMockMode(true);
            const mockUser = MOCK_USERS.find(u => u.email === email);
            if (mockUser) {
                setUsers(MOCK_USERS);
                setDepartments(MOCK_DEPARTMENTS);
                setTasks(MOCK_TASKS);
                setResources(MOCK_RESOURCES);
                setConversations(MOCK_CONVERSATIONS);
                setTeamChatMessages(MOCK_TEAM_CHAT_MESSAGES);
                setNotifications(MOCK_NOTIFICATIONS.filter(n => n.userId === mockUser.id));
                setCurrentUser(mockUser);
                setAppState('app');
                setIsLoading(false); // Ensure loading is off
                return { success: true, message: 'Switched to offline demo mode.' };
            }
        }
        if (error.code === 'auth/invalid-credential') {
             return { success: false, message: 'Invalid email or password. Please try again.' };
        }
        return { success: false, message: 'An unexpected error occurred during login.' };
    }
  }, []);

  const handleLogout = useCallback(async () => {
    if (isMockMode) {
        setIsMockMode(false);
        setCurrentUser(null);
        setAppState('landing');
    } else {
        try {
            await signOut(auth);
            setIsChatbotOpen(false);
            setChatHistory([]);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    }
  }, [isMockMode]);
  
  const handlePasswordChanged = useCallback(async (userId: string, newPassword: string) => {
    if (isMockMode) {
        const updatedUser = { ...currentUser!, forcePasswordChange: false };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
        setShowPasswordChange(false);
        setCurrentView('dashboard');
        return;
    }

    const user = auth.currentUser;
    if (user) {
        try {
            await updatePassword(user, newPassword);
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, { forcePasswordChange: false });
            setShowPasswordChange(false);
            setCurrentView('dashboard');
        } catch (error) {
            console.error("Password Update Error:", error);
        }
    }
  }, [isMockMode, currentUser]);

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view);
  }, []);
  
  const handleUpdateTask = async (updatedTask: Task) => {
      if (!currentUser) return;
      if (isMockMode) {
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...updatedTask, updatedAt: new Date().toISOString() } : t));
          return;
      }
      const { id, ...taskData } = updatedTask;
      const taskDocRef = doc(db, 'tasks', id);

      const originalTask = tasks.find(t => t.id === id);
      if (!originalTask) return;

      const taskWithTimestamp = { 
        ...taskData, 
        updatedAt: serverTimestamp(),
        dueDate: Timestamp.fromDate(new Date(taskData.dueDate)),
        startDate: Timestamp.fromDate(new Date(taskData.startDate)),
      };
      
      await updateDoc(taskDocRef, taskWithTimestamp);

      const newNotifications: Omit<Notification, 'id'>[] = [];
      const link = { type: 'task' as const, id: id };

      if (originalTask.status !== updatedTask.status) {
          const message = `Task "${updatedTask.title}" status: ${updatedTask.status}.`;
          const recipients = new Set([updatedTask.reporterId, ...updatedTask.assigneeIds]);
          recipients.delete(currentUser.id);
          recipients.forEach(userId => {
              newNotifications.push({ userId, message, isRead: false, createdAt: new Date().toISOString(), link });
          });
      }
      
      const originalCommentCount = originalTask.comments?.length || 0;
      const updatedCommentCount = updatedTask.comments?.length || 0;
      if (updatedCommentCount > originalCommentCount) {
          const newComment = updatedTask.comments![updatedCommentCount - 1];
          if (newComment.userId === currentUser.id && newComment.type === 'user') {
               const message = `${currentUser.name} commented on "${updatedTask.title}".`;
               const recipients = new Set([updatedTask.reporterId, ...updatedTask.assigneeIds]);
               recipients.delete(currentUser.id);
               recipients.forEach(userId => {
                   newNotifications.push({ userId, message, isRead: false, createdAt: new Date().toISOString(), link });
               });
          }
      }

      if (newNotifications.length > 0) {
          const batch = writeBatch(db);
          newNotifications.forEach(notif => {
              const notifRef = doc(collection(db, 'notifications'));
              batch.set(notifRef, notif);
          });
          await batch.commit();
      }
  };
  
  const handleCreateTask = async (newTask: Omit<Task, 'id' | 'reporterId' | 'viewedBy'>) => {
      if(!currentUser) return;
      if (isMockMode) {
          const mockNewTask: Task = {
              ...newTask,
              id: `task-${Date.now()}`,
              reporterId: currentUser.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              viewedBy: [],
              status: Status.ToDo,
          };
          setTasks(prev => [mockNewTask, ...prev]);
          return;
      }
      const taskWithMetadata = {
          ...newTask,
          reporterId: currentUser.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          viewedBy: [],
          status: Status.ToDo,
          dueDate: Timestamp.fromDate(new Date(newTask.dueDate)),
          startDate: Timestamp.fromDate(new Date(newTask.startDate)),
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), taskWithMetadata);

      const newNotifications = newTask.assigneeIds.map(userId => ({
        userId,
        message: `You've been assigned a new task: "${newTask.title}"`,
        isRead: false,
        createdAt: new Date().toISOString(),
        link: { type: 'task' as const, id: docRef.id }
      }));
      
      const batch = writeBatch(db);
      newNotifications.forEach(notif => {
          const notifRef = doc(collection(db, 'notifications'));
          batch.set(notifRef, notif);
      });
      await batch.commit();
  };
  
  const handleReactivateTask = async (taskId: string, reason: string, newDueDate: string) => {
      if (isMockMode) {
          setTasks(prev => prev.map(t => t.id === taskId ? {
              ...t,
              status: Status.ToDo,
              completedAt: undefined,
              dueDate: newDueDate,
              viewedBy: [],
              comments: [...(t.comments || []), {id: `comment-${Date.now()}`, userId: currentUser?.id || '', content: `Reactivated: ${reason}`, createdAt: new Date().toISOString()}]
          } : t));
          return;
      }
      const taskDocRef = doc(db, 'tasks', taskId);
      const originalTask = tasks.find(t => t.id === taskId);
      if (!originalTask) return;
      
      await updateDoc(taskDocRef, {
          status: Status.ToDo,
          completedAt: undefined,
          dueDate: Timestamp.fromDate(new Date(newDueDate)),
          viewedBy: [],
          comments: [...(originalTask.comments || []), {id: `comment-${Date.now()}`, userId: currentUser?.id || '', content: `Reactivated: ${reason}`, createdAt: new Date().toISOString()}]
      });
  };

  const handleTaskReadByAssignee = async (task: Task) => {
    if (!currentUser || !task.assigneeIds.includes(currentUser.id) || task.viewedBy.includes(currentUser.id)) return;
    if (isMockMode) {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, viewedBy: [...t.viewedBy, currentUser.id], status: Status.Pending } : t));
        return;
    }
    const taskDocRef = doc(db, 'tasks', task.id);
    await updateDoc(taskDocRef, {
        viewedBy: [...task.viewedBy, currentUser.id],
        status: Status.Pending,
    });
  };
  
  const handleUserUpdate = async (updatedUser: User) => {
    if (isMockMode) {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (currentUser?.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
        return;
    }
    const { id, ...userData } = updatedUser;
    const userDocRef = doc(db, 'users', id);
    await updateDoc(userDocRef, userData);
  };
  
  const handleCreateOrUpdateResource = async (resource: CompanyResource | Omit<CompanyResource, 'id'>) => {
    if (isMockMode) {
        if ('id' in resource) {
            setResources(prev => prev.map(r => r.id === resource.id ? resource : r));
        } else {
            setResources(prev => [{ ...resource, id: `res-${Date.now()}` }, ...prev]);
        }
        return;
    }
    if ('id' in resource) {
        const { id, ...resourceData } = resource;
        await updateDoc(doc(db, 'resources', id), resourceData);
    } else {
        await addDoc(collection(db, 'resources'), resource);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
      if (isMockMode) {
          setResources(prev => prev.filter(r => r.id !== resourceId));
          return;
      }
      await deleteDoc(doc(db, 'resources', resourceId));
  };

  const handleMarkNotificationsAsRead = async () => {
      if (isMockMode) {
          setNotifications(prev => prev.map(n => ({...n, isRead: true})));
          return;
      }
      const batch = writeBatch(db);
      notifications.filter(n => !n.isRead).forEach(n => {
          const notifRef = doc(db, 'notifications', n.id);
          batch.update(notifRef, { isRead: true });
      });
      await batch.commit();
  }

  const handleUpdateRolePermissions = (updatedRolePermissions: RolePermission[]) => {
      setRolePermissions(updatedRolePermissions);
  }

  const handleAppSettingsUpdate = (name: string, url: string) => {
    setAppName(name);
    setLogoUrl(url);
  };
  
  const handleSendTeamMessage = async (conversationId: string, content: string) => {
    if (!currentUser) return;
    if (isMockMode) {
        const newMessage: TeamChatMessage = {
            id: `msg-${Date.now()}`,
            conversationId,
            senderId: currentUser.id,
            content,
            createdAt: new Date().toISOString(),
        };
        setTeamChatMessages(prev => [...prev, newMessage]);
        setConversations(prev => prev.map(c => c.id === conversationId ? {...c, lastMessageAt: new Date().toISOString()} : c));
        return;
    }
    const newMessage: Omit<TeamChatMessage, 'id'> = {
      conversationId,
      senderId: currentUser.id,
      content,
      createdAt: new Date().toISOString(), // This will be converted to server timestamp
    };
    
    await addDoc(collection(db, 'teamChatMessages'), { ...newMessage, createdAt: serverTimestamp() });
    await updateDoc(doc(db, 'conversations', conversationId), { lastMessageAt: serverTimestamp() });
    
    // Create notifications for other participants
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
        const convoName = getConversationDetails(conversation, currentUser, users).name;
        const newNotifications = conversation.participantIds
            .filter(id => id !== currentUser.id)
            .map(userId => ({
                userId,
                message: `New message from ${currentUser.name} in "${convoName}"`,
                isRead: false,
                createdAt: new Date().toISOString(),
                link: { type: 'chat' as const, id: conversationId }
            }));
        
        const batch = writeBatch(db);
        newNotifications.forEach(notif => {
            const notifRef = doc(collection(db, 'notifications'));
            batch.set(notifRef, notif);
        });
        await batch.commit();
    }
  };

  const handleCreateConversation = async (participantIds: string[], groupName?: string): Promise<string | undefined> => {
    if (!currentUser) return;
    if (isMockMode) {
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
    }
    
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
    
    const newConversationData = {
      type: participantIds.length > 1 ? ConversationType.GROUP : ConversationType.DM,
      participantIds: [...participantIds, currentUser.id],
      name: groupName,
      groupAvatar: participantIds.length > 1 ? `https://picsum.photos/seed/group-${Date.now()}/100` : undefined,
      lastMessageAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'conversations'), newConversationData);
    return docRef.id;
  };
  
  const removeToast = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };
  
  const handleNotificationClick = async (notification: Notification) => {
    if (notification.link) {
        if (notification.link.type === 'chat') navigateTo('chat');
        else if (notification.link.type === 'task') navigateTo('tasks');
    }
    if (isMockMode) {
        setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, isRead: true} : n));
    } else {
        await updateDoc(doc(db, 'notifications', notification.id), { isRead: true });
    }
    removeToast(notification.id);
  };
  
  if (window.location.hash === '#/install') {
    return <Installer />;
  }

  if (isLoading && !isMockMode) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 dark:bg-dark-base-100">
            <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

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
        content = <Organization departments={departments} users={users} setUsers={() => {}} setDepartments={() => {}} currentUser={currentUser} rolePermissions={rolePermissions} onUpdateRolePermissions={handleUpdateRolePermissions} />;
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

  if (appState === 'landing') {
    return <LandingPage onShowLogin={() => setAppState('login')} appName={appName} />;
  }
  
  if (appState === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (!currentUser) {
    // This case should ideally not be hit if logic is correct, but as a fallback:
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
          notifications={notifications}
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

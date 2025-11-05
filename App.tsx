import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
// FIX: Import Status enum to use for type safety.
import { User, Role, Task, Department, Attachment, Status, CompanyResource, Notification, RolePermission, Permission, Conversation, TeamChatMessage, ConversationType } from './types';
import { MOCK_USERS, MOCK_DEPARTMENTS, MOCK_TASKS, MOCK_RESOURCES, MOCK_ROLE_PERMISSIONS, MOCK_CONVERSATIONS, MOCK_TEAM_CHAT_MESSAGES } from './constants';
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [appState, setAppState] = useState<'landing' | 'login' | 'app'>('landing');


  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [resources, setResources] = useState<CompanyResource[]>(MOCK_RESOURCES);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(MOCK_ROLE_PERMISSIONS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [teamChatMessages, setTeamChatMessages] = useState<TeamChatMessage[]>(MOCK_TEAM_CHAT_MESSAGES);
  
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
    document.title = appName;
  }, [appName]);
  
  useEffect(() => {
    if (!currentUser) return;
    // Filter for new, unread notifications for the current user that haven't been displayed as toasts yet
    const newUnread = notifications.filter(n => 
        n.userId === currentUser.id && 
        !n.isRead && 
        !displayedToastIds.current.has(n.id)
    );

    if (newUnread.length > 0) {
        // Add new notifications to the toast queue
        setToasts(prev => [...prev, ...newUnread]);
        // Mark these notifications as displayed to prevent re-adding them
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
  
  // Simulate bot sending daily task reminder to General channel
  useEffect(() => {
    const botSentToday = localStorage.getItem('botSentToday');
    const today = new Date().toDateString();
    
    if (botSentToday !== today) {
      const generalConvo = conversations.find(c => c.name === 'General');
      if (generalConvo) {
        const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== Status.Done);
        
        let messageContent = `**Good morning, team!** Here's a quick look at overdue tasks:`;
        if (overdueTasks.length > 0) {
            messageContent += overdueTasks.map(t => `\n- **${t.title}** (Overdue)`).join('');
        } else {
            messageContent = `**Good morning, team!** Great job, there are no overdue tasks today. Keep up the momentum!`;
        }
        
        const botMessage: TeamChatMessage = {
          id: `msg-${Date.now()}`,
          conversationId: generalConvo.id,
          senderId: 'user-bot',
          content: messageContent,
          createdAt: new Date().toISOString(),
        };

        setTimeout(() => {
          setTeamChatMessages(prev => [...prev, botMessage]);
          setConversations(prev => prev.map(c => c.id === generalConvo.id ? {...c, lastMessageAt: new Date().toISOString()} : c));
          localStorage.setItem('botSentToday', today);
        }, 2000); // Send after 2 seconds
      }
    }
  }, [conversations, tasks]);

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
  
  // Advanced recurring task generation
  useEffect(() => {
    const interval = setInterval(() => {
        const newNotifications: Notification[] = [];
        setTasks(prevTasks => {
            const newTasks: Task[] = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const parentTasks = prevTasks.filter(task => task.recurrence && task.recurrence.freq !== 'none' && !task.parentTaskId);

            parentTasks.forEach(parent => {
                const instances = prevTasks.filter(t => t.parentTaskId === parent.id);
                
                const todayString = today.toDateString();
                const hasInstanceForToday = instances.some(inst => new Date(inst.createdAt).toDateString() === todayString);

                if (hasInstanceForToday) return;

                let shouldCreate = false;
                switch (parent.recurrence?.freq) {
                    case 'daily':
                        shouldCreate = true;
                        break;
                    case 'weekly':
                        if (today.getDay() === parent.recurrence.dayOfWeek) {
                            shouldCreate = true;
                        }
                        break;
                    case 'monthly':
                        if (today.getDate() === parent.recurrence.dayOfMonth) {
                            shouldCreate = true;
                        }
                        break;
                }
                
                if (parent.recurrence?.endDate && today > new Date(parent.recurrence.endDate)) {
                    shouldCreate = false;
                }

                if (shouldCreate) {
                    const newDueDate = new Date(today);
                    const originalDueDate = new Date(parent.dueDate);
                    newDueDate.setHours(originalDueDate.getHours(), originalDueDate.getMinutes(), originalDueDate.getSeconds());

                    const newInstance: Task = {
                        ...parent,
                        id: `task-${Date.now()}-${Math.random()}`,
                        parentTaskId: parent.id,
                        dueDate: newDueDate.toISOString(),
                        createdAt: new Date().toISOString(),
                        status: Status.ToDo,
                        completedAt: undefined,
                        viewedBy: [],
                        comments: [],
                        attachments: parent.attachments,
                    };
                    newTasks.push(newInstance);

                    newInstance.assigneeIds.forEach(userId => {
                      newNotifications.push({
                        id: `notif-recur-${newInstance.id}-${userId}`,
                        userId,
                        message: `A new recurring task has been created: "${newInstance.title}"`,
                        isRead: false,
                        createdAt: new Date().toISOString(),
                        link: { type: 'task', id: newInstance.id },
                      });
                    });
                }
            });

            if (newNotifications.length > 0) {
              setNotifications(prev => [...prev, ...newNotifications]);
            }
            return [...prevTasks, ...newTasks];
        });
    }, 60000 * 60); // Check every hour
    return () => clearInterval(interval);
  }, []);

  // Notification generation (Due Soon & Overdue)
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
        const now = new Date();
        const userTasks = tasks.filter(task => task.assigneeIds.includes(currentUser.id) && task.status !== Status.Done);
        
        const newNotifications: Notification[] = [];
        
        // Due Soon
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const upcomingTasks = userTasks.filter(task => {
            const dueDate = new Date(task.dueDate).getTime();
            return dueDate > now.getTime() && dueDate <= (now.getTime() + twentyFourHours);
        });
        upcomingTasks.forEach(task => {
            const notificationId = `notif-due-${task.id}`;
            if (!notifications.some(n => n.id === notificationId)) {
                newNotifications.push({
                    id: notificationId, userId: currentUser.id, message: `Task "${task.title}" is due soon.`,
                    isRead: false, createdAt: new Date().toISOString(),
                    link: { type: 'task', id: task.id }
                });
            }
        });

        // Overdue
        const overdueTasks = userTasks.filter(task => new Date(task.dueDate) < now);
        overdueTasks.forEach(task => {
            const notificationId = `notif-overdue-${task.id}`;
            if (!notifications.some(n => n.id === notificationId)) {
                 newNotifications.push({
                    id: notificationId, userId: currentUser.id, message: `Task "${task.title}" is overdue.`,
                    isRead: false, createdAt: new Date().toISOString(),
                    link: { type: 'task', id: task.id }
                });
            }
        });

        if (newNotifications.length > 0) {
            setNotifications(prev => [...prev, ...newNotifications]);
        }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);

  }, [currentUser, tasks, notifications]);

  const handleLogin = useCallback((phone: string, password: string): boolean => {
    const user = users.find(u => u.phone === phone && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setAppState('app');
      if (user.forcePasswordChange) {
        setShowPasswordChange(true);
      } else {
        setCurrentView('dashboard');
      }
      return true;
    }
    return false;
  }, [users]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowPasswordChange(false);
    setIsChatbotOpen(false);
    setChatHistory([]);
    setAppState('landing');
  }, []);
  
  const handlePasswordChanged = useCallback((userId: string, newPassword: string) => {
      setUsers(prevUsers => prevUsers.map(u => 
          u.id === userId 
          ? { ...u, password: newPassword, forcePasswordChange: false } 
          : u
      ));
      setCurrentUser(prevUser => prevUser ? { ...prevUser, password: newPassword, forcePasswordChange: false } : null);
      setShowPasswordChange(false);
      setCurrentView('dashboard');
  }, []);

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view);
  }, []);
  
  const handleUpdateTask = (updatedTask: Task) => {
      setTasks(prevTasks => {
          const newTasks = [...prevTasks];
          const taskIndex = newTasks.findIndex(t => t.id === updatedTask.id);
          if (taskIndex === -1) return prevTasks;

          const originalTask = newTasks[taskIndex];
          const taskWithTimestamp = { ...updatedTask, updatedAt: new Date().toISOString() };
          newTasks[taskIndex] = taskWithTimestamp;

          // --- Notification Logic ---
          if (!currentUser) return newTasks;
          const newNotifications: Notification[] = [];
          const link = { type: 'task' as const, id: taskWithTimestamp.id };

          // 1. Status Change Notification
          if (originalTask.status !== taskWithTimestamp.status) {
              const message = `Task "${taskWithTimestamp.title}" status: ${taskWithTimestamp.status}.`;
              const recipients = new Set([taskWithTimestamp.reporterId, ...taskWithTimestamp.assigneeIds]);
              recipients.delete(currentUser.id);
              recipients.forEach(userId => {
                  newNotifications.push({
                      id: `notif-status-${taskWithTimestamp.id}-${userId}-${Date.now()}`,
                      userId: userId, message, isRead: false, createdAt: new Date().toISOString(), link
                  });
              });
          }

          // 2. New Comment Notification
          const originalCommentCount = originalTask.comments?.length || 0;
          const updatedCommentCount = taskWithTimestamp.comments?.length || 0;
          if (updatedCommentCount > originalCommentCount) {
              const newComment = taskWithTimestamp.comments![updatedCommentCount - 1];
              if (newComment.userId === currentUser.id && newComment.type === 'user') {
                   const message = `${currentUser.name} commented on "${taskWithTimestamp.title}".`;
                   const recipients = new Set([taskWithTimestamp.reporterId, ...taskWithTimestamp.assigneeIds]);
                   recipients.delete(currentUser.id);
                   recipients.forEach(userId => {
                       newNotifications.push({
                           id: `notif-comment-${taskWithTimestamp.id}-${userId}-${Date.now()}`,
                           userId: userId, message, isRead: false, createdAt: new Date().toISOString(), link
                       });
                   });
              }
          }

          if (newNotifications.length > 0) {
              setNotifications(prev => [...prev, ...newNotifications]);
          }
          // --- End Notification Logic ---
          
          return newTasks;
      });
  };
  
  const handleCreateTask = (newTask: Omit<Task, 'id' | 'reporterId' | 'viewedBy'>) => {
      if(!currentUser) return;
      const taskWithId: Task = {
          ...newTask,
          id: `task-${Date.now()}`,
          reporterId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          viewedBy: [],
          status: Status.ToDo,
      };

      setTasks(prev => [...prev, taskWithId]);

      const newNotifications: Notification[] = newTask.assigneeIds.map(userId => ({
        id: `notif-assign-${taskWithId.id}-${userId}`,
        userId: userId,
        message: `You've been assigned a new task: "${taskWithId.title}"`,
        isRead: false,
        createdAt: new Date().toISOString(),
        link: { type: 'task', id: taskWithId.id }
      }));
      setNotifications(prev => [...prev, ...newNotifications]);
  };
  
  const handleReactivateTask = (taskId: string, reason: string, newDueDate: string) => {
      setTasks(prevTasks => prevTasks.map(task => 
          task.id === taskId 
          ? { ...task, status: Status.ToDo, completedAt: undefined, dueDate: newDueDate, viewedBy: [], comments: [...(task.comments || []), {id: `comment-${Date.now()}`, userId: currentUser?.id || '', content: `Reactivated: ${reason}`, createdAt: new Date().toISOString()}] } 
          : task
      ));
  };

  const handleTaskReadByAssignee = (task: Task) => {
    if (!currentUser || !task.assigneeIds.includes(currentUser.id) || task.viewedBy.includes(currentUser.id)) {
        return;
    }

    const updatedTask: Task = {
        ...task,
        viewedBy: [...task.viewedBy, currentUser.id],
        status: Status.Pending, // Automatically change status to Pending
    };
    handleUpdateTask(updatedTask);

    // Mark assignment notification as read
    const notificationId = `notif-assign-${task.id}-${currentUser.id}`;
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };
  
  const handleUserUpdate = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const handleCreateOrUpdateResource = (resource: CompanyResource | Omit<CompanyResource, 'id'>) => {
    if ('id' in resource) {
        setResources(prev => prev.map(r => r.id === resource.id ? resource as CompanyResource : r));
    } else {
        const newResource: CompanyResource = {
            ...(resource as Omit<CompanyResource, 'id'>),
            id: `res-${Date.now()}`,
        };
        setResources(prev => [...prev, newResource]);
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
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, lastMessageAt: new Date().toISOString() } : c));

    // Create notifications for other participants
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
        const convoName = getConversationDetails(conversation, currentUser, users).name;
        const newNotifications: Notification[] = conversation.participantIds
            .filter(id => id !== currentUser.id) // Don't notify the sender
            .map(userId => ({
                id: `notif-chat-${newMessage.id}-${userId}`,
                userId,
                message: `New message from ${currentUser.name} in "${convoName}"`,
                isRead: false,
                createdAt: new Date().toISOString(),
                link: { type: 'chat', id: conversationId }
            }));
        setNotifications(prev => [...prev, ...newNotifications]);
    }
  };

  const handleCreateConversation = (participantIds: string[], groupName?: string) => {
    if (!currentUser) return;

    // Check if a DM with the same single participant already exists
    if (participantIds.length === 1) {
      const otherUserId = participantIds[0];
      const existing = conversations.find(c => 
        c.type === ConversationType.DM &&
        c.participantIds.length === 2 &&
        c.participantIds.includes(currentUser.id) &&
        c.participantIds.includes(otherUserId)
      );
      if (existing) {
        // A conversation already exists, we can perhaps switch to it.
        // For now, we just prevent creating a duplicate.
        // The ChatView component will handle switching.
        return existing.id;
      }
    }
    
    const newConversation: Conversation = {
      id: `convo-${Date.now()}`,
      type: participantIds.length > 1 ? ConversationType.GROUP : ConversationType.DM,
      participantIds: [...participantIds, currentUser.id],
      name: groupName,
      groupAvatar: participantIds.length > 1 ? `https://picsum.photos/seed/group-${Date.now()}/100` : undefined,
      lastMessageAt: new Date().toISOString(),
    };
    
    setConversations(prev => [newConversation, ...prev]);
    return newConversation.id;
  };
  
  const removeToast = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
        if (notification.link.type === 'chat') {
            navigateTo('chat');
        } else if (notification.link.type === 'task') {
            navigateTo('tasks');
        }
    }
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
    // Remove the toast
    removeToast(notification.id);
  };

  if (window.location.hash === '#/install') {
    return <Installer />;
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
        content = <Organization departments={departments} users={users} setUsers={setUsers} setDepartments={setDepartments} currentUser={currentUser} rolePermissions={rolePermissions} onUpdateRolePermissions={handleUpdateRolePermissions} />;
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
  
  if (appState === 'login' || !isLoggedIn || !currentUser) {
    return <Login onLogin={handleLogin} appName={appName} logoUrl={logoUrl} />;
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
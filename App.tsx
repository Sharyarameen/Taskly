

import React, { useState, useEffect } from 'react';
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
import Installer from './components/Installer'; 
import ConfigurationRequired from './components/ConfigurationRequired';

import { 
    User, 
    Task, 
    Department, 
    Notification,
    CompanyResource,
    RolePermission,
    Conversation,
    TeamChatMessage,
    Status,
    Role
} from './types';

// Firebase imports
import { auth, db, isFirebaseConfigured } from './firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, updatePassword } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc, writeBatch, setDoc, query, where, getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';


export type View = 'dashboard' | 'tasks' | 'calendar' | 'chat' | 'organization' | 'resources' | 'reports' | 'settings';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

const App: React.FC = () => {
  // Hard block if Firebase config is not set. This is the most critical check.
  if (!isFirebaseConfigured) {
      return <ConfigurationRequired />;
  }
  
  const [showLogin, setShowLogin] = useState(false);
  const [authInitializing, setAuthInitializing] = useState(true);
  
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
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [showInstaller, setShowInstaller] = useState(false);
  
  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user && user.email) {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    if (userData) {
                        setCurrentUser({ id: userDocSnap.id, ...userData } as User);
                    }
                } else {
                    console.log("User document not found for UID, creating one...");

                    const usersRef = collection(db, "users");
                    const allUsersSnapshot = await getDocs(usersRef);
                    const isFirstUser = allUsersSnapshot.empty;

                    const newUser: Omit<User, 'id'> = {
                        name: user.displayName || user.email!.split('@')[0],
                        email: user.email!,
                        avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/100`,
                        role: isFirstUser ? Role.Administrator : Role.Employee,
                        departmentId: '',
                        phone: '',
                        createdAt: new Date().toISOString(),
                        forcePasswordChange: false,
                    };

                    await setDoc(userDocRef, newUser);
                    setCurrentUser({ id: user.uid, ...newUser });
                }
            } catch (error: any) {
                console.error("Firestore permission error on user query:", { code: error.code, message: error.message });
                if (error.code === 'permission-denied') {
                    setFirestoreError('permission-denied');
                }
            }
        } else {
            setCurrentUser(null);
        }
        setAuthInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore listeners for real-time data
  useEffect(() => {
    if (!currentUser) return;

    const collectionsToSync: { name: string; setter: (data: any) => void }[] = [
        { name: 'users', setter: setUsers },
        { name: 'tasks', setter: setTasks },
        { name: 'departments', setter: setDepartments },
        { name: 'resources', setter: setResources },
        { name: 'role_permissions', setter: setRolePermissions },
        { name: 'conversations', setter: setConversations },
        { name: 'team_chat_messages', setter: setTeamChatMessages },
        { name: 'notifications', setter: setNotifications },
    ];

    const unsubscribers = collectionsToSync.map(({ name, setter }) => {
        return onSnapshot(
            collection(db, name), 
            (snapshot: QuerySnapshot<DocumentData>) => {
                const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setter(data);
                if (firestoreError) setFirestoreError(null);
            },
            (error: any) => {
                console.error(`Firestore permission error on collection '${name}':`, { code: error.code, message: error.message });
                if (error.code === 'permission-denied') {
                    setFirestoreError('permission-denied');
                }
            }
        );
    });

    // Listener for app settings
    const settingsDocRef = doc(db, "settings", "app");
    const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const settings = docSnap.data() as { appName?: string, logoUrl?: string };
            setAppName(settings?.appName || 'Zenith Task Manager');
            setLogoUrl(settings?.logoUrl || '');
        }
    },
    (error: any) => {
        console.error(`Firestore permission error on settings listener:`, { code: error.code, message: error.message });
        if (error.code === 'permission-denied') {
            setFirestoreError('permission-denied');
        }
    });
    unsubscribers.push(unsubscribeSettings);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser, firestoreError]);
  
  useEffect(() => {
    if (firestoreError === 'permission-denied') {
      setShowInstaller(true);
    }
  }, [firestoreError]);


  // --- Handlers ---
  const handleLogin = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error("Firebase login error:", { code: error.code, message: error.message });
      
      const isConfigError = 
        error.code === 'auth/operation-not-allowed' ||
        (error.message && error.message.includes('are-blocked')) ||
        error.code === 'auth/invalid-credential' || 
        error.code === 'auth/invalid-login-credentials' || 
        error.code === 'auth/user-not-found';

      if (isConfigError) {
        setShowInstaller(true);
      }

      if (error.code === 'auth/operation-not-allowed' || (error.message && error.message.includes('are-blocked'))) {
        return { 
          success: false, 
          message: "Configuration Error: Email/Password sign-in is disabled.\n\nThe setup guide has been opened to help you." 
        };
      }
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials' || error.code === 'auth/user-not-found') {
          return { 
              success: false, 
              message: 'Login failed: Invalid email or password.\n\nFor new setups, the guide has been opened to help you create a user.' 
            };
      }
      return { success: false, message: `Login failed: ${error.message}\n(Code: ${error.code})` };
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setShowLogin(false); // Go back to landing page
  };
  
  const addNotification = async (message: string, link?: Notification['link']) => {
    const newNotifData: Omit<Notification, 'id'> = { message, link, isRead: false, createdAt: new Date().toISOString() };
    const docRef = await addDoc(collection(db, 'notifications'), newNotifData);
    setToasts(prev => [...prev, { ...newNotifData, id: docRef.id }]);
  };

  const handleCreateTask = async (task: Omit<Task, 'id' | 'reporterId' | 'viewedBy'>) => {
    if (!currentUser) return;
    const newTask: Omit<Task, 'id'> = {
        ...task,
        reporterId: currentUser.id,
        viewedBy: [currentUser.id],
        createdAt: new Date().toISOString(),
        comments: [],
    };
    const docRef = await addDoc(collection(db, "tasks"), newTask);
    addNotification(`New task created: ${newTask.title}`, { type: 'task', id: docRef.id });
  };
  
  const handleUpdateTask = async (updatedTask: Task) => {
    const { id, ...taskData } = updatedTask;
    await setDoc(doc(db, "tasks", id), taskData);
    addNotification(`Task updated: ${updatedTask.title}`, { type: 'task', id: updatedTask.id });
  };

  const handleTaskRead = async (task: Task) => {
    if (!currentUser || task.viewedBy.includes(currentUser.id)) return;
    const updatedViewedBy = [...task.viewedBy, currentUser.id];
    await updateDoc(doc(db, "tasks", task.id), { viewedBy: updatedViewedBy });
  };
  
  const handleReactivateTask = async (taskId: string, reason: string, newDueDate: string) => {
    const taskRef = doc(db, "tasks", taskId);
    const taskDoc = await getDoc(taskRef);
    if (taskDoc.exists() && currentUser) {
        const taskData = taskDoc.data() as Task;
        await updateDoc(taskRef, {
            status: Status.ToDo, 
            dueDate: newDueDate,
            completedAt: undefined, // Firestore can use deleteField() but undefined works
            comments: [...taskData.comments, { id: `comment-${Date.now()}`, userId: currentUser.id, content: `Reactivated: ${reason}`, createdAt: new Date().toISOString(), type: 'system' }]
        });
    }
  };

  const handleSendMessage = async (message: string) => {
    const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsBotTyping(true);

    const historyForApi = [...chatHistory, newUserMessage];

    try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: historyForApi.slice(-10),
      });
      
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
    } catch (error) {
      console.error("Gemini API error:", error instanceof Error ? error.message : String(error));
      setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I encountered an error. Please try again." }] }]);
    } finally {
      setIsBotTyping(false);
    }
  };
  
   const handlePasswordChanged = async (userId: string, newPassword: string) => {
      const user = auth.currentUser;
      if (user) {
        try {
            await updatePassword(user, newPassword);
            const userRef = doc(db, "users", userId); 
            await updateDoc(userRef, { forcePasswordChange: false });
            setCurrentUser(prev => prev ? { ...prev, forcePasswordChange: false } : null);
        } catch(e: any) {
            console.error("Password update failed", { code: e.code, message: e.message });
            alert("Failed to update password. You may need to log out and log back in.");
        }
      }
  };

  const handleTeamChatMessageSend = async (conversationId: string, content: string) => {
    if (!currentUser) return;
    const newMessage: Omit<TeamChatMessage, 'id'> = {
      conversationId,
      userId: currentUser.id,
      content,
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'team_chat_messages'), newMessage);
  };
  
  const handleUserSave = async (userToSave: User | Omit<User, 'id' | 'createdAt'>) => {
    if ('id' in userToSave) {
        const { id, ...userData } = userToSave;
        await setDoc(doc(db, 'users', id), userData, { merge: true });
    } else {
        alert("Adding new users from the app is not supported. Please create an account for the user in Firebase Authentication. They will appear here after their first login.");
    }
  };

  const handleUserDelete = async (userId: string) => {
      if (window.confirm('Are you sure you want to delete this user\'s data? This will NOT delete their login account.')) {
          await deleteDoc(doc(db, 'users', userId));
      }
  };
  
  const handleDepartmentSave = async (dept: Department | Omit<Department, 'id'>) => {
      if ('id' in dept) {
          await setDoc(doc(db, 'departments', dept.id), dept);
      } else {
          await addDoc(collection(db, 'departments'), dept);
      }
  };

  const handleDepartmentDelete = async (deptId: string) => {
      if (window.confirm('Are you sure you want to delete this department? This will unassign all users from it.')) {
          const batch = writeBatch(db);
          batch.delete(doc(db, 'departments', deptId));
          users.filter(u => u.departmentId === deptId).forEach(u => {
              batch.update(doc(db, 'users', u.id), { departmentId: '' });
          });
          await batch.commit();
      }
  };
  
  const handleResourceSave = async (resource: CompanyResource | Omit<CompanyResource, 'id'>) => {
      if ('id' in resource) {
          await setDoc(doc(db, 'resources', resource.id), resource);
      } else {
          await addDoc(collection(db, 'resources'), resource);
      }
  };

  const handleResourceDelete = async (resourceId: string) => {
      await deleteDoc(doc(db, 'resources', resourceId));
  };
  
  const handleUpdateRolePermissions = async (permissions: RolePermission[]) => {
      const batch = writeBatch(db);
      permissions.forEach(rp => {
          const docRef = doc(db, 'role_permissions', rp.role);
          batch.set(docRef, rp);
      });
      await batch.commit();
  };
  
  const handleUserUpdate = async (user: User) => {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
  };
  
  const handleAppSettingsUpdate = async (name: string, url: string) => {
      await setDoc(doc(db, 'settings', 'app'), { appName: name, logoUrl: url }, { merge: true });
  };
  
  const handleMarkNotificationsAsRead = async () => {
      const batch = writeBatch(db);
      notifications.filter(n => !n.isRead).forEach(n => {
          batch.update(doc(db, 'notifications', n.id), { isRead: true });
      });
      await batch.commit();
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
        return <Chat currentUser={currentUser!} users={users} conversations={conversations} messages={teamChatMessages} onSendMessage={handleTeamChatMessageSend} />;
      case 'organization':
        return <Organization departments={departments} users={users} onUserSave={handleUserSave} onUserDelete={handleUserDelete} onDepartmentSave={handleDepartmentSave} onDepartmentDelete={handleDepartmentDelete} currentUser={currentUser!} rolePermissions={rolePermissions} onUpdateRolePermissions={handleUpdateRolePermissions} />;
      case 'resources':
        return <Resources currentUser={currentUser!} resources={resources} onSave={handleResourceSave} onDelete={handleResourceDelete} rolePermissions={rolePermissions}/>;
      case 'reports':
        return <Reports tasks={tasks} users={users} departments={departments} />;
      case 'settings':
        return <Settings currentUser={currentUser!} onUserUpdate={handleUserUpdate} appName={appName} logoUrl={logoUrl} onAppSettingsUpdate={handleAppSettingsUpdate} />;
      default:
        return <Dashboard currentUser={currentUser!} tasks={tasks} users={users} departments={departments} onUpdateTask={handleUpdateTask} onCreateTask={handleCreateTask} onReactivateTask={handleReactivateTask} onTaskRead={handleTaskRead} rolePermissions={rolePermissions} />;
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    if (notification.link) {
      if (notification.link.type === 'task') {
        setCurrentView('tasks');
      } else if (notification.link.type === 'chat') {
        setCurrentView('chat');
      }
    }
  };

  const renderAppContent = () => {
    if (authInitializing) {
      return (
          <div className="h-screen w-screen flex items-center justify-center bg-base-200 dark:bg-dark-base-100">
              <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
    }
    
    if (!currentUser) {
      return showLogin ? <Login onLogin={handleLogin} appName={appName} logoUrl={logoUrl} /> : <LandingPage onShowLogin={() => setShowLogin(true)} appName={appName} />;
    }
    
    if (currentUser.forcePasswordChange) {
        return <ForcePasswordChangeModal currentUser={currentUser} onPasswordChanged={handlePasswordChanged} />;
    }

    if (firestoreError === 'permission-denied') {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-base-200 dark:bg-dark-base-100 p-4 text-center">
                <h2 className="text-2xl font-bold text-red-500">Permission Denied</h2>
                <p className="mt-2 text-base-content-secondary dark:text-dark-base-content-secondary">
                    Your application does not have permission to access the database.
                </p>
                <p className="mt-1 text-base-content-secondary dark:text-dark-base-content-secondary">
                    The setup guide has been opened to help you resolve this.
                </p>
            </div>
        );
    }
    
    return (
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
            onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
            rolePermissions={rolePermissions}
            appName={appName}
            logoUrl={logoUrl}
        >
            {renderCurrentView()}
        </Layout>
    );
  };
  
  return (
    <>
      {renderAppContent()}
      {showInstaller && <Installer onClose={() => setShowInstaller(false)} />}
      <ToastContainer 
        toasts={toasts}
        onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
        onNotificationClick={handleNotificationClick}
      />
    </>
  );
};

export default App;

import React, { useState, useMemo } from 'react';
// FIX: Import 'Role' enum to use in the Settings component.
import { Task, User, Department, Priority, Status, RolePermission, Role } from '../types';
import TaskModal from './TaskModal';
import { PlusIcon } from './icons/SolidIcons';
import { CheckCircleIcon, ClockIcon, BriefcaseIcon, XIcon } from './icons/OutlineIcons';

// --- Dashboard Props ---
interface DashboardProps {
  currentUser: User;
  tasks: Task[];
  users: User[];
  departments: Department[];
  onUpdateTask: (task: Task) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'reporterId' | 'viewedBy'>) => void;
  onReactivateTask: (taskId: string, reason: string, newDueDate: string) => void;
  onTaskRead: (task: Task) => void;
  rolePermissions: RolePermission[];
}

// --- Sub-Components for Dashboard ---

const SummaryCard: React.FC<{ title: string; count: number; icon: React.ElementType; onClick: () => void; className?: string }> = ({ title, count, icon: Icon, onClick, className }) => (
  <button 
    onClick={onClick} 
    className={`p-5 rounded-xl shadow-lg flex items-center justify-between w-full text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 dark:focus:ring-offset-dark-base-100 focus:ring-white/50 ${className}`}
  >
    <div className="text-white">
      <p className="text-base font-semibold opacity-80">{title}</p>
      <p className="text-4xl font-bold">{count}</p>
    </div>
    <div className="bg-white/20 p-3 rounded-full">
      <Icon className="w-8 h-8 text-white" />
    </div>
  </button>
);

const getPriorityClass = (priority: Priority) => {
    switch(priority) {
        case Priority.Critical: return 'bg-priority-critical';
        case Priority.High: return 'bg-priority-high';
        case Priority.Medium: return 'bg-priority-medium';
        case Priority.Low: return 'bg-priority-low';
        default: return 'bg-gray-400';
    }
};

// TaskListModal component
const TaskListModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
}> = ({ isOpen, onClose, title, tasks, onTaskSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4">
      <div className="bg-base-100 dark:bg-dark-base-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-dark-base-300">
          <h2 className="text-xl font-bold">{title} ({tasks.length})</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300">
            <XIcon className="w-6 h-6 text-base-content-secondary" />
          </button>
        </div>
        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {tasks.length > 0 ? (
            <ul className="space-y-2">
              {tasks.map(task => (
                <li key={task.id}>
                  <button onClick={() => onTaskSelect(task)} className="w-full text-left p-3 bg-base-200/60 dark:bg-dark-base-300/50 rounded-lg hover:shadow-lg hover:bg-base-200 dark:hover:bg-dark-base-300 transition-all">
                    <div className="flex justify-between items-center">
                       <p className="font-semibold text-sm flex items-center">
                         <span className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${getPriorityClass(task.priority)}`}></span>
                         {task.title}
                       </p>
                       <p className="text-xs text-base-content-secondary dark:text-dark-base-content-secondary">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-base-content-secondary py-8">No tasks in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const TaskAnalytics: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const analyticsData = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        date: d.setHours(0, 0, 0, 0),
        created: 0,
        completed: 0,
      };
    }).reverse();

    tasks.forEach(task => {
      // Created tasks
      const createdDate = new Date(task.createdAt).setHours(0, 0, 0, 0);
      const createdDayData = days.find(d => d.date === createdDate);
      if (createdDayData) createdDayData.created++;

      // Completed tasks
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt).setHours(0, 0, 0, 0);
        const completedDayData = days.find(d => d.date === completedDate);
        if (completedDayData) completedDayData.completed++;
      }
    });
    
    const maxCount = Math.max(...days.flatMap(d => [d.created, d.completed]), 1);

    return days.map(d => ({ 
        ...d, 
        createdHeight: (d.created / maxCount) * 100,
        completedHeight: (d.completed / maxCount) * 100 
    }));
  }, [tasks]);

  return (
    <div className="bg-base-100 dark:bg-dark-base-200 p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-bold mb-1">Task Analytics</h3>
       <p className="text-sm text-base-content-secondary mb-4">Tasks created vs. completed over the last 7 days.</p>
      <div className="flex justify-between items-end h-32">
        {analyticsData.map((data, index) => (
          <div key={index} className="flex flex-col items-center w-1/7 gap-1">
            <div className="w-full flex justify-center items-end gap-1" style={{ height: '100%' }}>
              <div title={`Created: ${data.created}`} className="w-4 bg-blue-300 dark:bg-blue-600 rounded-t-md" style={{ height: `${data.createdHeight}%`, transition: 'height 0.5s ease-in-out' }}></div>
              <div title={`Completed: ${data.completed}`} className="w-4 bg-green-300 dark:bg-green-600 rounded-t-md" style={{ height: `${data.completedHeight}%`, transition: 'height 0.5s ease-in-out 0.1s' }}></div>
            </div>
            <span className="text-xs mt-2 text-base-content-secondary">{data.day}</span>
          </div>
        ))}
      </div>
       <div className="flex justify-center items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-300 dark:bg-blue-600"></div> Created</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-600"></div> Completed</div>
      </div>
    </div>
  );
};

const TaskProgress: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const validTasks = tasks.filter(t => !t.parentTaskId);
    const completedTasks = validTasks.filter(t => t.status === Status.Done).length;
    const totalTasks = validTasks.length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-base-100 dark:bg-dark-base-200 p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
             <h3 className="text-lg font-bold mb-4">Task Progress</h3>
             <div className="relative w-32 h-32">
                 <svg className="w-full h-full" viewBox="0 0 120 120">
                    <circle className="text-base-200 dark:text-dark-base-300" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
                    <circle 
                        className="text-brand-primary"
                        strokeWidth="10" 
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor" 
                        fill="transparent" 
                        r={radius} 
                        cx="60" 
                        cy="60"
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                 </svg>
                 <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{percentage}%</span>
             </div>
             <p className="text-sm mt-2 text-base-content-secondary">Tasks Completed</p>
        </div>
    );
};

const OverdueTasks: React.FC<{ tasks: Task[], onClickTask: (task: Task) => void }> = ({ tasks, onClickTask }) => {
    const overdue = useMemo(() => {
        const now = new Date();
        return tasks.filter(t => t.status !== Status.Done && new Date(t.dueDate) < now)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [tasks]);

    return (
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow-sm border border-red-200 dark:border-red-800/50">
            <h3 className="text-lg font-bold mb-4 text-red-800 dark:text-red-200">Overdue Tasks ({overdue.length})</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
                {overdue.length > 0 ? overdue.slice(0, 5).map(task => (
                    <div key={task.id} onClick={() => onClickTask(task)} className="p-3 bg-base-100 dark:bg-dark-base-200 rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
                        <p className="font-semibold text-sm">{task.title}</p>
                        <p className="text-xs text-red-600 dark:text-red-400">Overdue since: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                )) : <p className="text-sm text-center py-4 text-base-content-secondary dark:text-dark-base-content-secondary">No overdue tasks. Great job!</p>}
            </div>
        </div>
    );
};


const TeamCollaboration: React.FC<{ users: User[], tasks: Task[] }> = ({ users, tasks }) => {
    return (
        <div className="bg-base-100 dark:bg-dark-base-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-4">Team Collaboration</h3>
            <div className="space-y-4">
                {users.slice(0, 4).map(user => {
                    const userTask = tasks.find(t => t.assigneeIds.includes(user.id) && t.status !== Status.Done);
                    return (
                        <div key={user.id} className="flex items-center">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                            <div className="ml-3">
                                <p className="font-semibold text-sm">{user.name}</p>
                                <p className="text-xs text-base-content-secondary">
                                    {userTask ? `Working on: ${userTask.title}` : 'Available for tasks'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// --- Main Dashboard Component ---

const Dashboard: React.FC<DashboardProps> = ({ currentUser, tasks, users, departments, onUpdateTask, onCreateTask, onReactivateTask, onTaskRead, rolePermissions }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [isTaskListModalOpen, setIsTaskListModalOpen] = useState(false);
  const [tasksForModal, setTasksForModal] = useState<Task[]>([]);
  const [modalTitle, setModalTitle] = useState('');

  const taskSummary = useMemo(() => {
    const nonParentTasks = tasks.filter(t => !t.parentTaskId);
    return {
      total: nonParentTasks.length,
      done: nonParentTasks.filter(t => t.status === Status.Done).length,
      inProgress: nonParentTasks.filter(t => t.status === Status.InProgress).length,
      pending: nonParentTasks.filter(t => t.status === Status.Pending || t.status === Status.ToDo).length,
    }
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    return tasks
      .filter(t => t.status !== Status.Done && new Date(t.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [tasks]);

  const handleTaskClick = (task: Task) => {
    if (isTaskListModalOpen) {
      setIsTaskListModalOpen(false);
    }
    setSelectedTask(task);
    setIsTaskModalOpen(true);
    onTaskRead(task);
  };
  
  const handleModalClose = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleCreateNewTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };
  
  const handleSummaryCardClick = (statuses: Status[], title: string) => {
    const relevantTasks = tasks.filter(t => !t.parentTaskId && statuses.includes(t.status))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setTasksForModal(relevantTasks);
    setModalTitle(title);
    setIsTaskListModalOpen(true);
  };


  return (
    <div className="p-4 md:p-6 lg:p-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                 <h1 className="text-2xl md:text-3xl font-bold text-base-content dark:text-dark-base-content">Dashboard</h1>
                 <p className="text-base-content-secondary dark:text-dark-base-content-secondary mt-1">Plan, prioritize, and accomplish your tasks with ease.</p>
            </div>
            <button
              onClick={handleCreateNewTask}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-75"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Task</span>
            </button>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Main Content Area */}
        <div className="xl:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <SummaryCard 
                    title="Completed" 
                    count={taskSummary.done} 
                    icon={CheckCircleIcon}
                    onClick={() => handleSummaryCardClick([Status.Done], 'Completed Tasks')}
                    className="bg-emerald-500 dark:bg-emerald-600"
                />
                <SummaryCard 
                    title="In Progress" 
                    count={taskSummary.inProgress} 
                    icon={BriefcaseIcon}
                    onClick={() => handleSummaryCardClick([Status.InProgress], 'In Progress Tasks')}
                    className="bg-blue-500 dark:bg-blue-600"
                />
                <SummaryCard 
                    title="Pending" 
                    count={taskSummary.pending} 
                    icon={ClockIcon}
                    onClick={() => handleSummaryCardClick([Status.Pending, Status.ToDo], 'Pending Tasks')}
                    className="bg-amber-500 dark:bg-amber-600"
                />
            </div>
            <TaskAnalytics tasks={tasks} />
            <TeamCollaboration users={users} tasks={tasks} />
        </div>

        {/* Sidebar Area */}
        <div className="xl:col-span-2 space-y-6">
            <div className="bg-base-100 dark:bg-dark-base-200 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold mb-4">Upcoming Tasks</h3>
                <div className="space-y-3">
                    {upcomingTasks.length > 0 ? upcomingTasks.map(task => (
                        <div key={task.id} onClick={() => handleTaskClick(task)} className="p-3 bg-base-200 dark:bg-dark-base-300/50 rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
                            <p className="font-semibold text-sm">{task.title}</p>
                            <p className="text-xs text-base-content-secondary">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                    )) : <p className="text-sm text-center py-4 text-base-content-secondary">No upcoming tasks.</p>}
                </div>
            </div>
            <OverdueTasks tasks={tasks} onClickTask={handleTaskClick} />
            <TaskProgress tasks={tasks} />
        </div>
      </div>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={handleModalClose}
          task={selectedTask}
          allTasks={tasks}
          onSave={selectedTask ? onUpdateTask : (t) => { onCreateTask(t); handleModalClose(); }}
          onReactivate={onReactivateTask}
          onTaskRead={onTaskRead}
          currentUser={currentUser}
          users={users}
          rolePermissions={rolePermissions}
        />
      )}
      <TaskListModal
        isOpen={isTaskListModalOpen}
        onClose={() => setIsTaskListModalOpen(false)}
        title={modalTitle}
        tasks={tasksForModal}
        onTaskSelect={handleTaskClick}
      />
    </div>
  );
};

export default Dashboard;


// --- Settings Component ---
interface SettingsProps {
    currentUser: User;
    onUserUpdate: (user: User) => void;
    appName: string;
    logoUrl: string;
    onAppSettingsUpdate: (name: string, url: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser, onUserUpdate, appName, logoUrl, onAppSettingsUpdate }) => {
    const [formState, setFormState] = useState(currentUser);
    const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
    const [appSettingsForm, setAppSettingsForm] = useState({ name: appName, logoUrl: logoUrl });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleAppSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAppSettingsForm({ ...appSettingsForm, [e.target.name]: e.target.value });
    };
    
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUserUpdate(formState);
        alert('Profile updated successfully!');
    };

    const handleAppSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAppSettingsUpdate(appSettingsForm.name, appSettingsForm.logoUrl);
        alert('Application settings updated successfully!');
    }
    
    const handleAvatarChange = () => {
        const newSeed = `user-${currentUser.id}-${Date.now()}`;
        const newAvatar = `https://picsum.photos/seed/${newSeed}/100`;
        const updatedUser = { ...formState, avatar: newAvatar };
        setFormState(updatedUser);
        onUserUpdate(updatedUser);
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-base-content dark:text-dark-base-content mb-6">Settings</h1>

             {currentUser.role === Role.Administrator && (
                <div className="mb-8 bg-base-100 dark:bg-dark-base-200 rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Application Customization</h2>
                    <form onSubmit={handleAppSettingsSubmit} className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium">Application Name</label>
                            <input type="text" name="name" value={appSettingsForm.name} onChange={handleAppSettingsChange} className="mt-1 block w-full input-style" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Logo URL</label>
                            <input type="text" name="logoUrl" value={appSettingsForm.logoUrl} onChange={handleAppSettingsChange} className="mt-1 block w-full input-style" placeholder="https://example.com/logo.png"/>
                        </div>
                        <div className="text-right">
                            <button type="submit" className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary">Save App Settings</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h2 className="text-lg font-semibold">Profile Picture</h2>
                    <div className="mt-4 flex flex-col items-center">
                        <img src={formState.avatar} alt="User Avatar" className="w-32 h-32 rounded-full ring-4 ring-brand-primary/50" />
                        <button onClick={handleAvatarChange} className="mt-4 px-4 py-2 text-sm font-medium bg-base-200 dark:bg-dark-base-200 rounded-lg hover:bg-base-300 dark:hover:bg-dark-base-300">
                            Generate New Avatar
                        </button>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-base-100 dark:bg-dark-base-200 rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Full Name</label>
                                <input type="text" name="name" value={formState.name} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input type="email" name="email" value={formState.email} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Phone</label>
                                <input type="tel" name="phone" value={formState.phone} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                            </div>
                            <div className="text-right">
                                <button type="submit" className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                    <div className="bg-base-100 dark:bg-dark-base-200 rounded-lg shadow-sm p-6">
                         <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                        <form className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium">Current Password</label>
                                <input type="password" name="current" className="mt-1 block w-full input-style" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">New Password</label>
                                <input type="password" name="new" className="mt-1 block w-full input-style" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">Confirm New Password</label>
                                <input type="password" name="confirm" className="mt-1 block w-full input-style" />
                            </div>
                            <div className="text-right">
                                <button type="submit" className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary" onClick={(e) => e.preventDefault()}>Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
             <style>{`
            .input-style {
                background-color: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 0.375rem;
                padding: 0.5rem 0.75rem;
                width: 100%;
                color: #1f2937;
            }
            .dark .input-style {
                background-color: #1e293b;
                border-color: #334155;
                color: #f1f5f9;
            }
            .input-style:focus {
                outline: 2px solid transparent;
                outline-offset: 2px;
                border-color: #059669;
                box-shadow: 0 0 0 1px #059669;
            }
       `}</style>
        </div>
    )
}
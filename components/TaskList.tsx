import React, { useState, useMemo } from 'react';
import { Task, User, Priority, Status, RolePermission, RecurrenceRule } from '../types';
import TaskModal from './TaskModal';
import { PlusIcon } from './icons/SolidIcons';
import { PaperClipIcon, LinkIcon, UsersIcon } from './icons/OutlineIcons';

interface TaskListProps {
  currentUser: User;
  tasks: Task[];
  users: User[];
  onUpdateTask: (task: Task) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'reporterId' | 'viewedBy'>) => void;
  onReactivateTask: (taskId: string, reason: string, newDueDate: string) => void;
  onTaskRead: (task: Task) => void;
  rolePermissions: RolePermission[];
}

const getPriorityClass = (priority: Priority) => {
    switch(priority) {
        case Priority.Critical: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
        case Priority.High: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200';
        case Priority.Medium: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
        case Priority.Low: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
        default: return 'bg-base-200 text-base-content dark:bg-dark-base-300 dark:text-dark-base-content';
    }
};

const getStatusClass = (status: Status) => {
    switch(status) {
        case Status.Done: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
        case Status.Pending: return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200';
        case Status.InProgress: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
        case Status.ToDo: return 'bg-base-200 text-base-content dark:bg-dark-base-300 dark:text-dark-base-content';
        default: return 'bg-base-200 text-base-content dark:bg-dark-base-300 dark:text-dark-base-content';
    }
};

const TaskList: React.FC<TaskListProps> = ({ currentUser, tasks, users, onUpdateTask, onCreateTask, onReactivateTask, onTaskRead, rolePermissions }) => {
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [filter, setFilter] = useState({ search: '', status: '', priority: '', assigneeId: '' });
    const [activeTab, setActiveTab] = useState('All');
    
    const tabs = ['All', 'Daily', 'Weekly', 'Monthly'];

    const taskMap = useMemo(() => new Map(tasks.map(t => [t.id, t])), [tasks]);

    const filteredTasks = useMemo(() => {
        let tabFilteredTasks: Task[];

        switch(activeTab) {
            case 'Daily':
            case 'Weekly':
            case 'Monthly':
                const freq = activeTab.toLowerCase() as RecurrenceRule['freq'];
                tabFilteredTasks = tasks.filter(t => {
                    if (!t.parentTaskId) return false;
                    const parent = taskMap.get(t.parentTaskId);
                    return parent?.recurrence?.freq === freq;
                });
                break;
            case 'All':
            default:
                // All user-facing tasks: one-time tasks and all recurring instances
                tabFilteredTasks = tasks.filter(t => !t.recurrence || t.recurrence.freq === 'none' || !!t.parentTaskId);
                break;
        }

        return tabFilteredTasks
            .filter(task => {
                const searchMatch = task.title.toLowerCase().includes(filter.search.toLowerCase());
                const statusMatch = filter.status ? task.status === filter.status : true;
                const priorityMatch = filter.priority ? task.priority === filter.priority : true;
                const assigneeMatch = filter.assigneeId ? task.assigneeIds.includes(filter.assigneeId) : true;
                return searchMatch && statusMatch && priorityMatch && assigneeMatch;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    }, [tasks, filter, activeTab, taskMap]);

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    const handleCreateNewTask = () => {
        setSelectedTask(null);
        setIsTaskModalOpen(true);
    };

    const handleModalClose = () => {
        setIsTaskModalOpen(false);
        setSelectedTask(null);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilter(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-base-content dark:text-dark-base-content">All Tasks</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCreateNewTask}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span className="hidden sm:block">New Task</span>
                    </button>
                </div>
            </div>
            
             <div className="mb-4">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${
                                    tab === activeTab
                                        ? 'border-brand-primary text-brand-primary'
                                        : 'border-transparent text-base-content-secondary hover:text-base-content dark:hover:text-dark-base-content hover:border-gray-300 dark:hover:border-gray-500'
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="mb-4 bg-base-100 dark:bg-dark-base-200 p-4 rounded-lg shadow-sm flex flex-col md:flex-row flex-wrap gap-4 items-center">
                <input
                    type="text"
                    name="search"
                    placeholder="Search by title..."
                    className="w-full md:flex-1 px-3 py-2 border border-base-300 dark:border-dark-base-300 rounded-md bg-base-100 dark:bg-dark-base-300 focus:outline-none focus:ring-brand-primary"
                    value={filter.search}
                    onChange={handleFilterChange}
                />
                <select name="assigneeId" className="w-full md:w-auto px-3 py-2 border border-base-300 dark:border-dark-base-300 rounded-md bg-base-100 dark:bg-dark-base-300 focus:outline-none focus:ring-brand-primary" value={filter.assigneeId} onChange={handleFilterChange}>
                    <option value="">All Assignees</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select name="status" className="w-full md:w-auto px-3 py-2 border border-base-300 dark:border-dark-base-300 rounded-md bg-base-100 dark:bg-dark-base-300 focus:outline-none focus:ring-brand-primary" value={filter.status} onChange={handleFilterChange}>
                    <option value="">All Statuses</option>
                    {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                 <select name="priority" className="w-full md:w-auto px-3 py-2 border border-base-300 dark:border-dark-base-300 rounded-md bg-base-100 dark:bg-dark-base-300 focus:outline-none focus:ring-brand-primary" value={filter.priority} onChange={handleFilterChange}>
                    <option value="">All Priorities</option>
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            <div className="bg-base-100 dark:bg-dark-base-200 shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-base-300 dark:divide-dark-base-300">
                    <thead className="bg-base-200/50 dark:bg-dark-base-300/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content-secondary dark:text-dark-base-content-secondary uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content-secondary dark:text-dark-base-content-secondary uppercase tracking-wider">Assignees</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content-secondary dark:text-dark-base-content-secondary uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content-secondary dark:text-dark-base-content-secondary uppercase tracking-wider">Priority</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content-secondary dark:text-dark-base-content-secondary uppercase tracking-wider">Progress</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-base-content-secondary dark:text-dark-base-content-secondary uppercase tracking-wider">Due Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-base-100 dark:bg-dark-base-200 divide-y divide-base-200 dark:divide-dark-base-300">
                        {filteredTasks.map(task => {
                            const isUnread = task.status === Status.ToDo && task.assigneeIds.includes(currentUser.id) && !task.viewedBy.includes(currentUser.id);
                            const isBlockedByDependencies = task.dependsOn.some(depId => {
                                const dep = tasks.find(t => t.id === depId);
                                return dep && dep.status !== Status.Done;
                            });

                            return (
                                <tr key={task.id} onClick={() => handleTaskClick(task)} className="hover:bg-base-200/50 dark:hover:bg-dark-base-300/50 cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {isUnread && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2 flex-shrink-0" title="New task"></span>}
                                            {task.attachments && task.attachments.length > 0 && <PaperClipIcon className="w-4 h-4 mr-2 text-base-content-secondary flex-shrink-0" />}
                                            {isBlockedByDependencies && <span title="This task is blocked by another task."><LinkIcon className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" /></span>}
                                            <div className="text-sm font-medium text-base-content dark:text-dark-base-content">{task.title}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex -space-x-1 overflow-hidden">
                                            {task.assigneeIds.map(id => {
                                                const user = users.find(u => u.id === id);
                                                return user ? <img key={id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-dark-base-200" src={user.avatar} alt={user.name} title={user.name}/> : null;
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[120px]">
                                        {task.assigneeIds.length > 1 && (
                                            <div className="flex items-center gap-2" title={`Assignees: ${task.completedBy?.length || 0}/${task.assigneeIds.length} complete`}>
                                                <UsersIcon className="w-4 h-4 text-base-content-secondary flex-shrink-0" />
                                                <div className="w-full bg-base-300 rounded-full h-2 dark:bg-dark-base-300">
                                                    <div className="bg-status-inprogress h-2 rounded-full" style={{ width: `${((task.completedBy?.length || 0) / task.assigneeIds.length) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                        {task.dependsOn.length > 0 && (
                                            <div className="flex items-center gap-2 mt-1" title={`Dependencies: ${tasks.filter(t => task.dependsOn.includes(t.id) && t.status === Status.Done).length}/${task.dependsOn.length} complete`}>
                                                <LinkIcon className="w-4 h-4 text-base-content-secondary flex-shrink-0" />
                                                <div className="w-full bg-base-300 rounded-full h-2 dark:bg-dark-base-300">
                                                    <div className="bg-status-blocked h-2 rounded-full" style={{ width: `${(tasks.filter(t => task.dependsOn.includes(t.id) && t.status === Status.Done).length / task.dependsOn.length) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                        {(task.assigneeIds.length <= 1 && task.dependsOn.length === 0) && (
                                            <span className="text-base-content-secondary">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-base-content-secondary dark:text-dark-base-content-secondary">
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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
        </div>
    );
};

export default TaskList;
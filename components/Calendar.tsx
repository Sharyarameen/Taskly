import React, { useState, useMemo } from 'react';
import { Task, User, RolePermission, Priority } from '../types';
import TaskModal from './TaskModal';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/OutlineIcons';

interface CalendarProps {
  currentUser: User;
  tasks: Task[];
  users: User[];
  onUpdateTask: (task: Task) => void;
  onCreateTask: (task: Omit<Task, 'id' | 'reporterId' | 'viewedBy'>) => void;
  onReactivateTask: (taskId: string, reason: string, newDueDate: string) => void;
  onTaskRead: (task: Task) => void;
  rolePermissions: RolePermission[];
}

const getPriorityDotClass = (priority: Priority) => {
    switch(priority) {
        case Priority.Critical: return 'bg-priority-critical';
        case Priority.High: return 'bg-priority-high';
        case Priority.Medium: return 'bg-priority-medium';
        case Priority.Low: return 'bg-priority-low';
        default: return 'bg-gray-400';
    }
};

const Calendar: React.FC<CalendarProps> = ({ currentUser, tasks, users, onUpdateTask, onCreateTask, onReactivateTask, onTaskRead, rolePermissions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
    onTaskRead(task);
  };

  const handleModalClose = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };


  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Add blank days for the first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ key: `blank-${i}`, date: null, tasks: [] });
    }
    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate.getFullYear() === year && dueDate.getMonth() === month && dueDate.getDate() === day;
      });
      days.push({ key: `day-${day}`, date, tasks: dayTasks });
    }
    return days;
  }, [currentDate, tasks]);
  
  const today = new Date();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-base-content dark:text-dark-base-content">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h1>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-base-300/50 dark:hover:bg-dark-base-300">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())} 
            className="px-4 py-2 text-sm font-semibold border border-base-300 dark:border-dark-base-300 rounded-md hover:bg-base-300/50 dark:hover:bg-dark-base-300"
          >
            Today
          </button>
          <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-base-300/50 dark:hover:bg-dark-base-300">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="bg-base-100 dark:bg-dark-base-200 shadow-md rounded-lg">
        <div className="grid grid-cols-7 text-center font-semibold text-sm text-base-content-secondary dark:text-dark-base-content-secondary border-b dark:border-dark-base-300">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3">{day}</div>
            ))}
        </div>
        <div className="grid grid-cols-7">
            {calendarGrid.map(({ key, date, tasks }) => (
                <div key={key} className="relative h-24 md:h-32 border-b border-r dark:border-dark-base-300 p-2 overflow-hidden">
                    {date && (
                        <>
                            <span className={`text-sm ${date.toDateString() === today.toDateString() ? 'bg-brand-primary text-white rounded-full flex items-center justify-center h-6 w-6' : ''}`}>
                                {date.getDate()}
                            </span>
                             <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                                {tasks.map(task => (
                                    <div key={task.id} onClick={() => handleTaskClick(task)} className="text-xs p-1 rounded-md bg-brand-primary/10 dark:bg-brand-primary/20 cursor-pointer hover:bg-brand-primary/20 dark:hover:bg-brand-primary/30">
                                        <p className="flex items-center">
                                          <span className={`w-2 h-2 rounded-full mr-1.5 flex-shrink-0 ${getPriorityDotClass(task.priority)}`}></span>
                                          <span className="truncate">{task.title}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ))}
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
    </div>
  );
};

export default Calendar;
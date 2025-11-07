import React, { useState, useMemo } from 'react';
import { Task, User, Department, Priority, Status } from '../types';
import Widget from './Widget';

interface ReportsProps {
  tasks: Task[];
  users: User[];
  departments: Department[];
}

const today = new Date();
const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

const Reports: React.FC<ReportsProps> = ({ tasks, users, departments }) => {
    const [filters, setFilters] = useState({
        departmentId: 'all',
        userId: 'all',
        priority: 'all',
        status: 'all',
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        taskType: 'all',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            const startDate = new Date(filters.startDate);
            startDate.setHours(0,0,0,0);
            const endDate = new Date(filters.endDate);
            endDate.setHours(23,59,59,999);
            
            const dateMatch = taskDate >= startDate && taskDate <= endDate;
            const deptMatch = filters.departmentId === 'all' || task.departmentId === filters.departmentId;
            const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
            const statusMatch = filters.status === 'all' || task.status === filters.status;
            
            const userMatch = filters.userId === 'all' || task.assigneeIds.includes(filters.userId);
            
            const typeMatch = (() => {
                if (filters.taskType === 'one-time') {
                    // Exclude parent templates from one-time tasks
                    return !task.parentTaskId && (!task.recurrence || task.recurrence.freq === 'none');
                }
                if (filters.taskType === 'recurring') {
                    return !!task.parentTaskId;
                }
                // For 'all', include one-time and instances, but not parent templates
                return !task.recurrence || task.recurrence.freq === 'none' || !!task.parentTaskId;
            })();

            return dateMatch && deptMatch && priorityMatch && statusMatch && userMatch && typeMatch;
        });
    }, [tasks, filters]);
    
    const reportData = useMemo(() => {
        const usersToReportOn = filters.userId === 'all' ? users : users.filter(u => u.id === filters.userId);

        const performance = usersToReportOn.map(user => {
            const assignedTasks = filteredTasks.filter(task => task.assigneeIds.includes(user.id));
            const completedTasks = assignedTasks.filter(task => task.status === Status.Done && task.completedAt);
            
            const onTimeTasks = completedTasks.filter(task => new Date(task.completedAt!) <= new Date(task.dueDate)).length;
            const onTimeRate = completedTasks.length > 0 ? ((onTimeTasks / completedTasks.length) * 100).toFixed(0) : 'N/A';
            
            const totalCompletionTime = completedTasks.reduce((acc, task) => {
                const startTime = new Date(task.createdAt);
                const endTime = new Date(task.completedAt!);
                return acc + (endTime.getTime() - startTime.getTime());
            }, 0);

            const avgTimeMs = completedTasks.length > 0 ? totalCompletionTime / completedTasks.length : 0;
            const days = Math.floor(avgTimeMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((avgTimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            
            return {
                user,
                assignedCount: assignedTasks.length,
                completedCount: completedTasks.length,
                onTimeRate,
                avgCompletionTime: avgTimeMs > 0 ? `${days}d ${hours}h` : 'N/A',
                avgTimeMs,
            };
        });

        const totalCompleted = performance.reduce((sum, p) => sum + p.completedCount, 0);
        const overallOnTimeCount = filteredTasks.filter(t => t.status === Status.Done && t.completedAt && new Date(t.completedAt) <= new Date(t.dueDate)).length;
        const overallOnTimeRate = totalCompleted > 0 ? ((overallOnTimeCount / totalCompleted) * 100).toFixed(0) + '%' : 'N/A';
        
        const totalCompletionTimeAcrossUsers = performance.reduce((acc, p) => {
            if (p.avgCompletionTime !== 'N/A') {
                return acc + (p.avgTimeMs * p.completedCount);
            }
            return acc;
        }, 0);
        const overallAvgTimeMs = totalCompleted > 0 ? totalCompletionTimeAcrossUsers / totalCompleted : 0;
        
        const totalDays = Math.floor(overallAvgTimeMs / (1000 * 60 * 60 * 24));
        const totalHours = Math.floor((overallAvgTimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const overallAvgCompletion = overallAvgTimeMs > 0 ? `${totalDays}d ${totalHours}h` : 'N/A';


        return {
            performance,
            summary: {
                totalCompleted,
                overallOnTimeRate,
                overallAvgCompletion,
            },
        };

    }, [filteredTasks, users, filters.userId]);

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-base-content dark:text-dark-base-content mb-6">Performance Reports</h1>
            
            {/* Filter Section */}
            <div className="mb-6 bg-base-100 dark:bg-dark-base-200 p-4 rounded-lg shadow-sm">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-grow">
                        <label className="text-sm font-medium">Date Range</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full input-style"/>
                            <span className="text-base-content-secondary">-</span>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full input-style"/>
                        </div>
                    </div>
                     <div className="flex-grow">
                        <label className="text-sm font-medium">Department</label>
                        <select name="departmentId" value={filters.departmentId} onChange={handleFilterChange} className="w-full mt-1 input-style">
                            <option value="all">All Departments</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="flex-grow">
                        <label className="text-sm font-medium">User</label>
                        <select name="userId" value={filters.userId} onChange={handleFilterChange} className="w-full mt-1 input-style">
                            <option value="all">All Users</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div className="flex-grow">
                        <label className="text-sm font-medium">Priority</label>
                        <select name="priority" value={filters.priority} onChange={handleFilterChange} className="w-full mt-1 input-style">
                            <option value="all">All</option>
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                     <div className="flex-grow">
                        <label className="text-sm font-medium">Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full mt-1 input-style">
                            <option value="all">All</option>
                            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div className="flex-grow">
                        <label className="text-sm font-medium">Task Type</label>
                        <select name="taskType" value={filters.taskType} onChange={handleFilterChange} className="w-full mt-1 input-style">
                            <option value="all">All (Work Tasks)</option>
                            <option value="one-time">One-Time Tasks</option>
                            <option value="recurring">Recurring Tasks</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-base-100 dark:bg-dark-base-200 p-4 rounded-lg shadow"><p className="text-sm text-base-content-secondary">Tasks Completed</p><p className="text-3xl font-bold">{reportData.summary.totalCompleted}</p></div>
                <div className="bg-base-100 dark:bg-dark-base-200 p-4 rounded-lg shadow"><p className="text-sm text-base-content-secondary">On-Time Completion</p><p className="text-3xl font-bold">{reportData.summary.overallOnTimeRate}</p></div>
                <div className="bg-base-100 dark:bg-dark-base-200 p-4 rounded-lg shadow"><p className="text-sm text-base-content-secondary">Avg. Completion Time</p><p className="text-3xl font-bold">{reportData.summary.overallAvgCompletion}</p></div>
            </div>

            {/* Performance Table */}
            <Widget title="User Performance Breakdown">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="text-left text-sm font-semibold text-base-content-secondary dark:text-dark-base-content-secondary">
                            <tr>
                                <th className="p-2">User</th>
                                <th className="p-2 text-center">Assigned</th>
                                <th className="p-2 text-center">Completed</th>
                                <th className="p-2 text-center">On-Time Rate</th>
                                <th className="p-2">Avg. Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.performance.map(({ user, assignedCount, completedCount, onTimeRate, avgCompletionTime }) => (
                                <tr key={user.id} className="border-t border-base-200 dark:border-dark-base-300">
                                    <td className="p-2">
                                        <div className="flex items-center">
                                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                                            <span>{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-2 font-medium text-center">{assignedCount}</td>
                                    <td className="p-2 font-medium text-center">{completedCount}</td>
                                    <td className="p-2 font-medium text-center">{onTimeRate}{onTimeRate !== 'N/A' && '%'}</td>
                                    <td className="p-2">{avgCompletionTime}</td>
                                </tr>
                            ))}
                             {reportData.performance.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-base-content-secondary">No data available for the selected filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Widget>
            <style>{`.input-style { background-color: #fff; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: #111827; } .dark .input-style { background-color: #1f2937; border-color: #4b5563; color: #f9fafb; }`}</style>
        </div>
    );
};

export default Reports;
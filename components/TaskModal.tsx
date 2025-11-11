

import React, { useState, useEffect, useCallback } from 'react';
import { Task, User, Priority, Status, Role, Attachment, Comment, RolePermission, Permission, RecurrenceRule } from '../types';
import { XIcon, PaperClipIcon, LinkIcon, CheckCircleIcon } from './icons/OutlineIcons';
import { SparklesIcon, TrashIcon } from './icons/SolidIcons';
// Fix: Import `Type` for responseSchema
import { GoogleGenAI, Type } from '@google/genai';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  allTasks: Task[];
  onSave: (task: Task | Omit<Task, 'id' | 'reporterId' | 'viewedBy'>) => void;
  onReactivate: (taskId: string, reason: string, newDueDate: string) => void;
  onTaskRead: (task: Task) => void;
  currentUser: User;
  users: User[];
  rolePermissions: RolePermission[];
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, allTasks, onSave, onReactivate, onTaskRead, currentUser, users, rolePermissions }) => {
  const [isEditing, setIsEditing] = useState(!task);
  const [formState, setFormState] = useState<Partial<Task>>({});
  const [reactivateReason, setReactivateReason] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [showReactivate, setShowReactivate] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  // New state for the simplified assignee view
  const [assigneeAction, setAssigneeAction] = useState<{comment: string, dueDate: string}>({comment: '', dueDate: ''});

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (currentUser.role === Role.Administrator) return true;
    const userRolePerms = rolePermissions.find(rp => rp.role === currentUser.role);
    return userRolePerms?.permissions.includes(permission) ?? false;
  }, [currentUser.role, rolePermissions]);


  const resetState = useCallback(() => {
    if (task) {
      setFormState(task);
      setIsEditing(false);
      // Check if the current user is an assignee and has not viewed the task yet.
      if (task.status === Status.ToDo && task.assigneeIds.includes(currentUser.id) && !task.viewedBy.includes(currentUser.id)) {
        onTaskRead(task);
      }
       setAssigneeAction({comment: '', dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''});
    } else {
      setFormState({
        title: '',
        description: '',
        assigneeIds: [],
        priority: Priority.Medium,
        status: Status.ToDo,
        dueDate: new Date().toISOString().split('T')[0],
        attachments: [],
        viewedBy: [],
        completedBy: [],
        dependsOn: [],
        recurrence: { freq: 'none', interval: 1 }
      });
      setIsEditing(true);
       setAssigneeAction({comment: '', dueDate: new Date().toISOString().split('T')[0]});
    }
    setShowReactivate(false);
    setReactivateReason('');
    setNewComment('');
  }, [task, currentUser, onTaskRead]);

  useEffect(() => {
    if (isOpen) {
        resetState();
    }
  }, [task, isOpen, resetState]);

  if (!isOpen) return null;

  const addComment = (taskToUpdate: { comments?: Comment[] }, comment: Omit<Comment, 'id' | 'createdAt'>): Comment[] => {
    const newComment: Comment = {
        ...comment,
        id: `comment-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    return [...(taskToUpdate.comments || []), newComment];
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      const { name, value } = e.target;
      const newRecurrence = { ...formState.recurrence, [name]: value };
      if (name === 'freq') {
          if (value === 'weekly') newRecurrence.dayOfWeek = newRecurrence.dayOfWeek ?? 1;
          if (value === 'monthly') newRecurrence.dayOfMonth = newRecurrence.dayOfMonth ?? 1;
      }
      setFormState(prev => ({ ...prev, recurrence: newRecurrence as RecurrenceRule }));
  }
  
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const options = e.target.options;
      const value: string[] = [];
      for(let i = 0, l = options.length; i < l; i++) {
          if(options[i].selected) {
              value.push(options[i].value);
          }
      }
      setFormState(prev => ({ ...prev, [e.target.name]: value }));
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files: File[] = Array.from(e.target.files);
          const newAttachments: Attachment[] = [];
          for (const file of files) {
              const url = await fileToBase64(file);
              newAttachments.push({ name: file.name, type: file.type, size: file.size, url });
          }
          setFormState(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...newAttachments] }));
      }
  };

  const removeAttachment = (index: number) => {
      setFormState(prev => ({ ...prev, attachments: prev.attachments?.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    if (task && isEditing) { // This means we are editing
        let comments = formState.comments || [];
        
        const addSystemComment = (content: string) => {
            comments = addComment({ comments }, { userId: currentUser.id, content, type: 'system' });
        };
        
        if (formState.title !== task.title) addSystemComment(`Title changed to "${formState.title}".`);
        if (formState.description !== task.description) addSystemComment('Description was updated.');
        if (formState.dueDate !== task.dueDate) addSystemComment(`Due date changed to ${new Date(formState.dueDate!).toLocaleDateString()}.`);
        if (formState.priority !== task.priority) addSystemComment(`Priority changed to ${formState.priority}.`);

        const oldAssignees = new Set(task.assigneeIds);
        const newAssignees = new Set(formState.assigneeIds);
        const added = (formState.assigneeIds || []).filter(id => !oldAssignees.has(id)).map(id => users.find(u => u.id === id)?.name).filter(Boolean);
        const removed = task.assigneeIds.filter(id => !newAssignees.has(id)).map(id => users.find(u => u.id === id)?.name).filter(Boolean);

        if (added.length > 0) addSystemComment(`Added assignees: ${added.join(', ')}.`);
        if (removed.length > 0) addSystemComment(`Removed assignees: ${removed.join(', ')}.`);
        
        onSave({ ...formState as Task, comments });

    } else {
        onSave(formState as Task);
    }
    onClose();
  };
  
  const handlePostComment = () => {
    if (!newComment.trim() || !task) return;
    const updatedTask = {
        ...task,
        comments: addComment(task, {
            userId: currentUser.id,
            content: newComment.trim(),
            type: 'user',
        }),
    };
    onSave(updatedTask);
    setFormState(updatedTask); // Update local form state to show new comment immediately
    setNewComment('');
  };

  const handleAssigneeCompletionToggle = () => {
    if (!task) return;
    const currentCompletedBy = task.completedBy || [];
    const isCompleted = currentCompletedBy.includes(currentUser.id);
    const newCompletedBy = isCompleted
        ? currentCompletedBy.filter(id => id !== currentUser.id)
        : [...currentCompletedBy, currentUser.id];
    
    let newStatus = task.status;
    if (task.assigneeIds.length > 1) {
        if (newCompletedBy.length === task.assigneeIds.length) {
            newStatus = Status.Done;
        } else if (newCompletedBy.length > 0) {
            newStatus = Status.InProgress;
        } else {
            // Revert to pending if no one has completed.
            newStatus = Status.Pending;
        }
    }

    const updatedTask = {
        ...task,
        completedBy: newCompletedBy,
        status: newStatus,
        ...(newStatus === Status.Done && { completedAt: new Date().toISOString() }),
        ...(newStatus !== Status.Done && { completedAt: undefined }),
        comments: addComment(task, {
            userId: currentUser.id,
            content: isCompleted ? 'marked their part as incomplete.' : 'marked their part as complete.',
            type: 'system',
        }),
    };

    onSave(updatedTask);
    setFormState(updatedTask); // update local state to reflect changes immediately
};


  const handleReactivateClick = () => {
      if(task && reactivateReason && newDueDate) {
          onReactivate(task.id, reactivateReason, new Date(newDueDate).toISOString());
          onClose();
      }
  }

  const handleStatusChangeForAssignee = (newStatus: Status) => {
    if (!task) return;

    if (newStatus === Status.Done) {
      const isBlocked = task.dependsOn.some(depId => {
        const dependency = allTasks.find(t => t.id === depId);
        return dependency && dependency.status !== Status.Done;
      });

      if (isBlocked) {
        alert('This task is blocked by another task. Please complete the dependency first.');
        return;
      }
    }

    const comments = addComment(task, {
        userId: currentUser.id,
        content: `Status changed from ${task.status} to ${newStatus}.`,
        type: 'system',
    });
    const updatedTask = {
        ...task,
        status: newStatus,
        comments,
        ...(newStatus === Status.Done && { completedAt: new Date().toISOString() }),
        ...(newStatus !== Status.Done && { completedAt: undefined }),
    };
    onSave(updatedTask);
    setFormState(updatedTask);
  };
  
  const handleAIAssist = async () => {
    if (!formState.title) {
        alert("Please provide a rough title first to give the AI some context.");
        return;
    }
    setIsAiLoading(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Fix: Simplified prompt, as responseSchema constrains the output to JSON.
        const prompt = `Based on the user's rough idea for a task title: "${formState.title}", generate a concise, professional task title and a detailed task description.`;
        
        // Fix: Use responseSchema for reliable JSON output as per guidelines
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    title: {
                      type: Type.STRING,
                      description: 'A concise and professional task title.'
                    },
                    description: {
                      type: Type.STRING,
                      description: 'A detailed task description.'
                    }
                  }
                }
            }
        });

        // Fix: Per guidelines, trim whitespace from the response before parsing JSON.
        const resultJson = JSON.parse(response.text.trim());

        setFormState(prev => ({
            ...prev,
            title: resultJson.title || prev.title,
            description: resultJson.description || prev.description,
        }));

    } catch (error) {
        console.error("AI Assistant Error:", error);
        alert("Failed to get suggestions from the AI Assistant. Please check the console for more details.");
    } finally {
        setIsAiLoading(false);
    }
  };

  const isReporter = task?.reporterId === currentUser.id;
  const isAssignee = task?.assigneeIds.includes(currentUser.id) ?? false;
  const canEdit = hasPermission(Permission.CanManageAllTasks) || isReporter;
  const canReactivate = hasPermission(Permission.CanManageAllTasks) || isReporter;

  const availableTasksForDependencies = allTasks.filter(t => t.id !== (task?.id || '') && t.parentTaskId === undefined);
  const isBlockedByDependencies = task && task.dependsOn.some(depId => {
    const dependency = allTasks.find(t => t.id === depId);
    return dependency && dependency.status !== Status.Done;
  });


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-base-100 dark:bg-dark-base-200 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-dark-base-300">
          <h2 className="text-xl font-bold">{task ? (isEditing ? 'Edit Task' : task.title) : 'Create New Task'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300">
            <XIcon className="w-6 h-6 text-base-content-secondary" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {isEditing ? (
            <>
              {/* Edit Form */}
              <div>
                <label className="block text-sm font-medium">Title</label>
                <div className="relative">
                    <input type="text" name="title" value={formState.title || ''} onChange={handleInputChange} className="mt-1 block w-full input-style pr-10" />
                     <button onClick={handleAIAssist} disabled={isAiLoading} className="absolute inset-y-0 right-0 top-1 flex items-center pr-3 text-brand-primary hover:text-brand-secondary disabled:text-gray-400" title="AI Assistant">
                        {isAiLoading ? <div className="w-5 h-5 border-2 border-slate-300 border-t-brand-primary rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5"/>}
                    </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea name="description" value={formState.description || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full input-style"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Assignees</label>
                   <div className="flex items-center gap-2 mt-1 mb-1">
                        <button onClick={() => setFormState(prev => ({...prev, assigneeIds: [currentUser.id]}))} className="px-2 py-1 text-xs bg-base-200 dark:bg-dark-base-300 rounded hover:bg-base-300 dark:hover:bg-dark-base-300/50">Assign to Me</button>
                        <button onClick={() => setFormState(prev => ({...prev, assigneeIds: users.map(u => u.id)}))} className="px-2 py-1 text-xs bg-base-200 dark:bg-dark-base-300 rounded hover:bg-base-300 dark:hover:bg-dark-base-300/50">Assign to All</button>
                    </div>
                  <select multiple name="assigneeIds" value={formState.assigneeIds} onChange={handleMultiSelectChange} className="block w-full input-style h-24">
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <select name="status" value={formState.status} onChange={handleInputChange} className="mt-1 block w-full input-style">
                    {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <label className="block text-sm font-medium mt-2">Priority</label>
                  <select name="priority" value={formState.priority} onChange={handleInputChange} className="mt-1 block w-full input-style">
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Due Date</label>
                    <input type="date" name="dueDate" value={formState.dueDate ? new Date(formState.dueDate).toISOString().split('T')[0] : ''} onChange={handleInputChange} className="mt-1 block w-full input-style" />
                </div>
                 <div>
                    <label className="block text-sm font-medium">Recurrence</label>
                    <select name="freq" value={formState.recurrence?.freq} onChange={handleRecurrenceChange} className="mt-1 block w-full input-style">
                        <option value="none">None</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                {formState.recurrence?.freq === 'weekly' && (
                    <div>
                        <label className="block text-sm font-medium">Day of the Week</label>
                        <select name="dayOfWeek" value={formState.recurrence?.dayOfWeek} onChange={handleRecurrenceChange} className="mt-1 block w-full input-style">
                           {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => <option key={i} value={i}>{day}</option>)}
                        </select>
                    </div>
                )}
                 {formState.recurrence?.freq === 'monthly' && (
                    <div>
                        <label className="block text-sm font-medium">Day of the Month</label>
                        <select name="dayOfMonth" value={formState.recurrence?.dayOfMonth} onChange={handleRecurrenceChange} className="mt-1 block w-full input-style">
                           {Array.from({length: 31}, (_, i) => i + 1).map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                    </div>
                )}
              </div>
                <div>
                     <label className="block text-sm font-medium">Blocked By (Dependencies)</label>
                     <select multiple name="dependsOn" value={formState.dependsOn} onChange={handleMultiSelectChange} className="mt-1 block w-full input-style h-24">
                       {availableTasksForDependencies.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                </div>
               <div>
                  <label className="block text-sm font-medium">Attachments</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-base-300 dark:border-dark-base-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                          <PaperClipIcon className="mx-auto h-12 w-12 text-base-content-secondary" />
                          <div className="flex text-sm text-base-content-secondary">
                              <label htmlFor="file-upload" className="relative cursor-pointer bg-base-100 dark:bg-dark-base-200 rounded-md font-medium text-brand-primary hover:text-brand-secondary focus-within:outline-none">
                                  <span>Upload files</span>
                                  <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                              </label>
                          </div>
                      </div>
                  </div>
                  {formState.attachments && formState.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                          {formState.attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between text-sm p-2 bg-base-200 dark:bg-dark-base-300/50 rounded">
                                  <span>{file.name}</span>
                                  <button onClick={() => removeAttachment(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            </>
          ) : (
            <>
              {/* View Details */}
              {isBlockedByDependencies && task?.status !== Status.Done && <div className="p-3 text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 rounded-lg flex items-center gap-2"><LinkIcon className="w-4 h-4"/>This task is currently blocked by another task.</div>}
              <p className="text-base-content-secondary dark:text-dark-base-content-secondary whitespace-pre-wrap">{formState?.description}</p>
              
              {(task && (task.assigneeIds.length > 1 || (task.dependsOn && task.dependsOn.length > 0))) && (
                    <div className="space-y-4 my-4 p-4 bg-base-200 dark:bg-dark-base-300/50 rounded-lg">
                        {task.assigneeIds.length > 1 && (
                            <div>
                                <h4 className="text-sm font-bold mb-2">Assignee Progress ({task.completedBy?.length || 0}/{task.assigneeIds.length})</h4>
                                <div className="w-full bg-base-300 rounded-full h-2.5 dark:bg-dark-base-300">
                                    <div className="bg-status-inprogress h-2.5 rounded-full" style={{ width: `${((task.completedBy?.length || 0) / task.assigneeIds.length) * 100}%` }}></div>
                                </div>
                                <div className="mt-2 text-sm space-y-1">
                                    {task.assigneeIds.map(id => {
                                        const user = users.find(u => u.id === id);
                                        if (!user) return null;
                                        const isComplete = task.completedBy?.includes(id);
                                        return (
                                            <div key={id} className="flex items-center p-1">
                                                {isComplete ? <CheckCircleIcon className="w-5 h-5 text-status-done mr-2 flex-shrink-0" /> : <div className="w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0"><div className="w-3.5 h-3.5 border-2 border-base-content-secondary rounded-full" /></div>}
                                                <span className={isComplete ? 'line-through text-base-content-secondary' : ''}>{user.name} ({user.role})</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        {task.dependsOn && task.dependsOn.length > 0 && (
                            <div className={task.assigneeIds.length > 1 ? 'pt-4 border-t border-base-300 dark:border-dark-base-300' : ''}>
                                <h4 className="text-sm font-bold mb-2">Dependency Progress ({allTasks.filter(t => task.dependsOn.includes(t.id) && t.status === Status.Done).length}/{task.dependsOn.length})</h4>
                                <div className="w-full bg-base-300 rounded-full h-2.5 dark:bg-dark-base-300">
                                    <div className="bg-status-blocked h-2.5 rounded-full" style={{ width: `${(allTasks.filter(t => task.dependsOn.includes(t.id) && t.status === Status.Done).length / task.dependsOn.length) * 100}%` }}></div>
                                </div>
                                <ul className="mt-2 text-sm space-y-1">
                                    {task.dependsOn.map(id => {
                                        const depTask = allTasks.find(t => t.id === id);
                                        const isComplete = depTask?.status === Status.Done;
                                        return (
                                            <li key={id} className="flex items-center">
                                                {isComplete ? <CheckCircleIcon className="w-4 h-4 text-status-done mr-2 flex-shrink-0" /> : <div className="w-3.5 h-3.5 border-2 border-base-content-secondary rounded-full mr-2 ml-px flex-shrink-0" />}
                                                <span className={isComplete ? 'line-through text-base-content-secondary' : ''}>{depTask?.title}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Assignees:</strong> {formState?.assigneeIds?.map(id => users.find(u => u.id === id)?.name).join(', ')}</div>
                <div><strong>Reporter:</strong> {users.find(u => u.id === formState?.reporterId)?.name}</div>
                <div>
                    <strong>Status:</strong>
                    {!isEditing && isAssignee && task?.assigneeIds.length === 1 && formState.status !== Status.Done ? (
                         <select 
                            value={formState.status}
                            onChange={(e) => handleStatusChangeForAssignee(e.target.value as Status)}
                            className="ml-2 p-1 text-sm border border-base-300 dark:border-dark-base-300 rounded bg-base-100 dark:bg-dark-base-300 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                         >
                            {Object.values(Status).filter(s => s !== Status.ToDo).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    ) : (
                        <span className="font-bold ml-2">{formState?.status}</span>
                    )}
                </div>
                <div><strong>Priority:</strong> <span className="font-bold">{formState?.priority}</span></div>
                 <div>
                    <strong>Due Date:</strong> {formState?.dueDate ? new Date(formState.dueDate).toLocaleDateString() : 'N/A'}
                 </div>
                 <div><strong>Created At:</strong> {formState?.createdAt ? new Date(formState.createdAt).toLocaleString() : 'N/A'}</div>
              </div>

                {isAssignee && task && task.assigneeIds.length > 1 && task.status !== Status.Done && (
                    <div className="mt-4">
                        <button 
                            onClick={handleAssigneeCompletionToggle}
                            className={`w-full px-4 py-2 font-semibold rounded-lg ${task.completedBy?.includes(currentUser.id) ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                        >
                            {task.completedBy?.includes(currentUser.id) ? 'Mark My Part as Incomplete' : 'Mark My Part as Complete'}
                        </button>
                    </div>
                )}

              {formState.attachments && formState.attachments.length > 0 && (
                  <div>
                      <h3 className="font-bold mt-4 mb-2">Attachments</h3>
                      <div className="space-y-2">
                          {formState.attachments.map((file, index) => (
                              <a key={index} href={file.url} download={file.name} className="flex items-center text-sm p-2 bg-base-200 dark:bg-dark-base-300/50 rounded hover:bg-base-300 dark:hover:bg-dark-base-300">
                                  <PaperClipIcon className="w-4 h-4 mr-2" /> {file.name}
                              </a>
                          ))}
                      </div>
                  </div>
              )}
              <div>
                <h3 className="font-bold mt-4 mb-2">Comments & Activity Log</h3>
                <div className="space-y-3 max-h-32 overflow-y-auto bg-base-200 dark:bg-dark-base-300/50 p-2 rounded mb-2">
                    {formState.comments?.length ? [...formState.comments].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(c => (
                        <div key={c.id} className="text-sm">
                            <p className={`${c.type === 'system' ? 'italic text-base-content-secondary' : ''}`}>
                                <span className="font-semibold">{users.find(u => u.id === c.userId)?.name}: </span>
                                <span>{c.content}</span>
                            </p>
                            <span className="block text-xs text-base-content-secondary dark:text-dark-base-content-secondary">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                    )) : <p className="text-xs text-base-content-secondary dark:text-dark-base-content-secondary text-center py-2">No comments yet.</p>}
                </div>
                <div className="flex items-start space-x-2">
                    <img src={currentUser.avatar} className="w-8 h-8 rounded-full" alt="Your avatar" />
                    <div className="flex-1">
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..." 
                            rows={2} 
                            className="w-full input-style text-sm"
                        />
                        <button onClick={handlePostComment} className="mt-2 px-3 py-1 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-secondary">Post Comment</button>
                    </div>
                </div>
              </div>
            </>
          )}

          {canReactivate && formState?.status === Status.Done && !isEditing && (
            <div className="pt-4 border-t dark:border-dark-base-300">
                {!showReactivate ? (
                    <button onClick={() => setShowReactivate(true)} className="w-full text-center px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600">Reactivate Task</button>
                ): (
                    <div className="space-y-2">
                         <h3 className="font-semibold">Reactivate Task</h3>
                         <textarea placeholder="Reason for reactivation..." value={reactivateReason} onChange={e => setReactivateReason(e.target.value)} className="w-full input-style" rows={2}></textarea>
                         <input type="date" placeholder="New due date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="w-full input-style"/>
                         <div className="flex gap-2">
                            <button onClick={handleReactivateClick} className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600">Confirm Reactivation</button>
                            <button onClick={() => setShowReactivate(false)} className="px-4 py-2 bg-base-200 dark:bg-dark-base-300 rounded-lg">Cancel</button>
                         </div>
                    </div>
                )}
            </div>
          )}
        </div>

        <div className="flex justify-end items-center p-4 border-t dark:border-dark-base-300 space-x-2">
            {task && !isEditing && canEdit && (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-base-200 dark:bg-dark-base-300 font-semibold rounded-lg hover:bg-base-300 dark:hover:bg-dark-base-300/50">Edit</button>
            )}
            {isEditing && (
                <button onClick={() => { if(task) { setIsEditing(false); setFormState(task); } else onClose(); }} className="px-4 py-2 bg-base-200 dark:bg-dark-base-300 font-semibold rounded-lg hover:bg-base-300 dark:hover:bg-dark-base-300/50">Cancel</button>
            )}
          <button onClick={isEditing ? handleSave : onClose} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary">
            {isEditing ? 'Save Changes' : 'Close'}
          </button>
        </div>
      </div>
       <style>{`
            .input-style {
                background-color: #fff;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                padding: 0.5rem 0.75rem;
                width: 100%;
                color: #111827;
            }
            .dark .input-style {
                background-color: #1f2937;
                border-color: #4b5563;
                color: #f9fafb;
            }
            .input-style:focus {
                outline: 2px solid transparent;
                outline-offset: 2px;
                border-color: #4f46e5;
                box-shadow: 0 0 0 1px #4f46e5;
            }
       `}</style>
    </div>
  );
};

export default TaskModal;
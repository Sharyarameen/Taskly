
import { User, Role, Department, Task, Priority, Status, CompanyResource, RolePermission, Permission, Conversation, TeamChatMessage } from './types';

// Mock data for the application.

// --- USERS ---
export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Faisal Khan', email: 'faisal@example.com', password: 'password', avatar: 'https://picsum.photos/seed/user-1/100', role: Role.Administrator, departmentId: 'dept-1', phone: '123-456-7890', createdAt: new Date('2023-01-10').toISOString(), forcePasswordChange: false },
  { id: 'user-2', name: 'Ali Raza', email: 'ali@example.com', password: 'password', avatar: 'https://picsum.photos/seed/user-2/100', role: Role.Manager, departmentId: 'dept-1', phone: '123-456-7891', createdAt: new Date('2023-01-11').toISOString(), forcePasswordChange: false },
  { id: 'user-3', name: 'Fatima Ahmed', email: 'fatima@example.com', password: 'password', avatar: 'https://picsum.photos/seed/user-3/100', role: Role.Employee, departmentId: 'dept-1', phone: '123-456-7892', createdAt: new Date('2023-01-12').toISOString(), forcePasswordChange: false },
  { id: 'user-4', name: 'Zainab Malik', email: 'zainab@example.com', password: 'password', avatar: 'https://picsum.photos/seed/user-4/100', role: Role.Manager, departmentId: 'dept-2', phone: '123-456-7893', createdAt: new Date('2023-02-01').toISOString(), forcePasswordChange: false },
  { id: 'user-5', name: 'Usman Tariq', email: 'usman@example.com', password: 'password', avatar: 'https://picsum.photos/seed/user-5/100', role: Role.Employee, departmentId: 'dept-2', phone: '123-456-7894', createdAt: new Date('2023-02-02').toISOString(), forcePasswordChange: true },
];

// --- DEPARTMENTS ---
export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Engineering' },
  { id: 'dept-2', name: 'Marketing' },
  { id: 'dept-3', name: 'Human Resources' },
];

// --- TASKS ---
export const MOCK_TASKS: Task[] = [
  { id: 'task-1', title: 'Deploy frontend application', description: 'Deploy the new React application to production servers.', reporterId: 'user-1', assigneeIds: ['user-2', 'user-3'], departmentId: 'dept-1', priority: Priority.Critical, status: Status.InProgress, dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date('2023-10-01').toISOString(), attachments: [], comments: [], viewedBy: ['user-1', 'user-2'], completedBy: ['user-2'], dependsOn: ['task-2'] },
  { id: 'task-2', title: 'Run final E2E tests', description: 'Complete all end-to-end tests before deployment.', reporterId: 'user-2', assigneeIds: ['user-3'], departmentId: 'dept-1', priority: Priority.High, status: Status.Done, dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date('2023-09-28').toISOString(), completedAt: new Date('2023-09-30').toISOString(), attachments: [], comments: [], viewedBy: ['user-1', 'user-2', 'user-3'], completedBy: ['user-3'], dependsOn: [] },
  { id: 'task-3', title: 'Design new marketing campaign', description: 'Create assets and copy for the Q4 marketing campaign.', reporterId: 'user-4', assigneeIds: ['user-5'], departmentId: 'dept-2', priority: Priority.High, status: Status.ToDo, dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date('2023-10-05').toISOString(), attachments: [], comments: [], viewedBy: [], dependsOn: [] },
  { id: 'task-4', title: 'Review Q3 performance reports', description: 'Analyze team performance and prepare a summary.', reporterId: 'user-1', assigneeIds: ['user-1'], departmentId: 'dept-1', priority: Priority.Medium, status: Status.Pending, dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date('2023-10-02').toISOString(), attachments: [], comments: [], viewedBy: [], dependsOn: [] },
  { id: 'task-5', title: 'Onboard new marketing intern', description: 'Prepare onboarding documents and schedule introduction meetings.', reporterId: 'user-4', assigneeIds: ['user-4'], departmentId: 'dept-2', priority: Priority.Low, status: Status.Done, dueDate: new Date('2023-09-20').toISOString(), createdAt: new Date('2023-09-15').toISOString(), completedAt: new Date('2023-09-18').toISOString(), attachments: [], comments: [], viewedBy: ['user-4'], completedBy: ['user-4'], dependsOn: [] },
  { id: 'task-6', title: 'Update company HR policies', description: 'Review and update the employee handbook.', reporterId: 'user-1', assigneeIds: ['user-1'], departmentId: 'dept-3', priority: Priority.Medium, status: Status.ToDo, dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date('2023-09-25').toISOString(), attachments: [], comments: [], viewedBy: [], dependsOn: [] },
];

// --- RESOURCES ---
export const MOCK_RESOURCES: CompanyResource[] = [
    { id: 'res-1', title: 'Company Website', description: 'Official company public website.', category: 'Company Links', type: 'link', content: 'https://example.com' },
    { id: 'res-2', title: 'LinkedIn Profile', description: 'Our official LinkedIn page.', category: 'Social Media', type: 'link', content: 'https://linkedin.com' },
    { id: 'res-3', title: 'Engineering Drive', description: 'Shared Google Drive for the engineering team.', category: 'Shared Drives', type: 'link', content: 'https://drive.google.com' },
    { id: 'res-4', title: 'Employee Handbook', description: 'Latest version of the company employee handbook.', category: 'HR Documents', type: 'document', content: '# Employee Handbook\n\nWelcome to Zenith!' },
];

// --- PERMISSIONS ---
export const MOCK_ROLE_PERMISSIONS: RolePermission[] = [
    { role: Role.Administrator, permissions: Object.values(Permission) },
    { role: Role.Manager, permissions: [Permission.CanManageUsers, Permission.CanManageAllTasks, Permission.CanViewReports, Permission.CanManageResources] },
    { role: Role.Employee, permissions: [] },
];

// --- TEAM CHAT ---
export const MOCK_CONVERSATIONS: Conversation[] = [
    { id: 'conv-1', name: 'Engineering Team', userIds: ['user-1', 'user-2', 'user-3'], isGroup: true },
    { id: 'conv-2', name: 'Marketing Team', userIds: ['user-4', 'user-5'], isGroup: true },
    { id: 'conv-3', name: 'Ali Raza', userIds: ['user-1', 'user-2'], isGroup: false },
    { id: 'conv-4', name: 'Zainab Malik', userIds: ['user-1', 'user-4'], isGroup: false },
];

export const MOCK_TEAM_CHAT_MESSAGES: TeamChatMessage[] = [
    { id: 'msg-1', userId: 'user-2', conversationId: 'conv-1', content: 'Hey team, how is the deployment prep going?', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'msg-2', userId: 'user-3', conversationId: 'conv-1', content: 'Tests are almost done! Looks good so far.', createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() },
    { id: 'msg-3', userId: 'user-1', conversationId: 'conv-1', content: 'Great work! Let\'s sync up at 3 PM.', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { id: 'msg-4', userId: 'user-4', conversationId: 'conv-2', content: 'I\'ve uploaded the new campaign assets to the drive.', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: 'msg-5', userId: 'user-1', conversationId: 'conv-3', content: 'Hey Ali, can you look at the Q3 report when you have a moment?', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
];

import { User, Department, Task, CompanyResource, Conversation, TeamChatMessage, Notification, Role, Priority, Status, ConversationType, RolePermission } from './types';
import { MOCK_ROLE_PERMISSIONS } from './constants';

const DB_KEY = 'zenith_task_manager_db';

// --- INITIAL MOCK DATA (used to seed the database on first load) ---

const MOCK_USERS: User[] = [
  {
    id: 'admin-001',
    name: 'Admin User',
    phone: '123-456-7890',
    email: 'admin@zenith.com',
    role: Role.Administrator,
    avatar: 'https://picsum.photos/seed/admin-001/100',
    departmentId: 'dept-exec',
    createdAt: new Date('2023-01-01T10:00:00Z').toISOString(),
  },
  {
    id: 'manager-001',
    name: 'Manager Mike',
    phone: '123-456-7891',
    email: 'manager@zenith.com',
    role: Role.Manager,
    avatar: 'https://picsum.photos/seed/manager-001/100',
    departmentId: 'dept-eng',
    createdAt: new Date('2023-01-10T11:00:00Z').toISOString(),
  },
  {
    id: 'employee-001',
    name: 'Employee Emma',
    phone: '123-456-7892',
    email: 'employee@zenith.com',
    role: Role.Employee,
    avatar: 'https://picsum.photos/seed/employee-001/100',
    departmentId: 'dept-eng',
    createdAt: new Date('2023-02-05T09:00:00Z').toISOString(),
  },
    {
    id: 'employee-002',
    name: 'Marketing Mark',
    phone: '123-456-7893',
    email: 'mark@zenith.com',
    role: Role.Employee,
    avatar: 'https://picsum.photos/seed/employee-002/100',
    departmentId: 'dept-mktg',
    createdAt: new Date('2023-03-15T14:00:00Z').toISOString(),
  },
];

const MOCK_DEPARTMENTS: Department[] = [
    { id: 'dept-exec', name: 'Executive' },
    { id: 'dept-eng', name: 'Engineering', managerId: 'manager-001' },
    { id: 'dept-mktg', name: 'Marketing' },
];

const now = new Date();
const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
};

const MOCK_TASKS: Task[] = [
    {
        id: 'task-1',
        title: 'Develop User Authentication',
        description: 'Implement login, signup, and password reset functionality using best practices.',
        reporterId: 'manager-001',
        assigneeIds: ['employee-001'],
        priority: Priority.Critical,
        status: Status.InProgress,
        startDate: addDays(now, -5),
        dueDate: addDays(now, 5),
        viewedBy: ['employee-001'],
        createdAt: addDays(now, -7),
        updatedAt: addDays(now, -1),
        departmentId: 'dept-eng',
        dependsOn: [],
        comments: [
            { id: 'c1-1', userId: 'manager-001', content: 'Let\'s get this done by EOW.', createdAt: addDays(now, -6), type: 'user' }
        ]
    },
    {
        id: 'task-2',
        title: 'Design Q3 Marketing Campaign',
        description: 'Brainstorm and create a proposal for the upcoming Q3 marketing campaign.',
        reporterId: 'admin-001',
        assigneeIds: ['employee-002'],
        priority: Priority.High,
        status: Status.ToDo,
        startDate: addDays(now, -2),
        dueDate: addDays(now, 10),
        viewedBy: [],
        createdAt: addDays(now, -2),
        updatedAt: addDays(now, -2),
        departmentId: 'dept-mktg',
        dependsOn: [],
    },
     {
        id: 'task-3',
        title: 'Fix Login Page CSS Bug',
        description: 'The login button is misaligned on mobile devices.',
        reporterId: 'employee-001',
        assigneeIds: ['employee-001'],
        priority: Priority.Medium,
        status: Status.Done,
        startDate: addDays(now, -10),
        dueDate: addDays(now, -8),
        completedAt: addDays(now, -8),
        viewedBy: ['employee-001'],
        createdAt: addDays(now, -10),
        updatedAt: addDays(now, -8),
        departmentId: 'dept-eng',
        dependsOn: [],
    },
     {
        id: 'task-4',
        title: 'Review Performance Metrics',
        description: 'Admin needs to review the team performance for the last month.',
        reporterId: 'admin-001',
        assigneeIds: ['admin-001'],
        priority: Priority.Low,
        status: Status.Pending,
        startDate: addDays(now, -1),
        dueDate: addDays(now, 2),
        viewedBy: ['admin-001'],
        createdAt: addDays(now, -1),
        updatedAt: addDays(now, -1),
        departmentId: 'dept-exec',
        dependsOn: ['task-3'],
    },
];

const MOCK_RESOURCES: CompanyResource[] = [
    {
        id: 'res-1',
        category: 'Company Links',
        type: 'link',
        title: 'Internal Wiki',
        description: 'Company knowledge base.',
        content: 'https://www.notion.so'
    },
     {
        id: 'res-2',
        category: 'HR Documents',
        type: 'document',
        title: 'Employee Handbook',
        description: 'Rules and guidelines for all employees.',
        content: '# Employee Handbook\n\n## Welcome\n\nWelcome to the team! We are excited to have you.'
    }
];

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'convo-1',
        type: ConversationType.DM,
        participantIds: ['admin-001', 'manager-001'],
        lastMessageAt: addDays(now, -1),
    },
    {
        id: 'convo-2',
        type: ConversationType.GROUP,
        name: 'Engineering Team',
        participantIds: ['manager-001', 'employee-001'],
        groupAvatar: 'https://picsum.photos/seed/convo-2/100',
        lastMessageAt: new Date().toISOString(),
    }
];

const MOCK_TEAM_CHAT_MESSAGES: TeamChatMessage[] = [
    {
        id: 'msg-1',
        conversationId: 'convo-1',
        senderId: 'admin-001',
        content: 'Hey Mike, how are the Q2 projections looking?',
        createdAt: addDays(now, -1)
    },
    {
        id: 'msg-2',
        conversationId: 'convo-2',
        senderId: 'manager-001',
        content: 'Team, let\'s sync up on the auth task.',
        createdAt: addDays(now, 0)
    },
     {
        id: 'msg-3',
        conversationId: 'convo-2',
        senderId: 'employee-001',
        content: 'Will do, I have a quick question about the token refresh logic.',
        createdAt: addDays(now, 0)
    }
];

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif-1',
        userId: 'employee-001',
        message: 'You\'ve been assigned a new task: "Develop User Authentication"',
        isRead: true,
        createdAt: addDays(now, -7),
        link: { type: 'task', id: 'task-1' }
    },
    {
        id: 'notif-2',
        userId: 'manager-001',
        message: 'New message from Admin User',
        isRead: false,
        createdAt: addDays(now, -1),
        link: { type: 'chat', id: 'convo-1' }
    }
];

// --- DATABASE SERVICE ---

interface DatabaseSchema {
    users: User[];
    departments: Department[];
    tasks: Task[];
    resources: CompanyResource[];
    conversations: Conversation[];
    teamChatMessages: TeamChatMessage[];
    notifications: Notification[];
    rolePermissions: RolePermission[];
}

class Database {
    private data: DatabaseSchema;
    private subscribers: (() => void)[] = [];

    constructor() {
        this.data = this.load();
    }

    private load(): DatabaseSchema {
        try {
            const storedData = localStorage.getItem(DB_KEY);
            if (storedData) {
                return JSON.parse(storedData);
            }
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
        }
        
        // If no stored data, initialize with mock data
        const initialData: DatabaseSchema = {
            users: MOCK_USERS,
            departments: MOCK_DEPARTMENTS,
            tasks: MOCK_TASKS,
            resources: MOCK_RESOURCES,
            conversations: MOCK_CONVERSATIONS,
            teamChatMessages: MOCK_TEAM_CHAT_MESSAGES,
            notifications: MOCK_NOTIFICATIONS,
            rolePermissions: MOCK_ROLE_PERMISSIONS,
        };
        this.save(initialData);
        return initialData;
    }

    private save(dataToSave: DatabaseSchema) {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(dataToSave));
            this.data = dataToSave;
            this.notifySubscribers();
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }

    subscribe(callback: () => void) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    private notifySubscribers() {
        this.subscribers.forEach(callback => callback());
    }

    // --- Public API ---

    getAllData = () => this.data;

    // --- Tasks ---
    saveTask = (task: Task | Omit<Task, 'id' | 'reporterId' | 'viewedBy'>, reporterId: string) => {
        if ('id' in task) {
            const updatedTask = { ...task, updatedAt: new Date().toISOString() };
            this.save({ ...this.data, tasks: this.data.tasks.map(t => t.id === updatedTask.id ? updatedTask : t) });
        } else {
            const newTask: Task = {
                ...task,
                id: `task-${Date.now()}`,
                reporterId: reporterId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                viewedBy: [],
                status: Status.ToDo,
            };
            this.save({ ...this.data, tasks: [newTask, ...this.data.tasks] });
        }
    }

    // --- Users ---
    saveUser = (user: User | Omit<User, 'id' | 'createdAt'>) => {
        if ('id' in user) {
            this.save({ ...this.data, users: this.data.users.map(u => u.id === user.id ? user : u) });
        } else {
            const newUserId = `user-${Date.now()}`;
            const newUser: User = {
                ...user,
                id: newUserId,
                createdAt: new Date().toISOString(),
                avatar: `https://picsum.photos/seed/${newUserId}/100`,
                forcePasswordChange: true,
            };
            this.save({ ...this.data, users: [newUser, ...this.data.users] });
        }
    }
    deleteUser = (userId: string) => {
        this.save({ ...this.data, users: this.data.users.filter(u => u.id !== userId) });
    }

    // --- Departments ---
    saveDepartment = (dept: Department | Omit<Department, 'id'>) => {
        if ('id' in dept) {
            this.save({ ...this.data, departments: this.data.departments.map(d => d.id === dept.id ? dept : d) });
        } else {
            const newDept: Department = { ...dept, id: `dept-${Date.now()}` };
            this.save({ ...this.data, departments: [...this.data.departments, newDept] });
        }
    }
    deleteDepartment = (deptId: string) => {
        const usersInDeptUpdated = this.data.users.map(u => u.departmentId === deptId ? { ...u, departmentId: '' } : u);
        const departmentsUpdated = this.data.departments.filter(d => d.id !== deptId);
        this.save({ ...this.data, users: usersInDeptUpdated, departments: departmentsUpdated });
    }

    // --- Resources ---
    saveResource = (resource: CompanyResource | Omit<CompanyResource, 'id'>) => {
        if ('id' in resource) {
            this.save({ ...this.data, resources: this.data.resources.map(r => r.id === resource.id ? resource : r) });
        } else {
            this.save({ ...this.data, resources: [{ ...resource, id: `res-${Date.now()}` } as CompanyResource, ...this.data.resources] });
        }
    }
    deleteResource = (resourceId: string) => {
        this.save({ ...this.data, resources: this.data.resources.filter(r => r.id !== resourceId) });
    }
    
    // --- Permissions ---
    saveRolePermissions = (permissions: RolePermission[]) => {
        this.save({ ...this.data, rolePermissions: permissions });
    }

    // --- Notifications ---
    addNotifications = (notifications: Notification[]) => {
        this.save({ ...this.data, notifications: [...this.data.notifications, ...notifications] });
    }

    markAllNotificationsAsRead = (userId: string) => {
        const updated = this.data.notifications.map(n => n.userId === userId ? { ...n, isRead: true } : n);
        this.save({ ...this.data, notifications: updated });
    }
    
    markNotificationAsRead = (notificationId: string) => {
        const updated = this.data.notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
        this.save({ ...this.data, notifications: updated });
    }

    // --- Chat ---
    createConversation = (participantIds: string[], currentUserId: string, groupName?: string): string => {
        if (participantIds.length === 1) { // DM
            const otherUserId = participantIds[0];
            const existing = this.data.conversations.find(c =>
                c.type === ConversationType.DM &&
                c.participantIds.length === 2 &&
                c.participantIds.includes(currentUserId) &&
                c.participantIds.includes(otherUserId)
            );
            if (existing) return existing.id;
        }

        const newConvoId = `convo-${Date.now()}`;
        const newConversation: Conversation = {
            id: newConvoId,
            type: participantIds.length > 1 ? ConversationType.GROUP : ConversationType.DM,
            participantIds: [...participantIds, currentUserId],
            name: groupName,
            groupAvatar: participantIds.length > 1 ? `https://picsum.photos/seed/group-${Date.now()}/100` : undefined,
            lastMessageAt: new Date().toISOString(),
        };
        this.save({ ...this.data, conversations: [newConversation, ...this.data.conversations] });
        return newConvoId;
    }

    addTeamMessage = (conversationId: string, senderId: string, content: string) => {
        const newMessage: TeamChatMessage = {
            id: `msg-${Date.now()}`,
            conversationId,
            senderId,
            content,
            createdAt: new Date().toISOString(),
        };
        const updatedConversations = this.data.conversations.map(c => c.id === conversationId ? { ...c, lastMessageAt: new Date().toISOString() } : c);
        
        this.save({ 
            ...this.data, 
            teamChatMessages: [...this.data.teamChatMessages, newMessage],
            conversations: updatedConversations
        });
    }
}

export const db = new Database();

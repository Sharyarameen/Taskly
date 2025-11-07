import { User, Department, Task, CompanyResource, Conversation, TeamChatMessage, Notification, Role, Priority, Status, ConversationType } from './types';

export const MOCK_USERS: User[] = [
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

export const MOCK_DEPARTMENTS: Department[] = [
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

export const MOCK_TASKS: Task[] = [
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

export const MOCK_RESOURCES: CompanyResource[] = [
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

export const MOCK_CONVERSATIONS: Conversation[] = [
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

export const MOCK_TEAM_CHAT_MESSAGES: TeamChatMessage[] = [
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

export const MOCK_NOTIFICATIONS: Notification[] = [
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

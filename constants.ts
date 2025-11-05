import { User, Department, Task, Role, Priority, Status, CompanyResource, RolePermission, Permission, Conversation, ConversationType, TeamChatMessage } from './types';

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Engineering', managerId: 'user-2' },
  { id: 'dept-2', name: 'Sales' },
  { id: 'dept-3', name: 'Marketing' },
];

export const MOCK_ROLE_PERMISSIONS: RolePermission[] = [
    {
        role: Role.Administrator,
        permissions: [
            Permission.CanManageUsers,
            Permission.CanManageDepartments,
            Permission.CanManageAllTasks,
            Permission.CanViewReports,
            Permission.CanManageResources,
            Permission.CanManagePermissions,
        ]
    },
    {
        role: Role.Manager,
        permissions: [
            Permission.CanManageAllTasks,
            Permission.CanViewReports,
            Permission.CanManageResources,
        ]
    },
    {
        role: Role.Employee,
        permissions: []
    }
];

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Ali (Super Admin)', phone: '+923400000001', password: 'password', email: 'ali@example.com', role: Role.Administrator, avatar: 'https://picsum.photos/seed/user-1/100', departmentId: 'dept-1', createdAt: '2023-01-01T10:00:00Z', forcePasswordChange: false },
  { id: 'user-2', name: 'Sara (Manager)', phone: '+923400000002', password: 'password', email: 'sara@example.com', role: Role.Manager, avatar: 'https://picsum.photos/seed/user-2/100', departmentId: 'dept-1', createdAt: '2023-01-02T11:00:00Z', forcePasswordChange: false },
  { id: 'user-3', name: 'Faisal (Employee)', phone: '+923400000003', password: 'password', email: 'faisal@example.com', role: Role.Employee, avatar: 'https://picsum.photos/seed/user-3/100', departmentId: 'dept-1', createdAt: '2023-01-03T12:00:00Z', forcePasswordChange: false },
  { id: 'user-4', name: 'Ayesha (Employee)', phone: '+923400000004', password: 'password', email: 'ayesha@example.com', role: Role.Employee, avatar: 'https://picsum.photos/seed/user-4/100', departmentId: 'dept-2', createdAt: '2023-01-04T13:00:00Z', forcePasswordChange: false },
  { id: 'user-5', name: 'Bilal (Employee)', phone: '+923400000005', password: 'password', email: 'bilal@example.com', role: Role.Employee, avatar: 'https://picsum.photos/seed/user-5/100', departmentId: 'dept-3', createdAt: '2023-01-05T14:00:00Z', forcePasswordChange: false },
  { id: 'user-6', name: 'Anas (Super Admin)', phone: '+923400000006', password: 'password', email: 'anas@smashxpk.com', role: Role.Administrator, avatar: 'https://picsum.photos/seed/user-6/100', departmentId: 'dept-1', createdAt: '2023-01-06T15:00:00Z', forcePasswordChange: false },
  { id: 'user-7', name: 'Aman (Employee)', phone: '+923400000007', password: 'password', email: 'aman@example.com', role: Role.Employee, avatar: 'https://picsum.photos/seed/user-7/100', departmentId: 'dept-2', createdAt: '2023-01-07T16:00:00Z', forcePasswordChange: false },
  { id: 'user-bot', name: 'Zenith Assistant', phone: '', email: 'bot@zenith.com', role: Role.Administrator, avatar: '/zenith-assistant-avatar.svg', departmentId: 'dept-1', createdAt: '2023-01-01T00:00:00Z' },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);

const aMonthAgo = new Date();
aMonthAgo.setMonth(today.getMonth() - 1);

const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const lastMonday = new Date(today);
lastMonday.setDate(today.getDate() - (today.getDay() + 6) % 7);
lastMonday.setHours(17,0,0,0);

const mondayBeforeLast = new Date(lastMonday);
mondayBeforeLast.setDate(lastMonday.getDate() - 7);


export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Deploy frontend to production',
    description: 'Finalize the deployment process for the new React application.',
    reporterId: 'user-2',
    assigneeIds: ['user-3'],
    priority: Priority.Critical,
    status: Status.Pending,
    startDate: twoDaysAgo.toISOString(),
    dueDate: today.toISOString(),
    tags: ['deployment', 'frontend'],
    departmentId: 'dept-1',
    createdAt: twoDaysAgo.toISOString(),
    updatedAt: yesterday.toISOString(),
    viewedBy: ['user-3'],
    comments: [
        {id: 'c-1', userId: 'user-3', content: 'Almost done, just running final checks.', createdAt: yesterday.toISOString(), type: 'user' }
    ],
    dependsOn: ['task-4', 'task-2'],
  },
  {
    id: 'task-2',
    title: 'Prepare weekly sales report',
    description: 'Collect sales data and prepare a comprehensive report for the weekly meeting.',
    reporterId: 'user-2',
    assigneeIds: ['user-4'],
    priority: Priority.High,
    status: Status.ToDo,
    startDate: yesterday.toISOString(),
    dueDate: tomorrow.toISOString(),
    tags: ['sales', 'reporting'],
    departmentId: 'dept-2',
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
    viewedBy: [],
    dependsOn: [],
  },
  {
    id: 'task-3',
    title: 'Design new marketing campaign',
    description: 'Brainstorm and design visuals for the upcoming Q4 marketing campaign.',
    reporterId: 'user-1',
    assigneeIds: ['user-5', 'user-2'],
    priority: Priority.Medium,
    status: Status.InProgress,
    startDate: today.toISOString(),
    dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['marketing', 'design'],
    departmentId: 'dept-3',
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
    viewedBy: [],
    completedBy: ['user-2'],
    dependsOn: [],
  },
  {
    id: 'task-4',
    title: 'Fix login button bug',
    description: 'The login button is not responsive on mobile devices.',
    reporterId: 'user-3',
    assigneeIds: ['user-3'],
    priority: Priority.High,
    status: Status.Done,
    startDate: twoDaysAgo.toISOString(),
    dueDate: yesterday.toISOString(),
    completedAt: yesterday.toISOString(),
    tags: ['bug', 'frontend'],
    departmentId: 'dept-1',
    createdAt: twoDaysAgo.toISOString(),
    updatedAt: yesterday.toISOString(),
    viewedBy: ['user-3'],
    comments: [
        {id: 'c-2', userId: 'user-3', content: 'Fixed and deployed.', createdAt: yesterday.toISOString(), type: 'user'}
    ],
    dependsOn: [],
  },
  {
    id: 'task-5',
    title: 'Setup new employee workstation',
    description: 'Prepare the desk and computer for the new hire starting next week.',
    reporterId: 'user-2',
    assigneeIds: ['user-2'],
    priority: Priority.Low,
    status: Status.Done,
    startDate: twoDaysAgo.toISOString(),
    dueDate: yesterday.toISOString(),
    completedAt: yesterday.toISOString(),
    tags: ['hr', 'onboarding'],
    departmentId: 'dept-1',
    createdAt: twoDaysAgo.toISOString(),
    updatedAt: yesterday.toISOString(),
    viewedBy: ['user-2'],
    dependsOn: [],
  },
   {
    id: 'task-6-recurring-parent',
    title: 'Weekly Standup Report',
    description: 'Submit weekly progress report before the Monday standup meeting.',
    reporterId: 'user-2',
    assigneeIds: ['user-3'],
    priority: Priority.Medium,
    status: Status.ToDo,
    startDate: aMonthAgo.toISOString(),
    dueDate: new Date(new Date(aMonthAgo).setDate(aMonthAgo.getDate() + 1)).toISOString(),
    recurrence: { freq: 'weekly', interval: 1, dayOfWeek: 1 }, // 1 for Monday
    tags: ['reporting', 'weekly'],
    departmentId: 'dept-1',
    createdAt: aMonthAgo.toISOString(),
    updatedAt: aMonthAgo.toISOString(),
    viewedBy: [],
    dependsOn: [],
  },
  {
    id: 'task-6-instance-1',
    parentTaskId: 'task-6-recurring-parent',
    title: 'Weekly Standup Report',
    description: 'Submit weekly progress report before the Monday standup meeting.',
    reporterId: 'user-2',
    assigneeIds: ['user-3'],
    priority: Priority.Medium,
    status: Status.Done,
    startDate: mondayBeforeLast.toISOString(),
    dueDate: mondayBeforeLast.toISOString(),
    completedAt: mondayBeforeLast.toISOString(),
    tags: ['reporting', 'weekly'],
    departmentId: 'dept-1',
    createdAt: mondayBeforeLast.toISOString(),
    updatedAt: mondayBeforeLast.toISOString(),
    viewedBy: ['user-3'],
    dependsOn: [],
  },
  {
    id: 'task-6-instance-2',
    parentTaskId: 'task-6-recurring-parent',
    title: 'Weekly Standup Report',
    description: 'Submit weekly progress report before the Monday standup meeting.',
    reporterId: 'user-2',
    assigneeIds: ['user-3'],
    priority: Priority.Medium,
    status: Status.Pending,
    startDate: lastMonday.toISOString(),
    dueDate: lastMonday.toISOString(),
    tags: ['reporting', 'weekly'],
    departmentId: 'dept-1',
    createdAt: lastMonday.toISOString(),
    updatedAt: lastMonday.toISOString(),
    viewedBy: ['user-3'],
    dependsOn: [],
  },
  {
    id: 'task-7',
    title: 'Client Follow-up Call',
    description: 'Call Acme Corp to discuss project updates.',
    reporterId: 'user-2',
    assigneeIds: ['user-4', 'user-7'],
    priority: Priority.High,
    status: Status.ToDo,
    startDate: today.toISOString(),
    dueDate: today.toISOString(),
    tags: ['client', 'sales'],
    departmentId: 'dept-2',
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
    viewedBy: [],
    dependsOn: [],
  },
  {
    id: 'task-8-recurring-daily-parent',
    title: 'Daily Team Check-in',
    description: 'Post a brief summary of your daily progress and any blockers.',
    reporterId: 'user-2',
    assigneeIds: ['user-3'],
    priority: Priority.Low,
    status: Status.ToDo,
    startDate: aMonthAgo.toISOString(),
    dueDate: aMonthAgo.toISOString(),
    recurrence: { freq: 'daily', interval: 1 },
    tags: ['daily', 'check-in'],
    departmentId: 'dept-1',
    createdAt: aMonthAgo.toISOString(),
    updatedAt: aMonthAgo.toISOString(),
    viewedBy: [],
    dependsOn: [],
  },
  {
    id: 'task-8-instance-1',
    parentTaskId: 'task-8-recurring-daily-parent',
    title: 'Daily Team Check-in',
    description: 'Post a brief summary of your daily progress and any blockers.',
    reporterId: 'user-2',
    assigneeIds: ['user-3'],
    priority: Priority.Low,
    status: Status.Done,
    startDate: yesterday.toISOString(),
    dueDate: yesterday.toISOString(),
    completedAt: yesterday.toISOString(),
    tags: ['daily', 'check-in'],
    departmentId: 'dept-1',
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
    viewedBy: ['user-3'],
    dependsOn: [],
  },
  {
    id: 'task-9-recurring-monthly-parent',
    title: 'Generate Monthly Expense Report',
    description: 'Compile all expenses for the month and submit the report to accounting.',
    reporterId: 'user-1',
    assigneeIds: ['user-2'],
    priority: Priority.High,
    status: Status.ToDo,
    startDate: aMonthAgo.toISOString(),
    dueDate: new Date(aMonthAgo.getFullYear(), aMonthAgo.getMonth(), 5).toISOString(),
    recurrence: { freq: 'monthly', interval: 1, dayOfMonth: 1 },
    tags: ['monthly', 'finance'],
    departmentId: 'dept-1',
    createdAt: aMonthAgo.toISOString(),
    updatedAt: aMonthAgo.toISOString(),
    viewedBy: [],
    dependsOn: [],
  },
  {
    id: 'task-9-instance-1',
    parentTaskId: 'task-9-recurring-monthly-parent',
    title: 'Generate Monthly Expense Report',
    description: 'Compile all expenses for the month and submit the report to accounting.',
    reporterId: 'user-1',
    assigneeIds: ['user-2'],
    priority: Priority.High,
    status: Status.Pending,
    startDate: firstOfThisMonth.toISOString(),
    dueDate: new Date(firstOfThisMonth.getFullYear(), firstOfThisMonth.getMonth(), 5).toISOString(),
    tags: ['monthly', 'finance'],
    departmentId: 'dept-1',
    createdAt: firstOfThisMonth.toISOString(),
    updatedAt: firstOfThisMonth.toISOString(),
    viewedBy: ['user-2'],
    dependsOn: [],
  }
];

export const MOCK_RESOURCES: CompanyResource[] = [
  {
    id: 'res-1',
    category: 'Company Links',
    type: 'link',
    title: 'Zenith Official Website',
    description: 'Our public-facing company website.',
    content: 'https://example.com/zenith',
  },
  {
    id: 'res-2',
    category: 'Social Media',
    type: 'link',
    title: 'LinkedIn Profile',
    description: 'Follow us on LinkedIn for company updates.',
    content: 'https://linkedin.com/company/zenith-task',
  },
  {
    id: 'res-3',
    category: 'Shared Drives',
    type: 'link',
    title: 'Marketing Assets Drive',
    description: 'Shared Google Drive for all marketing materials.',
    content: 'https://drive.google.com/drive/folders/example',
  },
  {
    id: 'res-4',
    category: 'HR Documents',
    type: 'document',
    title: 'Employee Handbook',
    description: 'Company policies, procedures, and benefits information.',
    content: '# Employee Handbook\n\n## Section 1: Welcome\n\nWelcome to Zenith! We are excited to have you on our team.\n\n## Section 2: Code of Conduct\n\nAll employees are expected to maintain a high standard of professionalism...',
  },
  {
    id: 'res-5',
    category: 'HR Documents',
    type: 'document',
    title: 'Remote Work Policy',
    description: 'Guidelines for working effectively from a remote location.',
    content: '# Remote Work Policy\n\nThis document outlines the expectations for remote employees at Zenith.',
  },
];


export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'convo-1',
        type: ConversationType.GROUP,
        name: 'General',
        groupAvatar: 'https://picsum.photos/seed/group-1/100',
        participantIds: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6', 'user-7'],
        lastMessageAt: new Date(new Date().setHours(new Date().getHours() - 1)).toISOString(),
    },
    {
        id: 'convo-2',
        type: ConversationType.DM,
        participantIds: ['user-2', 'user-3'], // Sara and Faisal
        lastMessageAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    },
    {
        id: 'convo-3',
        type: ConversationType.DM,
        participantIds: ['user-7', 'user-bot'], // Aman and Bot
        lastMessageAt: new Date(new Date().setMinutes(new Date().getMinutes() - 30)).toISOString(),
    }
];

export const MOCK_TEAM_CHAT_MESSAGES: TeamChatMessage[] = [
    { id: 'msg-1', conversationId: 'convo-2', senderId: 'user-2', content: 'Hey Faisal, have you had a chance to look at the deployment script?', createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
    { id: 'msg-2', conversationId: 'convo-2', senderId: 'user-3', content: "Yep, I'm on it. Just running some final checks before pushing.", createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
    { id: 'msg-3', conversationId: 'convo-1', senderId: 'user-4', content: "Morning team!", createdAt: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString() },
    { id: 'msg-4', conversationId: 'convo-3', senderId: 'user-bot', content: "Hello Aman! I'm here to help you stay productive. You can ask me to summarize your tasks, suggest priorities, or brainstorm ideas.", createdAt: new Date(new Date().setMinutes(new Date().getMinutes() - 29)).toISOString() },
    { id: 'msg-5', conversationId: 'convo-3', senderId: 'user-7', content: "Awesome! Can you list my top 3 priority tasks for today?", createdAt: new Date(new Date().setMinutes(new Date().getMinutes() - 28)).toISOString() },
    { id: 'msg-6', conversationId: 'convo-3', senderId: 'user-bot', content: "Of course! Based on due dates and priority levels, your top tasks are: \n- **Client Follow-up Call** (High)\n- **Design new marketing campaign** (Medium)\n- **Prepare weekly sales report** (High, but due tomorrow)", createdAt: new Date(new Date().setMinutes(new Date().getMinutes() - 27)).toISOString() },
];

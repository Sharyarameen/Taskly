export enum Role {
  Administrator = 'Administrator',
  Manager = 'Manager',
  Employee = 'Employee',
}

export enum Permission {
    CanManageUsers = 'CanManageUsers',
    CanManageDepartments = 'CanManageDepartments',
    CanManageAllTasks = 'CanManageAllTasks',
    CanViewReports = 'CanViewReports',
    CanManageResources = 'CanManageResources',
    CanManagePermissions = 'CanManagePermissions',
}

export interface RolePermission {
    role: Role;
    permissions: Permission[];
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum Status {
  ToDo = 'To Do',
  Pending = 'Pending',
  InProgress = 'In Progress',
  Done = 'Done',
}

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string; // Should not be sent to client in real app
  email: string;
  role: Role;
  avatar: string;
  departmentId: string;
  createdAt: string;
  forcePasswordChange?: boolean;
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
}

export interface Comment {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    type?: 'user' | 'system';
}

export interface RecurrenceRule {
    freq: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    dayOfWeek?: number; // 0 (Sun) to 6 (Sat)
    dayOfMonth?: number; // 1 to 31
    endDate?: string;
}

export interface Attachment {
    name: string;
    type: string;
    size: number;
    url: string; // base64 data URL
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reporterId: string;
  assigneeIds: string[];
  priority: Priority;
  status: Status;
  startDate: string;
  dueDate: string;
  recurrence?: RecurrenceRule;
  parentTaskId?: string; // For recurring instances
  tags?: string[];
  comments?: Comment[];
  attachments?: Attachment[];
  completedBy?: string[]; // List of user IDs who have completed their part
  viewedBy: string[]; // List of user IDs who have viewed the task
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  departmentId: string;
  dependsOn: string[]; // Tasks that must be completed before this one
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: {
      type: 'task' | 'chat';
      id: string; // taskId or conversationId
  };
}

export interface CompanyResource {
  id: string;
  category: 'Company Links' | 'Social Media' | 'Shared Drives' | 'HR Documents';
  type: 'link' | 'document';
  title: string;
  description: string;
  content: string; // URL for link, Markdown for document
}

// --- New Chat Types ---
export enum ConversationType {
    DM = 'dm',
    GROUP = 'group'
}

export interface Conversation {
    id: string;
    type: ConversationType;
    participantIds: string[];
    name?: string; // For groups
    groupAvatar?: string; // For groups
    lastMessageAt: string;
    unreadCount?: { [userId: string]: number };
}

export interface TeamChatMessage {
    id: string;
    conversationId: string;
    senderId: string; // 'user-bot' for system messages
    content: string;
    createdAt: string;
}

export enum Role {
  Administrator = 'Administrator',
  Manager = 'Manager',
  Employee = 'Employee',
}

export enum Permission {
  CanManageUsers = 'can-manage-users',
  CanManageDepartments = 'can-manage-departments',
  CanManageAllTasks = 'can-manage-all-tasks',
  CanViewReports = 'can-view-reports',
  CanManageResources = 'can-manage-resources',
  CanManagePermissions = 'can-manage-permissions',
}

export interface RolePermission {
  role: Role;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be passed to client, but needed for mock data
  avatar: string;
  role: Role;
  departmentId: string;
  phone: string;
  createdAt: string;
  forcePasswordChange: boolean;
}

export interface Department {
  id: string;
  name: string;
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

export interface RecurrenceRule {
    freq: 'none' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    dayOfWeek?: number; // 0 for Sunday, 1 for Monday...
    dayOfMonth?: number; // 1-31
}

export interface Attachment {
  name: string;
  type: string;
  size: number;
  url: string; // base64 or a real URL
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  type: 'user' | 'system';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  reporterId: string;
  assigneeIds: string[];
  departmentId?: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  attachments: Attachment[];
  comments: Comment[];
  viewedBy: string[];
  completedBy?: string[];
  dependsOn: string[];
  recurrence?: RecurrenceRule;
  parentTaskId?: string; // To link recurring instances to a parent template
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: {
    type: 'task' | 'chat';
    id: string;
  };
}

export interface CompanyResource {
    id: string;
    title: string;
    description: string;
    category: 'Company Links' | 'Social Media' | 'Shared Drives' | 'HR Documents';
    type: 'link' | 'document';
    content: string; // URL for link, markdown for document
}

export interface Conversation {
  id: string;
  name: string;
  userIds: string[];
  isGroup: boolean;
}

export interface TeamChatMessage {
  id: string;
  userId: string;
  conversationId: string;
  content: string;
  createdAt: string;
}


import { User, Role, Department, Task, Priority, Status, CompanyResource, RolePermission, Permission, Conversation, TeamChatMessage } from './types';

// Mock data has been cleared.
// The role permissions below are used to seed the initial configuration for a new app instance.

export const MOCK_USERS: User[] = [];

export const MOCK_DEPARTMENTS: Department[] = [];

export const MOCK_TASKS: Task[] = [];

export const MOCK_RESOURCES: CompanyResource[] = [];

export const MOCK_CONVERSATIONS: Conversation[] = [];

export const MOCK_TEAM_CHAT_MESSAGES: TeamChatMessage[] = [];


// --- PERMISSIONS ---
// This is default configuration, not demo data. It's seeded by the installer.
export const MOCK_ROLE_PERMISSIONS: RolePermission[] = [
    { role: Role.Administrator, permissions: Object.values(Permission) },
    { role: Role.Manager, permissions: [Permission.CanManageUsers, Permission.CanManageAllTasks, Permission.CanViewReports, Permission.CanManageResources] },
    { role: Role.Employee, permissions: [] },
];

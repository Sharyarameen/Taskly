import { Role, Permission, RolePermission } from './types';

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

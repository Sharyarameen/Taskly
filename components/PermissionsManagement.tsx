import React, { useState, useEffect } from 'react';
import { Role, Permission, RolePermission } from '../types';

interface PermissionsManagementProps {
  rolePermissions: RolePermission[];
  onSave: (updatedPermissions: RolePermission[]) => void;
}

const allPermissions = Object.values(Permission);
const permissionLabels: Record<Permission, string> = {
    [Permission.CanManageUsers]: 'Manage Users',
    [Permission.CanManageDepartments]: 'Manage Departments',
    [Permission.CanManageAllTasks]: 'Manage All Tasks',
    [Permission.CanViewReports]: 'View Reports',
    [Permission.CanManageResources]: 'Manage Resources',
    [Permission.CanManagePermissions]: 'Manage Permissions',
};

const PermissionsManagement: React.FC<PermissionsManagementProps> = ({ rolePermissions, onSave }) => {
  const [localPermissions, setLocalPermissions] = useState<RolePermission[]>(rolePermissions);

  useEffect(() => {
    setLocalPermissions(rolePermissions);
  }, [rolePermissions]);

  const handlePermissionChange = (role: Role, permission: Permission, checked: boolean) => {
    setLocalPermissions(prev =>
      prev.map(rp => {
        if (rp.role === role) {
          const newPermissions = checked
            ? [...rp.permissions, permission]
            : rp.permissions.filter(p => p !== permission);
          return { ...rp, permissions: newPermissions };
        }
        return rp;
      })
    );
  };

  const handleSaveChanges = () => {
    onSave(localPermissions);
    alert('Permissions updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-base-100 dark:bg-dark-base-200 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Role Permissions</h2>
        <p className="text-sm text-base-content-secondary dark:text-dark-base-content-secondary mb-6">
            Define what users with different roles can do. Administrators have all permissions by default.
        </p>
        <div className="space-y-8">
          {localPermissions.filter(rp => rp.role !== Role.Administrator).map(({ role, permissions }) => (
            <div key={role} className="border-t dark:border-dark-base-300 pt-6">
              <h3 className="text-lg font-semibold text-base-content dark:text-dark-base-content">{role}</h3>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {allPermissions.map(p => (
                  <label key={p} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                      checked={permissions.includes(p)}
                      onChange={e => handlePermissionChange(role, p, e.target.checked)}
                    />
                    <span className="text-sm font-medium text-base-content dark:text-dark-base-content">{permissionLabels[p]}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSaveChanges}
          className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default PermissionsManagement;

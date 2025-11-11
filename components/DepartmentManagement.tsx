import React, { useState, useCallback, useEffect } from 'react';
import { Department, User, Role, RolePermission, Permission } from '../types';
import { PlusIcon, TrashIcon, PencilIcon } from './icons/SolidIcons';
import PermissionsManagement from './PermissionsManagement';

interface OrganizationProps {
  departments: Department[];
  users: User[];
  onUserSave: (user: User | Omit<User, 'id' | 'createdAt'>) => void;
  onUserDelete: (userId: string) => void;
  onDepartmentSave: (dept: Department | Omit<Department, 'id'>) => void;
  onDepartmentDelete: (deptId: string) => void;
  currentUser: User;
  rolePermissions: RolePermission[];
  onUpdateRolePermissions: (updatedPermissions: RolePermission[]) => void;
}

const Organization: React.FC<OrganizationProps> = ({ 
  departments, users, onUserSave, onUserDelete, onDepartmentSave, onDepartmentDelete, 
  currentUser, rolePermissions, onUpdateRolePermissions 
}) => {
  const [activeTab, setActiveTab] = useState('users');

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (currentUser.role === Role.Administrator) return true;
    const userRolePerms = rolePermissions.find(rp => rp.role === currentUser.role);
    return userRolePerms?.permissions.includes(permission) ?? false;
  }, [currentUser.role, rolePermissions]);

  const canManagePermissions = hasPermission(Permission.CanManagePermissions);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold text-base-content dark:text-dark-base-content mb-6">Organization Management</h1>
      <div className="mb-4 border-b border-base-300 dark:border-dark-base-300">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-base-content-secondary hover:text-base-content hover:border-base-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`${
              activeTab === 'departments'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-base-content-secondary hover:text-base-content hover:border-base-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Departments
          </button>
          {canManagePermissions && (
             <button
                onClick={() => setActiveTab('permissions')}
                className={`${
                activeTab === 'permissions'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-base-content-secondary hover:text-base-content hover:border-base-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
                Permissions
            </button>
          )}
        </nav>
      </div>
      <div>
        {activeTab === 'users' && <UserManagement users={users} onSaveUser={onUserSave} onDeleteUser={onUserDelete} departments={departments} canManage={hasPermission(Permission.CanManageUsers)} />}
        {activeTab === 'departments' && <DepartmentManagement departments={departments} onSaveDepartment={onDepartmentSave} onDeleteDepartment={onDepartmentDelete} users={users} canManage={hasPermission(Permission.CanManageDepartments)} />}
        {activeTab === 'permissions' && canManagePermissions && <PermissionsManagement rolePermissions={rolePermissions} onSave={onUpdateRolePermissions} />}
      </div>
    </div>
  );
};

// --- User Management ---
const UserManagement = ({ users, onSaveUser, onDeleteUser, departments, canManage }: { users: User[], onSaveUser: OrganizationProps['onUserSave'], onDeleteUser: OrganizationProps['onUserDelete'], departments: Department[], canManage: boolean }) => {
    
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleAddUser = () => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = (user: User | Omit<User, 'id' | 'createdAt'>) => {
        onSaveUser(user);
        setIsUserModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                 {canManage && <button onClick={handleAddUser} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary">
                    <PlusIcon className="w-5 h-5" /> Add User
                </button>}
            </div>
            <div className="bg-base-100 dark:bg-dark-base-200 shadow-md rounded-lg overflow-x-auto">
                 <table className="min-w-full divide-y divide-base-200 dark:divide-dark-base-300">
                    <thead className="bg-base-200/50 dark:bg-dark-base-300/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-base-content-secondary dark:text-dark-base-content-secondary uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-base-content-secondary dark:text-dark-base-content-secondary uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-base-content-secondary dark:text-dark-base-content-secondary uppercase">Department</th>
                            {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-base-content-secondary dark:text-dark-base-content-secondary uppercase">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-base-100 dark:bg-dark-base-200 divide-y divide-base-200 dark:divide-dark-base-300">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium">{user.name}</div>
                                            <div className="text-sm text-base-content-secondary dark:text-dark-base-content-secondary">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{departments.find(d => d.id === user.departmentId)?.name || 'N/A'}</td>
                                {canManage && <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEditUser(user)} className="text-brand-primary hover:text-brand-secondary p-1"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDeleteUser(user.id)} className="text-red-600 hover:text-red-800 p-1 ml-2"><TrashIcon className="w-5 h-5"/></button>
                                </td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isUserModalOpen && <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} user={editingUser} onSave={handleSaveUser} departments={departments} />}
        </div>
    )
}

// --- Department Management ---
const DepartmentManagement = ({ departments, onSaveDepartment, onDeleteDepartment, users, canManage }: { departments: Department[], onSaveDepartment: OrganizationProps['onDepartmentSave'], onDeleteDepartment: OrganizationProps['onDepartmentDelete'], users: User[], canManage: boolean }) => {
  const [newDeptName, setNewDeptName] = useState('');
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingDeptName, setEditingDeptName] = useState('');

  const handleAddDepartment = () => {
    if (newDeptName.trim()) {
      onSaveDepartment({ name: newDeptName.trim() });
      setNewDeptName('');
    }
  };

  const handleUpdateDepartment = (id: string) => {
    onSaveDepartment({ id, name: editingDeptName.trim() });
    setEditingDeptId(null);
  };

   return (
    <div className="space-y-6">
      {canManage && <div className="bg-base-100 dark:bg-dark-base-200 shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Department</h2>
        <div className="flex gap-2">
          <input
            type="text" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="Department Name"
            className="flex-grow px-3 py-2 border border-base-300 dark:border-dark-base-300 rounded-md bg-base-100 dark:bg-dark-base-300 focus:outline-none focus:ring-brand-primary"
          />
          <button onClick={handleAddDepartment} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary">
            <PlusIcon className="w-5 h-5" /> Add
          </button>
        </div>
      </div>}
      {departments.map(dept => (
        <div key={dept.id} className="bg-base-100 dark:bg-dark-base-200 shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            {editingDeptId === dept.id ? (
              <input type="text" value={editingDeptName} onChange={(e) => setEditingDeptName(e.target.value)} className="text-xl font-bold px-2 py-1 border rounded-md bg-base-100 dark:bg-dark-base-300"/>
            ) : <h2 className="text-xl font-bold">{dept.name}</h2>}
            {canManage && <div className="flex gap-2">
              {editingDeptId === dept.id ? (
                <>
                  <button onClick={() => handleUpdateDepartment(dept.id)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Save</button>
                  <button onClick={() => setEditingDeptId(null)} className="px-3 py-1 bg-slate-500 text-white rounded hover:bg-slate-600">Cancel</button>
                </>
              ) : <button onClick={() => { setEditingDeptId(dept.id); setEditingDeptName(dept.name); }} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>}
              <button onClick={() => onDeleteDepartment(dept.id)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600"><TrashIcon className="w-4 h-4" /></button>
            </div>}
          </div>
          <h3 className="font-semibold mb-2 text-sm text-base-content-secondary dark:text-dark-base-content-secondary">Members ({users.filter(u => u.departmentId === dept.id).length})</h3>
          <ul className="divide-y divide-base-200 dark:divide-dark-base-300">
              {users.filter(u => u.departmentId === dept.id).map(user => (
                  <li key={user.id} className="flex items-center py-3">
                      <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                      <div className="ml-3"><p className="text-sm font-medium">{user.name}</p><p className="text-sm text-base-content-secondary dark:text-dark-base-content-secondary">{user.email}</p></div>
                  </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};


// --- User Modal ---
const UserModal = ({ isOpen, onClose, user, onSave, departments }: { isOpen: boolean, onClose: () => void, user: User | null, onSave: (user: User | Omit<User, 'id' | 'createdAt'>) => void, departments: Department[] }) => {
    const [formState, setFormState] = useState<Partial<User>>(user || { name: '', email: '', phone: '', role: Role.Employee, departmentId: ''});
    
    useEffect(() => {
        setFormState(user || { name: '', email: '', phone: '', role: Role.Employee, departmentId: '' });
    }, [user, isOpen]);

    const handleSave = () => {
        if (!formState.name || !formState.email) {
            alert('Name and Email are required.');
            return;
        }
        onSave(formState as User);
    }
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-base-100 dark:bg-dark-base-200 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-base-300">
                    <h2 className="text-xl font-bold">{user ? 'Edit User' : 'Add New User'}</h2>
                    <button onClick={onClose}>&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-base-content-secondary dark:text-dark-base-content-secondary bg-base-200 dark:bg-dark-base-300 p-3 rounded-md">
                        {user ? 'Editing user details.' : 'To add a new user, first create their login account in the Firebase Authentication console, then add their details here using the same email.'}
                    </p>
                    <div>
                        <label className="block text-sm font-medium">Full Name</label>
                        <input type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="mt-1 block w-full input-style" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input type="email" value={formState.email} disabled={!!user} onChange={e => setFormState({...formState, email: e.target.value})} className="mt-1 block w-full input-style disabled:opacity-50" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Phone</label>
                        <input type="tel" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} className="mt-1 block w-full input-style" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">Role</label>
                            <select value={formState.role} onChange={e => setFormState({...formState, role: e.target.value as Role})} className="mt-1 block w-full input-style">
                                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Department</label>
                            <select value={formState.departmentId} onChange={e => setFormState({...formState, departmentId: e.target.value})} className="mt-1 block w-full input-style">
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t dark:border-dark-base-300 space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-base-200 dark:bg-dark-base-300 font-semibold rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg">Save</button>
                </div>
                 <style>{`
                    .input-style {
                        background-color: #fff;
                        border: 1px solid #d1d5db;
                        border-radius: 0.375rem;
                        padding: 0.5rem 0.75rem;
                        width: 100%;
                    }
                    .dark .input-style {
                        background-color: #1f2937;
                        border-color: #4b5563;
                        color: #f9fafb;
                    }
                `}</style>
          </div>
        </div>
    )
}


export default Organization;
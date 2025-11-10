import React, { useState, useMemo, useCallback } from 'react';
import { CompanyResource, User, Role, RolePermission, Permission } from '../types';
import Widget from './Widget';
import { PlusIcon, TrashIcon, PencilIcon } from './icons/SolidIcons';
import { XIcon } from './icons/OutlineIcons';

// Resource Modal sub-component
const ResourceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: CompanyResource | Omit<CompanyResource, 'id'>) => void;
  resource: CompanyResource | null;
}> = ({ isOpen, onClose, onSave, resource }) => {
  const [formState, setFormState] = useState<Partial<CompanyResource>>(
    resource || {
      title: '',
      description: '',
      category: 'Company Links',
      type: 'link',
      content: '',
    }
  );

  if (!isOpen) return null;

  const handleSave = () => {
    // Basic validation
    if (!formState.title || !formState.content) {
      alert('Title and Content (URL or document text) are required.');
      return;
    }
    onSave(formState as CompanyResource);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-base-100 dark:bg-dark-base-200 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b dark:border-dark-base-300">
          <h2 className="text-xl font-bold">{resource ? 'Edit Resource' : 'Add New Resource'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300"><XIcon className="w-6 h-6"/></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input type="text" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} className="mt-1 block w-full input-style" />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} className="mt-1 block w-full input-style" rows={3}></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Category</label>
              <select value={formState.category} onChange={e => setFormState({...formState, category: e.target.value as CompanyResource['category']})} className="mt-1 block w-full input-style">
                <option>Company Links</option>
                <option>Social Media</option>
                <option>Shared Drives</option>
                <option>HR Documents</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Type</label>
              <select value={formState.type} onChange={e => setFormState({...formState, type: e.target.value as CompanyResource['type']})} className="mt-1 block w-full input-style">
                <option value="link">Link</option>
                <option value="document">Document</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">{formState.type === 'link' ? 'URL' : 'Content (Markdown)'}</label>
            <textarea value={formState.content} onChange={e => setFormState({...formState, content: e.target.value})} className="mt-1 block w-full input-style font-mono" rows={formState.type === 'link' ? 1 : 10}></textarea>
          </div>
        </div>
        <div className="flex justify-end p-4 border-t dark:border-dark-base-300 space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-base-200 dark:bg-dark-base-300 font-semibold rounded-lg">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg">Save</button>
        </div>
        <style>{`.input-style { background-color: #fff; border: 1px solid #d1d5db; border-radius: 0.375rem; padding: 0.5rem 0.75rem; width: 100%; color: #111827; } .dark .input-style { background-color: #1f2937; border-color: #4b5563; color: #f9fafb; }`}</style>
      </div>
    </div>
  );
};

// Main Resources component
interface ResourcesProps {
  currentUser: User;
  resources: CompanyResource[];
  onSave: (resource: CompanyResource | Omit<CompanyResource, 'id'>) => void;
  onDelete: (resourceId: string) => void;
  rolePermissions: RolePermission[];
}

const Resources: React.FC<ResourcesProps> = ({ currentUser, resources, onSave, onDelete, rolePermissions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<CompanyResource | null>(null);
  const [viewingDocument, setViewingDocument] = useState<CompanyResource | null>(null);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (currentUser.role === Role.Administrator) return true;
    const userRolePerms = rolePermissions.find(rp => rp.role === currentUser.role);
    return userRolePerms?.permissions.includes(permission) ?? false;
  }, [currentUser.role, rolePermissions]);

  const canManage = hasPermission(Permission.CanManageResources);

  const groupedResources = useMemo(() => {
    return resources.reduce((acc, resource) => {
      (acc[resource.category] = acc[resource.category] || []).push(resource);
      return acc;
    }, {} as Record<string, CompanyResource[]>);
  }, [resources]);

  const handleAddResource = () => {
    setEditingResource(null);
    setIsModalOpen(true);
  };
  
  const handleEditResource = (resource: CompanyResource) => {
    setEditingResource(resource);
    setIsModalOpen(true);
  };

  const handleDeleteResource = (resourceId: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      onDelete(resourceId);
    }
  };
  
  const parseMarkdown = (text: string) => {
    text = text.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>');
    text = text.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: text.replace(/\n/g, '<br />') };
  };

  if (viewingDocument) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <button onClick={() => setViewingDocument(null)} className="mb-4 px-4 py-2 bg-base-200 dark:bg-dark-base-200 rounded-lg hover:bg-base-300 dark:hover:bg-dark-base-300">
          &larr; Back to Resources
        </button>
        <Widget title={viewingDocument.title}>
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={parseMarkdown(viewingDocument.content)}></div>
        </Widget>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-base-content dark:text-dark-base-content">Company Resources</h1>
        {canManage && (
          <button onClick={handleAddResource} className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary">
            <PlusIcon className="w-5 h-5" /> Add Resource
          </button>
        )}
      </div>

      <div className="space-y-8">
        {Object.entries(groupedResources).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold mb-4 border-b-2 border-brand-primary pb-2">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(items as CompanyResource[]).map(item => (
                <div key={item.id} className="bg-base-100 dark:bg-dark-base-200 rounded-lg shadow-md p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-sm text-base-content-secondary dark:text-dark-base-content-secondary mt-1">{item.description}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    {item.type === 'link' ? (
                      <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-primary hover:underline">
                        Open Link &rarr;
                      </a>
                    ) : (
                      <button onClick={() => setViewingDocument(item)} className="text-sm font-semibold text-brand-primary hover:underline">
                        View Document &rarr;
                      </button>
                    )}
                    {canManage && (
                      <div className="flex gap-2">
                        <button onClick={() => handleEditResource(item)} className="text-blue-500 hover:text-blue-700"><PencilIcon className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteResource(item.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && <ResourceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} resource={editingResource} onSave={onSave} />}
    </div>
  );
};

export default Resources;
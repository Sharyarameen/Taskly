import React, { useState } from 'react';
import { User } from '../types';
import { LogoIcon } from './icons/LogoIcon';

interface ForcePasswordChangeModalProps {
  currentUser: User;
  onPasswordChanged: (userId: string, newPassword: string) => void;
}

const ForcePasswordChangeModal: React.FC<ForcePasswordChangeModalProps> = ({ currentUser, onPasswordChanged }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    onPasswordChanged(currentUser.id, newPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 dark:bg-dark-base-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-base-100 dark:bg-dark-base-200 p-10 rounded-xl shadow-lg">
        <div>
          <div className="mx-auto h-12 w-auto text-brand-primary">
            <LogoIcon />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content dark:text-dark-base-content">
            Welcome to Zenith, {currentUser.name.split(' ')[0]}!
          </h2>
          <p className="mt-2 text-center text-sm text-base-content-secondary dark:text-dark-base-content-secondary">
            For your security, please create a new password to continue.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="new-password-input" className="sr-only">New Password</label>
              <input
                id="new-password-input"
                name="new-password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-base-300 dark:border-dark-base-300 placeholder-base-content-secondary text-base-content dark:text-dark-base-content bg-base-100 dark:bg-dark-base-300 rounded-t-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password-input" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password-input"
                name="confirm-password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-base-300 dark:border-dark-base-300 placeholder-base-content-secondary text-base-content dark:text-dark-base-content bg-base-100 dark:bg-dark-base-300 rounded-b-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            >
              Set Password and Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForcePasswordChangeModal;
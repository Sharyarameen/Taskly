import React, { useState } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { MOCK_ROLE_PERMISSIONS } from '../constants';
import { db } from '../firebaseConfig';
import { writeBatch, doc } from 'firebase/firestore';
import { XIcon, InformationCircleIcon } from './icons/OutlineIcons';

interface InstallerProps {
    onClose: () => void;
}

const Installer: React.FC<InstallerProps> = ({ onClose }) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingSuccess, setSeedingSuccess] = useState(false);
  const [seedingError, setSeedingError] = useState<string | null>(null);

  const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // WARNING: These rules are for development only.
    // They allow any authenticated user to read and write all data.
    // Secure your data before deploying to production!
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rules);
    alert('Rules copied to clipboard!');
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedingError(null);
    setSeedingSuccess(false);

    try {
      const batch = writeBatch(db);

      // Seed only the essential configuration data
      MOCK_ROLE_PERMISSIONS.forEach(item => batch.set(doc(db, 'role_permissions', item.role), item));
      batch.set(doc(db, 'settings', 'app'), { appName: 'Zenith Task Manager', logoUrl: '' });

      await batch.commit();
      setSeedingSuccess(true);
    } catch (error: any)
      {
      console.error("Database seeding failed:", { code: error.code, message: error.message });
      setSeedingError(`Seeding failed: ${error.message}. This could be a permission issue. Please ensure you have completed Step 3 correctly.`);
    } finally {
      setIsSeeding(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-base-100 dark:bg-dark-base-200 p-8 rounded-xl shadow-2xl relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-base-200 dark:hover:bg-dark-base-300 z-10">
            <XIcon className="w-6 h-6"/>
        </button>
        <div className="text-center mb-8">
            <LogoIcon className="w-12 h-12 mx-auto text-brand-primary mb-2" />
          <h1 className="text-3xl font-bold text-base-content dark:text-dark-base-content">Setup Guide</h1>
          <p className="text-base-content-secondary dark:text-dark-base-content-secondary mt-2">
            It looks like some setup is needed to get the app running smoothly. Please follow the steps below.
          </p>
        </div>

        <div className="space-y-6 overflow-y-auto pr-4 -mr-4">
            <div className="mb-4 p-3 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg border border-blue-200 dark:border-blue-800/50 flex items-start">
                <InformationCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"/>
                <div>
                    If you see this guide on your live website, it usually means your Firebase project is not correctly set up for your domain. Please carefully review all steps below, especially <strong>Step 2 (Authorize Domain)</strong> and <strong>Step 3 (Database Rules)</strong>.
                </div>
            </div>
            {/* Step 1: Authentication */}
            <div className="p-6 bg-base-200/50 dark:bg-dark-base-300/30 rounded-lg">
                <h2 className="text-xl font-semibold flex items-center">
                    <span className="bg-brand-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3">1</span>
                    Enable Authentication & Add First User
                </h2>
                <p className="mt-2 text-sm text-base-content-secondary dark:text-dark-base-content-secondary">
                    To log in, you must enable the Email/Password sign-in method and create your first user account. This user will automatically become the Administrator.
                </p>
                <ol className="list-decimal list-inside mt-4 space-y-2 text-sm">
                    <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline">Firebase Console</a>.</li>
                    <li>Navigate to <strong>Authentication</strong> &rarr; <strong>Sign-in method</strong> tab.</li>
                    <li>Click on "Email/Password" and enable it.</li>
                    <li>Go to the <strong>Users</strong> tab and click "Add user" to create your own account.</li>
                </ol>
            </div>

            {/* Step 2: Authorize Domain */}
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-800/50">
                <h2 className="text-xl font-semibold flex items-center text-yellow-800 dark:text-yellow-200">
                    <span className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3">2</span>
                    Authorize Your Domain (Very Important!)
                </h2>
                <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    Since you are using a custom domain (`taskly.kitabistaninternational.com`), you **must** tell Firebase that it's allowed to connect.
                </p>
                <ol className="list-decimal list-inside mt-4 space-y-2 text-sm">
                    <li>In your Firebase Console, navigate to <strong>Authentication</strong> &rarr; <strong>Settings</strong> tab.</li>
                    <li>Under the "Authorized domains" section, click <strong>Add domain</strong>.</li>
                    <li>Enter your domain: <code className="bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded">kitabistaninternational.com</code> and click "Add".</li>
                    <li className="font-bold">Note: Only add the main domain, not the `taskly.` part.</li>
                </ol>
            </div>

            {/* Step 3: Firestore Rules */}
             <div className="p-6 bg-base-200/50 dark:bg-dark-base-300/30 rounded-lg">
                <h2 className="text-xl font-semibold flex items-center">
                    <span className="bg-brand-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3">3</span>
                    Set Up Database Permissions
                </h2>
                <p className="mt-2 text-sm text-base-content-secondary dark:text-dark-base-content-secondary">
                    Your app might be blocked from reading data due to restrictive security rules. For development, you can use the rules below to allow access for any logged-in user.
                </p>
                <ol className="list-decimal list-inside mt-4 space-y-2 text-sm">
                    <li>In your Firebase Console, navigate to <strong>Firestore Database</strong> &rarr; <strong>Rules</strong> tab.</li>
                    <li>Replace the entire content with the code below and click "Publish".</li>
                </ol>
                <div className="mt-3 relative bg-base-100 dark:bg-dark-base-200 rounded">
                    <button onClick={handleCopy} className="absolute top-2 right-2 px-2 py-1 text-xs bg-base-300 dark:bg-dark-base-300 rounded hover:bg-base-200 dark:hover:bg-dark-base-100">Copy</button>
                    <pre className="p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto"><code>{rules}</code></pre>
                </div>
                <p className="mt-2 text-xs text-orange-500"><strong>Warning:</strong> These rules are for development only and are not secure for a production environment.</p>
            </div>

            {/* Step 4: Seed Configuration */}
            <div className="p-6 bg-base-200/50 dark:bg-dark-base-300/30 rounded-lg">
                <h2 className="text-xl font-semibold flex items-center">
                    <span className="bg-brand-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3">4</span>
                    Seed Initial Configuration
                </h2>
                <p className="mt-2 text-sm text-base-content-secondary dark:text-dark-base-content-secondary">
                    Your database needs some essential starting configuration (like default roles and permissions). Click the button below to add it.
                </p>
                <div className="mt-4">
                    <button
                        onClick={handleSeedData}
                        disabled={isSeeding || seedingSuccess}
                        className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSeeding ? 'Seeding...' : seedingSuccess ? 'Configuration Seeded!' : 'Seed Configuration'}
                    </button>
                    {seedingSuccess && <p className="text-green-600 text-sm mt-2">Success! Your app has its initial configuration.</p>}
                    {seedingError && <p className="text-red-500 text-sm mt-2">{seedingError}</p>}
                </div>
            </div>
        </div>

        <div className="mt-8 text-center pt-6 border-t dark:border-dark-base-300">
            <p className="text-base-content-secondary dark:text-dark-base-content-secondary mb-4">
                Once all steps are complete, close this guide and reload the application.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-brand-primary text-white font-bold rounded-lg text-lg hover:bg-brand-secondary transition-all shadow-xl transform hover:scale-105"
            >
                Reload Application
            </button>
        </div>
      </div>
    </div>
  );
};

export default Installer;
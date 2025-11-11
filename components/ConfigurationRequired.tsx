import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

const ConfigurationRequired: React.FC = () => {

    return (
        <div className="fixed inset-0 bg-slate-900 z-[200] flex items-center justify-center p-4 text-white">
            <div className="max-w-4xl w-full bg-slate-800 p-8 rounded-xl shadow-2xl relative max-h-[90vh] flex flex-col border border-yellow-500">
                <div className="text-center mb-8">
                    <LogoIcon className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
                    <h1 className="text-3xl font-bold text-yellow-400">Action Required: Configure Environment Variables</h1>
                    <p className="text-slate-300 mt-2">
                        Your deployed app isn't connected to Firebase. Please add your Firebase keys as Environment Variables in your hosting provider's settings (e.g., Vercel).
                    </p>
                </div>

                <div className="space-y-6 overflow-y-auto pr-4 -mr-4 text-left">
                    <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                        <p className="font-bold">CRITICAL:</p>
                        <p className="text-sm">Pasting your keys directly into the `firebaseConfig.ts` file is **insecure** and **will not work** on a deployed platform like Vercel. You <span className="font-bold underline">MUST</span> use Environment Variables as described below.</p>
                    </div>

                    <div className="p-6 bg-slate-700/50 rounded-lg">
                        <h2 className="text-xl font-semibold flex items-center">
                             <span className="bg-yellow-500 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3">1</span>
                            Get Your Firebase Keys
                        </h2>
                         <ol className="list-decimal list-inside mt-4 space-y-2 text-sm">
                            <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Firebase Console</a>.</li>
                            <li>Go to <strong>Project settings</strong> (⚙️ icon) &rarr; <strong>General</strong> tab.</li>
                            <li>Under "Your apps", find your web app and look for the `firebaseConfig` object. Keep these values ready to copy.</li>
                        </ol>
                    </div>
                     <div className="p-6 bg-slate-700/50 rounded-lg">
                        <h2 className="text-xl font-semibold flex items-center">
                            <span className="bg-yellow-500 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3">2</span>
                           Add Environment Variables to Your Hosting Provider
                        </h2>
                         <ol className="list-decimal list-inside mt-4 space-y-2 text-sm">
                            <li>Go to your project on your hosting provider (e.g., <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Vercel</a>).</li>
                            <li>Find the <strong>Settings</strong> tab, then click on <strong>Environment Variables</strong>.</li>
                            <li>Create a new variable for each key from your `firebaseConfig` object. The names MUST match exactly.</li>
                        </ol>
                        <div className="mt-4 p-4 bg-slate-900 rounded-lg text-sm font-mono">
                            <p><span className="text-red-400">FIREBASE_API_KEY</span>="your-api-key-from-firebase"</p>
                            <p><span className="text-red-400">FIREBASE_AUTH_DOMAIN</span>="your-auth-domain-from-firebase"</p>
                            <p><span className="text-red-400">FIREBASE_PROJECT_ID</span>="your-project-id-from-firebase"</p>
                            <p><span className="text-red-400">FIREBASE_STORAGE_BUCKET</span>="your-storage-bucket-from-firebase"</p>
                            <p><span className="text-red-400">FIREBASE_MESSAGING_SENDER_ID</span>="your-sender-id-from-firebase"</p>
                            <p><span className="text-red-400">FIREBASE_APP_ID</span>="your-app-id-from-firebase"</p>
                        </div>
                         <ol start={4} className="list-decimal list-inside mt-4 space-y-2 text-sm">
                            <li>After adding all variables, you must <strong>redeploy</strong> your project to apply the changes.</li>
                             <li>In Vercel, go to the <strong>Deployments</strong> tab, find the latest deployment, click the menu (...) and select <strong>Redeploy</strong>.</li>
                        </ol>
                    </div>
                </div>

                <div className="mt-8 text-center pt-6 border-t border-slate-700">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-yellow-500 text-slate-900 font-bold rounded-lg text-lg hover:bg-yellow-400 transition-all shadow-xl transform hover:scale-105"
                    >
                        Reload Application
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfigurationRequired;
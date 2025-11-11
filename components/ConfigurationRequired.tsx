import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

const ConfigurationRequired: React.FC = () => {
    const configExample = `const firebaseConfig = {
  apiKey: "aiZasYc...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:12345:web:abcdef123"
};`;

    return (
        <div className="fixed inset-0 bg-slate-900 z-[200] flex items-center justify-center p-4 text-white">
            <div className="max-w-4xl w-full bg-slate-800 p-8 rounded-xl shadow-2xl relative max-h-[90vh] flex flex-col border border-yellow-500">
                <div className="text-center mb-8">
                    <LogoIcon className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
                    <h1 className="text-3xl font-bold text-yellow-400">Action Required: Connect to Firebase</h1>
                    <p className="text-slate-300 mt-2">
                        Your application cannot start because it's not connected to your Firebase project.
                    </p>
                </div>

                <div className="space-y-6 overflow-y-auto pr-4 -mr-4 text-left">
                    <div className="p-6 bg-slate-700/50 rounded-lg">
                        <h2 className="text-xl font-semibold flex items-center">
                            <span className="bg-yellow-500 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3">!</span>
                            Update Your `firebaseConfig.ts` File
                        </h2>
                        <p className="mt-2 text-sm text-slate-300">
                            This is the most important step. The app needs your project's specific connection details to function.
                        </p>
                        <ol className="list-decimal list-inside mt-4 space-y-2 text-sm">
                            <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Firebase Console</a> and select your project.</li>
                            <li>Click the gear icon (Project settings) in the top left sidebar.</li>
                            <li>In the "Your apps" card, find your web app.</li>
                            <li>Look for the <strong>SDK setup and configuration</strong> section and select the "Config" option.</li>
                            <li>You will see an object named `firebaseConfig`. Copy this entire object.</li>
                        </ol>
                        <div className="mt-3 relative bg-slate-900 rounded">
                            <pre className="p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto"><code>{configExample}</code></pre>
                        </div>
                         <ol start={6} className="list-decimal list-inside mt-4 space-y-2 text-sm">
                            <li>Open the `firebaseConfig.ts` file in your code editor.</li>
                            <li>Delete the existing placeholder content and paste the configuration you just copied from your Firebase project.</li>
                            <li>Save the file.</li>
                        </ol>
                    </div>
                </div>

                <div className="mt-8 text-center pt-6 border-t border-slate-700">
                     <p className="text-slate-400 mb-4">
                        After updating the file, click the button below to restart the app.
                    </p>
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

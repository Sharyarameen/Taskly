import React, { useState } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { CheckCircleIcon } from './icons/OutlineIcons';

const Installer = () => {
  const [step, setStep] = useState<'welcome' | 'installing' | 'complete'>('welcome');
  const [log, setLog] = useState<string[]>([]);

  const installationSteps = [
    { message: 'Connecting to database...', delay: 500 },
    { message: 'Creating `users` table...', delay: 800 },
    { message: 'Creating `departments` table...', delay: 800 },
    { message: 'Creating `tasks` table...', delay: 800 },
    { message: 'Creating `resources` table...', delay: 800 },
    { message: 'Seeding initial admin user...', delay: 1000 },
    { message: 'Finalizing installation...', delay: 1200 },
  ];

  const startInstallation = async () => {
    setStep('installing');
    let currentLog: string[] = [];
    for (const installStep of installationSteps) {
      await new Promise(resolve => setTimeout(resolve, installStep.delay));
      currentLog = [...currentLog, `[SUCCESS] ${installStep.message}`];
      setLog(currentLog);
    }
    setStep('complete');
  };

  const goToLogin = () => {
    window.location.pathname = '/';
  };

  const renderContent = () => {
    switch (step) {
      case 'installing':
        return (
          <>
            <h2 className="text-2xl font-bold text-center">Installation in Progress</h2>
            <p className="text-center text-gray-400 mb-6">Please do not close this window.</p>
            <div className="w-full bg-slate-800 rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto ring-1 ring-slate-700">
              {log.map((line, index) => (
                <p key={index} className="text-green-400 animate-fadeInUp" style={{animationDelay: `${index * 50}ms`}}>{line}</p>
              ))}
              <div className="flex items-center text-gray-400 animate-pulse mt-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Executing...</span>
              </div>
            </div>
          </>
        );
      case 'complete':
        return (
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Installation Complete!</h2>
            <p className="text-gray-400 mt-2 mb-6">Your application database has been successfully set up.</p>
            <button
              onClick={goToLogin}
              className="w-full bg-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg"
            >
              Go to Login Page
            </button>
          </div>
        );
      case 'welcome':
      default:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Welcome to the Installer</h2>
            <p className="text-gray-400 mt-2 mb-6">This will set up the necessary database tables and seed initial data for your application.</p>
            <button
              onClick={startInstallation}
              className="w-full bg-indigo-600 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg"
            >
              Start Installation
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white" style={{background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)'}}>
      <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6 ring-1 ring-white/10">
        <div className="flex justify-center items-center gap-3">
          <LogoIcon className="h-10 w-10 text-indigo-400" />
          <h1 className="text-2xl font-bold">Zenith Task Manager</h1>
        </div>
        <div className="border-t border-white/10 my-6"></div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Installer;
import React, { useState } from 'react';
import { EnvelopeIcon, LockClosedIcon, ShieldCheckIcon, BriefcaseIcon, UserIcon, InformationCircleIcon } from './icons/OutlineIcons';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message:string }>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!email || !password) {
        setError('Please enter both email and password.');
        setIsLoading(false);
        return;
    }
    const result = await onLogin(email, password);
    if (!result.success) {
      setError(result.message || 'An unexpected error occurred. Please try a demo account.');
    }
    setIsLoading(false);
  };
  
  const handleDemoLogin = async (role: 'admin' | 'manager' | 'employee') => {
    setError('');
    setIsLoading(true);
    
    const demoCredentials = {
        admin: { email: 'admin@zenith.com', pass: 'password123' },
        manager: { email: 'manager@zenith.com', pass: 'password123' },
        employee: { email: 'employee@zenith.com', pass: 'password123' }
    };

    const { email, pass } = demoCredentials[role];
    
    setEmail(email);
    setPassword(pass);
    
    const result = await onLogin(email, pass);

    if (!result.success) {
        setError(result.message || `Demo login for ${role} failed.`);
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
        <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
        <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6 z-10 animate-fadeInUp">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                 <p className="mt-2 text-sm text-gray-600">Login to continue to your workspace.</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400"/>
                        </div>
                        <input
                          type="email"
                          required
                          className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 bg-gray-50 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-600">Password</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400"/>
                        </div>
                        <input
                          type="password"
                          required
                          className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 bg-gray-50 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="password123"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-start space-x-3 border border-red-200 dark:border-red-800/50">
                      <InformationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-200 whitespace-pre-wrap">{error}</p>
                  </div>
                )}

                <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white shadow-lg transition-all duration-300 ease-in-out disabled:opacity-50"
                      style={{ background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)' }}
                    >
                      {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'LOGIN'}
                    </button>
                </div>
            </form>
            
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">Or login as a demo user</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="space-y-3">
                <button onClick={() => handleDemoLogin('admin')} disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                    <ShieldCheckIcon className="w-5 h-5 text-red-500" /> Login as Administrator
                </button>
                 <button onClick={() => handleDemoLogin('manager')} disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                    <BriefcaseIcon className="w-5 h-5 text-blue-500" /> Login as Manager
                </button>
                 <button onClick={() => handleDemoLogin('employee')} disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                    <UserIcon className="w-5 h-5 text-green-500" /> Login as Employee
                </button>
            </div>

        </div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from './icons/OutlineIcons';

interface SignupProps {
  onSignUp: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  onNavigateToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignUp, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    const result = await onSignUp(name, email, password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100" style={{
        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
    }}>
        <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
        <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6 z-10 animate-fadeInUp">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">Create an Account</h2>
                <p className="mt-2 text-sm text-gray-600">Join and start organizing your tasks.</p>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400"/>
                        </div>
                        <input
                          type="text"
                          required
                          className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 bg-gray-50 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>
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
                          placeholder="Create a password (min. 6 characters)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-600">Confirm Password</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400"/>
                        </div>
                        <input
                          type="password"
                          required
                          className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 bg-gray-50 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                
                <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white shadow-lg transition-all duration-300 ease-in-out"
                      style={{ background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)' }}
                    >
                      SIGN UP
                    </button>
                </div>
            </form>

            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                <p>Already have an account?</p>
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }} className="font-medium text-purple-600 hover:text-purple-500">
                    LOGIN
                </a>
            </div>
        </div>
    </div>
  );
};

export default Signup;
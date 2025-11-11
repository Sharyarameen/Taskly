
import React, { useState } from 'react';
import { UserIcon, LockClosedIcon } from './icons/OutlineIcons';
import { GoogleIcon, FacebookIcon, TwitterIcon } from './icons/SocialIcons';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  appName: string;
  logoUrl: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, appName, logoUrl }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await onLogin(email, password);
    if (!result.success) {
      setError(result.message || 'An unknown error occurred. Please try again.');
    }
    setLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    alert("Google Login has not been configured for this project yet.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(160deg, #6b21a8 0%, #4f46e5 100%)' }}>
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 sm:p-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">Login</h1>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400"/>
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400"/>
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 text-sm text-red-800 rounded-lg bg-red-100 border border-red-300" role="alert">
              <div className="whitespace-pre-wrap font-medium">{error}</div>
            </div>
          )}
          
          <div className="text-right -mt-2">
            <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-800">
              Forgot password?
            </a>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white shadow-lg transition-all duration-300 ease-in-out disabled:opacity-75 transform hover:scale-105"
              style={{ background: 'linear-gradient(to right, #8B5CF6, #EC4899)' }}
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </div>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-sm text-gray-500">Or Sign Up Using</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="flex justify-center space-x-4">
          <button aria-label="Login with Facebook" className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform transform hover:scale-110">
            <FacebookIcon className="w-6 h-6" />
          </button>
          <button aria-label="Login with Twitter" className="w-12 h-12 flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-md transition-transform transform hover:scale-110">
            <TwitterIcon className="w-6 h-6" />
          </button>
          <button onClick={handleGoogleLogin} aria-label="Login with Google" className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 shadow-md transition-transform transform hover:scale-110">
            <GoogleIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <span>Don't have an account? </span>
          <a href="#" className="font-medium text-purple-600 hover:text-purple-800">
            SIGN UP
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { UserIcon, LockClosedIcon } from './icons/OutlineIcons';
import { GoogleIcon, FacebookIcon, TwitterIcon } from './icons/SocialIcons';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  appName: string;
  logoUrl: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, appName, logoUrl }) => {
  const [email, setEmail] = useState('faisal@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await onLogin(email, password);
    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    // Simulate login with a predefined Google user (Faisal)
    await onLogin('faisal@example.com', 'password');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
        <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
        <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6 z-10">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">Login</h2>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400"/>
                        </div>
                        <input
                          type="email"
                          required
                          className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 bg-gray-50 rounded-lg focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                          placeholder="Type your email"
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
                          placeholder="Type your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                
                <div className="text-right">
                    <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                        Forgot password?
                    </a>
                </div>

                <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white shadow-lg transition-all duration-300 ease-in-out disabled:opacity-75"
                      style={{ background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)' }}
                    >
                      {loading ? 'Logging in...' : 'LOGIN'}
                    </button>
                </div>
            </form>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-sm text-gray-500">Or Sign Up Using</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center space-x-4">
                <button aria-label="Login with Facebook" className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform transform hover:scale-110">
                    <FacebookIcon className="w-6 h-6" />
                </button>
                <button aria-label="Login with Twitter" className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-400 hover:bg-blue-500 text-white shadow-md transition-transform transform hover:scale-110">
                    <TwitterIcon className="w-6 h-6" />
                </button>
                <button onClick={handleGoogleLogin} aria-label="Login with Google" className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 shadow-md transition-transform transform hover:scale-110">
                    <GoogleIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="text-center text-sm text-gray-500">
                <p>Don't have an account?</p>
                <a href="#" className="font-medium text-purple-600 hover:text-purple-500">SIGN UP</a>
            </div>
        </div>
    </div>
  );
};

export default Login;
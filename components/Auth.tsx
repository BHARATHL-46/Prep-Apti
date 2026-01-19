
import React, { useState } from 'react';

interface AuthProps {
  onLogin: (email: string, pass: string) => void;
  onRegister: (email: string, fullName: string, gender: string, pass: string) => void;
  switchToRegister: () => void;
  switchToLogin: () => void;
  isRegister: boolean;
  error: string | null;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, switchToRegister, switchToLogin, isRegister, error }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (isRegister) {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      if (!gender) {
        setLocalError('Please select a gender');
        return;
      }
      onRegister(email, fullName, gender, password);
    } else {
      onLogin(email, password);
    }
  };

  const inputClass = "appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-300 text-gray-900 rounded-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm font-bold bg-transparent transition-smooth";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 border border-gray-100 shadow-premium rounded-sm">
        <div>
          <div className="mx-auto h-12 w-12 bg-black rounded-sm flex items-center justify-center">
            <span className="text-white text-xl font-black">A</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-gray-900 tracking-tight uppercase">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="mt-2 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
            PreAptiAI Access Portal
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Gender</label>
                  <select
                    required
                    className={`${inputClass} cursor-pointer`}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="" disabled className="text-gray-300">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Email Address</label>
              <input
                type="email"
                required
                className={inputClass}
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Password</label>
              <input
                type="password"
                required
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {isRegister && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Confirm Password</label>
                <input
                  type="password"
                  required
                  className={inputClass}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {(error || localError) && (
            <div className="text-red-500 text-[10px] font-black uppercase text-center bg-red-50 py-2 rounded-sm tracking-widest animate-in fade-in zoom-in-95">
              {error || localError}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-black rounded-sm text-white bg-black hover:bg-gray-900 focus:outline-none transition-smooth uppercase tracking-widest shadow-xl"
            >
              {isRegister ? 'Register' : 'Sign In'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            onClick={isRegister ? switchToLogin : switchToRegister}
            className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest transition-smooth"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;

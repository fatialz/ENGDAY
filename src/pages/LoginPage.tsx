/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Languages } from 'lucide-react';
import { authService } from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/app";

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await authService.login();
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-rose-200">
            <Languages size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Welcome</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">School Management System</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full h-14 flex items-center justify-center gap-3 px-6 rounded-xl bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 border border-slate-200/60 transition-all disabled:opacity-50 active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            <span className="text-sm font-bold">{isLoggingIn ? 'Verifying...' : 'Sign in with Google'}</span>
          </button>
        </div>

        <div className="mt-12 flex items-center gap-2 justify-center text-slate-300 group cursor-default">
          <Shield size={16} className="group-hover:text-rose-400 transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
}

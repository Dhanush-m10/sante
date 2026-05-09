import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { LogIn, Info, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100"
      >
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-lg shadow-indigo-200">
          SP
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Sante-Price</h1>
        <p className="text-slate-500 font-medium mb-8">Secure access to vendor intelligence and mandi prices.</p>

        <button 
          onClick={login}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          <LogIn size={20} />
          Sign in with Google
        </button>

        <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
          <div className="flex items-start gap-3 text-left">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800">Secure & Private</h3>
              <p className="text-[10px] text-slate-400 font-bold leading-tight">Your profit calculations and settings are saved privately in your account.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-left">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Info size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800">Multi-Market Data</h3>
              <p className="text-[10px] text-slate-400 font-bold leading-tight">Access prices from major Mandis including Bangalore, Mumbai, and Chennai.</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      <p className="mt-12 text-[10px] uppercase font-black tracking-widest text-slate-400">
        Empowering Micro-Entrepreneurs
      </p>
    </div>
  );
}

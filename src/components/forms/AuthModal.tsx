import React, { useEffect } from 'react';
import { X, ShieldCheck, Lock, Cpu, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: () => void;
  loading: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuth, loading }) => {
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md" 
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#0F172A] w-full max-w-sm rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative z-[10001] overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="p-10 text-white text-center relative border-b border-white/5">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:16px_16px]" />
            </div>
            
            <button onClick={onClose} className="absolute right-8 top-8 p-1.5 hover:bg-white/10 rounded-xl transition-all group">
              <X className="w-5 h-5 text-white/40 group-hover:text-white" />
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-600 rounded-[28px] flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.4)] relative">
                 <div className="absolute inset-0 bg-red-400 rounded-[28px] opacity-20" />
                 <ShieldCheck className="w-10 h-10 text-white relative z-10" />
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase leading-none mb-3">
              Signal <span className="text-[#8B0000]">Uplink</span>
            </h2>
            <div className="flex items-center justify-center gap-2">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                 Authorization Required
               </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                  <Cpu className="w-4 h-4 text-slate-500" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Encrypted</span>
               </div>
               <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Global Ops</span>
               </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: '#ffffff', color: '#000000' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAuth()}
              disabled={loading}
              className="w-full bg-white/10 border border-white/10 text-white py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
            >
              <div className="w-8 h-8 bg-white text-black rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              {loading ? 'SYNCHRONIZING...' : 'AUTHORIZE WITH GOOGLE'}
            </motion.button>

            <div className="flex flex-col items-center gap-3">
               <div className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em]">Secure Protocol v12.4</span>
               </div>
               <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest text-center leading-relaxed">
                  By accessing this terminal you agree to the <br/> technical emergency deployment terms.
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

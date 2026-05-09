import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail('');
    }, 1500);
  };

  return (
    <section className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[32px] md:rounded-[40px] border-2 border-slate-50 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-slate-800 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl -ml-32 -mb-32 opacity-30" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
        <div className="max-w-md space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
             <div className="w-10 h-10 bg-slate-900 dark:bg-red-900 rounded-xl flex items-center justify-center text-white">
                <Mail className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.3em]">Sector broadcast</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
            Network <span className="text-[#8B0000] dark:text-red-500">Intelligence</span>
          </h2>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 tracking-wider leading-relaxed">
            Subscribe to receive real-time updates on regional blood inventory, emergency protocols, and network expansions.
          </p>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-4">
            {!subscribed ? (
              <form onSubmit={handleSubmit} className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Operator email address"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-[11px] font-black tracking-widest text-slate-900 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-slate-900 dark:focus:border-red-900 focus:bg-white dark:focus:bg-slate-900 transition-all pr-16"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-slate-900 dark:bg-red-900 text-white rounded-xl hover:bg-[#8B0000] dark:hover:bg-red-800 disabled:bg-slate-200 dark:disabled:bg-slate-800 transition-all flex items-center justify-center shadow-lg active:scale-95"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            ) : (
               <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-900/30 p-6 rounded-2xl flex items-center gap-4 text-emerald-700 dark:text-emerald-400"
              >
                <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black tracking-widest">Protocol accepted</p>
                  <p className="text-[10px] font-bold tracking-tighter opacity-70">Your terminal is now synced with central broadcasts.</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-3">Operational feedback?</p>
            <a 
              href="mailto:ops@emergencerescue.io?subject=System Feedback"
              className="inline-flex items-center gap-2 text-[11px] font-black text-slate-900 dark:text-slate-100 tracking-widest hover:text-[#8B0000] dark:hover:text-red-500 transition-colors group"
            >
              Contact command deck
              <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800 group-hover:bg-[#8B0000] dark:group-hover:bg-red-500 transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

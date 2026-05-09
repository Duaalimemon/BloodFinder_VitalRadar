import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, ShieldCheck, Database, Droplet } from 'lucide-react';
import { BloodBank } from '../../services/mapService';

interface BloodStockProps {
  banks?: BloodBank[];
}

const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

export const BloodStock: React.FC<BloodStockProps> = ({ banks = [] }) => {
  const verifiedBanks = banks.filter(b => b.isVerified);
  
  const getStockColor = (level: number) => {
    if (level < 10) return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]';
    if (level < 30) return 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]';
    return 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
  };

  const getPercentage = (level: number) => Math.min(Math.round((level / 100) * 100), 100);

  const globalTotal = React.useMemo(() => {
    if (verifiedBanks.length > 0) {
      return verifiedBanks.reduce((sum: number, b) => {
        const inventoryValues = Object.values(b.inventory || {}) as number[];
        return sum + inventoryValues.reduce((a, b) => a + Number(b || 0), 0);
      }, 0);
    }
    return 1450; // Demo fallback
  }, [verifiedBanks]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Network Overview Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 text-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/5 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5 group-hover:opacity-10 transition-opacity">
           <Activity className="w-40 h-40 md:w-56 md:h-56 text-red-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-red-950 rounded-[16px] md:rounded-[20px] flex items-center justify-center border border-red-900/50 shadow-2xl">
               <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-red-500" />
            </div>
            <div>
              <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 tracking-[0.3em] mb-1 leading-none">Vital <span className="text-[#8B0000]">Reserves</span> uplink</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black tracking-tighter tabular-nums leading-none">{globalTotal}</span>
                <span className="text-[8px] md:text-[9px] font-bold text-red-500 tracking-widest italic">Units verified</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 md:gap-4">
             <div className="px-4 md:px-6 py-2 md:py-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-[8px] md:text-[10px] font-black text-slate-400 tracking-widest mb-1 flex items-center gap-1 md:gap-2">
                   <Database className="w-2.5 h-2.5 md:w-3 md:h-3" /> Nodes
                </div>
                <div className="text-lg md:text-xl font-black">{verifiedBanks.length || 12} <span className="text-[8px] text-green-500 ml-1">Secure</span></div>
             </div>
             <div className="px-4 md:px-6 py-2 md:py-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-[8px] md:text-[10px] font-black text-slate-400 tracking-widest mb-1 flex items-center gap-1 md:gap-2">
                   <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3" /> Protocol
                </div>
                <div className="text-lg md:text-xl font-black text-emerald-500 italic">Active</div>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {BLOOD_TYPES.map((type, i) => {
          const units = verifiedBanks.length > 0 
            ? verifiedBanks.reduce((s: number, b) => s + Number(b.inventory?.[type] || 0), 0)
            : Math.floor(Math.random() * 40) + 10; // Demo fallback
          const percentage = getPercentage(units);
          
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-red-900/30 transition-all group flex items-center gap-4"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all group-hover:scale-110 shrink-0 ${
                units < 10 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                 {type}
              </div>
              
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">Inventory level</h4>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">{units}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 + (i * 0.05) }}
                      className={`h-full rounded-full ${getStockColor(units).split(' ').shift()} transition-all`}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${units < 10 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      {units < 10 ? 'Critical SOS' : 'Stable supply'}
                    </span>
                    <span>{percentage}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

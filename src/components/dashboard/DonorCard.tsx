import React from 'react';
import { ShieldCheck, Phone, MessageCircle, Bell, ExternalLink, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface DonorCardProps {
  donor: any;
  distance?: number;
}

export const DonorCard: React.FC<DonorCardProps> = ({ donor, distance }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 md:p-5 rounded-[24px] shadow-sm hover:shadow-2xl dark:hover:shadow-none hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row lg:flex-col xl:flex-row justify-between gap-4 relative group overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700 opacity-50" />
      
      <div className="flex items-start gap-4 relative z-10 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 md:w-14 bg-slate-900 dark:bg-red-900 rounded-[16px] flex items-center justify-center text-white shadow-xl group-hover:translate-y-[-2px] transition-transform overflow-hidden">
            {donor.photoURL ? (
              <img src={donor.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="font-black text-lg italic tracking-tighter">{donor.bloodType}</div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-lg flex items-center justify-center z-10">
             <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col mb-1">
            <h3 className="font-black text-sm md:text-base text-slate-800 dark:text-slate-100 tracking-tight leading-tight">{donor.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-100 dark:border-emerald-900/30">
                <ShieldCheck className="w-2 h-2" />
                <span className="text-[7px] font-black tracking-widest">Verified</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1">
               <MapPin className="w-2.5 h-2.5" />
               <span className="text-[9px] font-bold tracking-tight text-slate-500 dark:text-slate-400">
                  {distance !== undefined ? `${distance.toFixed(1)}km` : 'Locked'}
               </span>
            </div>
            <div className="text-[8px] font-mono tracking-tighter opacity-40 truncate">
              ID: {donor.id?.slice(0, 8) || '...'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center md:items-end xl:items-center gap-2 relative z-10">
        <div className="flex gap-1.5 w-full md:w-auto xl:flex-col lg:flex-row flex-row">
          <motion.a 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            href={`tel:${donor.phone || ''}`}
            className="flex-1 md:w-9 md:h-9 h-10 bg-slate-900 dark:bg-red-900 text-white rounded-[12px] flex items-center justify-center hover:bg-red-900 dark:hover:bg-red-800 transition-all shadow-lg active:scale-95 group/btn"
          >
            <Phone className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
          </motion.a>
          
          <motion.a 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            href={`https://wa.me/${donor.phone?.replace(/\D/g, '') || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:w-9 md:h-9 h-10 bg-emerald-500 text-white rounded-[12px] flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg active:scale-95 group/btn"
          >
            <MessageCircle className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
          </motion.a>
          
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 md:w-9 md:h-9 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[12px] flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group/btn"
          >
            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

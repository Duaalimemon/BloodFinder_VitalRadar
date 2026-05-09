import React from 'react';
import { motion } from 'framer-motion';
import { Droplet, Heart, Landmark, ShieldCheck } from 'lucide-react';

interface RoleSelectionProps {
  onSelect: (role: 'donor' | 'requester' | 'bank') => void;
  loading: boolean;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect, loading }) => {
  return (
    <div className="fixed inset-0 bg-[#2F4F4F]/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100"
      >
        <div className="bg-[#8B0000] p-10 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />
          </div>
          <ShieldCheck className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-3xl font-black uppercase tracking-tight leading-none mb-4">Select <span className="text-[#8B0000]">Your</span> Role</h2>
          <p className="text-slate-100/60 text-xs font-black uppercase tracking-[0.3em]">Operational Protocol Alpha-1</p>
        </div>

        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            disabled={loading}
            onClick={() => onSelect('donor')}
            className="group flex flex-col items-center p-6 rounded-2xl border-2 border-slate-50 hover:border-[#8B0000] hover:bg-red-50 transition-all text-center"
          >
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8 text-[#8B0000]" />
            </div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-2">Blood Donor</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">Ready to save lives in emergency quadrants</p>
          </button>

          <button 
            disabled={loading}
            onClick={() => onSelect('requester')}
            className="group flex flex-col items-center p-6 rounded-2xl border-2 border-slate-50 hover:border-[#2F4F4F] hover:bg-slate-50 transition-all text-center"
          >
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Droplet className="w-8 h-8 text-[#2F4F4F]" />
            </div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-2">Requester</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">Broadcast SOS signals for patient rescue</p>
          </button>

          <button 
            disabled={loading}
            onClick={() => onSelect('bank')}
            className="group flex flex-col items-center p-6 rounded-2xl border-2 border-slate-50 hover:border-slate-800 hover:bg-slate-100 transition-all text-center"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Landmark className="w-8 h-8 text-slate-800" />
            </div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-2">Medical Center</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">Manage official blood reserves and banks</p>
          </button>
        </div>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Identity verification will be required for official mission logs</p>
        </div>
      </motion.div>
    </div>
  );
};

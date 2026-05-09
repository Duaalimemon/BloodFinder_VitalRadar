import React, { useState } from 'react';
import { ShieldCheck, Droplet, Phone, MapPin, Heart, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DonorRegistrationFormProps {
  user: any;
  userProfile: any;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

export const DonorRegistrationForm: React.FC<DonorRegistrationFormProps> = ({ 
  user, 
  userProfile, 
  onSubmit, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    name: userProfile?.name || user?.displayName || '',
    bloodType: userProfile?.bloodType || '',
    phone: userProfile?.phone || '',
    isAvailable: userProfile?.isAvailable ?? true,
    age: userProfile?.age || '',
    weight: userProfile?.weight || '',
    lastDonation: userProfile?.lastDonation || '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setSubmitted(true);
  };

  if (submitted && !loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 border-2 border-green-100 dark:border-green-900/30 p-8 rounded-3xl text-center shadow-sm transition-colors duration-500"
      >
        <div className="w-20 h-20 bg-green-50 dark:bg-green-900/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">Registration confirmed</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs mx-auto">
          Your profile is now active on the radar. You will receive pulse alerts when your blood type is needed nearby.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="text-[10px] font-black tracking-widest text-[#2F4F4F] dark:text-slate-400 hover:text-[#8B0000] dark:hover:text-red-500 transition-colors"
        >
          Update profile details
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-colors duration-500">
      <div className="bg-slate-800 dark:bg-slate-950 p-8 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 radar-scan z-0 pointer-events-none opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            </div>
            <h2 className="text-2xl font-display font-black tracking-tight">Establish <span className="text-[#8B0000]">Connection</span></h2>
          </div>
          <p className="text-white/60 text-[10px] font-black tracking-[0.2em]">
            Sector authorization required | Join the emergency life stream
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Name */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Operational ID
            </label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Your Full Name"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:border-slate-800 dark:focus:border-red-900 transition-all outline-none"
            />
          </div>

          {/* Blood Type */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <Droplet className="w-3.5 h-3.5 text-[#8B0000] dark:text-red-500" />
              Resource classification
            </label>
            <select 
              required
              value={formData.bloodType}
              onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:border-slate-800 dark:focus:border-red-900 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled>Select Blood Type</option>
              {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].sort().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              Direct signal line
            </label>
            <input 
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+00 (000) 000-0000"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:border-slate-800 dark:focus:border-red-900 transition-all outline-none"
            />
          </div>

          {/* Availability */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Broadcast status
            </label>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setFormData({...formData, isAvailable: true})}
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all shadow-sm ${formData.isAvailable ? 'bg-green-500 text-white shadow-green-500/20 scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Available
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, isAvailable: false})}
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all shadow-sm ${!formData.isAvailable ? 'bg-slate-800 dark:bg-brand-dark text-white shadow-slate-800/20 scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Stealth
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-6">
          <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border-2 border-white dark:border-slate-800">
            <MapPin className="w-6 h-6 text-slate-800 dark:text-slate-100 flex-shrink-0 mt-1" />
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest leading-relaxed">
              Encryption protocol active: Your location is only pulsed in response to direct SOS matches. Sector tracking is secured by the network.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B0000] text-white py-5 rounded-2xl text-[12px] font-black tracking-[0.3em] shadow-xl shadow-red-900/20 hover:bg-red-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Initiating handshake...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Determine live status
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

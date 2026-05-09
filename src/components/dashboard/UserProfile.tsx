import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Droplet, 
  Clock, 
  Moon, 
  Sun, 
  Save, 
  Loader2,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfileProps {
  userProfile: any;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    bloodType: userProfile?.bloodType || 'O+',
    photoURL: userProfile?.photoURL || '',
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        bloodType: userProfile.bloodType || 'O+',
        photoURL: userProfile.photoURL || '',
      });
    }
  }, [userProfile]);

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 1MB for Firestore base64)
    if (file.size > 1024 * 1024) {
      setNotification({ type: 'error', message: 'ERROR: Image exceeds 1MB sector limit.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, photoURL: base64String }));
      setIsEditing(true); // Automatically set to editing mode when image changes
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      setNotification({ type: 'success', message: 'CRITICAL: Profile updated and synchronized.' });
      setIsEditing(false);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error(err);
      setNotification({ type: 'error', message: 'ERROR: Protocol synchronization failed.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />

      {/* Header Profile Section */}
      <div className="bg-slate-900 dark:bg-brand-dark p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden group transition-colors duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[40px] bg-white/10 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-2xl relative">
              {formData.photoURL ? (
                <img src={formData.photoURL} alt="" className="w-full h-full object-cover" />
              ) : auth.currentUser?.photoURL ? (
                <img src={auth.currentUser.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-white/50" />
              )}
            </div>
            <button 
              onClick={handleImageClick}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center border-4 border-slate-900 hover:bg-red-700 transition-colors shadow-lg z-20"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400">Authenticated Node</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
              {userProfile?.name || 'Authorized Personnel'}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/50 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {auth.currentUser?.email}
              </div>
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                <Clock className="w-3.5 h-3.5" /> Node Created: {new Date(auth.currentUser?.metadata.creationTime || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 px-6 py-4 bg-white/5 rounded-3xl border border-white/10">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Blood Group</span>
            <div className="text-3xl font-black text-red-500 italic">{userProfile?.bloodType || 'O+'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border-2 border-slate-50 dark:border-slate-800 shadow-sm transition-colors duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Identification <span className="text-[#8B0000]">Protocols</span></h3>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline"
              >
                Modify Identity
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2">
                    <User className="w-3 h-3" /> Node Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-700 transition-all outline-none disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2">
                      <Droplet className="w-3 h-3 text-red-600" /> Antigen
                    </label>
                    <select
                      disabled={!isEditing}
                      value={formData.bloodType}
                      onChange={(e) => setFormData(prev => ({ ...prev, bloodType: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-700 transition-all outline-none disabled:opacity-50 appearance-none"
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Telecom
                    </label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+X-XXX-XXX-XXXX"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:border-slate-800 dark:focus:border-slate-700 transition-all outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Abort Changes
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-[2] bg-slate-900 dark:bg-red-900 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Confirm Uplink
                  </button>
                </div>
              )}
            </div>
          </form>

          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-2xl flex items-center gap-3 ${
                notification.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 text-red-700'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest">{notification.message}</p>
            </motion.div>
          )}
        </div>

        {/* Global Terminal Settings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border-2 border-slate-50 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full transition-colors duration-500">
            <div>
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8">Node <span className="text-[#8B0000]">Environment</span></h3>
              
              <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-transparent hover:border-slate-900 dark:hover:border-red-900 transition-all group cursor-pointer" onClick={handleThemeToggle}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-red-900 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                    {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Terminal Mode</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Toggle UI visual protocol</p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-red-600' : 'bg-slate-200'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-[24px] flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Security Status</span>
                    <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Encrypted Terminal V2.4.0</span>
                  </div>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-[24px] flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                  <MapPin className="w-6 h-6 text-red-500" />
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current Sector</span>
                    <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Active Node Tracking</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 text-center border-t border-slate-50 dark:border-slate-800 mt-8">
              <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">System Secure 2048-BIT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

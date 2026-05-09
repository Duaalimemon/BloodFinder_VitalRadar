import React, { useState } from 'react';
import { ShieldCheck, Droplet, Bell, LogOut, LogIn, Search, Activity, User, Settings, Info, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  user: any;
  userProfile: any;
  onLogin: () => void;
  onLogout: () => void;
  notifications: any[];
  onDismissAlert: (id: string) => void;
  onAcceptAlert: (alert: any) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  userProfile,
  onLogin, 
  onLogout, 
  notifications = [],
  activeView,
  onViewChange,
  onToggleSidebar,
  searchQuery,
  onSearchChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative z-10 border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-6">
                <LogOut className="w-8 h-8" />
              </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">Terminate <span className="text-[#8B0000]">Session?</span></h2>
              <p className="text-sm font-medium text-slate-400 mb-8 px-4">Are you sure you want to exit the VitalRadar network? Your live pulse status will be set to offline.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    onLogout();
                    setShowLogoutConfirm(false);
                  }}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl text-xs font-black tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  Confirm logout
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-xs font-black tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                >
                  Stay connected
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="h-16 bg-white/80 dark:bg-brand-dark/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 text-slate-800 dark:text-slate-100 sticky top-0 z-[50] shadow-sm transition-colors duration-500">
      {/* Search/Context */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <button 
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <form 
          onSubmit={(e) => e.preventDefault()}
          className="hidden md:flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-2xl w-full max-w-md focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-slate-800 dark:focus-within:border-red-900 transition-all"
        >
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search blood types, hospitals, or patients..." 
            className="bg-transparent border-none outline-none text-xs font-medium flex-1 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => onSearchChange('')}
              className="text-[10px] font-black text-slate-400 hover:text-red-600 tracking-tighter"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Brand - Center on mobile, Right on desktop */}
      <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
        <Droplet className="w-6 h-6 text-red-600" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
              notifications.length > 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-500' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'
            }`}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-600 rounded-full border border-white" />
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-12 right-0 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-3xl border border-slate-100 dark:border-slate-800 p-4 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 tracking-[0.2em]">Live <span className="text-[#8B0000]">Transmissions</span></h3>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 dark:bg-red-900 text-white rounded text-[8px] font-black">
                     <div className="w-1 h-1 bg-white rounded-full" /> Pulse
                  </div>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="text-center py-10 opacity-30">
                       <ShieldCheck className="w-10 h-10 mx-auto mb-2" />
                       <p className="text-[9px] font-black tracking-widest">Sector clear</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.emergencyId} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-red-900/20 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black text-red-600 italic">{notif.bloodType} required</span>
                          <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500">NOW</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-red-900 transition-colors">Emergency at {notif.hospitalName}</p>
                        <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-1 tracking-tighter">Pulsed by {notif.requesterName}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-slate-100 hidden sm:block" />

        {user ? (
          <div className="flex items-center gap-3">
             <div className="hidden lg:flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-800 tracking-[0.1em] leading-none">{user.displayName || 'Authorized user'}</span>
               <div className="flex items-center gap-1 mt-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span className="text-[8px] font-bold text-slate-400 tracking-widest">Verified session</span>
               </div>
             </div>
             <div className="relative group">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border-2 border-white shadow-lg overflow-hidden flex items-center justify-center text-white font-black italic">
                   {userProfile?.photoURL ? (
                     <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                   ) : user?.photoURL ? (
                     <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                   ) : (
                     user?.displayName?.[0] || 'U'
                   )}
                </div>
                <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="absolute -right-1 -bottom-1 w-5 h-5 bg-white shadow-md rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 transition-all border border-slate-50"
                >
                  <LogOut className="w-3 h-3" />
                </button>
             </div>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogin}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest hover:bg-black transition-colors"
          >
            System login
          </motion.button>
        )}
      </div>
    </nav>
  </>
  );
};

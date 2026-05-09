import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  User,
  Droplet, 
  Heart, 
  Building2, 
  Landmark, 
  ShieldCheck, 
  Menu, 
  X,
  CreditCard,
  MessageSquare,
  Activity
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isAdmin: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange, 
  isAdmin,
  isOpen,
  onToggle
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Radar', icon: LayoutDashboard },
    { id: 'broadcast-emergency', label: 'Generate Pulse', icon: MessageSquare, color: 'text-red-600' },
    { id: 'live-events', label: 'Emergency SOS', icon: Droplet, color: 'text-red-500' },
    { id: 'donors', label: 'Verified Donors', icon: Users },
    { id: 'banks', label: 'Blood Banks', icon: Landmark },
    { id: 'register-donor', label: 'Donor Status', icon: Heart, color: 'text-green-500' },
    { id: 'manage-facility', label: 'Facility Portal', icon: Building2 },
    { id: 'profile', label: 'User Profile', icon: User },
  ];

  return (
    <>
      {/* Sidebar Rail */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isOpen ? 256 : 72,
          x: 0 
        }}
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-brand-dark border-r border-slate-100 dark:border-slate-800 flex flex-col z-[5000] transition-colors duration-500 ease-in-out ${
          !isOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-slate-900 dark:bg-red-900 text-white rounded-xl flex items-center justify-center font-black relative group shrink-0">
               <Activity className="w-6 h-6" />
               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-xs font-black tracking-tighter text-slate-900 dark:text-white leading-none">Vital</span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#8B0000] dark:text-red-500 leading-none mt-0.5">Radar</span>
              </motion.div>
            )}
          </div>
          <button 
            onClick={onToggle}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          <div className="mb-4">
             <p className={`text-[9px] font-black text-slate-400 tracking-[0.2em] px-2 mb-4 ${!isOpen && 'text-center opacity-0'}`}>Main deck</p>
             {menuItems.map((item) => (
               <button
                 key={item.id}
                 onClick={() => {
                   onViewChange(item.id);
                   onToggle();
                 }}
                 className={`w-full flex items-center px-3 py-3 rounded-xl transition-all group relative duration-150 ${
                   activeView === item.id 
                     ? 'bg-slate-900 dark:bg-red-900 text-white shadow-lg' 
                     : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                 }`}
               >
                 <item.icon className={`w-5 h-5 flex-shrink-0 ${activeView === item.id ? 'text-white' : item.color || ''}`} />
                 <AnimatePresence>
                   {isOpen && (
                     <motion.span
                       initial={{ opacity: 0, x: -5 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -5 }}
                       transition={{ duration: 0.15 }}
                       className="ml-3 text-[11px] font-black tracking-widest whitespace-nowrap"
                     >
                       {item.label}
                     </motion.span>
                   )}
                 </AnimatePresence>
                 
                 {/* Tooltip for collapsed state */}
                 {!isOpen && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] font-black tracking-widest rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
                       {item.label}
                    </div>
                 )}
               </button>
             ))}
          </div>

          <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
             <p className={`text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] px-2 mb-4 ${!isOpen && 'text-center opacity-0'}`}>Protocols</p>
             {isAdmin && (
               <button
                 onClick={() => {
                   onViewChange('admin');
                    onToggle();
                 }}
                 className={`w-full flex items-center px-3 py-3 rounded-xl transition-all group relative ${
                   activeView === 'admin' 
                     ? 'bg-red-900 text-white shadow-lg' 
                     : 'text-slate-400 hover:text-red-900 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                 }`}
               >
                 <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                 {isOpen && (
                   <span className="ml-3 text-[11px] font-black tracking-widest">Admin control</span>
                 )}
               </button>
             )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
           {isOpen ? (
             <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                   <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em]">Operational status</span>
                </div>
                <div className="text-[10px] font-black text-slate-800 dark:text-slate-300 tracking-tighter truncate max-w-[140px]">Karachi sector alpha</div>
             </div>
           ) : (
             <div className="flex justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
             </div>
           )}
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
          />
        )}
      </AnimatePresence>
    </>
  );
};

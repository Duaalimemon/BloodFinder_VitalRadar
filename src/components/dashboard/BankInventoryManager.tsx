import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Plus, 
  Minus, 
  Save, 
  Building2, 
  ShieldCheck, 
  AlertTriangle,
  Loader2,
  Trash2,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { BankProfile, BloodType } from '../../types';
import { getGeohash } from '../../lib/geo';

const BLOOD_TYPES: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const BankInventoryManager: React.FC<{ coords: [number, number] | null }> = ({ coords }) => {
  const [bank, setBank] = useState<BankProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'bloodBanks'), 
      where('ownerUid', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docData = snapshot.docs[0];
        setBank({ id: docData.id, ...docData.data() } as BankProfile);
      } else {
        setBank(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStock = async (type: BloodType, delta: number) => {
    if (!bank) return;
    
    const newInventory = { ...bank.inventory };
    newInventory[type] = Math.max(0, (newInventory[type] || 0) + delta);
    
    try {
      await setDoc(doc(db, 'bloodBanks', bank.id), {
        inventory: newInventory,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to update stock:", err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !coords) return;

    setSaving(true);
    try {
      const initialInventory = BLOOD_TYPES.reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {} as any);

      const newBankId = `bank-${auth.currentUser.uid}`;
      const newBank: Omit<BankProfile, 'id'> = {
        name: registerData.name,
        address: registerData.address,
        phone: registerData.phone,
        ownerUid: auth.currentUser.uid,
        inventory: initialInventory,
        lat: coords[0],
        lng: coords[1],
        geohash: getGeohash(coords[0], coords[1]),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'bloodBanks', newBankId), newBank);
      setIsRegistering(false);
    } catch (err) {
      console.error("Registration failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center bg-white border-2 border-slate-50 rounded-[32px]">
        <Loader2 className="w-10 h-10 text-slate-200 animate-spin mb-4" />
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Accessing Medical Database...</p>
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="bg-white border-2 border-slate-50 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-8 md:p-10 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Building2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-display font-black text-slate-800 uppercase tracking-tight mb-3">No <span className="text-[#8B0000]">Facility</span> Registered</h2>
          <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
            Authorized medical centers can manage live inventory and broadcast stockpile status to the radar.
          </p>
          
          {isRegistering ? (
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleRegister} 
              className="mt-8 space-y-4 text-left max-w-md mx-auto"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Facility Name</label>
                <input 
                  required
                  value={registerData.name}
                  onChange={e => setRegisterData({...registerData, name: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:border-slate-800 transition-all outline-none"
                  placeholder="e.g. City General Blood Bank"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Operational Address</label>
                <input 
                  required
                  value={registerData.address}
                  onChange={e => setRegisterData({...registerData, address: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:border-slate-800 transition-all outline-none"
                  placeholder="Street, City, Sector"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Emergency Contact</label>
                <input 
                  required
                  value={registerData.phone}
                  onChange={e => setRegisterData({...registerData, phone: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:border-slate-800 transition-all outline-none"
                  placeholder="+00 000 000 000"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={saving}
                  className="flex-[2] bg-[#8B0000] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-900/10 hover:bg-red-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Register Facility
                </button>
              </div>
            </motion.form>
          ) : (
            <button 
              onClick={() => setIsRegistering(true)}
              className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-slate-900 transition-all active:scale-95"
            >
              Initialize Facility Protocol
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-8 rounded-[32px] text-white shadow-xl shadow-slate-900/10 border-2 border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 radar-scan z-0 pointer-events-none opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 font-display">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-400">Live Telemetry Active</span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight">{bank.name}</h2>
            <div className="flex items-center gap-4 mt-3 text-white/40 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {bank.address}
              </div>
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                Verified Node
              </div>
            </div>
          </div>
          <button 
            className="flex-shrink-0 bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-all border border-white/10 group"
            title="Update Facility Details"
          >
            <Building2 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {BLOOD_TYPES.map((type) => {
          const count = bank.inventory[type] || 0;
          const isLow = count < 10;
          
          return (
            <motion.div 
              key={type}
              whileHover={{ y: -4 }}
              className="bg-white border-2 border-slate-50 p-6 rounded-[28px] shadow-sm hover:border-slate-800 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <div className="text-3xl font-display font-black text-slate-800 italic group-hover:scale-110 transition-transform origin-left">{type}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Classification</div>
                </div>
                <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${isLow ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                  {isLow ? 'Critical Low' : 'Supply Stable'}
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={() => handleUpdateStock(type, -1)}
                  className="w-10 h-10 rounded-xl border-2 border-slate-50 flex items-center justify-center text-slate-400 hover:border-slate-800 hover:text-slate-800 transition-all active:scale-90"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-display font-black text-slate-800">{count}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Units</span>
                </div>
                <button 
                  onClick={() => handleUpdateStock(type, 1)}
                  className="w-10 h-10 rounded-xl border-2 border-slate-50 flex items-center justify-center text-slate-400 hover:border-slate-800 hover:text-slate-800 transition-all active:scale-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Droplet className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Sync Global Registry</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last updated: {bank.updatedAt?.toDate ? bank.updatedAt.toDate().toLocaleTimeString() : 'Just now'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-xl border-2 border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-slate-800 hover:text-slate-800 transition-all">Export Report</button>
          <button className="px-6 py-3 rounded-xl bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-900 transition-all">Broadcast Pulse</button>
        </div>
      </div>
    </div>
  );
};

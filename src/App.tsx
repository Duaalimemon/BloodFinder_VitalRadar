/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
  orderBy,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db, messaging, handleFirestoreError, OperationType } from './lib/firebase';
import { getToken } from 'firebase/messaging';
import { getGeohash, calculateDistance } from './lib/geo';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { NovaAssistant } from './components/ai/NovaAssistant';
import { BloodStock } from './components/dashboard/BloodStock';
import { DonorCard } from './components/dashboard/DonorCard';
import { BankInventoryManager } from './components/dashboard/BankInventoryManager';
import { Newsletter } from './components/dashboard/Newsletter';
import { LiveMap } from './components/map/LiveMap';
import { EmergencyRequestForm } from './components/forms/EmergencyRequestForm';
import { DonorRegistrationForm } from './components/forms/DonorRegistrationForm';
import { UserProfile } from './components/dashboard/UserProfile';
import { AuthModal } from './components/forms/AuthModal';
import { Footer } from './components/layout/Footer';
import { useSocket } from './hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Droplet, ShieldCheck, Info, UserPlus, Phone, MessageCircle, Navigation, Clock, MapPin, Landmark, Trash2, CheckCircle2, Users, Building2, User, X } from 'lucide-react';
import { fetchNearbyBloodBanks, BloodBank } from './services/mapService';
import { formatDistanceToNow } from 'date-fns';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [coords, setCoords] = useState<[number, number]>([24.8607, 67.0011]); // Default to Karachi
  const [donors, setDonors] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dismissedFloatingAlertIds, setDismissedFloatingAlertIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [adminSubView, setAdminSubView] = useState<'emergencies' | 'donors' | 'banks' | 'users'>('emergencies');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granted' | 'denied' | 'error'>('prompt');
  const [showLocationModal, setShowLocationModal] = useState(false);

  const ADMIN_EMAILS = ['memonduaa544@gmail.com']; // Authorized command deck personnel

  const socket = useSocket(userProfile?.bloodType);

  const filteredEmergencies = emergencies.filter(e => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase().trim();
    const bType = e.bloodType?.toLowerCase().replace(/\s/g, '') || '';
    const cleanQuery = query.replace(/\s/g, '');
    return (
      bType.includes(cleanQuery) ||
      e.hospitalName?.toLowerCase().includes(query) ||
      e.patientName?.toLowerCase().includes(query) ||
      e.id?.toLowerCase().includes(query)
    );
  });

  const filteredBanks = bloodBanks.filter(bank => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      bank.name?.toLowerCase().includes(query) ||
      bank.address?.toLowerCase().includes(query)
    );
  });

  const filteredDonors = donors.filter(donor => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase().trim();
    const bType = donor.bloodType?.toLowerCase().replace(/\s/g, '') || '';
    const cleanQuery = query.replace(/\s/g, '');
    return (
      donor.name?.toLowerCase().includes(query) ||
      bType.includes(cleanQuery)
    );
  });

  useEffect(() => {
    if (isAdmin && activeView === 'admin') {
      setUsersLoading(true);
      const unsubscribe = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setUsersLoading(false);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'users');
          setUsersLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [isAdmin, activeView]);

  useEffect(() => {
    if (user?.email && ADMIN_EMAILS.includes(user.email)) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const lastFetchCoords = useRef<[number, number] | null>(null);

  useEffect(() => {
    const getBanks = async () => {
      if (coords) {
        // Skip if moved less than 500m to prevent constant re-fetching/shivering
        if (lastFetchCoords.current) {
          const dist = calculateDistance(coords[0], coords[1], lastFetchCoords.current[0], lastFetchCoords.current[1]);
          if (dist < 0.5) return;
        }
        
        setBanksLoading(true);
        const banks = await fetchNearbyBloodBanks(coords[0], coords[1]);
        setBloodBanks(banks);
        lastFetchCoords.current = coords;
        setBanksLoading(false);
      }
    };
    getBanks();
  }, [coords]);

  // 1. Geolocation tracking
  useEffect(() => {
    // Force scroll to top on view change
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
  }, [activeView]);

  // Handle scroll lock when sidebar is open
  useEffect(() => {
    // Only lock scroll on mobile/tablet when sidebar is open as an overlay
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Register SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('SW Registered', reg);
      }).catch(err => console.warn('SW Register fail', err));
    }

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords([pos.coords.latitude, pos.coords.longitude]);
          setLocationStatus('granted');
        },
        (err) => {
          console.warn("Geolocation error:", err);
          if (err.code === 1) {
            setLocationStatus('denied');
            setShowLocationModal(true);
          } else {
            setLocationStatus('error');
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setLocationStatus('error');
    }
  }, []);

  // 2. Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setIsAuthModalOpen(false);
      } else {
        setUserProfile(null);
        // Automatically open auth modal for protocol access
        setIsAuthModalOpen(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. User Profile Listener
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile(data);
      }
    }, (err) => {
      console.warn("Profile snapshot error:", err);
    });

    // Request FCM Token separately to avoid blocking profile
    const setupMessaging = async () => {
      if (messaging) {
        try {
          const token = await getToken(messaging, { 
            vapidKey: 'BHL7Nf-qG-A67zD-K-8L8_E_r_P_R_S_T' 
          });
          if (token) {
            await setDoc(doc(db, 'users', user.uid), { pushToken: token }, { merge: true });
          }
        } catch (e) {
          console.warn("FCM Token fetch failed:", e);
        }
      }
    };
    setupMessaging();
    return () => unsubscribe();
  }, [user]);

  // 3. Real-time Listeners (Emergencies)
  useEffect(() => {
    if (!user) {
      setEmergencies([]);
      return;
    }
    // Newest first, only pending missions
    const q = query(
      collection(db, 'emergencies'), 
      where('status', '==', 'Pending'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setEmergencies(data);
      
      // Update alerts to only include missions that are still pending/active
      setAlerts(prev => {
        // Filter out any alerts that are no longer in the pending list
        const activeIds = new Set(data.map(e => e.id));
        const filteredPrev = prev.filter(a => activeIds.has(a.emergencyId));
        
        const existingIds = new Set(filteredPrev.map(a => a.emergencyId));
        const newAlerts = data
          .filter((e: any) => !existingIds.has(e.id))
          .map((e: any) => ({
            emergencyId: e.id,
            bloodType: e.bloodType,
            hospitalName: e.hospitalName,
            requesterName: e.requesterName,
            lat: e.lat,
            lng: e.lng
          }));
        
        if (newAlerts.length === 0) return filteredPrev;
        return [...newAlerts, ...filteredPrev].slice(0, 20); // Keep last 20
      });
    }, (err) => {
      if (auth.currentUser) {
        handleFirestoreError(err, OperationType.LIST, 'emergencies');
      }
    });
  }, [user]);

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Neutralize user profile? This action is irreversible.')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    }
  };

  const deleteDonor = async (donorId: string) => {
    if (!window.confirm('Decommission donor registry entry?')) return;
    try {
      await deleteDoc(doc(db, 'donors', donorId));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'donors');
    }
  };

  const deleteBank = async (bankId: string) => {
    if (!window.confirm('Decommission medical facility?')) return;
    try {
      await deleteDoc(doc(db, 'bloodBanks', bankId));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'bloodBanks');
    }
  };

  const markAsResolved = async (id: string) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'emergencies', id), {
        status: 'Resolved',
        resolvedAt: serverTimestamp(),
        resolvedBy: user?.uid
      });
      alert("MISSION RESOLVED: Emergency signal neutralized and removed from public radar.");
    } catch (err) {
      console.error("Resolution failed:", err);
      alert("Resolution protocol failed. Check system permissions.");
    } finally {
      setLoading(false);
    }
  };

  const deleteEmergency = async (id: string) => {
    if (!window.confirm("CRITICAL ACTION: Are you sure you want to permanently delete this distress signal from the system records?")) return;
    try {
      setLoading(true);
      // We could use deleteDoc, but status update is safer for logs
      await updateDoc(doc(db, 'emergencies', id), {
        status: 'Deleted',
        deletedAt: serverTimestamp(),
        deletedBy: user?.uid
      });
      alert("SIGNAL PURGED: Mission records have been decommissioned.");
    } catch (err) {
      console.error("Purge failed:", err);
      alert("System failed to purge signal. High-level override required.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Donor Matching (Simplified Geospatial for demo)
  useEffect(() => {
    if (!user) {
      setDonors([]);
      return;
    }
    // In a real app, we'd use geohash range queries here.
    // For this demo, we fetch available donors and filter locally.
    const q = query(collection(db, 'users'), where('isAvailable', '==', true));
    return onSnapshot(q, (snap) => {
      const allDonors = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDonors(allDonors);
    }, (err) => {
      if (auth.currentUser) {
        handleFirestoreError(err, OperationType.LIST, 'users');
      }
    });
  }, [user]);

  // 5. Socket alerts
  useEffect(() => {
    if (socket) {
      console.log("Socket listener active for emergency-alerts");
      let intervalId: any = null;
      
      socket.on('emergency-alert', (alert) => {
        console.log("ALERT RECEIVED:", alert);
        
        // Background Alert Protocol
        if (document.visibilityState === 'hidden') {
           // Attempt a browser-level alert (may be deferred until focus)
           // but also flash the title to attract attention
           const originalTitle = document.title;
           let isFlash = false;
           
           if (intervalId) clearInterval(intervalId);
           intervalId = setInterval(() => {
             document.title = isFlash ? "🚨 EMERGENCY SOS" : "🔴 NEW SIGNAL";
             isFlash = !isFlash;
           }, 1000);

           // Play a notification sound or use traditional alert as requested
           // Note: Traditional alerts are often blocked in background, 
           // but we'll include it for maximum compatibility with user request
           setTimeout(() => {
             if (document.visibilityState === 'hidden') {
                console.log("BACKGROUND ALERT TRIGGERED");
             }
           }, 100);

           // Revert title when visible
           const onVisible = () => {
             if (document.visibilityState === 'visible') {
               clearInterval(intervalId);
               document.title = originalTitle;
               document.removeEventListener('visibilitychange', onVisible);
             }
           };
           document.addEventListener('visibilitychange', onVisible);
        }

        // Browser Notification
        if ('Notification' in window && Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('🚨 Emergency Blood Needed', {
              body: `${alert.bloodType} Needed for Patient at ${alert.hospitalName || 'Ground Zero'}. Tap to Respond.`,
              icon: 'https://cdn-icons-png.flaticon.com/512/1048/1048953.png', // Using public high-res droplet icon
              tag: alert.emergencyId,
              data: {
                url: window.location.origin
              }
            });
          });
        }

        setAlerts(prev => {
          // Prevent duplicates
          if (prev.find(a => a.emergencyId === alert.emergencyId)) return prev;
          
          return [alert, ...prev];
        });
      });
      return () => {
        if (intervalId) clearInterval(intervalId);
        socket.off('emergency-alert');
      };
    }
  }, [socket]);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      
      // Check if profile exists, if not create it
      const profileDoc = await getDocs(query(collection(db, 'users'), where('email', '==', res.user.email)));
      
      if (profileDoc.empty) {
        const profile = {
          name: res.user.displayName || res.user.email?.split('@')[0] || 'User',
          email: res.user.email,
          bloodType: 'O+', // Default
          isAvailable: true,
          geohash: getGeohash(coords[0], coords[1]),
          lat: coords[0],
          lng: coords[1],
          updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', res.user.uid), profile);
      }
      
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error("Auth Exception:", err);
      // Avoid circular logs by sticking to basic types
      const errorCode = err.code || 'unknown';
      const errorMessage = err.message || 'Auth Error';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      console.log("Logged out");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleDismissAlert = (emergencyId: string) => {
    // Only dismiss from the visual floating pop-up
    setDismissedFloatingAlertIds(prev => new Set(prev).add(emergencyId));
  };

  const handleAcceptAlert = (alertData: any) => {
    const id = alertData.emergencyId || alertData.id;
    if (!id) return;
    alert(`MISSION ACCEPTED: Pulse signal locked for mission ${id.slice(0, 8)}. Proceed to ${alertData.hospitalName || 'Ground Zero'}. Contacting dispatcher...`);
    // User requested that notifications stay until resolved or deleted. 
    // We no longer filter them out manually here.
    // They will naturally disappear when the Firestore status changes to something other than 'Pending'.
    // We should however dismiss the floating popup for this alert.
    setDismissedFloatingAlertIds(prev => new Set(prev).add(id));
  };

  const handleCreateEmergency = async (data: { bloodType: string, urgency: string, phone: string, hospitalName: string, patientName: string }) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setBroadcastLoading(true);
    try {
      const emergency = {
        requesterUid: user.uid,
        requesterName: userProfile?.name || user.email,
        bloodType: data.bloodType,
        urgencyLevel: data.urgency,
        phone: data.phone,
        hospitalName: data.hospitalName,
        patientName: data.patientName,
        status: 'Pending',
        geohash: getGeohash(coords[0], coords[1]),
        lat: coords[0],
        lng: coords[1],
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'emergencies'), emergency);
      
      // Trigger notification via Express Server
      await fetch('/api/notify-donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          lat: coords[0],
          lng: coords[1],
          radius: 5000,
          emergencyId: docRef.id,
          hospitalName: data.hospitalName,
          requesterName: emergency.requesterName
        })
      });

      alert("📡 BROADCAST ACTIVE: Your request has been pulsed to all terminals in the quadrant. Watch the Feed for responses.");

    } catch (err: any) {
      console.error("Broadcast failed:", err);
      let message = "Emergency broadcast failed. Please verify your connection.";
      try {
        const errInfo = JSON.parse(err.message);
        if (errInfo.error.includes('permissions')) {
          message = "Access Denied: Your profile does not have permission to broadcast emergencies. Please verify your identity.";
        }
      } catch (e) {
        if (err.message) message = err.message;
      }
      alert(message);
      handleFirestoreError(err, OperationType.WRITE, 'emergencies');
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleRegisterDonor = async (data: any) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      const profile = {
        ...data,
        email: user.email,
        geohash: getGeohash(coords[0], coords[1]),
        lat: coords[0],
        lng: coords[1],
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      alert("📡 DONOR PROFILE INITIALIZED: You are now active on the VitalRadar network.");
    } catch (err: any) {
      console.error("Registration failed:", err);
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-brand-dark flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-slate-900 dark:text-white transition-colors duration-500">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#334155_1px,_transparent_1px)] bg-[length:32px_32px]" />
        </div>
        
        {/* Animated Core */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 text-center space-y-12 max-w-xl"
        >
          <div className="flex flex-col items-center gap-6">
            <motion.div 
              animate={{ 
                boxShadow: ["0 0 20px rgba(220,38,38,0.2)", "0 0 50px rgba(220,38,38,0.6)", "0 0 20px rgba(220,38,38,0.2)"] 
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-24 h-24 bg-red-600 rounded-[32px] flex items-center justify-center border border-red-500/50 shadow-2xl"
            >
              <Droplet className="w-12 h-12 text-white fill-white" />
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none text-slate-900 dark:text-white">
                Vital<span className="text-[#8B0000]">Radar</span>
              </h1>
              <div className="flex items-center justify-center gap-3">
                 <div className="h-px bg-slate-200 dark:bg-white/20 flex-1" />
                 <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 capitalize">Sector access protocol</p>
                 <div className="h-px bg-slate-200 dark:bg-white/20 flex-1" />
              </div>
            </div>
          </div>

          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wide leading-relaxed">
            A high-stakes cryptographic blood <br /> distribution & response network.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAuthModalOpen(true)}
            className="px-12 py-5 bg-slate-900 dark:bg-white/5 text-white border border-slate-800 dark:border-white/10 rounded-full font-black text-xs tracking-wider shadow-2xl transition-all"
          >
            Initiate authorization
          </motion.button>
        </motion.div>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onAuth={handleAuth}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark font-sans text-slate-900 dark:text-slate-100 overflow-x-hidden transition-colors duration-500">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isAdmin={isAdmin}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="transition-all duration-200">
        <Navbar 
          user={user} 
          userProfile={userProfile}
          onLogin={() => setIsAuthModalOpen(true)} 
          onLogout={handleLogout}
          notifications={alerts}
          onDismissAlert={handleDismissAlert}
          onAcceptAlert={handleAcceptAlert}
          activeView={activeView}
          onViewChange={setActiveView}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <main className="max-w-[2000px] mx-auto px-4 md:px-10 py-4 md:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, scale: 0.99, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -5 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8"
          >
            {/* Left Column: Summary & Map - Now dynamically spans based on view */}
            <div className={`${activeView === 'dashboard' ? 'lg:col-span-8 2xl:col-span-9' : 'lg:col-span-12'} space-y-6 md:space-y-8`}>
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                    <div className="w-5 h-5 bg-[#2F4F4F]/5 dark:bg-[#2F4F4F]/20 rounded flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2F4F4F] dark:text-emerald-400" />
                    </div>
                    <span className="text-[8px] md:text-[9px] font-black text-[#2F4F4F] dark:text-slate-400 tracking-wider md:tracking-widest">Operational security: High</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                    {activeView === 'dashboard' ? (
                      <>Vital<span className="text-[#8B0000]">Radar</span></>
                    ) : activeView === 'donors' ? (
                      <>Donor <span className="text-[#8B0000]">Registry</span></>
                    ) : activeView === 'register-donor' ? (
                      <>Donor <span className="text-[#8B0000]">Registration</span></>
                    ) : activeView === 'manage-facility' ? (
                      <>Portal <span className="text-[#8B0000]">Inventory</span></>
                    ) : activeView === 'profile' ? (
                      <>User <span className="text-[#8B0000]">Profile</span></>
                    ) : (
                      <>Medical <span className="text-[#8B0000]">Centers</span></>
                    )}
                  </h1>
                </div>
                {isAdmin && activeView === 'dashboard' && (
                  <button 
                    onClick={() => setActiveView('admin')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-[#8B0000] border border-red-100 rounded-xl text-[10px] font-black tracking-widest hover:bg-[#8B0000] hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin terminal
                  </button>
                )}
              </header>

              {activeView === 'dashboard' ? (
                <div className="space-y-8 md:space-y-12">
                   {/* Strategic Metrics Overlay */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8 bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-8 md:p-10 rounded-[44px] border-2 border-slate-50 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none">
                     <button 
                       onClick={() => setActiveView('register-donor')}
                       className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700 active:scale-95"
                     >
                       <div className="flex flex-col items-start">
                         <div className="text-[9px] font-black text-slate-400 tracking-widest mb-1">Your identity</div>
                         <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${userProfile?.isAvailable ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                           <div className="text-sm font-black text-slate-900 dark:text-slate-100">{userProfile?.isAvailable ? 'Active pulse' : 'Offline'}</div>
                         </div>
                       </div>
                       <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-slate-900 dark:group-hover:bg-red-900 group-hover:text-white transition-all">
                         <User className="w-5 h-5" />
                       </div>
                     </button>

                     <button 
                       onClick={() => setActiveView('live-events')}
                       className="flex items-center justify-between p-4 rounded-2xl hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all group border border-transparent hover:border-red-100 dark:hover:border-red-900/20 active:scale-95 px-4"
                     >
                       <div className="flex flex-col items-start">
                         <div className="text-[9px] font-black text-slate-400 tracking-widest mb-1 text-left">Emergency pulse</div>
                         <div className="flex items-baseline gap-2">
                           <div className="text-3xl font-black text-[#8B0000] dark:text-red-500 tracking-tighter leading-none">{filteredEmergencies.length}</div>
                           <div className="flex items-center gap-1">
                             <div className="w-1 h-1 bg-[#8B0000] dark:bg-red-500 rounded-full" />
                             <span className="text-[10px] font-bold text-[#8B0000] dark:text-red-500">Live</span>
                           </div>
                         </div>
                       </div>
                       <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-[#8B0000] dark:text-red-500 group-hover:bg-[#8B0000] dark:group-hover:bg-red-900 group-hover:text-white transition-all">
                         <Droplet className="w-5 h-5" />
                       </div>
                     </button>

                     <button 
                       onClick={() => setActiveView('donors')}
                       className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700 active:scale-95"
                     >
                       <div className="flex flex-col items-start">
                         <div className="text-[9px] font-black text-slate-400 tracking-widest mb-1">Verified fleet</div>
                         <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter leading-none">{filteredDonors.length}</div>
                       </div>
                       <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-red-900 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-slate-200 dark:shadow-none">
                         <Users className="w-5 h-5" />
                       </div>
                     </button>

                     <button 
                       onClick={() => setActiveView('banks')}
                       className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700 active:scale-95"
                     >
                       <div className="flex flex-col items-start">
                         <div className="text-[9px] font-black text-slate-400 tracking-widest mb-1">Medical Grid</div>
                         <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter leading-none">{filteredBanks.length}</div>
                       </div>
                       <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-slate-900 dark:group-hover:bg-red-900 group-hover:text-white transition-all">
                         <Building2 className="w-5 h-5" />
                       </div>
                     </button>
                   </div>

                   <LiveMap 
                    center={coords} 
                    donors={filteredDonors} 
                    emergencies={filteredEmergencies} 
                    banks={filteredBanks}
                  />
                  
                  <BloodStock banks={filteredBanks} />

                  <Newsletter />
                </div>
              ) : activeView === 'banks' ? (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-400 tracking-widest">Networked <span className="text-[#8B0000]">Medical</span> assets</h2>
                    <button onClick={() => setActiveView('dashboard')} className="text-[10px] font-black text-slate-400 hover:text-[#8B0000]">Back to radar</button>
                  </div>
                  
                  {banksLoading ? (
                    <div className="text-center py-10 md:py-20 bg-slate-50/50 rounded-2xl md:rounded-3xl border border-slate-100">
                      <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-[#8B0000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-[10px] font-black text-slate-400 tracking-widest">Scanning grid...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8 auto-rows-min">
                      {filteredBanks.map((bank) => (
                        <div 
                          key={bank.id}
                          className="bg-white border-2 border-slate-50 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm hover:border-slate-800 transition-all flex gap-4 md:gap-6"
                        >
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 text-slate-800">
                            <Landmark className="w-6 h-6 md:w-7 md:h-7" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs md:text-sm font-black text-slate-800 leading-tight mb-1 md:mb-2">{bank.name}</h3>
                            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold mb-3 md:mb-4 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {bank.address}
                            </p>
                            <div className="flex gap-2">
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bank.name + ' ' + bank.address)}`}
                                target="_blank"
                                className="flex-1 bg-slate-800 text-white py-2 rounded-lg text-[8px] md:text-[9px] font-black tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-colors"
                              >
                                <Navigation className="w-2.5 h-2.5 md:w-3 md:h-3" /> Route
                              </a>
                              {bank.phone && (
                                <a 
                                  href={`tel:${bank.phone}`}
                                  className="w-10 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
                                >
                                  <Phone className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {filteredBanks.length === 0 && !banksLoading && (
                    <div className="text-center py-20 bg-white border-2 border-dashed border-slate-100 rounded-3xl">
                      <Landmark className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                      <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Assets Found</h3>
                      <p className="text-sm italic text-slate-400 mt-2">No authorized medical facilities detected in this quadrant.</p>
                    </div>
                  )}
                </section>
              ) : activeView === 'broadcast-emergency' ? (
                <section className="max-w-2xl mx-auto space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-red-200">
                      <Droplet className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Emergency <span className="text-[#8B0000]">Dispatch</span></h2>
                    <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">Global Broadcast Protocol Alpha</p>
                  </div>
                  <div className="bg-white p-8 rounded-[40px] border-2 border-slate-50 shadow-2xl">
                    <EmergencyRequestForm onSubmit={(data) => {
                      handleCreateEmergency(data);
                      setActiveView('dashboard');
                    }} loading={broadcastLoading} />
                  </div>
                  <div className="text-center">
                    <button onClick={() => setActiveView('dashboard')} className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-900 tracking-widest">Cancel Mission</button>
                  </div>
                </section>
              ) : activeView === 'register-donor' ? (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Establish <span className="text-[#8B0000]">Local</span> Presence</h2>
                    <button onClick={() => setActiveView('dashboard')} className="text-[10px] font-black text-slate-400 uppercase hover:text-[#8B0000]">Back to Radar</button>
                  </div>
                  <DonorRegistrationForm 
                    user={user} 
                    userProfile={userProfile} 
                    onSubmit={handleRegisterDonor} 
                    loading={loading} 
                  />
                </section>
              ) : activeView === 'profile' ? (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Identity <span className="text-[#8B0000]">Protocol</span> Deck</h2>
                    <button onClick={() => setActiveView('dashboard')} className="text-[10px] font-black text-slate-400 uppercase hover:text-[#8B0000]">Back to Radar</button>
                  </div>
                  <UserProfile userProfile={userProfile} />
                </section>
              ) : activeView === 'manage-facility' ? (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Facility <span className="text-[#8B0000]">Inventory</span> Control</h2>
                    <button onClick={() => setActiveView('dashboard')} className="text-[10px] font-black text-slate-400 uppercase hover:text-[#8B0000]">Back to Radar</button>
                  </div>
                  <BankInventoryManager coords={coords} />
                </section>
              ) : activeView === 'live-events' ? (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Active <span className="text-[#8B0000]">Sos</span> Signals</h2>
                    <button onClick={() => setActiveView('dashboard')} className="text-[10px] font-black text-slate-400 uppercase hover:text-[#8B0000]">Back to Radar</button>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {filteredEmergencies.map(e => (
                      <div 
                        key={e.id}
                        className="bg-white border-2 border-slate-100 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm hover:border-[#8B0000] transition-all flex flex-col md:flex-row gap-4 md:gap-6 relative overflow-hidden"
                      >
                        {e.urgencyLevel === 'Critical' && (
                          <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-[#8B0000]" />
                        )}
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Droplet className="w-6 h-6 md:w-8 md:h-8 text-[#8B0000]" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${e.urgencyLevel === 'Critical' ? 'text-[#8B0000]' : 'text-slate-400'}`}>
                                {e.urgencyLevel} Mission
                              </span>
                              <h3 className="text-base md:text-xl font-black text-slate-800">Request for {e.bloodType}</h3>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time Posted</div>
                              <div className="text-[10px] md:text-xs font-bold text-slate-600 flex items-center gap-1 justify-end">
                                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                {e.createdAt ? formatDistanceToNow(e.createdAt.toDate(), { addSuffix: true }) : 'Just Now'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[9px] md:text-[11px] font-bold text-slate-500 uppercase">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#2F4F4F]" />
                              {e.hospitalName}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Navigation className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#2F4F4F]" />
                              {calculateDistance(coords[0], coords[1], e.lat, e.lng).toFixed(1)}km
                            </div>
                          </div>
 
                          <div className="pt-1 md:pt-2 flex gap-2 md:gap-3">
                            <button 
                              onClick={() => handleAcceptAlert(e)}
                              className="flex-1 bg-[#2F4F4F] text-white px-4 md:px-8 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#8B0000] transition-colors shadow-lg active:scale-95"
                            >
                              Dispatch Response
                            </button>
                            <a 
                              href={`tel:${e.phone}`}
                              className="w-10 md:w-12 h-10 md:h-12 bg-slate-50 rounded-lg md:rounded-xl border-2 border-slate-100 text-slate-400 hover:text-[#8B0000] hover:border-[#8B0000] transition-all flex items-center justify-center flex-shrink-0"
                            >
                              <Phone className="w-4 h-4 md:w-5 md:h-5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredEmergencies.length === 0 && (
                      <div className="text-center py-32 bg-white border-2 border-dashed border-slate-100 rounded-3xl">
                        <ShieldCheck className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">{searchQuery ? 'No Matching Signals' : 'Zone Secure'}</h3>
                        <p className="text-sm italic text-slate-400 mt-2">{searchQuery ? `No pulse matching "${searchQuery}" detected.` : 'No active distress signals in your quadrant.'}</p>
                      </div>
                    )}
                  </div>
                </section>
              ) : activeView === 'admin' ? (
                <section className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-[#8B0000] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">Command <span className="text-[#8B0000]">Center</span></h2>
                        <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full System Override</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                       {[
                         { id: 'emergencies', label: 'Pulses', icon: Droplet },
                         { id: 'donors', label: 'Donors', icon: Users },
                         { id: 'banks', label: 'Facilities', icon: Building2 },
                         { id: 'users', label: 'User Profiles', icon: ShieldCheck }
                       ].map(sub => (
                         <button
                           key={sub.id}
                           onClick={() => setAdminSubView(sub.id as any)}
                           className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                             adminSubView === sub.id 
                               ? 'bg-slate-900 text-white shadow-md' 
                               : 'bg-slate-50 text-slate-400 hover:text-slate-900'
                           }`}
                         >
                           <sub.icon className="w-3 h-3" />
                           {sub.label}
                         </button>
                       ))}
                    </div>

                    <button onClick={() => setActiveView('dashboard')} className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase hover:text-[#8B0000] flex-shrink-0">Exit Protocol</button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {adminSubView === 'emergencies' && (
                      <>
                        <div className="bg-[#2F4F4F]/5 p-4 rounded-2xl border border-[#2F4F4F]/10 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-200">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending</div>
                              <div className="text-xl font-black text-[#8B0000]">{filteredEmergencies.length}</div>
                            </div>
                            <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-200">
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">System Health</div>
                              <div className="text-xl font-black text-green-500">100%</div>
                            </div>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter text-center md:text-right">
                            Direct modification of mission status will trigger quadrant-wide signal neutralization.
                          </p>
                        </div>

                        {filteredEmergencies.map(e => (
                          <div key={e.id} className="bg-white border-2 border-slate-100 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm flex flex-col gap-4 relative overflow-hidden group">
                            <div className="flex-1 space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1 min-w-0">
                                  <span className="text-[8px] md:text-[10px] font-black text-[#8B0000] bg-red-50 px-2 py-0.5 rounded-sm uppercase tracking-widest block">Mission ID: {e.id?.slice(0,8) || 'Unknown'}</span>
                                  <h3 className="text-sm md:text-lg font-black text-slate-800">{e.bloodType} {e.patientName}</h3>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{e.urgencyLevel}</div>
                                  <div className="text-[10px] md:text-xs font-bold text-slate-600 italic">
                                    {e.createdAt ? formatDistanceToNow(e.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 md:p-4 bg-slate-50 rounded-xl">
                                <div className="flex md:flex-col justify-between md:justify-start">
                                  <div className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase">Requester</div>
                                  <div className="text-[10px] md:text-[11px] font-bold text-slate-700">{e.requesterName}</div>
                                </div>
                                <div className="flex md:flex-col justify-between md:justify-start">
                                  <div className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase">Hospital</div>
                                  <div className="text-[10px] md:text-[11px] font-bold text-slate-700">{e.hospitalName}</div>
                                </div>
                                <div className="flex md:flex-col justify-between md:justify-start">
                                  <div className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase">Phone</div>
                                  <div className="text-[10px] md:text-[11px] font-bold text-[#2F4F4F]">{e.phone}</div>
                                </div>
                              </div>
     
                              <div className="flex gap-2 pt-1 md:pt-2">
                                <button 
                                  onClick={() => markAsResolved(e.id)}
                                  className="flex-1 bg-green-600 text-white py-2 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg active:scale-95"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> <span className="hidden md:inline">Mark as Resolved</span><span className="md:hidden">Resolve</span>
                                </button>
                                <button 
                                  onClick={() => deleteEmergency(e.id)}
                                  className="px-4 py-2 md:py-3 bg-slate-100 text-slate-400 rounded-lg md:rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                                  title="Delete (Admin Only)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {adminSubView === 'donors' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {donors.map(donor => (
                          <div key={donor.id} className="bg-white p-4 rounded-2xl border-2 border-slate-50 flex gap-4 items-center group">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black uppercase">
                              {donor.bloodType}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-slate-800 uppercase">{donor.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{donor.email}</p>
                            </div>
                            <button onClick={() => deleteDonor(donor.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {adminSubView === 'banks' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bloodBanks.map(bank => (
                          <div key={bank.id} className="bg-white p-4 rounded-2xl border-2 border-slate-50 flex gap-4 items-center group">
                            <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center">
                              <Building2 className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-slate-800 uppercase">{bank.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">STOCK: {bank.stock} units</p>
                            </div>
                            <button onClick={() => deleteBank(bank.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {adminSubView === 'users' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allUsers.map(u => (
                          <div key={u.id} className="bg-white p-4 rounded-2xl border-2 border-slate-50 flex gap-4 items-center group">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                              <User className="w-6 h-6 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-slate-800 uppercase">{u.name || 'Anonymous User'}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.email}</p>
                              {ADMIN_EMAILS.includes(u.email) && <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 rounded uppercase ml-1">MASTER ADMIN</span>}
                            </div>
                            {!ADMIN_EMAILS.includes(u.email) && (
                              <button onClick={() => deleteUser(u.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {usersLoading && (
                          <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Interrogating user records...</div>
                        )}
                      </div>
                    )}
                    
                    {adminSubView === 'emergencies' && filteredEmergencies.length === 0 && (
                      <div className="py-20 text-center bg-white border-2 border-dashed border-slate-100 rounded-3xl">
                        <CheckCircle2 className="w-16 h-16 text-green-100 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">{searchQuery ? 'Target Not Found' : 'Protocol Delta: Zero Active Signals'}</h3>
                      </div>
                    )}
                  </div>
                </section>
              ) : activeView === 'active-donors' ? (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Verified <span className="text-[#8B0000]">Personnel</span> On-Site</h2>
                    <button onClick={() => setActiveView('dashboard')} className="text-[10px] font-black text-slate-400 uppercase hover:text-[#8B0000]">Back to Radar</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {donors.map(donor => (
                      <motion.div 
                        key={donor.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white border-2 border-slate-100 p-6 rounded-2xl shadow-sm hover:border-[#2F4F4F] transition-all flex gap-6"
                      >
                        <div className="relative">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-[#2F4F4F]">
                            <ShieldCheck className="w-8 h-8" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-sm" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{donor.name}</h3>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{donor.bloodType} Negative</p>
                            </div>
                            <span className="text-[9px] font-black bg-slate-100 text-[#2F4F4F] px-2 py-0.5 rounded uppercase">
                              {calculateDistance(coords[0], coords[1], donor.lat, donor.lng).toFixed(1)}km
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <a 
                              href={`tel:${donor.phone}`}
                              className="flex-1 bg-[#2F4F4F] text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#8B0000] transition-colors"
                            >
                              <Phone className="w-3 h-3" /> Call
                            </a>
                            <a 
                              href={`https://wa.me/${donor.phone?.replace(/\D/g, '')}`}
                              target="_blank"
                              className="px-3 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              ) : activeView === 'donors' ? (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Verified <span className="text-[#8B0000]">Donor</span> Registry</h2>
                    <button onClick={() => setActiveView('dashboard')} className="text-[10px] font-black text-slate-400 uppercase hover:text-[#8B0000]">Back to Radar</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                    {filteredDonors.map((donor) => (
                      <DonorCard 
                        key={donor.id} 
                        donor={donor} 
                        distance={coords ? calculateDistance(coords[0], coords[1], donor.lat, donor.lng) : undefined}
                      />
                    ))}
                    {filteredDonors.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-100 rounded-[32px]">
                        <Users className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Registry Empty</h3>
                        <p className="text-sm italic text-slate-400 mt-2">No verified donors detected in this sector.</p>
                      </div>
                    )}
                  </div>
                </section>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white border-2 border-dashed border-slate-100 rounded-3xl">
                  <ShieldCheck className="w-16 h-16 text-slate-100 mb-4" />
                  <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Sector Initializing</h3>
                  <p className="text-sm italic text-slate-400 mt-2">Select a task from the Radar console above.</p>
                </div>
              )}

              {activeView === 'dashboard' && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Nearby <span className="text-[#8B0000]">Life</span> Links</h2>
                    <button 
                      onClick={() => setActiveView('donors')}
                      className="text-[10px] font-black text-[#8B0000] uppercase tracking-widest hover:underline transition-all"
                    >
                      View All Personnel
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {filteredDonors.length > 0 ? (
                      filteredDonors.slice(0, 8).map((donor) => (
                        <DonorCard 
                          key={donor.id} 
                          donor={donor} 
                          distance={coords ? calculateDistance(coords[0], coords[1], donor.lat, donor.lng) : undefined}
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-16 text-center bg-white border-2 border-dashed border-slate-100 rounded-[32px]">
                        <Users className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching results...</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Alerts & Actions */}
            {activeView === 'dashboard' && (
              <div className="lg:col-span-4 2xl:col-span-3 space-y-6">
                <EmergencyRequestForm onSubmit={handleCreateEmergency} loading={broadcastLoading} />
                
                <div className="bg-[#0F172A] text-white p-8 rounded-[40px] border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-32 h-32" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <h3 className="font-black text-xs tracking-[0.2em] uppercase text-red-500">
                      Security Standard
                    </h3>
                    <p className="text-xs text-slate-300 font-bold leading-relaxed uppercase tracking-tight">
                      End-to-End Encrypted Triage Protocol Active. Donor Identities remain masked until mission commitment.
                    </p>
                  </div>
                </div>

                <section className="space-y-4">
                   <div className="flex items-center justify-between px-2">

                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Network <span className="text-[#8B0000]">Pulse</span></h2>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                       <span className="text-[8px] font-black text-slate-400 uppercase">Live Signals</span>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                   {filteredEmergencies.slice(0, 8).map(e => (
                     <motion.div 
                       key={e.id}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col gap-3 group hover:border-red-900 transition-colors"
                     >
                       <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${e.urgencyLevel === 'Critical' ? 'bg-red-50 text-red-900' : 'bg-slate-50 text-slate-400'}`}>
                           <Droplet className="w-5 h-5" />
                         </div>
                         <div className="flex-1">
                           <div className="flex justify-between items-center mb-0.5">
                             <div className="flex items-center gap-2">
                               <span className={`text-[10px] font-black uppercase tracking-tighter ${e.urgencyLevel === 'Critical' ? 'text-red-900' : 'text-slate-400'}`}>{e.urgencyLevel}</span>
                               {e.requesterUid === user?.uid && (
                                 <span className="text-[8px] bg-slate-900 text-white px-1 rounded font-black uppercase">Your Request</span>
                               )}
                             </div>
                             <span className="text-[8px] font-bold text-slate-300 uppercase">Just Now</span>
                           </div>
                           <div className="text-xs font-black text-slate-800">{e.bloodType} Required for {e.patientName || 'Emergency Patient'}</div>
                           <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">At {e.hospitalName || 'Medical Facility'}</div>
                         </div>
                       </div>
                       
                       <div className="flex gap-2">
                         <a 
                           href={`tel:${e.phone}`}
                           className="w-full bg-slate-900 text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-900 transition-all shadow-sm active:scale-95"
                         >
                           <Phone className="w-3 h-3" />
                           Call Dispatch
                         </a>

                       </div>
                       
                       {e.requesterUid !== user?.uid && (
                         <div className="text-[8px] text-slate-400 text-center italic font-medium">Verified mission from {e.requesterName}</div>
                       )}
                     </motion.div>
                   ))}
                   {filteredEmergencies.length === 0 && (
                     <div className="text-center py-12 bg-white border border-slate-100 rounded-xl">
                       <ShieldCheck className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                       <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Radar Screen Clear</div>
                       <div className="text-[9px] italic text-slate-400">All regions currently secure.</div>
                     </div>
                   )}
                 </div>
              </section>
            </div>
          )}
        </motion.div>
        </AnimatePresence>
      </main>

      {/* Notifications Portal */}
      <div className="fixed top-24 md:top-auto md:bottom-8 right-4 md:right-8 z-[11000] flex flex-col gap-2 md:gap-4 pointer-events-none max-w-[calc(100vw-32px)]">
        <AnimatePresence>
          {alerts.filter(alert => !dismissedFloatingAlertIds.has(alert.emergencyId)).map((alert) => (
            <motion.div
              key={alert.emergencyId}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="bg-red-600 text-white p-4 rounded-[24px] shadow-2xl border border-white/20 pointer-events-auto w-full md:max-w-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <button 
                onClick={() => handleDismissAlert(alert.emergencyId)}
                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20 group"
                aria-label="Dismiss Alert"
              >
                <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
              </button>

              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2.5 rounded-2xl flex-shrink-0">
                  <Bell className="w-6 h-6 animate-bounce" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="font-black text-xs md:text-sm uppercase tracking-tight mb-0.5">Mission Alert</h4>
                  <p className="text-[10px] md:text-xs text-white/90 leading-tight font-medium mb-3">
                    {alert.message || `URGENT: ${alert.bloodType} required at ${alert.hospitalName || 'medical facility'}`}.
                  </p>
                  <button 
                    onClick={() => handleAcceptAlert(alert)}
                    className="w-full bg-white text-red-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-900/20 active:scale-95 transition-all hover:bg-red-50"
                  >
                    Accept Mission
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <NovaAssistant />

      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl relative z-10 border border-white/20 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-6 shadow-lg shadow-red-100">
                <MapPin className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">GPS Protocol Offline</h2>
              <p className="text-sm font-medium text-slate-400 mb-8 px-4 leading-relaxed">
                VitalRadar requires location access to synchronize your pulse with the nearest medical facilities. Please enable GPS permissions in your browser.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowLocationModal(false);
                    // Re-request if possible or show help
                    window.location.reload();
                  }}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95"
                >
                  Authorize Pulse
                </button>
                <button 
                  onClick={() => setShowLocationModal(false)}
                  className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Continue in Blind Mode
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuth={handleAuth}
        loading={loading}
      />
    </div>
  </div>
  );
}


import React, { useState } from 'react';
import { Droplet, AlertTriangle, Sparkles, Loader2, Info, Radio } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });
};

const ai = getAiClient();

interface EmergencyRequestFormProps {
  onSubmit: (data: { bloodType: string, urgency: string, phone: string, hospitalName: string, patientName: string }) => void;
  loading: boolean;
}

export const EmergencyRequestForm: React.FC<EmergencyRequestFormProps> = ({ onSubmit, loading }) => {
  const [bloodType, setBloodType] = useState('O+');
  const [urgency, setUrgency] = useState('Urgent');
  const [phone, setPhone] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [situation, setSituation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [wasLoading, setWasLoading] = useState(false);

  // Clear fields after successful broadcast
  React.useEffect(() => {
    if (wasLoading && !loading) {
      setPhone('');
      setHospitalName('');
      setPatientName('');
      setSituation('');
      setAiAnalysis(null);
    }
    setWasLoading(loading);
  }, [loading, wasLoading]);

  const handleAiTriage = async () => {
    if (!situation.trim() || isAnalyzing) return;
    
    if (!process.env.GEMINI_API_KEY && !(import.meta as any).env?.VITE_GEMINI_API_KEY) {
      setAiAnalysis("Configuration Error: GEMINI_API_KEY is missing. AI triage requires an active neural link.");
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          role: "user",
          parts: [{ text: `Analyze this emergency situation for a blood request: "${situation}". Categorize it into 'Critical' (life or death immediate), 'Urgent' (serious but stable for minutes), or 'Stable' (needed within hours). Return ONLY one word for the category followed by a 1-sentence justification. Format like this: [CATEGORY] Justification.` }]
        }],
        config: {
          systemInstruction: "You are a professional medical triage analyzer. Be precise and conservative."
        }
      });

      const text = response.text || "";
      setAiAnalysis(text);
      if (text.toUpperCase().includes('CRITICAL')) setUrgency('Critical');
      else if (text.toUpperCase().includes('URGENT')) setUrgency('Urgent');
      else if (text.toUpperCase().includes('STABLE')) setUrgency('Stable');

    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !hospitalName || !patientName) {
      alert("Please provide contact phone, hospital information, and patient name.");
      return;
    }
    onSubmit({ bloodType, urgency, phone, hospitalName, patientName });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] dark:shadow-none space-y-8 transition-colors duration-500">
      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-950 dark:bg-red-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-xl tracking-tight text-slate-800 dark:text-slate-100 leading-none">Broadcast SOS</h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mt-1.5">Network pulsing enabled</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-900/30">
           <div className="w-2 h-2 bg-red-600 rounded-full" />
           <span className="text-[9px] font-black text-red-900 dark:text-red-400">Live uplink</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Blood Type Selection */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 tracking-[0.2em] flex items-center gap-2">
            <Droplet className="w-3 h-3 text-red-600" /> Required antigen profile
          </label>
          <div className="grid grid-cols-4 gap-2">
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setBloodType(type)}
                className={`py-3.5 text-xs font-black rounded-2xl border-2 transition-all active:scale-95 ${
                  bloodType === type 
                    ? 'bg-slate-900 dark:bg-red-900 border-slate-900 dark:border-red-900 text-white shadow-xl translate-y-[-2px]' 
                    : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* AI Triage Section */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 tracking-[0.2em] flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-red-900 dark:text-red-500" /> Situation analysis (AI triage)
          </label>
          <div className="flex flex-col gap-3 mb-3">
             <textarea 
               value={situation}
               onChange={(e) => setSituation(e.target.value)}
               placeholder="Describe the medical situation..."
               className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium min-h-[80px] outline-none focus:border-slate-800 dark:focus:border-red-900 transition-all no-scrollbar text-slate-800 dark:text-slate-100 resize-none"
             />
             <button
               type="button"
               onClick={handleAiTriage}
               disabled={!situation.trim() || isAnalyzing}
               className="w-full py-4 bg-slate-900 dark:bg-red-900 text-white rounded-2xl hover:bg-black dark:hover:bg-red-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden flex items-center justify-center gap-2"
             >
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin relative z-10" /> : <Sparkles className="w-5 h-5 relative z-10" />}
                <span className="text-[10px] font-black uppercase tracking-widest relative z-10">
                  {isAnalyzing ? 'Analyzing situation...' : 'Initiate AI analysis'}
                </span>
             </button>
          </div>
          <AnimatePresence>
            {aiAnalysis && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-3 mt-2"
              >
                <Info className="w-3.5 h-3.5 text-red-900 dark:text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed tracking-tighter">
                   {aiAnalysis}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 tracking-[0.2em]">
              Protocol urgency
            </label>
            <select 
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-xs font-black tracking-widest text-slate-800 dark:text-slate-100 outline-none focus:border-slate-800 dark:focus:border-red-900 focus:bg-white dark:focus:bg-slate-900 transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="Critical">Critical (Immediate)</option>
              <option value="Urgent">Urgent (Delayed safe)</option>
              <option value="Stable">Stable (Routine)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 tracking-[0.2em]">
              Patient identity
            </label>
            <input 
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Full name or Hospital ID"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-slate-800 dark:focus:border-red-900 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 tracking-[0.2em]">
              Medical facility
            </label>
            <input 
              type="text"
              required
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="e.g. Sindh Medical Center"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-slate-800 dark:focus:border-red-900 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 tracking-[0.2em]">
              Authorized handset
            </label>
            <input 
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Verification Number"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-slate-800 dark:focus:border-red-900 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={loading}
        className="w-32 h-14 sm:w-full sm:h-auto sm:py-6 mx-auto bg-slate-900 dark:bg-red-900 hover:bg-black dark:hover:bg-red-800 text-white rounded-2xl sm:rounded-[28px] font-black text-[10px] sm:text-xs tracking-[0.3em] uppercase shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-0 sm:gap-4 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <div className="relative flex items-center justify-center shrink-0">
          <Radio className="w-6 h-6 sm:w-6 sm:h-6 text-red-500" />
          <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-20" />
        </div>
        <span className="relative z-10 hidden sm:inline">
          {loading ? 'Pulsing system encryption...' : 'Initiate SOS Broadcast'}
        </span>
      </motion.button>
      
      <div className="flex items-center justify-center gap-4 pt-2">
         <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
         <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 tracking-[0.5em]">System secure 2048-bit</span>
         <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
      </div>
    </form>
  );
};

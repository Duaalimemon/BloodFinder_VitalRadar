import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader2, Bot, Info, ShieldAlert } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY or VITE_GEMINI_API_KEY not found in environment.");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });
};

const ai = getAiClient();

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const NovaAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello, I'm Nova. I can help you find blood banks, check donor eligibility, or guide you through an emergency. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasApiKey = !!(process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    if (!hasApiKey) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "**System Configuration Required:** It appears the `GEMINI_API_KEY` is missing from the environment. To enable my neural core on platforms like GitHub, you must provide a valid Gemini API key in your environment variables." 
      }]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: userMsg }]
          }
        ],
        config: {
          systemInstruction: `You are Nova, the AI mission specialist for VitalRadar. 
          Your tone is professional, tactical, and calm.
          Your goal is to assist users with blood donation logistics, emergency response protocols, and finding resources on the VitalRadar network.
          
          CAPABILITIES:
          1. Finder: Guide users to find the 'Medical Centers' view to see nearby blood banks.
          2. Eligibility: Explain that donors must be 18-65 (usually), weigh >50kg, and be in good health.
          3. Emergency: Always prioritize safety. If life is at risk, tell them to call emergency services.
          
          STRICT RULES:
          - Use short, punchy, military-grade sentences.
          - Use technical terms like 'Sector', 'Pulse', 'Protocol', and 'Signal'.
          - If asked for 'Nearest Bank', inform them that the 'Medical Centers' map on the dashboard is the primary tool for real-time facility tracking.
          - Never list specific banks manually unless you have real data (which you don't yet, so direct them to the UI).`,
        }
      });

      const assistantMsg = response.text || "I apologize, command. I'm having trouble processing your request. Please try again or use the main dashboard.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Neural link fractured. Please use the primary dashboard interface while I recalibrate the core." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
          />
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 sm:bottom-6 sm:right-6 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center z-[10000] border border-white/10 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-900/20 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-500" />
            <motion.div
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center justify-center"
            >
              <Bot className="w-6 h-6 relative z-10" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.15)] flex flex-col z-[9999] overflow-hidden sm:rounded-l-[40px]"
          >
            {/* Header */}
            <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-900/50 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-tight leading-none uppercase">Nova <span className="text-[#8B0000]">Assistant</span></h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Neural Core Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-xs md:text-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'
                  }`}>
                    <div className="markdown-content prose prose-slate prose-invert max-w-none">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Nova is analyzing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-50">
              {['Eligibility?', 'Nearest Bank?', 'Emergency Help'].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="whitespace-nowrap px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase hover:border-slate-800 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-slate-50 bg-white">
              <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-slate-900 transition-all shadow-inner">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Nova anything..."
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2.5 text-sm font-medium text-white placeholder-slate-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black disabled:opacity-50 transition-all flex-shrink-0 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-300 font-bold uppercase tracking-widest mt-4">
                <ShieldAlert className="w-3 h-3 inline mr-1" /> System guidance is advisory only.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

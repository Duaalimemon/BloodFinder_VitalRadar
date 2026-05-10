import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, Bot, ShieldAlert } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // 1. Get API Key from Vite environment
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // 2. Update UI with user message
    setMessages(prev => [...prev, { role: 'user', content: trimmedInput }]);
    setInput('');

    if (!apiKey) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "**System Error:** `VITE_GEMINI_API_KEY` is not defined in your .env file." 
      }]);
      return;
    }

    setIsLoading(true);

    try {
      // 3. Initialize AI only when the function is called to avoid top-level browser errors
      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are Nova, a professional tactical assistant for VitalRadar. Keep responses punchy and use terms like 'Protocol' and 'Sector'."
      });

      const result = await model.generateContent(trimmedInput);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Neural link fractured. Please verify your API key and connection." 
      }]);
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
            <Bot className="w-6 h-6 relative z-10" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
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
                  <h3 className="font-black text-base uppercase">Nova <span className="text-red-500">Assistant</span></h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Core Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'
                  }`}>
                    <Markdown className="prose prose-sm max-w-none">{msg.content}</Markdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-400 p-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest">Analyzing...</span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-slate-100 bg-white">
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 focus-within:border-slate-400 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Nova anything..."
                  // Dark Blue text for Light Mode, light blue for Dark Mode
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2.5 text-sm font-bold text-[#001f3f] dark:text-blue-100 placeholder-slate-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black disabled:opacity-50 transition-all shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-300 font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Advisory only.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

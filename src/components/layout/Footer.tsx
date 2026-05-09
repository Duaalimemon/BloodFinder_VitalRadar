import React from 'react';
import { Droplet, Facebook, Twitter, Instagram, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface FooterProps {
  onViewChange: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onViewChange }) => {
  return (
    <footer className="bg-white border-t border-slate-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8B0000] rounded flex items-center justify-center">
                <Droplet className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase text-slate-800">EMERGENCE</span>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase leading-relaxed tracking-wider">
              Advanced Geospatial Matrix for Emergency Blood Search and Rescue Operations.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-[#8B0000] transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-[#8B0000] transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-[#8B0000] transition-colors"><Instagram className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] mb-6">Operations</h4>
            <ul className="space-y-3">
              <li><button onClick={() => onViewChange('dashboard')} className="text-xs font-bold text-slate-400 hover:text-[#8B0000] uppercase transition-colors">Radar Feed</button></li>
              <li><button onClick={() => onViewChange('live-events')} className="text-xs font-bold text-slate-400 hover:text-[#8B0000] uppercase transition-colors">Active SOS Signals</button></li>
              <li><button onClick={() => onViewChange('donors')} className="text-xs font-bold text-slate-400 hover:text-[#8B0000] uppercase transition-colors">Verified Personnel</button></li>
              <li><button onClick={() => onViewChange('banks')} className="text-xs font-bold text-slate-400 hover:text-[#8B0000] uppercase transition-colors">Medical Assets</button></li>
            </ul>
          </div>

          {/* Support/Info */}
          <div>
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] mb-6">Information</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-xs font-bold text-slate-400 hover:text-[#8B0000] uppercase transition-colors">Safety Protocols</a></li>
              <li><a href="#" className="text-xs font-bold text-slate-400 hover:text-[#8B0000] uppercase transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-xs font-bold text-slate-400 hover:text-[#8B0000] uppercase transition-colors">Privacy Matrix</a></li>
              <li><a href="#" className="text-xs font-bold text-slate-400 hover:text-[#8B0000] uppercase transition-colors text-red-600">Admin Terminal</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] mb-6">Headquarters</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#8B0000] flex-shrink-0" />
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-snug">Global Operations Center<br/>122 West St, NY 10001</p>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#8B0000] flex-shrink-0" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">Emergency: +1 (800) SOS-BLOOD</p>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#8B0000] flex-shrink-0" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ops@emergencerescue.io</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
            © 2026 EMERGENCE GEOSPATIAL SYSTEMS. ALL SIGNALS ENCRYPTED.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-black text-green-500 uppercase flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Global Grid Status: Active
            </span>
            <span className="text-[9px] font-black text-slate-300 uppercase">v2.0.4-BETA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

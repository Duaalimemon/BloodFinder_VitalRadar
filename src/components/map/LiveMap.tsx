import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Droplet, MapPin, Landmark, ShieldCheck, Activity, Radio, Crosshair } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const EmergencyIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="relative group">
       <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-20 scale-150" />
       <div className="bg-red-600 p-2 rounded-xl shadow-2xl relative z-10 border border-white/50">
          <Droplet className="w-5 h-5 text-white fill-white" />
       </div>
    </div>
  ),
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const UserIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="relative flex items-center justify-center">
       <div className="absolute w-12 h-12 border-2 border-slate-900/10 rounded-full animate-[spin_4s_linear_infinite]" />
       <div className="bg-slate-900 p-2 rounded-xl border border-white shadow-xl relative z-10">
          <Crosshair className="w-5 h-5 text-white" />
       </div>
    </div>
  ),
  className: '',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const BankIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="bg-slate-800 p-2 rounded-lg border border-slate-400/30 shadow-lg group">
       <Landmark className="w-5 h-5 text-white" />
    </div>
  ),
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const DonorIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="bg-white p-1 rounded-full border-2 border-slate-800 shadow-lg">
       <div className="bg-slate-100 p-1 rounded-full">
          <Droplet className="w-3 h-3 text-red-600" />
       </div>
    </div>
  ),
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface Donor {
  id: string;
  name: string;
  bloodType: string;
  lat: number;
  lng: number;
}

interface Emergency {
  id: string;
  requesterName: string;
  bloodType: string;
  lat: number;
  lng: number;
  urgency: string;
}

interface LiveMapProps {
  center: [number, number];
  donors: Donor[];
  emergencies: Emergency[];
  banks?: any[];
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export const LiveMap: React.FC<LiveMapProps> = ({ center, donors, emergencies, banks = [] }) => {
  return (
    <div className="h-[350px] md:h-[500px] w-full rounded-[32px] md:rounded-[40px] overflow-hidden border border-slate-200 bg-slate-50 relative group">
      {/* HUD Overlays */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none max-w-[calc(100%-32px)]">
        <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-white/10 shadow-2xl flex items-center gap-2 w-fit pointer-events-auto">
           <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
           <div>
              <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-0.5">RADAR: ACTIVE</p>
              <p className="text-[8px] font-bold text-slate-400 opacity-70 uppercase tracking-tighter">Sector Uplink Verified</p>
           </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 z-[400] pointer-events-none hidden md:flex">
        <div className="bg-white/80 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-slate-100 flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Distress Signal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Command Center</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Assets</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none border-[1px] border-slate-400/10 rounded-[40px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] radar-scan z-0 pointer-events-none opacity-10" />

      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        className="grayscale-[0.4] contrast-[1.2]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterMap center={center} />

        <Marker position={center} icon={UserIcon}>
          <Popup className="font-sans">
            <div className="p-2">
               <h4 className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</h4>
               <p className="text-sm font-black text-slate-800">UPLINK ESTABLISHED</p>
            </div>
          </Popup>
        </Marker>

        {banks.map(bank => (
          <Marker key={bank.id} position={[bank.lat, bank.lng]} icon={BankIcon}>
            <Popup>
              <div className="font-sans p-2 min-w-[200px]">
                <div className="flex items-center justify-between gap-4 mb-3 border-b border-slate-100 pb-2">
                  <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Medical Node</div>
                  {bank.isVerified && (
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                      <ShieldCheck className="w-2.5 h-2.5" /> SECURE
                    </div>
                  )}
                </div>
                <div className="font-black text-sm text-slate-800 leading-tight mb-1">{bank.name}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-4 leading-none">{bank.address}</div>
                
                {bank.inventory && (
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Live Inventory</p>
                    <div className="grid grid-cols-4 gap-2">
                       {Object.entries(bank.inventory as Record<string, number>).map(([type, count]) => (
                         <div key={type} className="flex flex-col items-center">
                           <div className="text-[9px] font-black text-slate-900 leading-none mb-1">{type}</div>
                           <div className={`text-[10px] font-black tabular-nums ${Number(count) < 5 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                             {count as number}
                           </div>
                         </div>
                       ))}
                     </div>
                  </div>
                )}
                
                {!bank.inventory && (
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 p-2 bg-slate-50 rounded-lg">
                    <Activity className="w-3 h-3" /> Node response timeout
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {donors.map(donor => (
          <Marker key={donor.id} position={[donor.lat, donor.lng]} icon={DonorIcon}>
            <Popup>
              <div className="font-sans p-1 text-center">
                <div className="text-[9px] font-black text-emerald-600 uppercase mb-1">Verified Unit</div>
                <div className="text-sm font-black text-slate-800">{donor.name}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase mt-1">Profile: {donor.bloodType}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {emergencies.map(emergency => (
          <React.Fragment key={emergency.id}>
            <Marker position={[emergency.lat, emergency.lng]} icon={EmergencyIcon}>
              <Popup>
                <div className="font-sans p-2 min-w-[180px]">
                  <div className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                     <Radio className="w-3 h-3 animate-pulse" /> Critical Sos
                  </div>
                  <div className="font-black text-lg text-slate-800 leading-none mb-1">{emergency.bloodType} Required</div>
                  <p className="text-[10px] font-bold text-slate-500 mb-3 tracking-tighter">Signal triggered by {emergency.requesterName}</p>
                  
                  <button className="w-full py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/30">
                     Respond to Mission
                  </button>
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={[emergency.lat, emergency.lng]} 
              radius={2000} 
              pathOptions={{ 
                color: '#ef4444', 
                fillColor: '#ef4444', 
                fillOpacity: 0.05, 
                weight: 1, 
                dashArray: '4, 8' 
              }} 
            />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

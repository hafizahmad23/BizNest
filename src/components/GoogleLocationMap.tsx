import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Compass, ExternalLink, ShieldCheck, Info } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface GoogleLocationMapProps {
  lat: number;
  lng: number;
  locationName: string;
  address?: string;
  province?: string;
  district?: string;
  tehsil?: string;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  isDarkMode?: boolean;
}

export const GoogleLocationMap: React.FC<GoogleLocationMapProps> = ({
  lat,
  lng,
  locationName,
  address,
  province,
  district,
  tehsil,
  onCoordinatesChange,
  isDarkMode = true
}) => {
  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number }>({ lat, lng });
  const [showInfoWindow, setShowInfoWindow] = useState(true);

  // Sync state if props change
  React.useEffect(() => {
    setSelectedPos({ lat, lng });
  }, [lat, lng]);

  const handleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      const newLat = e.detail.latLng.lat;
      const newLng = e.detail.latLng.lng;
      setSelectedPos({ lat: newLat, lng: newLng });
      if (onCoordinatesChange) {
        onCoordinatesChange(newLat, newLng);
      }
    }
  };

  if (!hasValidKey) {
    return (
      <div className={`p-5 rounded-2xl border text-left ${
        isDarkMode ? 'bg-[#0b1329] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Interactive Map Verification</h4>
              <p className="text-xs text-slate-400">
                {locationName} {district ? `(${district}, ${province || 'Pakistan'})` : ''}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[11px] font-bold border border-cyan-500/20 flex items-center gap-1">
            <Compass className="w-3 h-3" />
            {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </span>
        </div>

        {/* Visual Map Placeholder / Simulated Coordinate Viewer */}
        <div className="relative h-64 rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-900 flex flex-col items-center justify-center p-6 text-center group">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
          
          <div className="relative z-10 space-y-3 max-w-md">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/10 animate-bounce">
              <MapPin className="w-6 h-6" />
            </div>
            <h5 className="font-bold text-sm text-white">
              Selected Location: {locationName}
            </h5>
            <p className="text-xs text-slate-300">
              {address || `${tehsil || ''} ${district || ''}, ${province || 'Pakistan'}`}
            </p>

            <div className="pt-2 text-[11px] text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-left">
              <p className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Google Maps API Key Instructions
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px]">
                <li>Get a Google Maps API Key from Google Cloud Console</li>
                <li>In AI Studio: Open <strong>Settings (⚙️)</strong> → <strong>Secrets</strong></li>
                <li>Add key name: <code className="text-amber-300 bg-slate-800 px-1 rounded">GOOGLE_MAPS_PLATFORM_KEY</code></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden border border-slate-700 shadow-xl relative">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={selectedPos}
          center={selectedPos}
          defaultZoom={13}
          mapId="BIZNEST_PAKISTAN_MAP"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          onClick={handleMapClick}
          style={{ width: '100%', height: '100%' }}
        >
          <AdvancedMarker
            position={selectedPos}
            onClick={() => setShowInfoWindow(prev => !prev)}
          >
            <Pin background="#10B981" glyphColor="#FFFFFF" borderColor="#065F46" />
          </AdvancedMarker>

          {showInfoWindow && (
            <InfoWindow
              position={selectedPos}
              onCloseClick={() => setShowInfoWindow(false)}
            >
              <div className="p-1 text-slate-900 max-w-xs">
                <h4 className="font-bold text-xs text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {locationName}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {address || `${district || ''}, ${province || 'Pakistan'}`}
                </p>
                <div className="mt-1 text-[10px] text-slate-400 font-mono">
                  Lat: {selectedPos.lat.toFixed(5)}, Lng: {selectedPos.lng.toFixed(5)}
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
};

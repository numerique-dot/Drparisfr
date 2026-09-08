import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { MapPin, Sparkles, Settings, ChevronRight, Navigation, Copy, Check, ExternalLink } from 'lucide-react';
import { COMPANY_INFO } from '../constants';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY.trim() !== '' && API_KEY !== 'YOUR_API_KEY';

// Latitude & Longitude for 50 rue Popincourt, 75011 Paris
const POSITION = { lat: 48.862660, lng: 2.373492 };
const ITINERARY_URL = `https://www.google.com/maps/dir/?api=1&destination=50+Rue+Popincourt+75011+Paris`;

export const InteractiveMap: React.FC = () => {
  const [showKeyInstructions, setShowKeyInstructions] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowOpen, setInfoWindowOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("50 rue Popincourt, 75011 Paris");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="interactive-google-map" className="bg-white rounded-3xl overflow-hidden shadow-xl border border-purple-100 flex flex-col h-full min-h-[460px] relative transition-all duration-300">
      
      {/* Header bar */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 px-5 py-3.5 text-white flex items-center justify-between text-xs font-medium z-10 border-b border-purple-900/40">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-[11px] uppercase text-purple-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              Localisation Institut
            </span>
            <span className="text-[10px] text-slate-400 font-mono">50 Rue Popincourt, 75011 Paris</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <a
            href={ITINERARY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:text-white transition flex items-center gap-1 px-2.5 py-1 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 rounded-lg text-[11px] font-bold"
            title="Ouvrir dans Google Maps"
          >
            <Navigation className="w-3 h-3" />
            <span className="hidden sm:inline">Itinéraire</span>
          </a>

          <button 
            onClick={() => setShowKeyInstructions(!showKeyInstructions)}
            className="text-purple-300 hover:text-white transition flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-lg text-[11px] font-bold"
            title="Options de rendu"
          >
            <Settings className="w-3 h-3" />
            <span className="hidden sm:inline">{showKeyInstructions ? "Carte" : "Configuration"}</span>
          </button>
        </div>
      </div>

      {showKeyInstructions ? (
        /* Setup / Instructions Screen */
        <div className="p-8 flex flex-col justify-center items-center text-center bg-gradient-to-tr from-slate-900 to-purple-950 text-white flex-grow min-h-[380px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 text-white shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6 text-[#D4AF37] animate-pulse" />
          </div>

          <h3 className="text-lg font-black tracking-tight mb-2 text-white">Google Maps Vectoriel SDK</h3>
          <p className="text-xs text-purple-200/80 max-w-sm mb-6 leading-relaxed">
            Pour activer la vue vectorielle avec inclinaison 3D personnalisée, vous pouvez configurer une clé API Google Maps Platform.
          </p>

          <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-5 text-left mb-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-purple-300 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</span>
              <p className="text-xs text-slate-300">
                Obtenez une clé API sur la console Google Cloud : <br />
                <a 
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp_mcp_codeassist_v1_aistudio" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-amber-400 hover:text-amber-300 font-bold underline inline-flex items-center gap-0.5 mt-1"
                >
                  Générer une Clé API <ChevronRight className="w-3 h-3" />
                </a>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-purple-300 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">2</span>
              <p className="text-xs text-slate-300">
                Ouvrez les <strong>Paramètres de l'espace de travail</strong> (icône d'engrenage ⚙️) &rarr; onglet <strong>Secrets</strong>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-purple-300 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">3</span>
              <p className="text-xs text-slate-300">
                Ajoutez la variable <code className="bg-white/15 px-1.5 py-0.5 rounded font-mono text-[10px] text-white font-bold">GOOGLE_MAPS_PLATFORM_KEY</code>.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setShowKeyInstructions(false)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg"
          >
            Retourner à la carte interactive
          </button>
        </div>
      ) : (
        /* Real Map or Fallback Display */
        <div className="relative flex-grow min-h-[380px] w-full bg-slate-100">
          {hasValidKey ? (
            /* Interactive JS SDK Map with Custom Branded Advanced Marker */
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={POSITION}
                defaultZoom={16}
                mapId="DEMO_MAP_ID"
                disableDefaultUI={false}
                zoomControl={true}
                gestureHandling="cooperative"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full min-h-[380px]"
              >
                <AdvancedMarker 
                  ref={markerRef} 
                  position={POSITION} 
                  onClick={() => setInfoWindowOpen(true)}
                  title="D.R. Santé & Beauté - 50 rue Popincourt"
                >
                  {/* Custom Marker aux couleurs de l'institut (Violet #7C3AED & Or #D4AF37) */}
                  <div className="relative group cursor-pointer flex flex-col items-center select-none transform -translate-y-2">
                    {/* Glowing pulse ring */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-purple-800 to-amber-500 rounded-full blur-sm opacity-70 group-hover:opacity-100 animate-pulse"></div>
                    
                    {/* Main Badge */}
                    <div className="relative flex items-center gap-2 bg-gradient-to-r from-[#2A1A3E] via-[#4C1D95] to-[#7C3AED] text-white px-3.5 py-1.5 rounded-full shadow-2xl border-2 border-[#D4AF37] group-hover:scale-105 transition-transform duration-200">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D4AF37] text-[#2A1A3E] font-black text-[10px] flex items-center justify-center shadow-inner">
                        DR
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] font-black tracking-wide text-white leading-tight">
                          D.R. Santé & Beauté
                        </span>
                        <span className="text-[9px] text-amber-200 font-medium leading-tight">
                          50 rue Popincourt
                        </span>
                      </div>
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>

                    {/* Marker Tail */}
                    <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-[#4C1D95] mx-auto -mt-[1px] drop-shadow-md"></div>
                    {/* Pulse Dot */}
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] -mt-0.5 shadow-md"></div>
                  </div>
                </AdvancedMarker>

                {infoWindowOpen && (
                  <InfoWindow anchor={marker} onCloseClick={() => setInfoWindowOpen(false)}>
                    <div className="p-3 text-slate-900 font-sans max-w-[260px]">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-purple-700 text-amber-300 font-black text-[10px] flex items-center justify-center">DR</span>
                        <h4 className="font-extrabold text-sm text-purple-900">
                          {COMPANY_INFO.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-700 font-semibold leading-normal">
                        50 rue Popincourt, 75011 Paris
                      </p>
                      <p className="text-[11px] text-purple-700 font-medium mt-1">
                        🚇 Métro Saint-Ambroise (L9) &bull; Richard-Lenoir (L5)
                      </p>
                      <div className="mt-3 pt-2 border-t border-gray-100 flex gap-2">
                        <a
                          href={ITINERARY_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold py-1.5 px-2.5 rounded-lg text-center flex items-center justify-center gap-1 transition"
                        >
                          <Navigation className="w-3 h-3" />
                          Itinéraire
                        </a>
                        <button
                          onClick={handleCopyAddress}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition"
                        >
                          {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          ) : (
            /* Interactive Embed Map with Institute Custom Marker Overlay */
            <div className="w-full h-full relative min-h-[380px] overflow-hidden">
              <iframe 
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: '380px' }}
                loading="lazy" 
                allowFullScreen 
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.764375971488!2d2.373491876846177!3d48.86266010041132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66dfb8d8f99ad%3A0x6b8f8f8f8f8f8f8f!2s50%20Rue%20Popincourt%2C%2075011%20Paris%2C%20France!5e0!3m2!1sfr!2sfr!4v1700000000000!5m2!1sfr!2sfr"
                title="Carte Google Maps 50 rue Popincourt 75011 Paris"
                className="w-full h-full absolute inset-0"
              ></iframe>

              {/* Custom Institute Marker Floating Pill over 50 rue Popincourt */}
              <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-xs z-10 pointer-events-auto">
                <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border-2 border-[#D4AF37]/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2A1A3E] via-[#4C1D95] to-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-md border border-[#D4AF37]/50">
                    <span className="font-black text-xs text-[#D4AF37]">DR</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-900 text-xs truncate">D.R. Santé & Beauté</span>
                      <Sparkles className="w-3 h-3 text-[#D4AF37] shrink-0" />
                    </div>
                    <p className="text-[11px] font-semibold text-purple-700 leading-tight">
                      50 rue Popincourt, 75011 Paris
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                      Métro Saint-Ambroise (L9) &bull; Richard-Lenoir (L5)
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Action Floating Bar at the bottom of the map */}
              <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 z-10 flex items-center gap-2">
                <a
                  href={ITINERARY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-lg flex items-center gap-1.5 transition transform hover:-translate-y-0.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-200" />
                  <span>Itinéraire Google Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <button
                  onClick={handleCopyAddress}
                  className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 text-xs font-bold py-2 px-3 rounded-xl shadow-md border border-purple-100 flex items-center gap-1.5 transition"
                  title="Copier l'adresse"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-purple-600" />
                      <span className="hidden sm:inline">Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Quick metro & transport info banner beneath map */}
          <div className="bg-purple-50/70 border-t border-purple-100/80 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span><strong>Adresse :</strong> 50 rue Popincourt, 75011 Paris (Face au square)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-purple-100 font-bold text-purple-800">M9 Saint-Ambroise</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 font-bold text-amber-800">M5 Richard-Lenoir</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 font-bold text-slate-800">M9 Voltaire</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


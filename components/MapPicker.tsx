'use client';
import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface MapPickerProps {
  lat: number;
  lng: number;
  radiusMeters: number;
  onChangeLocation: (lat: number, lng: number, addressName?: string) => void;
}

export default function MapPicker({ lat, lng, radiusMeters, onChangeLocation }: MapPickerProps) {
  const [currentLat, setCurrentLat] = useState(lat || -18.5808); // Patos de Minas como fallback
  const [currentLng, setCurrentLng] = useState(lng || -46.5181);
  const [loadingGps, setLoadingGps] = useState(false);

  // Capturar posição atual do GPS do celular
  function handleUseCurrentLocation() {
    if (!navigator.geolocation) return alert('Geolocalização não suportada no aparelho.');

    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setCurrentLat(newLat);
        setCurrentLng(newLng);
        onChangeLocation(newLat, newLng, 'Minha Localização Atual');
        setLoadingGps(false);
      },
      (err) => {
        alert('Erro ao obter localização: ' + err.message);
        setLoadingGps(false);
      },
      { enableHighAccuracy: true }
    );
  }

  // Gera a URL do OpenStreetMap estático/interativo com o raio e o ponto
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${currentLng - 0.005},${currentLat - 0.005},${currentLng + 0.005},${currentLat + 0.005}&layer=mapnik&marker=${currentLat},${currentLng}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
          <MapPin size={14} className="text-indigo-400" /> Ponto no Mapa
        </span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={loadingGps}
          className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 active:scale-95 transition-all"
        >
          <Navigation size={12} /> {loadingGps ? 'Buscando GPS...' : 'Usar meu GPS'}
        </button>
      </div>

      {/* Frame do Mapa */}
      <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-900 shadow-inner">
        <iframe
          title="Seletor de Localização"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={mapUrl}
          className="grayscale contrast-125 opacity-80"
        />
        
        {/* Indicador do Raio Visual */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div 
            className="rounded-full border-2 border-indigo-500 bg-indigo-500/20 animate-pulse flex items-center justify-center"
            style={{
              width: `${Math.min(Math.max(radiusMeters / 4, 40), 140)}px`,
              height: `${Math.min(Math.max(radiusMeters / 4, 40), 140)}px`,
            }}
          >
            <span className="text-[9px] font-black text-indigo-200 bg-zinc-950/80 px-1.5 py-0.5 rounded-full border border-indigo-500/40">
              {radiusMeters}m
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-[10px] text-zinc-500 leading-tight">
        O alerta será disparado quando a coordenada do seu celular entrar dentro do raio azul estipulado.
      </p>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Star, MapPin } from 'lucide-react';
import { db } from '../lib/db';
import { supabase } from '../lib/supabase';
import { triggerHaptic } from '../lib/haptics';

const icon = L.icon({ 
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", 
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41]
});

interface FavoriteLocation {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  radius_meters?: number;
}

interface MapPickerProps {
  lat?: number;
  lng?: number;
  radius?: number;
  onLocationChange: (lat: number, lng: number, name?: string) => void;
  userId?: string;
}

export default function MapPicker({ lat, lng, radius = 100, onLocationChange, userId }: MapPickerProps) {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [isSavingFav, setIsSavingFav] = useState(false);
  const [favName, setFavName] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    // Carrega locais favoritos salvos (exemplo local ou via Supabase)
    const { data } = await supabase.from('favorite_locations').select('*');
    if (data && data.length > 0) {
      setFavorites(data);
    } else {
      // Fallback para favoritos iniciais úteis
      setFavorites([
        { name: 'Casa', lat: lat || -18.5808, lng: lng || -46.5181 },
      ]);
    }
  }

  async function handleSaveFavorite() {
    if (!lat || !lng || !favName.trim()) return;
    triggerHaptic('success');

    const newFav: FavoriteLocation = {
      id: crypto.randomUUID(),
      name: favName.trim(),
      lat,
      lng,
      radius_meters: radius
    };

    // Salva na nuvem Supabase
    await supabase.from('favorite_locations').upsert([newFav]);
    setFavorites([...favorites, newFav]);
    setIsSavingFav(false);
    setFavName('');
  }

  function MapEvents() {
    useMapEvents({
      click(e) { 
        triggerHaptic('light');
        onLocationChange(e.latlng.lat, e.latlng.lng, 'Local Personalizado'); 
      },
    });
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Lista Rápida de Favoritos (Chips) */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {favorites.map((fav, index) => (
          <button
            key={fav.id || index}
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onLocationChange(fav.lat, fav.lng, fav.name);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 hover:border-indigo-500 shrink-0 transition-all"
          >
            <MapPin size={12} className="text-indigo-400" /> {fav.name}
          </button>
        ))}
      </div>

      {/* Container do Mapa */}
      <div className="relative h-56 w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-xl">
        <MapContainer center={[lat || -18.5808, lng || -46.5181]} zoom={14} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {lat && lng && (
            <>
              <Marker position={[lat, lng]} icon={icon} />
              <Circle center={[lat, lng]} radius={radius} color="#6366f1" fillColor="#6366f1" fillOpacity={0.2} />
            </>
          )}
          <MapEvents />
        </MapContainer>

        {/* Botão Flutuante de Favoritar Local Atual */}
        {lat && lng && (
          <div className="absolute top-3 right-3 z-40">
            <button
              type="button"
              onClick={() => setIsSavingFav(!isSavingFav)}
              className="p-2.5 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-xl text-amber-400 shadow-lg hover:bg-zinc-800 transition-all"
              title="Salvar nos Favoritos"
            >
              <Star size={16} fill="currentColor" />
            </button>
          </div>
        )}
      </div>

      {/* Input Flutuante para Nomear o Favorito */}
      {isSavingFav && (
        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex gap-2 animate-in fade-in">
          <input 
            type="text"
            placeholder="Nome do local (Ex: Trabalho, Farmácia)..."
            value={favName}
            onChange={(e) => setFavName(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 outline-none"
          />
          <button
            type="button"
            onClick={handleSaveFavorite}
            className="px-3 py-1.5 bg-indigo-600 text-xs font-bold text-white rounded-lg shadow"
          >
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}

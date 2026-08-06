'use client';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrige o ícone padrão do Leaflet que quebra no React
const icon = L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png" });

export default function MapPicker({ lat, lng, radius, onLocationChange }: any) {
  function MapEvents() {
    useMapEvents({
      click(e) { onLocationChange(e.latlng.lat, e.latlng.lng); },
    });
    return null;
  }

  return (
    <div className="h-64 w-full rounded-3xl overflow-hidden border border-zinc-700 shadow-xl">
      <MapContainer center={[lat || -15.7801, lng || -47.9292]} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {lat && lng && (
          <>
            <Marker position={[lat, lng]} icon={icon} />
            <Circle center={[lat, lng]} radius={radius} color="#6366f1" fillColor="#6366f1" />
          </>
        )}
        <MapEvents />
      </MapContainer>
    </div>
  );
}

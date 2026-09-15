'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  label: string;
  isAnycast?: boolean;
}

export default function LeafletMap({
  latitude,
  longitude,
  label,
  isAnycast = false,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 9);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    const popupContent = `
      <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
        <strong>${label}</strong><br/>
        <span>Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}</span><br/>
        ${isAnycast ? '<span style="color: #b91c1c; font-weight: bold;">🌐 Anycast Edge Location</span>' : ''}
      </div>
    `;

    L.marker([latitude, longitude], { icon: defaultIcon })
      .addTo(map)
      .bindPopup(popupContent)
      .openPopup();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, label, isAnycast]);

  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden border border-gray-300 z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface MapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

// Only import and initialize Leaflet on the client side
const Map = ({ onLocationSelect }: MapProps) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import Leaflet
    const initializeMap = async () => {
      const L = (await import('leaflet')).default;
      
      // Initialize map
      if (!mapRef.current && containerRef.current) {
        mapRef.current = L.map(containerRef.current).setView([0, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);

        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude: lat, longitude: lng } = position.coords;
              mapRef.current?.setView([lat, lng], 12);
            },
            () => {
              // Handle geolocation error
            }
          );
        }

        // Add click handler
        mapRef.current.on('click', async (e: any) => {
          const { lat, lng } = e.latlng;

          // Update or create marker
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
          }

          try {
            // Get address using Nominatim (OpenStreetMap's geocoding service)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            
            if (data.display_name) {
              onLocationSelect(lat, lng, data.display_name);
            }
          } catch (error) {
            console.error('Error getting address:', error);
          }
        });
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [onLocationSelect]);

  return <div ref={containerRef} className="w-full h-full" />;
};

// Prevent SSR for this component
export default dynamic(() => Promise.resolve(Map), {
  ssr: false
}); 
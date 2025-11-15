import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";

interface MapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  showMarker?: boolean;
}

export const MapView = ({ latitude, longitude, zoom = 15, showMarker = true }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    const fetchToken = async () => {
      const { data } = await supabase.functions.invoke('get-mapbox-token');
      if (data?.token) {
        setMapboxToken(data.token);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude, latitude],
      zoom: zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    if (showMarker) {
      marker.current = new mapboxgl.Marker({ color: '#2563EB' })
        .setLngLat([longitude, latitude])
        .addTo(map.current);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, latitude, longitude, zoom, showMarker]);

  useEffect(() => {
    if (map.current && marker.current) {
      marker.current.setLngLat([longitude, latitude]);
      map.current.flyTo({ center: [longitude, latitude], zoom });
    }
  }, [latitude, longitude, zoom]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full min-h-[300px] rounded-lg"
    />
  );
};

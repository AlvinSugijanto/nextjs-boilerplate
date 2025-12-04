'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from 'next-themes';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const TraccarMap = ({ devices, positions }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (mapboxgl.accessToken === '') {
      console.error("Mapbox token is not set. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file.");
      return;
    }
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [106.8, -6.2],
      zoom: 10,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isDark]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const deviceMap = new Map();
    devices.forEach(d => deviceMap.set(d.id, d));

    const latestPositions = new Map();
    positions.forEach(p => {
      if (!latestPositions.has(p.deviceId)) {
        latestPositions.set(p.deviceId, p);
      }
    });

    latestPositions.forEach(position => {
      const device = deviceMap.get(position.deviceId);
      if (!device) return;

      const { latitude, longitude } = position;
      const lngLat = [longitude, latitude];

      const popupHtml = `
            <div class="text-sm text-black">
                <div class="font-semibold mb-1">${device.name}</div>
                <div class="text-xs text-gray-600 mb-1">Status: ${device.status}</div>
                <div class="text-xs text-gray-500">
                    ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
                </div>
            </div>
        `;

      if (markersRef.current[device.id]) {
        markersRef.current[device.id].setLngLat(lngLat);
        markersRef.current[device.id].getPopup().setHTML(popupHtml);
      } else {
        const el = document.createElement('div');
        el.className = 'w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg';

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);

        const newMarker = new mapboxgl.Marker(el)
          .setLngLat(lngLat)
          .setPopup(popup)
          .addTo(mapRef.current);

        markersRef.current[device.id] = newMarker;
      }
    });

    if (Object.keys(markersRef.current).length > 0 && positions.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      Object.values(markersRef.current).forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 500 });
      }
    }

  }, [devices, positions, mapLoaded]);

  if (mapboxgl.accessToken === '') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <p className="text-red-500">
          Mapbox access token is not configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your environment variables.
        </p>
      </div>
    )
  }

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default TraccarMap;

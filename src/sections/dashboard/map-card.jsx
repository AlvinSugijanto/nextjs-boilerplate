import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { useTheme } from "next-themes";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const GEOFENCE_POLYGON = {
  type: "Feature",
  properties: { name: "Geofence Bundaran HI" },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [106.821564, -6.1922],
        [106.8226, -6.1922],
        [106.8226, -6.1913],
        [106.821564, -6.1913],
        [106.821564, -6.1922],
      ],
    ],
  },
};

const ROUTE_LINE = {
  type: "Feature",
  properties: { name: "Sample Route" },
  geometry: {
    type: "LineString",
    coordinates: [
      [106.8205, -6.1928],
      [106.8213, -6.1922],
      [106.8221, -6.1918],
      [106.823, -6.1915],
    ],
  },
};

const DEVICE_MARKER = {
  lng: 106.8219,
  lat: -6.1919,
  label: "Device #001",
  description: "Last update: 2 mins ago",
};

function MapCard({ mapRef, mapContainerRef }) {
  const { theme } = useTheme();

  // state
  const [mapLoaded, setMapLoaded] = useState(false);

  const isDark = useMemo(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  }, [theme]);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isDark
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11",
      center: [106.8219, -6.1918],
      zoom: 16,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    map.on("load", () => {
      setMapLoaded(true);

      map.addSource("geofence-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [GEOFENCE_POLYGON] },
      });

      map.addLayer({
        id: "geofence-fill",
        type: "fill",
        source: "geofence-source",
        paint: { "fill-color": "#10b981", "fill-opacity": 0.2 },
      });

      map.addLayer({
        id: "geofence-outline",
        type: "line",
        source: "geofence-source",
        paint: { "line-color": "#10b981", "line-width": 2 },
      });

      map.addSource("route-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [ROUTE_LINE] },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route-source",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#3b82f6", "line-width": 4 },
      });

      const markerEl = document.createElement("div");
      markerEl.className =
        "w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg";

      const popupHtml = `
            <div class="text-sm">
              <div class="font-semibold mb-1">${DEVICE_MARKER.label}</div>
              <div class="text-xs text-gray-600 mb-1">${
                DEVICE_MARKER.description
              }</div>
              <div class="text-xs text-gray-500">
                ${DEVICE_MARKER.lng.toFixed(5)}, ${DEVICE_MARKER.lat.toFixed(5)}
              </div>
            </div>
          `;

      new mapboxgl.Marker(markerEl)
        .setLngLat([DEVICE_MARKER.lng, DEVICE_MARKER.lat])
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(popupHtml))
        .addTo(map);

      const bounds = new mapboxgl.LngLatBounds();
      GEOFENCE_POLYGON.geometry.coordinates[0].forEach(([lng, lat]) => {
        bounds.extend([lng, lat]);
      });
      ROUTE_LINE.geometry.coordinates.forEach(([lng, lat]) => {
        bounds.extend([lng, lat]);
      });
      bounds.extend([DEVICE_MARKER.lng, DEVICE_MARKER.lat]);
      map.fitBounds(bounds, { padding: 60, duration: 800 });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [
    isDark,
    GEOFENCE_POLYGON,
    ROUTE_LINE,
    DEVICE_MARKER,
    mapRef.current,
    mapContainerRef.current,
  ]);

  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      mapRef.current.setStyle(
        isDark
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11"
      );
    }
  }, [isDark, mapLoaded]);

  return (
    <Card className="h-full p-0 overflow-hidden">
      {/* Map */}
      <main className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-sm font-medium">Loading map...</p>
            </div>
          </div>
        )}
      </main>
    </Card>
  );
}

export default MapCard;

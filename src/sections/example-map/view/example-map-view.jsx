"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function ExampleMapView() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDark, setIsDark] = useState(true);

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
  }, [isDark, GEOFENCE_POLYGON, ROUTE_LINE, DEVICE_MARKER]);

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
    <div
      className={`min-h-screen ${isDark ? "dark bg-gray-950" : "bg-gray-50"}`}
    >
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header
          className={`border-b ${
            isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1
                className={`text-2xl font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Tracking Dashboard
              </h1>
              <p
                className={`text-sm mt-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Real-time geofence monitoring & route tracking
              </p>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {isDark ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`w-80 border-r overflow-y-auto ${
              isDark
                ? "bg-gray-900 border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="p-6 space-y-4">
              {/* Status */}
              <div
                className={`p-4 rounded-lg ${
                  isDark ? "bg-gray-800" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      mapLoaded ? "bg-green-500" : "bg-yellow-500"
                    } animate-pulse`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {mapLoaded ? "Map Active" : "Initializing..."}
                  </span>
                </div>
              </div>

              {/* Geofence */}
              <div
                className={`p-4 rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-semibold mb-1 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Geofence Zone
                    </h3>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Bundaran HI monitoring area with automated entry/exit
                      detection
                    </p>
                  </div>
                </div>
              </div>

              {/* Route */}
              <div
                className={`p-4 rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-semibold mb-1 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Active Route
                    </h3>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Historical tracking path showing device movement
                      trajectory
                    </p>
                  </div>
                </div>
              </div>

              {/* Device */}
              <div
                className={`p-4 rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-sm font-semibold mb-1 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Device #001
                    </h3>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Current position with real-time coordinates and status
                      updates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Map */}
          <main className="flex-1 relative">
            <div ref={mapContainerRef} className="w-full h-full" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white text-sm font-medium">
                    Loading map...
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

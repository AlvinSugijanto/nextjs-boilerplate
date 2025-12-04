import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from 'next-themes';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const TraccarMap = ({ devices, positions, geofences }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const geofencesRef = useRef(geofences);
  const hasFitBounds = useRef(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    geofencesRef.current = geofences;
  }, [geofences]);

  // Calculate centroid of a polygon
  const calculateCentroid = (coordinates) => {
    const coords = coordinates[0]; // Get outer ring
    let x = 0, y = 0;
    const numPoints = coords.length - 1; // Exclude the closing point

    for (let i = 0; i < numPoints; i++) {
      x += coords[i][0];
      y += coords[i][1];
    }

    return [x / numPoints, y / numPoints];
  };

  // Parse Traccar geofence format to GeoJSON
  const parseGeofence = (area) => {
    if (area.startsWith('CIRCLE')) {
      const match = area.match(/CIRCLE \(([-\d.]+) ([-\d.]+), ([\d.]+)\)/);
      if (match) {
        const [, lat, lng, radius] = match;
        const center = [parseFloat(lng), parseFloat(lat)];
        const points = 64;
        const coords = [];
        const latCenter = parseFloat(lat);
        const radiusInDegreesLat = radius / 111320;
        const radiusInDegreesLng = radius / (111320 * Math.cos(latCenter * Math.PI / 180));

        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * 2 * Math.PI;
          const dx = radiusInDegreesLng * Math.cos(angle);
          const dy = radiusInDegreesLat * Math.sin(angle);
          coords.push([center[0] + dx, center[1] + dy]);
        }

        return {
          type: 'Polygon',
          coordinates: [coords],
          center: center // Return the actual center for circles
        };
      }
    } else if (area.startsWith('POLYGON')) {
      const coordString = area.match(/POLYGON \(\((.*?)\)\)/)?.[1];
      if (coordString) {
        const coords = coordString.split(', ').map(pair => {
          const [lat, lng] = pair.split(' ').map(Number);
          return [lng, lat];
        });
        return {
          type: 'Polygon',
          coordinates: [coords]
        };
      }
    } else if (area.startsWith('LINESTRING')) {
      const coordString = area.match(/LINESTRING \((.*?)\)/)?.[1];
      if (coordString) {
        const coords = coordString.split(', ').map(pair => {
          const [lat, lng] = pair.split(' ').map(Number);
          return [lng, lat];
        });
        if (coords.length > 0 &&
          (coords[0][0] !== coords[coords.length - 1][0] ||
            coords[0][1] !== coords[coords.length - 1][1])) {
          coords.push([...coords[0]]);
        }
        return {
          type: 'Polygon',
          coordinates: [coords]
        };
      }
    }
    return null;
  };

  // Helper function to add geofence layers
  const addGeofenceLayers = (map) => {
    if (!map.getSource('geofences')) {
      map.addSource('geofences', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.addLayer({
        id: 'geofences-fill',
        type: 'fill',
        source: 'geofences',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.2
        }
      });

      map.addLayer({
        id: 'geofences-outline',
        type: 'line',
        source: 'geofences',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 2
        }
      });
    }

    // Add label source and layer
    if (!map.getSource('geofence-labels')) {
      map.addSource('geofence-labels', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.addLayer({
        id: 'geofence-labels',
        type: 'symbol',
        source: 'geofence-labels',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-anchor': 'center',
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': '#3b82f6',
          'text-halo-color': isDark ? '#1f2937' : '#ffffff',
          'text-halo-width': 2,
          'text-halo-blur': 1
        }
      });
    }
  };

  // Helper function to update geofence data
  const updateGeofenceData = (map, geofencesData) => {
    if (!geofencesData) return;

    const features = [];
    const labelFeatures = [];

    geofencesData.forEach(geofence => {
      const geometryData = parseGeofence(geofence.area);
      if (!geometryData) return;

      // Add geofence polygon
      features.push({
        type: 'Feature',
        properties: {
          id: geofence.id,
          name: geofence.name,
          description: geofence.description
        },
        geometry: {
          type: geometryData.type,
          coordinates: geometryData.coordinates
        }
      });

      // Calculate center for label
      const center = geometryData.center || calculateCentroid(geometryData.coordinates);

      // Add label point
      labelFeatures.push({
        type: 'Feature',
        properties: {
          id: geofence.id,
          name: geofence.name
        },
        geometry: {
          type: 'Point',
          coordinates: center
        }
      });
    });

    const source = map.getSource('geofences');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features
      });
    }

    const labelSource = map.getSource('geofence-labels');
    if (labelSource) {
      labelSource.setData({
        type: 'FeatureCollection',
        features: labelFeatures
      });
    }
  };

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
      addGeofenceLayers(map);
      updateGeofenceData(map, geofencesRef.current);
      setMapLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const newStyle = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';
    mapRef.current.setStyle(newStyle);

    // Re-add geofence layers and data after style change
    mapRef.current.once('style.load', () => {
      addGeofenceLayers(mapRef.current);
      updateGeofenceData(mapRef.current, geofencesRef.current);

      // Update label text halo color based on theme
      if (mapRef.current.getLayer('geofence-labels')) {
        mapRef.current.setPaintProperty(
          'geofence-labels',
          'text-halo-color',
          isDark ? '#1f2937' : '#ffffff'
        );
      }
    });
  }, [isDark]);

  // Update geofences when they change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !geofences) return;
    updateGeofenceData(mapRef.current, geofences);
  }, [geofences, mapLoaded]);

  // Get marker color based on device status
  const getMarkerColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'unknown':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Update markers when devices/positions change
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

    // Remove markers for devices that no longer have positions
    Object.keys(markersRef.current).forEach(deviceId => {
      if (!latestPositions.has(parseInt(deviceId))) {
        markersRef.current[deviceId].remove();
        delete markersRef.current[deviceId];
      }
    });

    latestPositions.forEach(position => {
      const device = deviceMap.get(position.deviceId);
      if (!device) return;

      const { latitude, longitude, speed, course, address } = position;
      const lngLat = [longitude, latitude];

      const popupHtml = `
        <div class="text-sm" style="color: #000;">
          <div class="font-semibold mb-1">${device.name}</div>
          <div class="text-xs mb-1" style="color: #666;">
            Status: <span class="${device.status === 'online' ? 'text-green-600' : device.status === 'offline' ? 'text-red-600' : 'text-yellow-600'}">${device.status}</span>
          </div>
          ${speed !== undefined ? `<div class="text-xs" style="color: #666;">Speed: ${Math.round(speed * 1.852)} km/h</div>` : ''}
          ${course !== undefined ? `<div class="text-xs" style="color: #666;">Course: ${Math.round(course)}°</div>` : ''}
          ${address ? `<div class="text-xs mt-1" style="color: #666;">${address}</div>` : ''}
          <div class="text-xs mt-1" style="color: #999;">
            ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
          </div>
          ${device.lastUpdate ? `<div class="text-xs" style="color: #999;">Updated: ${new Date(device.lastUpdate).toLocaleString()}</div>` : ''}
        </div>
      `;

      if (markersRef.current[device.id]) {
        // Update existing marker
        markersRef.current[device.id].setLngLat(lngLat);
        markersRef.current[device.id].getPopup().setHTML(popupHtml);

        // Update marker color if status changed
        const el = markersRef.current[device.id].getElement().querySelector('.device-marker');
        if (el) {
          el.className = `device-marker w-4 h-4 rounded-full border-2 border-white shadow-lg ${getMarkerColor(device.status)}`;
        }
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.innerHTML = `<div class="device-marker w-4 h-4 rounded-full border-2 border-white shadow-lg ${getMarkerColor(device.status)}"></div>`;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);

        const newMarker = new mapboxgl.Marker(el)
          .setLngLat(lngLat)
          .setPopup(popup)
          .addTo(mapRef.current);

        markersRef.current[device.id] = newMarker;
      }
    });

    // Fit bounds to show all markers on first load
    if (!hasFitBounds.current) {
      if (Object.keys(markersRef.current).length > 0 && positions.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        Object.values(markersRef.current).forEach(marker => {
          bounds.extend(marker.getLngLat());
        });

        if (!bounds.isEmpty()) {
          mapRef.current.fitBounds(bounds, {
            padding: 60,
            maxZoom: 16,
            duration: 500
          });
          hasFitBounds.current = true;
        }
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
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default TraccarMap;

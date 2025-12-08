import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from 'next-themes';
import { DEFAULT_CENTER, DEFAULT_ZOOM, GEOFENCE_LABELS_LAYER_ID } from './constants';
import { addGeofenceLayers, updateGeofenceData } from './geofenceLayers';
import { buildDeviceFeatures } from './deviceFeatures';
import { addDeviceLayers, updateDeviceSourceData } from './deviceLayers';
import { openPopupForDeviceId, closePopup, updatePopupContent } from './popupUtils';

const TraccarMap = ({ devices, positions, geofences, mapRef: externalMapRef, selectedDeviceId }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const geofencesRef = useRef(geofences);
  const latestDevicesRef = useRef(devices);
  const latestPositionsRef = useRef(positions);
  const latestDeviceFeaturesRef = useRef([]);
  const hasFitBounds = useRef(false);
  const currentPopupRef = useRef(null);
  const focusedDeviceIdRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    geofencesRef.current = geofences;
  }, [geofences]);

  useEffect(() => {
    latestDevicesRef.current = devices;
  }, [devices]);

  useEffect(() => {
    latestPositionsRef.current = positions;
  }, [positions]);

  useEffect(() => {
    if (externalMapRef && mapRef.current) {
      externalMapRef.current = mapRef.current;
    }
  }, [externalMapRef, mapRef.current]);

  const updateDeviceData = () => {
    const map = mapRef.current;
    if (!map) return;

    const features = buildDeviceFeatures(latestDevicesRef.current, latestPositionsRef.current);
    latestDeviceFeaturesRef.current = features;
    updateDeviceSourceData(map, features, hasFitBounds);

    // Update popup if there's a focused device
    if (focusedDeviceIdRef.current && currentPopupRef.current) {
      const focusedFeature = features.find(
        (f) => Number(f.properties.deviceId) === Number(focusedDeviceIdRef.current)
      );

      if (focusedFeature) {
        const newCoords = focusedFeature.geometry.coordinates;

        // Update popup position
        currentPopupRef.current.setLngLat(newCoords);

        // Update popup content
        updatePopupContent(currentPopupRef.current, focusedFeature.properties);

        // Move camera to follow the device smoothly
        map.easeTo({
          center: newCoords,
          duration: 1000,
          essential: true
        });
      }
    }
  };

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    map.removeControl(map._controls.find((c) => c instanceof mapboxgl.AttributionControl));
    map.addControl(
      new mapboxgl.AttributionControl({
        compact: true
      }),
      'bottom-right'
    );

    map.on('load', () => {
      addGeofenceLayers(map, isDark);
      updateGeofenceData(map, geofencesRef.current);
      addDeviceLayers(map, isDark, currentPopupRef, focusedDeviceIdRef);
      updateDeviceData();
      setMapLoaded(true);
    });

    return () => {
      closePopup(currentPopupRef);
      focusedDeviceIdRef.current = null;
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
    closePopup(currentPopupRef);
    focusedDeviceIdRef.current = null;

    mapRef.current.setStyle(newStyle);

    mapRef.current.once('style.load', () => {
      addGeofenceLayers(mapRef.current, isDark);
      updateGeofenceData(mapRef.current, geofencesRef.current);

      if (mapRef.current.getLayer(GEOFENCE_LABELS_LAYER_ID)) {
        mapRef.current.setPaintProperty(
          GEOFENCE_LABELS_LAYER_ID,
          'text-halo-color',
          isDark ? '#1f2937' : '#ffffff'
        );
      }

      addDeviceLayers(mapRef.current, isDark, currentPopupRef, focusedDeviceIdRef);
      updateDeviceData();
    });
  }, [isDark]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !geofences) return;
    updateGeofenceData(mapRef.current, geofences);
  }, [geofences, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    updateDeviceData();
  }, [devices, positions, mapLoaded]);

  useEffect(() => {
    if (!selectedDeviceId || !mapRef.current || !mapLoaded) return;

    const deviceId = selectedDeviceId;
    const feature = latestDeviceFeaturesRef.current.find(
      (candidate) => Number(candidate.properties.deviceId) === Number(deviceId)
    );

    if (!feature) return;

    closePopup(currentPopupRef);
    focusedDeviceIdRef.current = deviceId;

    mapRef.current.flyTo({
      center: feature.geometry.coordinates,
      zoom: 18,
      duration: 1500,
      essential: true
    });

    setTimeout(() => {
      if (mapRef.current && deviceId === selectedDeviceId) {
        openPopupForDeviceId(
          mapRef.current,
          deviceId,
          latestDeviceFeaturesRef.current,
          currentPopupRef
        );
      }
    }, 1600);
  }, [selectedDeviceId, mapLoaded]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default TraccarMap;

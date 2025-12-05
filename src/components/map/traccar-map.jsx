import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from 'next-themes';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const DEVICE_SOURCE_ID = 'traccar-device-source';
const CLUSTER_LAYER_ID = 'traccar-device-clusters';
const CLUSTER_COUNT_LAYER_ID = 'traccar-device-cluster-count';
const UNCLUSTERED_LAYER_ID = 'traccar-device-unclustered';

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

  const closeCurrentPopup = () => {
    if (currentPopupRef.current) {
      currentPopupRef.current.remove();
      currentPopupRef.current = null;
    }
  };

  // Calculate centroid of a polygon
  const calculateCentroid = (coordinates) => {
    const coords = coordinates[0];
    let x = 0, y = 0;
    const numPoints = coords.length - 1;

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
          center: center
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
        if (
          coords.length > 0 &&
          (coords[0][0] !== coords[coords.length - 1][0] ||
            coords[0][1] !== coords[coords.length - 1][1])
        ) {
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

      const center = geometryData.center || calculateCentroid(geometryData.coordinates);

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

  const buildDeviceFeatures = () => {
    const deviceMap = new Map(latestDevicesRef.current.map(device => [device.id, device]));
    const positionList = latestPositionsRef.current || [];
    const latestPositions = new Map();
    positionList.forEach(position => {
      const deviceId = Number(position.deviceId);
      if (!Number.isFinite(deviceId) || latestPositions.has(deviceId)) return;
      latestPositions.set(deviceId, position);
    });
    const features = [];
    latestPositions.forEach((position, deviceId) => {
      const device = deviceMap.get(deviceId);
      if (!device) return;
      const latitude = Number(position.latitude);
      const longitude = Number(position.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
      const speedValue = Number(position.speed);
      const courseValue = Number(position.course);
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        properties: {
          deviceId,
          name: device.name || 'Unknown device',
          status: device.status || 'unknown',
          speed: Number.isFinite(speedValue) ? speedValue : null,
          course: Number.isFinite(courseValue) ? courseValue : null,
          address: position.address || '',
          lastUpdate: device.lastUpdate || null,
          latitude,
          longitude
        }
      });
    });
    return features;
  };

  const createPopupHtml = (properties) => {
    const {
      name,
      status,
      speed,
      course,
      address,
      latitude,
      longitude,
      lastUpdate
    } = properties;
    const statusColor = status === 'online' ? '#16a34a' : status === 'offline' ? '#dc2626' : '#6b7280';
    const speedLine =
      typeof speed === 'number'
        ? `<div style="color:#555;font-size:0.7rem;margin-bottom:2px;">Speed: ${Math.round(
          speed * 1.852 || 0
        )} km/h</div>`
        : '';
    const courseLine =
      typeof course === 'number'
        ? `<div style="color:#555;font-size:0.7rem;margin-bottom:2px;">Course: ${Math.round(course)}°</div>`
        : '';
    const addressLine = address ? `<div style="color:#555;font-size:0.7rem;margin-bottom:2px;">${address}</div>` : '';
    const latLonLine =
      Number.isFinite(latitude) && Number.isFinite(longitude)
        ? `<div style="color:#777;font-size:0.65rem;margin-top:4px;">${latitude.toFixed(5)}, ${longitude.toFixed(5)}</div>`
        : '';
    const updatedLine = lastUpdate
      ? `<div style="color:#777;font-size:0.65rem;">Updated: ${new Date(lastUpdate).toLocaleString()}</div>`
      : '';
    return `
      <div style="font-size:0.75rem;color:#111;min-width:200px">
        <div style="font-weight:600;margin-bottom:4px;">${name}</div>
        <div style="color:#555;font-size:0.7rem;margin-bottom:4px;">
          Status: <span style="color:${statusColor};font-weight:600;">${status || 'Unknown'}</span>
        </div>
        ${speedLine}
        ${courseLine}
        ${addressLine}
        ${latLonLine}
        ${updatedLine}
      </div>
    `;
  };

  const openPopupFromFeature = (feature) => {
    const map = mapRef.current;
    if (!map) return;
    closeCurrentPopup();
    const coordinates = feature.geometry.coordinates.slice();
    const html = createPopupHtml(feature.properties);
    const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
      .setLngLat(coordinates)
      .setHTML(html)
      .addTo(map);
    currentPopupRef.current = popup;
  };

  const openPopupForDeviceId = (deviceId) => {
    const normalizedId = Number(deviceId);
    const feature = latestDeviceFeaturesRef.current.find(
      (candidate) => Number(candidate.properties.deviceId) === normalizedId
    );
    if (feature) {
      openPopupFromFeature(feature);
    }
  };

  const updateDeviceSourceData = () => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource(DEVICE_SOURCE_ID);
    if (!source) return;
    const features = buildDeviceFeatures();
    latestDeviceFeaturesRef.current = features;
    source.setData({
      type: 'FeatureCollection',
      features
    });
    if (!hasFitBounds.current && features.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      features.forEach(feature => bounds.extend(feature.geometry.coordinates));
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: 60,
          maxZoom: 16,
          duration: 500
        });
        hasFitBounds.current = true;
      }
    }
  };

  const addDeviceLayers = (map) => {
    if (!map) return;
    closeCurrentPopup();
    if (map.getLayer(CLUSTER_LAYER_ID)) map.removeLayer(CLUSTER_LAYER_ID);
    if (map.getLayer(CLUSTER_COUNT_LAYER_ID)) map.removeLayer(CLUSTER_COUNT_LAYER_ID);
    if (map.getLayer(UNCLUSTERED_LAYER_ID)) map.removeLayer(UNCLUSTERED_LAYER_ID);
    if (map.getSource(DEVICE_SOURCE_ID)) map.removeSource(DEVICE_SOURCE_ID);

    map.addSource(DEVICE_SOURCE_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      },
      cluster: true,
      clusterRadius: 60,
      clusterMaxZoom: 14
    });

    map.addLayer({
      id: CLUSTER_LAYER_ID,
      type: 'circle',
      source: DEVICE_SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': isDark ? '#2563eb' : '#1d4ed8',
        'circle-radius': ['step', ['get', 'point_count'], 15, 5, 20, 25, 25],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.8
      }
    });

    map.addLayer({
      id: CLUSTER_COUNT_LAYER_ID,
      type: 'symbol',
      source: DEVICE_SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#e0f2fe'
      }
    });

    map.addLayer({
      id: UNCLUSTERED_LAYER_ID,
      type: 'circle',
      source: DEVICE_SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'status'],
          'online',
          '#16a34a',
          'offline',
          '#dc2626',
          '#a1a1aa'
        ],
        'circle-radius': 8,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
      }
    });

    map.off('click', CLUSTER_LAYER_ID);
    map.on('click', CLUSTER_LAYER_ID, (event) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const clusterId = feature.properties.cluster_id;
      const source = map.getSource(DEVICE_SOURCE_ID);
      if (!source || typeof clusterId === 'undefined') return;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.easeTo({
          center: feature.geometry.coordinates,
          zoom,
          duration: 500
        });
      });
    });

    map.off('click', UNCLUSTERED_LAYER_ID);
    map.on('click', UNCLUSTERED_LAYER_ID, (event) => {
      const feature = event.features?.[0];
      if (feature) {
        openPopupFromFeature(feature);
      }
    });

    map.off('mouseenter', CLUSTER_LAYER_ID);
    map.on('mouseenter', CLUSTER_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.off('mouseleave', CLUSTER_LAYER_ID);
    map.on('mouseleave', CLUSTER_LAYER_ID, () => {
      map.getCanvas().style.cursor = '';
    });

    map.off('mouseenter', UNCLUSTERED_LAYER_ID);
    map.on('mouseenter', UNCLUSTERED_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.off('mouseleave', UNCLUSTERED_LAYER_ID);
    map.on('mouseleave', UNCLUSTERED_LAYER_ID, () => {
      map.getCanvas().style.cursor = '';
    });
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
      zoom: 10
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
      addGeofenceLayers(map);
      updateGeofenceData(map, geofencesRef.current);
      addDeviceLayers(map);
      updateDeviceSourceData();
      setMapLoaded(true);
    });

    return () => {
      closeCurrentPopup();
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
    closeCurrentPopup();
    mapRef.current.setStyle(newStyle);

    mapRef.current.once('style.load', () => {
      addGeofenceLayers(mapRef.current);
      updateGeofenceData(mapRef.current, geofencesRef.current);

      if (mapRef.current.getLayer('geofence-labels')) {
        mapRef.current.setPaintProperty(
          'geofence-labels',
          'text-halo-color',
          isDark ? '#1f2937' : '#ffffff'
        );
      }
      addDeviceLayers(mapRef.current);
      updateDeviceSourceData();
    });
  }, [isDark]);

  // Update geofences when they change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !geofences) return;
    updateGeofenceData(mapRef.current, geofences);
  }, [geofences, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    updateDeviceSourceData();
  }, [devices, positions, mapLoaded]);

  useEffect(() => {
    if (!selectedDeviceId || !mapRef.current || !mapLoaded) return;
    const deviceId = selectedDeviceId;
    const feature = latestDeviceFeaturesRef.current.find(
      (candidate) => Number(candidate.properties.deviceId) === Number(deviceId)
    );
    if (!feature) return;

    closeCurrentPopup();

    mapRef.current.flyTo({
      center: feature.geometry.coordinates,
      zoom: 18,
      duration: 1500,
      essential: true
    });

    setTimeout(() => {
      if (mapRef.current && deviceId === selectedDeviceId) {
        openPopupForDeviceId(deviceId);
      }
    }, 1600);
  }, [selectedDeviceId, mapLoaded]);

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

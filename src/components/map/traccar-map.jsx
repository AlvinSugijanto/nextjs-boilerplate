import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "next-themes";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  GEOFENCE_LABELS_LAYER_ID,
} from "./constants";
import { addGeofenceLayers, updateGeofenceData } from "./geofenceLayers";
import { buildDeviceFeatures } from "./deviceFeatures";
import { addDeviceLayers, updateDeviceSourceData } from "./deviceLayers";
import {
  openPopupForDeviceId,
  closePopup,
  updatePopupContent,
} from "./popupUtils";
import { convertDrawFeatureToTraccarArea } from "./drawUtils";
import GeofenceNameDialog from "./geofence-name-dialog";
import RadiusMode from "./radiusMode";

const TraccarMap = ({
  devices,
  positions,
  geofences,
  mapRef: externalMapRef,
  selectedDeviceId,
  isSelectingEvent,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const geofencesRef = useRef(geofences);
  const latestDevicesRef = useRef(devices);
  const latestPositionsRef = useRef(positions);
  const latestDeviceFeaturesRef = useRef([]);
  const hasFitBounds = useRef(false);
  const currentPopupRef = useRef(null);
  const focusedDeviceIdRef = useRef(null);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingFeature, setPendingFeature] = useState(null);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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

    const features = buildDeviceFeatures(
      latestDevicesRef.current,
      latestPositionsRef.current
    );
    latestDeviceFeaturesRef.current = features;
    updateDeviceSourceData(map, features, hasFitBounds);

    // Update popup if there's a focused device
    if (focusedDeviceIdRef.current && currentPopupRef.current) {
      const focusedFeature = features.find(
        (f) =>
          Number(f.properties.deviceId) === Number(focusedDeviceIdRef.current)
      );

      if (focusedFeature) {
        const newCoords = focusedFeature.geometry.coordinates;

        currentPopupRef.current.setLngLat(newCoords);
        updatePopupContent(currentPopupRef.current, focusedFeature.properties);

        // Move camera to follow the device smoothly
        map.flyTo({
          center: newCoords,
          duration: 1000,
          essential: true,
        });
      }
    }
  };

  const handleGeofenceCreate = async (name) => {
    if (!pendingFeature || !name.trim()) return;

    try {
      const traccarArea = convertDrawFeatureToTraccarArea(pendingFeature);

      const response = await fetch("/api/proxy/traccar/geofences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          area: traccarArea,
        }),
      });

      if (response.ok) {
        const newGeofence = await response.json();
        console.log("Geofence created:", newGeofence);

        // Update geofences immediately in the map
        if (mapRef.current && mapLoaded) {
          const updatedGeofences = [...geofencesRef.current, newGeofence];
          geofencesRef.current = updatedGeofences;
          updateGeofenceData(mapRef.current, updatedGeofences);
        }

        // Clear the drawing
        if (drawRef.current) {
          drawRef.current.deleteAll();
        }
      } else {
        const error = await response.text();
        console.error("Failed to create geofence:", error);
        alert("Failed to create geofence: " + error);
      }
    } catch (error) {
      console.error("Error creating geofence:", error);
      alert("Error creating geofence: " + error.message);
    } finally {
      setPendingFeature(null);
      setShowNameDialog(false);
    }
  };

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isDark
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    mapRef.current = map;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        line_string: true,
        trash: true,
      },
      modes: {
        ...MapboxDraw.modes,
        draw_radius: RadiusMode,
      },
      styles: [
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: {
            "fill-color": "#3b82f6",
            "fill-outline-color": "#3b82f6",
            "fill-opacity": 0.3,
          },
        },
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
          paint: {
            "line-color": "#3b82f6",
            "line-width": 2,
          },
        },
        {
          id: "gl-draw-line",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "LineString"],
            ["!=", "mode", "static"],
          ],
          paint: {
            "line-color": "#3b82f6",
            "line-width": 2,
          },
        },
        {
          id: "gl-draw-point",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["!=", "mode", "static"]],
          paint: {
            "circle-radius": 6,
            "circle-color": "#3b82f6",
          },
        },
        {
          id: "gl-draw-polygon-and-line-vertex-active",
          type: "circle",
          filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
          paint: {
            "circle-radius": 5,
            "circle-color": "#ffffff",
            "circle-stroke-color": "#3b82f6",
            "circle-stroke-width": 2,
          },
        },
      ],
    });

    drawRef.current = draw;
    map.addControl(draw, "top-left");

    map.on("load", () => {
      const drawControls = document.querySelector(".mapboxgl-ctrl-group");
      if (drawControls) {
        const radiusButton = document.createElement("button");
        const svgIcon =
          "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3'%3E%3Ccircle cx='12' cy='12' r='8'/%3E%3C/svg%3E";
        radiusButton.className = "mapbox-gl-draw_ctrl-draw-btn";
        radiusButton.title = "Draw circle by radius";
        radiusButton.style.backgroundImage = `url("${svgIcon}")`;
        radiusButton.style.backgroundPosition = "center";
        radiusButton.style.backgroundSize = "18px 18px";
        radiusButton.addEventListener("click", () => {
          draw.changeMode("draw_radius");
        });
        drawControls.insertBefore(
          radiusButton,
          drawControls.firstChild.nextSibling
        );
      }
    });

    map.on("draw.create", (e) => {
      const feature = e.features[0];
      setPendingFeature(feature);
      setShowNameDialog(true);
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    map.removeControl(
      map._controls.find((c) => c instanceof mapboxgl.AttributionControl)
    );
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.on("load", () => {
      addGeofenceLayers(map, isDark);
      updateGeofenceData(map, geofencesRef.current);
      addDeviceLayers(map, isDark, currentPopupRef, focusedDeviceIdRef);
      updateDeviceData();
      setMapLoaded(true);
    });

    return () => {
      closePopup(currentPopupRef);
      focusedDeviceIdRef.current = null;
      if (drawRef.current && mapRef.current) {
        mapRef.current.removeControl(drawRef.current);
        drawRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map style when theme changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const newStyle = isDark
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/light-v11";
    closePopup(currentPopupRef);
    focusedDeviceIdRef.current = null;

    mapRef.current.setStyle(newStyle);

    mapRef.current.once("style.load", () => {
      addGeofenceLayers(mapRef.current, isDark);
      updateGeofenceData(mapRef.current, geofencesRef.current);

      if (mapRef.current.getLayer(GEOFENCE_LABELS_LAYER_ID)) {
        mapRef.current.setPaintProperty(
          GEOFENCE_LABELS_LAYER_ID,
          "text-halo-color",
          isDark ? "#1f2937" : "#ffffff"
        );
      }

      addDeviceLayers(
        mapRef.current,
        isDark,
        currentPopupRef,
        focusedDeviceIdRef
      );
      updateDeviceData();
    });
  }, [isDark]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !geofences) return;
    updateGeofenceData(mapRef.current, geofences);
  }, [geofences, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || isSelectingEvent) return;

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
      essential: true,
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

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-full" />
      <GeofenceNameDialog
        open={showNameDialog}
        onOpenChange={(open) => {
          setShowNameDialog(open);
          if (!open && pendingFeature && drawRef.current) {
            drawRef.current.deleteAll();
            setPendingFeature(null);
          }
        }}
        onSubmit={handleGeofenceCreate}
      />
    </>
  );
};

export default TraccarMap;

"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import DeviceCard from "../device-card";
import MapCard from "../map-card";
import InfoCard from "../info-card";
import EventCard from "../event-card";
import { useBoolean } from "@/hooks/use-boolean";
import axios from "axios";
import { endOfDay, startOfDay } from "date-fns";
import Cookies from "js-cookie";

// Default sizes
const DEFAULT_SIZES = {
  leftColumnWidth: 400,
  leftTopHeight: 50, // percentage
  leftBottomHeight: 50, // percentage
  rightTopHeight: 50, // percentage
  rightBottomHeight: 50, // percentage
};

const STORAGE_KEY = "dashboard-layout-sizes";

const DashboardView = () => {
  // hooks
  const topRowRef = useRef(null);
  const bottomRowRef = useRef(null);
  const topRightRef = useRef(null);
  const bottomRightRef = useRef(null);
  const leftColumnRef = useRef(null);
  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const loadingDevices = useBoolean();
  const loadingEvents = useBoolean();
  const loadingEventTypes = useBoolean();

  // state
  const [sizes, setSizes] = useState(DEFAULT_SIZES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [devices, setDevices] = useState([]);
  const [deviceTracks, setDeviceTracks] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [selectedTrackDetail, setSelectedTrackDetail] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [positions, setPositions] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [isSelectingEvent, setIsSelectingEvent] = useState(false);

  // Load sizes from localStorage on mount
  useEffect(() => {
    const savedSizes = localStorage.getItem(STORAGE_KEY);
    if (savedSizes) {
      try {
        const parsed = JSON.parse(savedSizes);
        setSizes({ ...DEFAULT_SIZES, ...parsed });
      } catch (error) {
        console.error("Failed to parse saved layout sizes:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save sizes to localStorage whenever they change
  const saveSizes = (newSizes) => {
    setSizes(newSizes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSizes));
  };

  // Apply saved sizes after component is loaded
  useEffect(() => {
    if (!isLoaded) return;

    if (leftColumnRef.current) {
      leftColumnRef.current.style.width = `${sizes.leftColumnWidth}px`;
    }

    // For left column panels, use percentage
    if (topRowRef.current && bottomRowRef.current) {
      topRowRef.current.style.height = `${sizes.leftTopHeight}%`;
      bottomRowRef.current.style.height = `${sizes.leftBottomHeight}%`;
    }

    // For right column panels, use percentage
    if (topRightRef.current && bottomRightRef.current) {
      topRightRef.current.style.height = `${sizes.rightTopHeight}%`;
      bottomRightRef.current.style.height = `${sizes.rightBottomHeight}%`;
    }
  }, [isLoaded, sizes]);

  const handleVerticalResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const topRow = topRowRef.current;
    const bottomRow = bottomRowRef.current;

    if (!topRow || !bottomRow) return;

    const container = leftColumnRef.current;
    const containerHeight = container.offsetHeight;
    const startTopHeight = topRow.offsetHeight;
    const startBottomHeight = bottomRow.offsetHeight;

    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newTopHeight = startTopHeight + deltaY;
      const newBottomHeight = startBottomHeight - deltaY;

      if (newTopHeight > 150 && newBottomHeight > 150) {
        const topPercent = (newTopHeight / containerHeight) * 100;
        const bottomPercent = (newBottomHeight / containerHeight) * 100;

        topRow.style.height = `${topPercent}%`;
        bottomRow.style.height = `${bottomPercent}%`;
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      // Save the final sizes
      const containerHeight = container.offsetHeight;
      const finalTopPercent = (topRow.offsetHeight / containerHeight) * 100;
      const finalBottomPercent =
        (bottomRow.offsetHeight / containerHeight) * 100;

      saveSizes({
        ...sizes,
        leftTopHeight: finalTopPercent,
        leftBottomHeight: finalBottomPercent,
      });

      // Resize map
      if (mapRef.current) {
        setTimeout(() => mapRef.current.resize(), 10);
      }
    };

    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleVerticalResizeRight = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const topRow = topRightRef.current;
    const bottomRow = bottomRightRef.current;

    if (!topRow || !bottomRow) return;

    const container = topRow.parentElement;
    const containerHeight = container.offsetHeight;
    const startTopHeight = topRow.offsetHeight;
    const startBottomHeight = bottomRow.offsetHeight;

    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newTopHeight = startTopHeight + deltaY;
      const newBottomHeight = startBottomHeight - deltaY;

      if (newTopHeight > 150 && newBottomHeight > 150) {
        const topPercent = (newTopHeight / containerHeight) * 100;
        const bottomPercent = (newBottomHeight / containerHeight) * 100;

        topRow.style.height = `${topPercent}%`;
        bottomRow.style.height = `${bottomPercent}%`;
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      // Save the final sizes
      const containerHeight = container.offsetHeight;
      const finalTopPercent = (topRow.offsetHeight / containerHeight) * 100;
      const finalBottomPercent =
        (bottomRow.offsetHeight / containerHeight) * 100;

      saveSizes({
        ...sizes,
        rightTopHeight: finalTopPercent,
        rightBottomHeight: finalBottomPercent,
      });

      // Resize map
      if (mapRef.current) {
        setTimeout(() => mapRef.current.resize(), 10);
      }
    };

    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleHorizontalResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const leftColumn = leftColumnRef.current;

    if (!leftColumn) return;

    const startWidth = leftColumn.offsetWidth;
    const containerWidth = leftColumn.parentElement.offsetWidth;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = startWidth + deltaX;
      const maxWidth = containerWidth * 0.8;

      if (newWidth > 200 && newWidth < maxWidth) {
        leftColumn.style.width = `${newWidth}px`;
      }

      // Resize map
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      // Save the final width
      saveSizes({
        ...sizes,
        leftColumnWidth: leftColumn.offsetWidth,
      });
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const fetchInitialData = useCallback(async () => {
    console.log("position changed");
    try {
      const positionsResponse = await fetch("/api/proxy/traccar/positions");
      if (positionsResponse.ok) {
        const positionsData = await positionsResponse.json();
        setPositions(positionsData);
      }

      const geofencesResponse = await fetch("/api/proxy/traccar/geofences");
      if (geofencesResponse.ok) {
        const geofencesData = await geofencesResponse.json();
        setGeofences(geofencesData);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoadingMap(false);
    }
  }, []);

  const handleWebSocketConnect = useCallback(() => {
    const traccarUrl = process.env.NEXT_PUBLIC_TRACCAR_WS_URL;
    const token = Cookies.get("T_SESSION");

    if (!traccarUrl || !token) {
      console.warn("Missing Traccar URL or token");
      return;
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `${traccarUrl}?token=${token}`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = (event) => {
      if (event.data === "{}") return;

      try {
        const message = JSON.parse(event.data);

        if (message.devices) {
          setDevices((prev) => {
            const deviceMap = new Map(prev.map((d) => [d.id, d]));
            message.devices.forEach((d) => deviceMap.set(d.id, d));
            return Array.from(deviceMap.values());
          });
        }

        if (message.positions) {
          setPositions((prev) => {
            const positionMap = new Map(prev.map((p) => [p.deviceId, p]));
            message.positions.forEach((p) => positionMap.set(p.deviceId, p));
            return Array.from(positionMap.values());
          });
        }

        if (message.geofences) {
          setGeofences((prev) => {
            const geofenceMap = new Map(prev.map((g) => [g.id, g]));
            message.geofences.forEach((g) => geofenceMap.set(g.id, g));
            return Array.from(geofenceMap.values());
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed");
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (socketRef.current?.readyState !== WebSocket.OPEN) {
          handleWebSocketConnect();
        }
      }, 5000);
    };
  }, []);

  const fetchDevices = useCallback(async () => {
    loadingDevices.onTrue();

    try {
      const { data } = await axios.get("/api/proxy/traccar/devices");

      setDevices(data);
      loadingDevices.onFalse();
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      loadingDevices.onFalse();
      loadingEvents.onFalse();
    }
  }, []);

  const fetchEventTypes = useCallback(async () => {
    loadingEventTypes.onTrue();

    try {
      const { data } = await axios.get(
        "/api/proxy/traccar/notifications/types"
      );

      setEventTypes(data.sort((a, b) => a.type.localeCompare(b.type)));
    } catch (error) {
      console.error("Error fetching event types:", error);
    } finally {
      loadingEventTypes.onFalse();
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    fetchEventTypes();
    fetchInitialData().then(() => {
      handleWebSocketConnect();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleDeviceClick = useCallback((device) => {
    setSelectedDeviceId(device.id);
  }, []);

  const handleChangeInfoPosition = useCallback((value) => {
    setSelectedTrackDetail(value);
  }, []);

  return (
    <div className="h-full flex gap-1 max-h-[calc(100vh-100px)]">
      {/* Left Column */}
      <div
        ref={leftColumnRef}
        className="flex-shrink-0 flex flex-col gap-1 h-full overflow-hidden"
      >
        {/* Top Left Panel */}
        <div ref={topRowRef} className="min-h-[150px]">
          <DeviceCard
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            onDeviceClick={handleDeviceClick}
            loading={loadingDevices.value}
          />
        </div>

        {/* Horizontal Resize Handle */}
        <div
          onMouseDown={handleVerticalResize}
          className="h-0.5 cursor-row-resize group flex items-center justify-center relative flex-shrink-0"
        >
          <div className="absolute inset-x-0 -inset-y-4 z-10"></div>
          <div className="h-1 min-w-[30px] max-w-[100px] bg-gray-200/0 dark:bg-gray-700/0 group-hover:bg-primary dark:group-hover:bg-primary/50 transition-all duration-200 rounded-full group-hover:shadow-lg group-hover:shadow-blue-500/50"></div>
        </div>

        {/* Bottom Left Panel */}
        <div ref={bottomRowRef} className="min-h-[150px]">
          <InfoCard
            devices={devices}
            width={bottomRowRef.current?.offsetWidth}
            selectedDeviceId={selectedDeviceId}
            positions={positions}
            onTrackChanges={setDeviceTracks}
            onChangePosition={handleChangeInfoPosition}
          />
        </div>
      </div>

      {/* Vertical Resize Handle */}
      <div
        onMouseDown={handleHorizontalResize}
        className="w-1 cursor-col-resize group flex items-center justify-center relative flex-shrink-0"
      >
        <div className="absolute inset-y-0 -inset-x-4 z-10"></div>
        <div className="w-1 min-h-[40px] max-h-[100px] bg-gray-200/0 dark:bg-gray-700/0 group-hover:bg-primary dark:group-hover:bg-primary/50 transition-all duration-200 rounded-full group-hover:shadow-lg group-hover:shadow-blue-500/50"></div>
      </div>

      {/* Right Column */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 h-full overflow-hidden">
        {/* Top Right Panel */}
        <div ref={topRightRef} className="min-h-[150px]">
          <MapCard
            devices={devices}
            positions={positions}
            geofences={geofences}
            mapRef={mapRef}
            selectedDeviceId={selectedDeviceId}
            selectedTrackDetail={selectedTrackDetail}
            loading={loadingMap}
            tracks={deviceTracks}
            isSelectingEvent={isSelectingEvent}
          />
        </div>

        {/* Horizontal Resize Handle for Right Column */}
        <div
          onMouseDown={handleVerticalResizeRight}
          className="h-0.5 cursor-row-resize group flex items-center justify-center relative flex-shrink-0"
        >
          <div className="absolute inset-x-0 -inset-y-4 z-10"></div>
          <div className="h-1 min-w-[30px] max-w-[100px] bg-gray-200/0 dark:bg-gray-700/0 group-hover:bg-primary dark:group-hover:bg-primary/50 transition-all duration-200 rounded-full group-hover:shadow-lg group-hover:shadow-blue-500/50"></div>
        </div>

        {/* Bottom Right Panel */}
        <div ref={bottomRightRef} className="min-h-[150px]">
          {!loadingMap && (
            <EventCard
              eventTypes={eventTypes}
              geofences={geofences}
              selectedDeviceId={selectedDeviceId}
              positions={positions}
              setPositions={setPositions}
              setIsSelectingEvent={setIsSelectingEvent}
              fetchInitialData={fetchInitialData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;

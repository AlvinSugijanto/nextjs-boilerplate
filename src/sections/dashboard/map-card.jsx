import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import TraccarMap from "@/components/map/traccar-map";
import ClientOnly from "@/components/client-only";
import Cookies from "js-cookie";

function MapCard({ devices, setDevices }) {
  const [positions, setPositions] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const fetchInitialData = useCallback(async () => {
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
      setLoading(false);
    }
  }, []);

  const handleConnect = useCallback(() => {
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
          handleConnect();
        }
      }, 5000);
    };
  }, []);

  useEffect(() => {
    fetchInitialData().then(() => {
      handleConnect();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [fetchInitialData, handleConnect]);

  return (
    <Card className="h-full p-0 overflow-hidden">
      <main className="flex-1 relative h-full">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-sm font-medium">Loading map...</p>
            </div>
          </div>
        ) : (
          <ClientOnly>
            <TraccarMap
              devices={devices}
              positions={positions}
              geofences={geofences}
            />
          </ClientOnly>
        )}
      </main>
    </Card>
  );
}

export default MapCard;

'use client'

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Small from '@/components/typography/small';
import ClientOnly from '@/components/client-only';
import TraccarMap from '@/components/map/traccar-map';
import Cookies from 'js-cookie';

export default function MapView() {
  const [devices, setDevices] = useState([]);
  const [positions, setPositions] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const fetchInitialData = useCallback(async () => {
    try {
      const devicesResponse = await fetch('/api/proxy/traccar/devices');

      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json();
        setDevices(devicesData);

        const positionsResponse = await fetch('/api/proxy/traccar/positions');

        if (positionsResponse.ok) {
          const positionsData = await positionsResponse.json();
          setPositions(positionsData);
        }
      }

      const geofencesResponse = await fetch('/api/proxy/traccar/geofences');

      if (geofencesResponse.ok) {
        const geofencesData = await geofencesResponse.json();
        setGeofences(geofencesData);
      }

    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Connect to WebSocket for real-time updates
  const handleConnect = useCallback(() => {
    const traccarUrl = process.env.NEXT_PUBLIC_TRACCAR_URL;
    const token = Cookies.get('T_SESSION');

    if (!traccarUrl || !token) {
      console.warn('Missing Traccar URL or token');
      return;
    }

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `wss://${traccarUrl}/api/socket?token=${token}`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = (event) => {
      if (event.data === '{}') return;

      try {
        const message = JSON.parse(event.data);

        if (message.devices) {
          setDevices(prev => {
            const deviceMap = new Map(prev.map(d => [d.id, d]));
            message.devices.forEach(d => deviceMap.set(d.id, d));
            return Array.from(deviceMap.values());
          });
        }

        if (message.positions) {
          setPositions(prev => {
            const positionMap = new Map(prev.map(p => [p.deviceId, p]));
            message.positions.forEach(p => positionMap.set(p.deviceId, p));
            return Array.from(positionMap.values());
          });
        }

        if (message.geofences) {
          setGeofences(prev => {
            const geofenceMap = new Map(prev.map(g => [g.id, g]));
            message.geofences.forEach(g => geofenceMap.set(g.id, g));
            return Array.from(geofenceMap.values());
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
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
    <div className="flex h-full w-full flex-col gap-4">
      <Card className="p-0 overflow-hidden">
        <CardContent className="h-[600px] p-0">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Small className="text-muted-foreground">Loading map data...</Small>
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
        </CardContent>
      </Card>
    </div>
  );
}

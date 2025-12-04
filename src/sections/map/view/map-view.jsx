'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import H1 from '@/components/typography/h1';
import P from '@/components/typography/p';
import Small from '@/components/typography/small';
import ClientOnly from '@/components/client-only';
import TraccarMap from '@/components/map/traccar-map';

export default function MapView() {
  const [traccarUrl, setTraccarUrl] = useState('');
  const [token, setToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [positions, setPositions] = useState([]);
  const socketRef = useRef(null);

  const handleConnect = useCallback(() => {
    if (!traccarUrl || !token) {
      alert('Please enter Traccar URL and token.');
      return;
    }

    const wsUrl = `wss://${traccarUrl}/api/socket?token=${token}`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      setIsConnected(true);
      setMessages((prev) => [...prev, { type: 'system', text: 'Connected to WebSocket.' }]);
    };

    socketRef.current.onmessage = (event) => {
      if (event.data === '{}') return;
      const message = JSON.parse(event.data);
      setMessages((prev) => [{ type: 'server', data: message }, ...prev]);

      if (message.devices) {
        setDevices(prev => {
          const deviceMap = new Map();
          [...prev, ...message.devices].forEach(d => deviceMap.set(d.id, d));
          return Array.from(deviceMap.values());
        });
      }
      if (message.positions) {
        setPositions(prev => {
          const positionMap = new Map();
          prev.forEach(p => positionMap.set(p.deviceId, p));
          message.positions.forEach(p => positionMap.set(p.deviceId, p));
          return Array.from(positionMap.values());
        });
      }
    };

    socketRef.current.onclose = (event) => {
      setIsConnected(false);
      socketRef.current = null;
      let closeReason = `Code: ${event.code}`;
      if (event.reason) {
        closeReason += `, Reason: ${event.reason}`;
      }
      setMessages((prev) => [
        ...prev,
        { type: 'system', text: `Disconnected from WebSocket. ${closeReason}` },
      ]);
    };

    socketRef.current.onerror = (event) => {
      console.error('WebSocket Error:', event);
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          text: 'A WebSocket error occurred. Check the browser developer console for more details.',
        },
      ]);
    };
  }, [traccarUrl, token]);

  const handleDisconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <H1>Traccar WebSocket Test</H1>
      <Card>
        <CardHeader>
          <CardTitle>Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="traccar-url">Traccar URL (without wss://)</Label>
            <Input
              id="traccar-url"
              placeholder="demo.traccar.org"
              value={traccarUrl}
              onChange={(e) => setTraccarUrl(e.target.value)}
              disabled={isConnected}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Input
              id="token"
              placeholder="Your Traccar Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isConnected}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleConnect} disabled={isConnected}>
              Connect
            </Button>
            <Button onClick={handleDisconnect} disabled={!isConnected} variant="destructive">
              Disconnect
            </Button>
          </div>
          <P>
            Connection Status:{' '}
            {isConnected ? (
              <span className="font-semibold text-green-500">Connected</span>
            ) : (
              <span className="font-semibold text-red-500">Disconnected</span>
            )}
          </P>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Map</CardTitle>
        </CardHeader>
        <CardContent className="h-[600px] p-0">
          <ClientOnly>
            <TraccarMap devices={devices} positions={positions} />
          </ClientOnly>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 overflow-y-auto rounded-md border bg-muted p-4">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                {msg.type === 'system' && <Small className="text-muted-foreground">{msg.text}</Small>}
                {msg.type === 'error' && <Small className="text-red-500">{msg.text}</Small>}
                {msg.type === 'server' && <pre className="text-xs">{JSON.stringify(msg.data, null, 2)}</pre>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

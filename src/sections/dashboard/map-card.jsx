import React from "react";
import { Card } from "@/components/ui/card";
import TraccarMap from "@/components/map/traccar-map";
import ClientOnly from "@/components/client-only";

function MapCard({
  devices,
  positions,
  geofences,
  mapRef,
  selectedDeviceId,
  loading,
  tracks
}) {
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
              mapRef={mapRef}
              selectedDeviceId={selectedDeviceId}
              tracks={tracks}
            />
          </ClientOnly>
        )}
      </main>
    </Card>
  );
}

export default React.memo(MapCard);

import { useEffect, useMemo, useRef, useState } from "react";

import {
  ChevronDown,
  ChevronUp,
  CircleDot,
  Clock,
  Eye,
  EyeClosed,
  Flag,
  Gauge,
  LoaderCircle,
  LocateFixed,
  Navigation,
  Route,
} from "lucide-react";

import { fDate, fDateTime } from "@/utils/format-time";
import { Skeleton } from "@/components/ui/skeleton";
import { reverseGeocode } from "@/utils/reverse-geocode";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { intervalToDuration } from "date-fns";
import { useBoolean } from "@/hooks/use-boolean";
import axios from "axios";

const InfoTrackList = ({ data, loading, onChangeHide, onClickRoute }) => {
  const renderLoading = (
    <div className="flex flex-col gap-4">
      {[...new Array(3)].map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 overflow-auto">
      {data.map((device) => {
        return (
          <InfoTrackListCard
            key={device.id}
            device={device}
            onChangeHide={onChangeHide}
            onClickRoute={onClickRoute}
          />
        );
      })}

      {loading && renderLoading}

      {data.length === 0 && !loading && (
        <div
          className="text-center py-8 text-gray-500 min-h-40 flex items-center justify-center "
          style={{ fontSize: "11px" }}
        >
          <p>No track data available for the selected devices and date.</p>
        </div>
      )}
    </div>
  );
};

export default InfoTrackList;

const InfoTrackListCard = ({ device, onChangeHide, onClickRoute }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHideTrack, setIsHideTrack] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleTrack = () => {
    setSelectedRouteId(null);
    onChangeHide?.({
      id: device.id,
      hide: !isHideTrack,
    });
    setIsHideTrack(!isHideTrack);
  };

  const totalDistance = device.trips.reduce(
    (sum, trip) => sum + (trip.distance || 0),
    0
  );
  const totalDuration = device.trips.reduce(
    (sum, trip) => sum + (trip.duration || 0),
    0
  );

  const distance = Number((totalDistance / 1000).toFixed(2));
  const duration = formatDuration(totalDuration / 1000);

  return (
    <>
      <div className="rounded-lg shadow-sm border w-full min-w-[350px] overflow-auto">
        {/* Header - Clickable untuk toggle collapse */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-primary cursor-pointer hover:bg-primary/70 transition-colors flex-wrap"
          onClick={toggleExpand}
        >
          <div className="flex flex-col">
            <span
              className="text-white font-semibold"
              style={{ fontSize: "11px" }}
            >
              {device.name}
            </span>
            <span className="text-white" style={{ fontSize: "10px" }}>
              {fDate(device.tracks.date)}
            </span>
          </div>
          <div
            className="flex items-center gap-3 text-white"
            style={{ fontSize: "11px" }}
          >
            <span className="font-semibold">{distance} km</span>
            <span className="text-gray-200">●</span>
            <span className="font-semibold">{duration}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Trip Details - Collapsible */}
        {isExpanded && (
          <div className="flex flex-col">
            {device.trips.length ? (
              device.trips.map((trip, index) => (
                <InfoTrackListItem
                  key={index}
                  device={device}
                  trip={trip}
                  selectedRouteId={selectedRouteId}
                  onClickRoute={(value) => {
                    onClickRoute?.(value);
                    setIsHideTrack(true);

                    if (selectedRouteId === trip.id) {
                      setSelectedRouteId(null);
                      onClickRoute?.({ ...value, data: [] });
                      return;
                    }

                    setSelectedRouteId(trip.id);
                  }}
                />
              ))
            ) : (
              <div
                className="text-center py-8 text-gray-500 flex items-center justify-center "
                style={{ fontSize: "11px" }}
              >
                <p>No track data available for this date.</p>
              </div>
            )}
          </div>
        )}

        {/* Device Info Footer */}
        <div className="px-4 py-2 border-t bg-muted">
          <div
            className="flex items-center justify-between"
            style={{ fontSize: "11px" }}
          >
            <span>
              Status:{" "}
              <span
                className={`font-semibold ${colorStatus(
                  device.status
                )} capitalize`}
              >
                {device.status}
              </span>
            </span>

            <div className="flex items-center gap-1">
              <button
                className="p-1.5 hover:bg-primary rounded-full duration-150 cursor-pointer"
                onClick={toggleTrack}
              >
                {isHideTrack ? (
                  <EyeClosed className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: device?.color,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-[10px] text-muted-foreground">
                    Color track
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const InfoTrackListItem = ({ device, trip, onClickRoute, selectedRouteId }) => {
  const loadingFetch = useBoolean();

  const distance = Number((trip?.distance / 1000).toFixed(2));
  const duration = formatDuration(trip?.duration / 1000);

  const handleClickRoute = async () => {
    loadingFetch.onTrue();

    try {
      const { data: routeData } = await axios.get(
        `/api/proxy/traccar/reports/route?deviceId=${
          device?.id
        }&from=${new Date(trip?.startTime)?.toISOString()}&to=${new Date(
          trip?.endTime
        )?.toISOString()}`
      );

      onClickRoute?.({
        deviceId: device.id,
        tripId: trip.id,
        data: routeData,
      });
    } catch (error) {
      console.log(error);
    } finally {
      loadingFetch.onFalse();
    }
  };

  return (
    <>
      <>
        <div className="transition-colors shadow px-4 py-2 border">
          <div className="mb-3 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold" style={{ fontSize: "11px" }}>
                  {trip?.startTime
                    ? fDateTime(trip?.startTime, "dd MMM yyyy HH:mm")
                    : "-"}
                </span>
                <span className="text-gray-500" style={{ fontSize: "11px" }}>
                  →
                </span>
                <span className="font-semibold" style={{ fontSize: "11px" }}>
                  {trip?.endTime ? fDateTime(trip?.endTime, "HH:mm") : "-"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  className={`p-1.5 hover:bg-primary rounded-full duration-150 cursor-pointer ${
                    selectedRouteId === trip.id ? "bg-primary" : ""
                  }`}
                  onClick={handleClickRoute}
                  disabled={loadingFetch.value}
                >
                  {loadingFetch.value ? (
                    <LoaderCircle className="w-3 h-3 animate-spin" />
                  ) : (
                    <Route className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div
              className="flex items-center gap-3 text-muted-foreground"
              style={{ fontSize: "10px" }}
            >
              <div className="flex items-center gap-1">
                <Gauge className="w-[10px] h-[10px]" />
                <span className="font-semibold">{distance} km</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-[10px] h-[10px]" />
                <span className="font-semibold">{duration}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-1 min-h-12">
            <div className="flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-green-500 dark:text-green-400" />

              <p className="text-muted-foreground text-[11px] font-medium">
                {trip?.startAddress || "-"}
              </p>
            </div>

            <div className="h-full border-l-2 mx-1.5 flex-1" />

            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-500 dark:text-red-400" />

              <p className="text-muted-foreground text-[11px] font-medium">
                {trip?.endAddress || "-"}
              </p>
            </div>
          </div>
        </div>
      </>
    </>
  );
};

function formatDuration(seconds) {
  const duration = intervalToDuration({
    start: 0,
    end: seconds * 1000, // ms
  });

  const { days, hours, minutes, seconds: secs } = duration;

  let parts = [];
  if (days) parts.push(`${days} d`);
  if (hours) parts.push(`${hours} H`);
  if (minutes) parts.push(`${minutes} m`);
  if (secs) parts.push(`${secs} s`);

  return parts.join(" ");
}

const colorStatus = (status) => {
  switch (status) {
    case "online":
      return "text-green-500 dark:text-green-400";
    case "offline":
      return "text-red-500 dark:text-red-400";
    case "idle":
      return "text-yellow-500 dark:text-yellow-400";
    default:
      return "text-gray-500 dark:text-gray-400";
  }
};

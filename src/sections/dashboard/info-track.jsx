import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { MultiSelect } from "@/components/ui/multi-select";
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Flag,
  History,
  ListMinus,
  MapPin,
  RotateCcw,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RangeDatePicker } from "@/components/date-picker";

import { fDate, fDateTime } from "@/utils/format-time";
import { TableList } from "@/components/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useBoolean } from "@/hooks/use-boolean";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { reverseGeocode } from "@/utils/reverse-geocode";

const PAGE_SIZE = 10;
const PAGE_INDEX = 0;

const InfoTrack = ({
  devices = [],
  selectedDeviceIds = [],
  onChangeDate,
  onChangeDevices,
  onRowClick,
  data = [],
  date,
  loading,
}) => {
  const openPopover = useBoolean();

  const [selectedTab, setSelectedTab] = useState("list");

  const handleDateChange = (newDate) => {
    onChangeDate?.(newDate);
    openPopover.onFalse();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 bg-muted p-2 rounded-md">
        <div className="flex items-center gap-2 flex-col flex-wrap">
          <MultiSelect
            options={devices.map(({ id, name }) => ({
              label: name,
              value: id,
            }))}
            defaultValue={selectedDeviceIds}
            className="w-full flex-1"
            placeholder="Select Devices..."
            maxViewSelected={2}
            onValueChange={onChangeDevices}
          />
        </div>

        <div className="flex items-center flex-wrap justify-between gap-2">
          <div className="relative flex-1 flex gap-2">
            <Input
              id="date"
              value={date ? fDate(date) : new Date()}
              placeholder="Select date..."
              className="bg-background pr-10 text-xs! text-muted-foreground w-full min-w-24"
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  openPopover.onTrue();
                }
              }}
              readOnly
            />
            <Popover
              open={openPopover.value}
              onOpenChange={(isOpen) => {
                openPopover.setValue(isOpen);
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  id="date-picker"
                  variant="ghost"
                  className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                >
                  <CalendarIcon className="size-3.5" />
                  <span className="sr-only">Select date</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="end"
                alignOffset={-8}
                sideOffset={10}
              >
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={handleDateChange}
                  disabled={{ after: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Reset"
            className="bg-gray-100! dark:bg-gray-800! hover:bg-gray-200! dark:hover:bg-gray-700! border"
            onClick={() => {
              handleDateChange(new Date());
            }}
          >
            <RotateCcw />
          </Button>

          <Tabs
            defaultValue="list"
            className="shadow border rounded-md"
            onValueChange={setSelectedTab}
          >
            <TabsList>
              <TabsTrigger value="list">
                <ListMinus />
              </TabsTrigger>
              <TabsTrigger value="history">
                <History />
              </TabsTrigger>
              <TabsTrigger value="table">
                <Table />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="p-2">
        {selectedTab === "list" && (
          <ListView
            data={data}
            devices={devices}
            loading={loading}
            onRowClick={onRowClick}
            selectedDeviceIds={selectedDeviceIds}
          />
        )}

        {selectedTab === "history" && (
          <HistoryView
            data={data}
            devices={devices}
            loading={loading}
            onRowClick={onRowClick}
          />
        )}

        {selectedTab === "table" && (
          <TableView
            data={data}
            devices={devices}
            loading={loading}
            onRowClick={onRowClick}
          />
        )}
      </div>
    </div>
  );
};

export default InfoTrack;

const ListView = ({
  data,
  devices = [],
  loading,
  onRowClick,
  selectedDeviceIds,
}) => {
  const [expandedDevices, setExpandedDevices] = useState(new Set());
  const [finalData, setFinalData] = useState([]);

  const toggleExpand = (deviceId) => {
    setExpandedDevices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  };

  function groupTracksByDevice(devices, tracks) {
    // Siapkan map untuk grouping
    const map = new Map();

    // Inisialisasi device → tracks kosong
    devices.forEach(async (device) => {
      map.set(device.id, {
        ...device,
        tracks: {
          startTime: null,
          endTime: null,
          date: null,
          startLatitude: null,
          startLongitude: null,
          endLatitude: null,
          endLongitude: null,
          startAddress: null,
          endAddress: null,
        },
      });
    });

    // sort tracks by deviceTime ascending
    const sortedTracks = tracks.sort(
      (a, b) => new Date(a.deviceTime) - new Date(b.deviceTime)
    );

    // put first and last track per device
    sortedTracks.forEach(async (track) => {
      const deviceEntry = map.get(track.deviceId);
      if (deviceEntry) {
        // If startTime is null, set it
        if (!deviceEntry.tracks.startTime) {
          deviceEntry.tracks.startTime = track.deviceTime;
          deviceEntry.tracks.startLatitude = track.latitude;
          deviceEntry.tracks.startLongitude = track.longitude;
          deviceEntry.tracks.date = track.deviceTime;
        }

        // Always update endTime to the latest
        deviceEntry.tracks.endTime = track.deviceTime;
        deviceEntry.tracks.endLatitude = track.latitude;
        deviceEntry.tracks.endLongitude = track.longitude;
      }
    });

    // Kembalikan array of object
    return Array.from(map.values());
  }

  const filterByDevice = useMemo(() => {
    const grouped = groupTracksByDevice(devices, data);

    console.log("Grouped Tracks:", grouped);

    if (loading) {
      return grouped.filter((device) => device.tracks.startTime !== null);
    }

    return grouped.filter((device) => selectedDeviceIds.includes(device.id));
  }, [devices, selectedDeviceIds, loading]);

  useEffect(() => {
    const fetchAddresses = async () => {
      const updatedData = await Promise.all(
        filterByDevice.map(async (device) => {
          const startAddress = device.tracks.startLatitude
            ? await reverseGeocode(
                device.tracks.startLatitude,
                device.tracks.startLongitude
              )
            : "Unknown Address";

          const endAddress = device.tracks.endLatitude
            ? await reverseGeocode(
                device.tracks.endLatitude,
                device.tracks.endLongitude
              )
            : "Unknown Address";

          return {
            ...device,
            tracks: {
              ...device.tracks,
              startAddress,
              endAddress,
            },
          };
        })
      );

      setFinalData(updatedData);
    };

    fetchAddresses();
  }, [filterByDevice]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return "0.0";
    const R = 6371; // Radius bumi dalam km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "0 min";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    const seconds = diffSecs % 60;

    if (hours > 0) {
      return `${hours} jam ${minutes} min`;
    }
    if (minutes > 0) {
      return `${minutes} min ${seconds} sec`;
    }
    return `${seconds} sec`;
  };

  const colorStatus = (status) => {
    switch (status) {
      case "online":
        return "text-green-600";
      case "offline":
        return "text-red-600";
      case "idle":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

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
      {filterByDevice.map((device) => {
        const distance = calculateDistance(
          device.tracks.startLatitude,
          device.tracks.startLongitude,
          device.tracks.endLatitude,
          device.tracks.endLongitude
        );
        const duration = calculateDuration(
          device.tracks.startTime,
          device.tracks.endTime
        );
        const isExpanded = expandedDevices.has(device.id);

        return (
          <div
            key={device.id}
            className="rounded-lg shadow-sm border w-full min-w-[350px] overflow-auto"
          >
            {/* Header - Clickable untuk toggle collapse */}
            <div
              className="flex items-center justify-between px-4 py-3 bg-primary cursor-pointer hover:bg-primary/70 transition-colors flex-wrap"
              onClick={() => toggleExpand(device.id)}
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
              <>
                {device?.tracks?.startLatitude &&
                device?.tracks?.endLatitude ? (
                  <>
                    <div className="px-4 py-3 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="font-semibold"
                            style={{ fontSize: "11px" }}
                          >
                            {fDateTime(
                              device.tracks.startTime,
                              "dd MMM yyyy HH:mm"
                            )}
                          </span>
                          <span
                            className="text-gray-500"
                            style={{ fontSize: "11px" }}
                          >
                            →
                          </span>
                          <span
                            className="font-semibold"
                            style={{ fontSize: "11px" }}
                          >
                            {fDateTime(device.tracks.endTime, "HH:mm")}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-3"
                          style={{ fontSize: "11px" }}
                        >
                          <span className="font-semibold">{distance} km</span>
                          <span className="font-semibold">{duration}</span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-1 min-h-16">
                        <div className="flex items-center gap-2">
                          <CircleDot className="w-4 h-4 text-green-500 dark:text-green-400" />

                          <p className="text-muted-foreground text-[11px] font-medium">
                            {device.tracks.startAddress ||
                              `Lat: ${device.tracks.startLatitude}, Lon: ${device.tracks.startLongitude}`}
                          </p>
                        </div>

                        <div className="h-full border-l-2 mx-1.5 flex-1" />

                        <div className="flex items-center gap-2">
                          <Flag className="w-4 h-4 text-red-500 dark:text-red-400" />

                          <p className="text-muted-foreground text-[11px] font-medium">
                            {device.tracks.endAddress ||
                              `Lat: ${device.tracks.endLatitude}, Lon: ${device.tracks.endLongitude}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Device Info Footer */}
                    <div className="px-4 py-2 border-t bg-muted">
                      <div
                        className="flex items-center justify-between text-muted-foreground"
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
                        <span>ID: {device.uniqueId}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    className="text-center py-8 text-gray-500 flex items-center justify-center "
                    style={{ fontSize: "11px" }}
                  >
                    <p>No track data available for this date.</p>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {loading && renderLoading}

      {filterByDevice.length === 0 && !loading && (
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

const HistoryView = ({ data, devices = [], loading, onRowClick }) => {
  return (
    <div>
      {/* Implement history view rendering here */}
      <p>History View is under construction.</p>
    </div>
  );
};

const TableView = ({ data, devices = [], loading, onRowClick }) => {
  const [sorting, setSorting] = useState([
    {
      id: "date",
      desc: false,
    },
  ]);

  const columns = useMemo(() => {
    return [
      {
        accessorKey: "deviceName",
        header: "Device",
        meta: {
          sortable: true,
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        meta: {
          sortable: true,
        },
        cell: ({ row }) =>
          row.getValue("date") ? fDate(row.getValue("date")) : "-",
      },
      {
        accessorKey: "speed",
        header: "Speed",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => {
          const speed = row.getValue("speed");
          return speed ? `${speed.toFixed(2)} km/h` : "-";
        },
      },
      {
        accessorKey: "time",
        header: "Time",
        meta: {
          sortable: true,
        },
      },
    ];
  }, [devices]);

  return (
    <>
      <TableList
        key={data.length}
        columns={columns}
        data={data}
        setSorting={setSorting}
        sorting={sorting}
        showPagination={true}
        pageSize={PAGE_SIZE}
        rowClassName="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
        onRowClick={(device) => {
          onRowClick?.(device);
        }}
        loading={loading}
        tableProps={{
          initialState: {
            pagination: { pageIndex: PAGE_INDEX, pageSize: PAGE_SIZE },
          },
        }}
        paginationType="small"
      />
    </>
  );
};

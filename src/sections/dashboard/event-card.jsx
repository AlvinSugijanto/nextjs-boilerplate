import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { LayoutGrid, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import EventTableListAll from "./event-table-list-all";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Iconify from "@/components/iconify";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { fDate } from "@/utils/format-time";
import { endOfDay, startOfDay, subDays, subMonths } from "date-fns";
import axios from "axios";

function EventCard({
  eventTypes,
  geofences,
  selectedDeviceId = null,
  positions,
  setPositions,
  setIsSelectingEvent,
  fetchInitialData,
}) {
  // state
  const [activeTab, setActiveTab] = useState(1);
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dateRange, setDateRange] = useState({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  const fetchEvent = async (deviceId, fromDate = null, toDate = null) => {
    if (!deviceId) {
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Gunakan parameter jika diberikan, jika tidak gunakan state dateRange
      const from = fromDate || dateRange.from;
      const to = toDate || dateRange.to;

      const fromISO = startOfDay(new Date(from)).toISOString();
      const toISO = endOfDay(new Date(to)).toISOString();

      const { data } = await axios.get(
        `/api/proxy/traccar/reports/events?deviceId=${deviceId}&from=${fromISO}&to=${toISO}`
      );

      const finalData = data?.map((item) => {
        const findGeofence = geofences?.find(
          (geo) => geo.id === item.geofenceId
        );

        return {
          ...item,
          geofenceName: findGeofence?.name,
        };
      });

      setEvents(finalData);
    } catch (error) {
      console.error("Error fetching event data:", error);
      setError("Failed to fetch events. Please try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosition = async (positionId, eventId) => {
    if (!positionId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setIsSelectingEvent(false);
      if (eventId === selectedEvents) {
        setSelectedEvents("");
        await fetchInitialData();

        return;
      }

      const { data } = await axios.get(
        `/api/proxy/traccar/positions?id=${positionId}`
      );

      if (data && data.length > 0) {
        const newPosition = data[0];

        setPositions((prevPositions) => {
          const existingIndex = prevPositions.findIndex(
            (item) => item.deviceId === selectedDeviceId
          );

          if (existingIndex !== -1) {
            const updatedPositions = [...prevPositions];
            updatedPositions[existingIndex] = {
              ...updatedPositions[existingIndex],
              ...newPosition,
            };
            return updatedPositions;
          }
        });
        setSelectedEvents(eventId);

        setTimeout(() => {
          setIsSelectingEvent(true);
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching position data:", error);
      setError("Failed to fetch position. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeDateRange = (range) => {
    if (range?.from && range?.to) {
      // Update state date range
      setDateRange({
        from: startOfDay(new Date(range.from)),
        to: endOfDay(new Date(range.to)),
      });

      // Refetch data dengan range baru
      if (selectedDeviceId) {
        fetchEvent(selectedDeviceId, range.from, range.to);
      }
    }
  };

  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    return events.filter((event) => {
      // Filter by event type
      const matchesEventType =
        selectedEventTypes.length === 0 ||
        selectedEventTypes.includes(event.type);

      return matchesEventType;
    });
  }, [events, selectedEventTypes]);

  useEffect(() => {
    if (selectedDeviceId) {
      fetchEvent(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  return (
    <Card className="h-full p-0 flex flex-col">
      <div className="px-4 py-3 flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <MultiSelect
              options={eventTypes.map(({ type }) => ({
                label: type,
                value: type,
              }))}
              className="w-fit min-w-[180px]"
              placeholder="Filter by Event Type"
              onValueChange={setSelectedEventTypes}
              value={selectedEventTypes}
            />

            <RangeDatePicker
              dateRange={dateRange}
              onChange={handleChangeDateRange}
              loading={loading}
              selectedDeviceId={selectedDeviceId}
            />
          </div>
        </div>

        {!error && (
          <>
            <div className="mb-2 text-xs text-muted-foreground flex-shrink-0">
              Showing {filteredEvents.length} of {events.length} events
              {dateRange.from && dateRange.to && (
                <span className="ml-2">
                  ({fDate(dateRange.from)} - {fDate(dateRange.to)})
                </span>
              )}
            </div>
            <div className="flex-1 overflow-auto min-h-0">
              <EventTableListAll
                events={filteredEvents}
                selectedEvents={selectedEvents}
                fetchPosition={fetchPosition}
                loading={loading}
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export default EventCard;

const RangeDatePicker = ({
  dateRange,
  onChange,
  loading = false,
  selectedDeviceId,
}) => {
  const [dateRangeLocal, setDateRangeLocal] = useState({
    from: dateRange.from ? new Date(dateRange.from) : new Date(),
    to: dateRange.to ? new Date(dateRange.to) : new Date(),
  });
  const [open, setOpen] = useState(false);

  const handleQuickSelect = (days) => {
    const to = endOfDay(new Date());
    const from = startOfDay(subDays(new Date(), days));

    const range = { from, to };
    setDateRangeLocal(range);
    onChange?.(range);
    setOpen(false);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const range = {
      from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: endOfDay(now),
    };
    setDateRangeLocal(range);
    onChange?.(range);
    setOpen(false);
  };

  const handleCustomSelect = (range) => {
    if (range?.from && range?.to) {
      setDateRangeLocal(range);
    } else if (range?.from) {
      setDateRangeLocal({ ...dateRangeLocal, from: range.from });
    }
  };

  const handleApplyCustomRange = () => {
    if (dateRangeLocal?.from && dateRangeLocal?.to) {
      onChange?.({
        from: startOfDay(new Date(dateRangeLocal.from)),
        to: endOfDay(new Date(dateRangeLocal.to)),
      });
      setOpen(false);
    }
  };

  const handleCancel = () => {
    // Reset ke nilai asli dari prop
    setDateRangeLocal({
      from: dateRange.from ? new Date(dateRange.from) : new Date(),
      to: dateRange.to ? new Date(dateRange.to) : new Date(),
    });
    setOpen(false);
  };

  const quickRanges = [
    { label: "Today", days: 0 },
    { label: "Yesterday", days: 1 },
    { label: "Last 7 Days", days: 7 },
    { label: "Last 30 Days", days: 30 },
    { label: "Last 90 Days", days: 90 },
  ];

  const isValidRange = dateRangeLocal?.from && dateRangeLocal?.to;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={loading || !selectedDeviceId}
          className={cn(
            "justify-start text-left font-normal text-xs",
            !dateRange?.from && "text-muted-foreground"
          )}
        >
          <Iconify
            icon={loading ? "eos-icons:loading" : "solar:calendar-bold"}
            className={cn("w-4 h-4", loading && "animate-spin")}
          />
          {dateRange?.from && dateRange?.to ? (
            <span className="text-xs ml-1">
              {fDate(dateRange.from)} - {fDate(dateRange.to)}
            </span>
          ) : (
            <span className="text-xs ml-1">Select date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-3 w-auto" align="start">
        <div className="flex gap-4">
          {/* Quick Selection Panel */}
          <div className="flex flex-col space-y-2 pr-4 border-r">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
              Quick Selection
            </h4>
            {quickRanges.map((range, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="justify-start text-xs h-8 px-2"
                onClick={() => handleQuickSelect(range.days)}
              >
                {range.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8 px-2"
              onClick={handleThisMonth}
            >
              This Month
            </Button>
          </div>

          {/* Calendar Panel */}
          <div className="flex flex-col">
            <Calendar
              mode="range"
              defaultMonth={dateRangeLocal?.from}
              selected={dateRangeLocal}
              onSelect={handleCustomSelect}
              numberOfMonths={2}
              disabled={loading}
              className="pointer-events-auto"
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApplyCustomRange}
                disabled={!isValidRange}
                className="text-xs"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

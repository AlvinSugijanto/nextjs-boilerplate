import React, { useMemo, useState } from "react";

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

const listTabs = [
  {
    value: 1,
    icon: <LayoutGrid />,
  },
  {
    value: 2,
    icon: <List />,
  },
];

function EventCard({ events = [], eventTypes = [] }) {
  // state
  const [activeTab, setActiveTab] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [expectedDueDate, setExpectedDueDate] = useState(null);
  const [selectedEventTypes, setSelectedEventTypes] = useState([]);

  const handleChangeDateRange = (range) => {
    // setStartDate(range.from);
    // setExpectedDueDate(range.to);
  };

  const fildteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesEventType =
        selectedEventTypes.length === 0 ||
        selectedEventTypes.includes(event.type);

      const eventDate = new Date(event.date);

      const matchesStartDate = startDate
        ? eventDate >= new Date(startDate)
        : true;
      const matchesExpectedDueDate = expectedDueDate
        ? eventDate <= new Date(expectedDueDate)
        : true;

      return matchesEventType && matchesStartDate && matchesExpectedDueDate;
    });
  }, [events, selectedEventTypes, startDate, expectedDueDate]);

  return (
    <Card className="h-full p-0">
      <div className="px-4 py-3 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="flex items-center justify-between gap-2 overflow-auto flex-wrap">
            <div className="flex items-center gap-2 flex-1">
              <TabsList className="">
                {listTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="text-xs"
                  >
                    {tab.icon}
                  </TabsTrigger>
                ))}
              </TabsList>

              {activeTab === 2 && (
                <div className="flex items-center gap-1">
                  <MultiSelect
                    options={eventTypes.map(({ type }) => ({
                      label: type,
                      value: type,
                    }))}
                    className="w-fit"
                    placeholder="Filter by Event Type"
                    onValueChange={setSelectedEventTypes}
                  />

                  <RangeDatePicker
                    from={startDate || new Date()}
                    to={expectedDueDate || new Date()}
                    onChange={handleChangeDateRange}
                  />
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" className="text-xs justify-end">
              Add Custom Event
            </Button>
          </div>

          <TabsContent value={1}>
            <div className="px-2 py-4">GRID CARD</div>
          </TabsContent>
          <TabsContent value={2} className="h-full overflow-auto relative!">
            <EventTableListAll events={fildteredEvents} />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}

export default EventCard;

const RangeDatePicker = ({ from, to, onChange }) => {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: from ? new Date(from) : new Date(),
    to: to ? new Date(to) : new Date(),
  });

  const handleSelect = (range) => {
    setDateRange(range);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // if closed, send the selected range
          if (dateRange?.from && dateRange?.to) {
            onChange?.(dateRange);
          }
        }
        setOpen(isOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "justify-start text-left font-normal",
            !dateRange?.from && "text-muted-foreground"
          )}
        >
          <Iconify icon="solar:calendar-bold" className="w-4 h-4" />
          {/* {dateRange?.from ? (
            dateRange?.to ? (
              <span className="text-xs">
                {fDate(dateRange.from)} - {fDate(dateRange.to)}
              </span>
            ) : (
              <span className="text-xs">{fDate(dateRange.from)}</span>
            )
          ) : (
            <span className="text-xs cursor-pointer hover:underline">
              Pick a date range
            </span>
          )} */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-auto" align="start">
        <Calendar
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

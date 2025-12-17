import React, { useEffect, useState } from "react";

import { MultiSelect } from "@/components/ui/multi-select";
import {
  CalendarIcon,
  ListMinus,
  MapPin,
  RotateCcw,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { fDate, fDateTime } from "@/utils/format-time";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useBoolean } from "@/hooks/use-boolean";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import InfoTrackList from "./info-track-list";
import InfoTrackTable from "./info-track-table";

const InfoTrack = ({
  devices = [],
  selectedDeviceIds = [],
  onChangeDate,
  onChangeDevices,
  onRowClick,
  data = [],
  date,
  loading,
  onChangeHide,
  onClickRoute,
}) => {
  const openPopover = useBoolean();

  const [selectedTab, setSelectedTab] = useState("list");

  const handleDateChange = (newDate) => {
    onChangeDate?.(newDate);
    openPopover.onFalse();
  };

  // INITIAL FETCH
  useEffect(() => {
    onRowClick?.(null);
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 bg-muted p-2 rounded-b-md">
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
            variant="outline"
            aria-label="Reset"
            onClick={() => {
              handleDateChange(new Date());
            }}
          >
            <RotateCcw />
          </Button>

          <Tabs
            defaultValue="list"
            className="border rounded-md"
            onValueChange={setSelectedTab}
          >
            <TabsList>
              <TabsTrigger value="list" className="rounded-sm">
                <ListMinus />
              </TabsTrigger>
              {/* <TabsTrigger value="history">
                <History />
              </TabsTrigger> */}
              <TabsTrigger value="table" className="rounded-sm">
                <Table />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="p-2">
        {selectedTab === "list" && (
          <InfoTrackList
            data={data}
            devices={devices}
            loading={loading}
            onRowClick={onRowClick}
            selectedDeviceIds={selectedDeviceIds}
            onChangeHide={onChangeHide}
            onClickRoute={onClickRoute}
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
          <InfoTrackTable
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

const HistoryView = ({ data, devices = [], loading, onRowClick }) => {
  return (
    <div>
      {/* Implement history view rendering here */}
      <p>History View is under construction.</p>
    </div>
  );
};

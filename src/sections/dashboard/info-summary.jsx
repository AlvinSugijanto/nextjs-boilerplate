import React, { useCallback, useMemo, useRef, useState } from "react";

import { MultiSelect } from "@/components/ui/multi-select";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RangeDatePicker } from "@/components/date-picker";

import { fDate, fDateTime } from "@/utils/format-time";
import { TableList } from "@/components/table";

const InfoSummary = ({
  devices = [],
  onChangeDateRange,
  onChangeDevices,
  onRowClick,
  data = [],
  from,
  to,
  loading,
}) => {
  // state
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
          row.getValue("startTime") ? fDate(row.getValue("startTime")) : "-",
      },
      {
        accessorKey: "distance",
        header: "Distance",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => {
          const distance = row.getValue("distance");
          return distance ? `${(distance / 1000).toFixed(2)} km` : "-";
        },
      },
      {
        accessorKey: "startTime",
        header: "Start",
        meta: {
          sortable: true,
        },
        cell: ({ row }) =>
          row.getValue("startTime")
            ? fDateTime(row.getValue("startTime"))
            : "-",
      },
      {
        accessorKey: "endTime",
        header: "End",
        meta: {
          sortable: true,
        },
        cell: ({ row }) =>
          row.getValue("endTime") ? fDateTime(row.getValue("endTime")) : "-",
      },
      {
        accessorKey: "startAddress",
        header: "Start Address",
        cell: ({ row }) =>
          row.getValue("startAddress") ? row.getValue("startAddress") : "-",
      },
      {
        accessorKey: "endAddress",
        header: "End Address",
        cell: ({ row }) =>
          row.getValue("endAddress") ? row.getValue("endAddress") : "-",
      },
    ];
  }, [devices]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 bg-muted p-2 rounded-md">
        <MultiSelect
          options={devices.map(({ id, name }) => ({
            label: name,
            value: id,
          }))}
          className="w-full h-full"
          placeholder="Select Devices..."
          maxViewSelected={2}
          onValueChange={onChangeDevices}
        />

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <RangeDatePicker
              from={from}
              to={to}
              onChange={onChangeDateRange}
              showDescription
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Reset"
            className="bg-gray-100! dark:bg-gray-800! hover:bg-gray-200! dark:hover:bg-gray-700! border"
            onClick={() => {
              onChangeDateRange({ from: new Date(), to: new Date() });
            }}
          >
            <RotateCcw />
          </Button>
        </div>
      </div>

      <div className="p-2">
        <TableList
          key={data.length}
          columns={columns}
          data={data}
          setSorting={setSorting}
          sorting={sorting}
          showPagination={false}
          pageSize={data.length}
          rowClassName="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
          // rowClassNameProps={(device) =>
          //   device.id === selectedDeviceId ? "bg-gray-200 dark:bg-gray-700" : ""
          // }
          onRowClick={(device) => {
            onRowClick?.(device);
          }}
          loading={loading}
          tableProps={{
            initialState: {
              pagination: { pageIndex: 0, pageSize: data.length },
            },
          }}
        />
      </div>
    </div>
  );
};

export default InfoSummary;

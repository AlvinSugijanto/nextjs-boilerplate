import { TableList } from "@/components/table";
import { fDate } from "@/utils/format-time";
import React, { useMemo, useState } from "react";

const PAGE_SIZE = 10;
const PAGE_INDEX = 0;

const InfoTrackTable = ({ data, devices = [], loading, onRowClick }) => {
  // state
  const [sorting, setSorting] = useState([
    {
      id: "time",
      desc: false,
    },
  ]);

  const transformedData = useMemo(() => {
    return data.flatMap((d) => d.tracks);
  }, [data]);

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
          return speed ? `${Number(speed.toFixed(2))} km/h` : "-";
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
        key={transformedData.length}
        columns={columns}
        data={transformedData}
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

export default InfoTrackTable;

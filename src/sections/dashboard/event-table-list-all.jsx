import React, { useMemo, useState } from "react";
import { faker } from "@faker-js/faker";
import { fDate, fDateTime } from "@/utils/format-time";
import { TableList } from "@/components/table";

const dummyData = [...new Array(200)].map((_, index) => ({
  id: index + 1,
  started: faker.date.recent().toLocaleString(),
  finished: faker.date.recent().toLocaleString(),
  deviceName: faker.commerce.productName(),
  duration: faker.number.int({ min: 1, max: 120 }) + " mins",
  eventName: faker.hacker.phrase(),
}));

function EventTableListAll({ events = [] }) {
  // state
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([
    {
      id: "started",
      desc: false,
    },
  ]);

  const filteredData = useMemo(() => {
    const transformedData = events.map((item) => ({
      id: item.id,
      started: item.eventTime,
      finished: item.finished,
      deviceName: item.device?.name,
      duration: item.duration,
      eventName: item.type,
    }));

    if (!search) return transformedData;

    return transformedData.filter((event) =>
      Object.values(event).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [events, search]);

  const columns = useMemo(() => {
    return [
      {
        accessorKey: "started",
        header: "Started",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => fDateTime(row.getValue("started"), "HH:mm:ss"),
      },
      {
        accessorKey: "finished",
        header: "Finished",
        meta: {
          sortable: true,
        },
        cell: ({ row }) =>
          row.getValue("finished")
            ? fDateTime(row.getValue("finished"), "HH:mm:ss")
            : "-",
      },
      {
        accessorKey: "deviceName",
        header: "Device Name",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => row.getValue("deviceName") || "-",
      },
      {
        accessorKey: "duration",
        header: "Duration",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => row.getValue("duration") || "-",
      },
      {
        accessorKey: "eventName",
        header: "Event Name",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => {
          const eventName = row.original.eventName;
          return (
            <span title={eventName} className="font-bold text-primary">
              {eventName}
            </span>
          );
        },
      },
    ];
  }, []);

  return (
    <>
      <TableList
        key={filteredData.length}
        columns={columns}
        data={filteredData}
        setSorting={setSorting}
        sorting={sorting}
        showPagination={false}
        pageSize={filteredData.length}
        rowClassName="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        onRowClick={(event) => {
          console.log("Clicked event:", event);
        }}
        tableProps={{
          initialState: {
            pagination: { pageIndex: 0, pageSize: dummyData.length },
          },
        }}
      />
    </>
  );
}

export default EventTableListAll;

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

function EventTableListAll() {
  // state
  const [sorting, setSorting] = useState([
    {
      id: "finished",
      desc: false,
    },
  ]);

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
        cell: ({ row }) => fDateTime(row.getValue("finished"), "HH:mm:ss"),
      },
      {
        accessorKey: "deviceName",
        header: "Device Name",
        meta: {
          sortable: true,
        },
      },
      {
        accessorKey: "duration",
        header: "Duration",
        meta: {
          sortable: true,
        },
      },
    ];
  }, []);

  return (
    <>
      <TableList
        columns={columns}
        data={dummyData}
        setSorting={setSorting}
        sorting={sorting}
        showPagination={false}
        pageSize={dummyData.length}
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

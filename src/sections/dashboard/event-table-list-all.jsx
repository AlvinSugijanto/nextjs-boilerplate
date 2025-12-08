import React, { useMemo, useState } from "react";
import { fDate, fDateTime } from "@/utils/format-time";
import { TableList } from "@/components/table";
import { LocateFixed, Waypoints } from "lucide-react";

function EventTableListAll({ events = [] }) {
  const [sorting, setSorting] = useState([
    {
      id: "eventTime",
      desc: false,
    },
  ]);

  const columns = useMemo(() => {
    return [
      {
        accessorKey: "eventTime",
        header: "Date",
        meta: {
          sortable: true,
        },
        cell: ({ row }) =>
          fDateTime(row.getValue("eventTime"), "d MMM, HH:mm:ss a"),
      },
      {
        accessorKey: "type",
        header: "Event Name",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => {
          const type = row.original.type;
          return (
            <span title={type} className="font-bold text-primary">
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const attributes = row.original.attributes;
          const geofenceName = row.original.geofenceName;

          const hasAttributes =
            attributes && Object.keys(attributes).length > 0;

          return (
            <div className="space-y-1">
              {hasAttributes && (
                <p className="text-sm">
                  {Object.entries(attributes).map(([key, value], index) => (
                    <span key={key}>
                      {value}
                      {index < Object.entries(attributes).length - 1 && ", "}
                    </span>
                  ))}
                </p>
              )}

              {geofenceName && <p>{geofenceName}</p>}
            </div>
          );
        },
      },
      {
        accessorKey: "icon",
        header: "",
        size: 20,
        cell: ({ row }) => {
          const position = row.original.positionId;
          if (position) {
            return <LocateFixed className="size-4 shrink-0" />;
          }
          return "";
        },
      },
    ];
  }, []);

  return (
    <>
      <TableList
        key={events.length}
        columns={columns}
        data={events}
        setSorting={setSorting}
        sorting={sorting}
        showPagination={true}
        pageSize={events.length}
        rowClassName="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
        onRowClick={(event) => {
          console.log("Clicked event:", event);
        }}
        tableProps={{
          initialState: {
            pagination: { pageIndex: 0, pageSize: 5 },
          },
        }}
      />
    </>
  );
}

export default EventTableListAll;

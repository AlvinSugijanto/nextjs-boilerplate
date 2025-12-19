import React, { useMemo, useState } from "react";
import { fDate, fDateTime } from "@/utils/format-time";
import { TableList } from "@/components/table";
import { LocateFixed, Waypoints } from "lucide-react";

function EventTableListAll({
  events = [],
  selectedEvents,
  fetchPosition,
  loading,
}) {
  const [sorting, setSorting] = useState([
    {
      id: "eventTime",
      desc: true,
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
                <p>
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
          const id = row.original.id;

          if (!position) return "";

          const isSelected = selectedEvents === id;

          return (
            <LocateFixed
              className={`
          size-4 shrink-0 transition
          ${isSelected ? "text-blue-600 scale-110" : "text-gray-400"}
          group-hover:text-blue-500 group-hover:scale-110
        `}
            />
          );
        },
      },
    ];
  }, [selectedEvents]);

  return (
    <>
      <TableList
        columns={columns}
        data={events}
        setSorting={setSorting}
        sorting={sorting}
        showPagination={true}
        pageSize={events.length}
        rowClassName="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
        rowClassNameProps={(event) =>
          event.id === selectedEvents ? "bg-gray-200 dark:bg-gray-700" : ""
        }
        onRowClick={(event) => {
          if (event.positionId > 0) {
            fetchPosition(event.positionId, event.id);
          }
        }}
        tableProps={{
          initialState: {
            pagination: { pageIndex: 0, pageSize: 5 },
          },
        }}
        loading={loading}
        loadingType="last"
      />
    </>
  );
}

export default EventTableListAll;

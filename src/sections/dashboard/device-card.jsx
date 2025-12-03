import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { faker } from "@faker-js/faker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TableList } from "@/components/table";
import { fDateTime } from "@/utils/format-time";

const dummyData = [...new Array(200)].map((_, index) => ({
  id: index + 1,
  name: faker.commerce.productName(),
  status: faker.helpers.arrayElement(["Online", "Offline", "Idle"]),
  lastActive: faker.date.recent().toLocaleString(),
}));

function DeviceCard() {
  // state
  const [search, setSearch] = useState("");
  const [data, setData] = useState(dummyData);
  const [sorting, setSorting] = useState([
    {
      id: "name",
      desc: false,
    },
  ]);

  // memo
  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  const columns = useMemo(() => {
    return [
      {
        accessorKey: "status",
        header: "Status",
        meta: {
          sortable: true,
        },
        size: 30,
        cell: ({ row }) => {
          const status = row.getValue("status");
          let colorClass = "bg-gray-500";

          if (status === "Online") colorClass = "bg-green-500";
          else if (status === "Offline") colorClass = "bg-red-500";
          else if (status === "Idle") colorClass = "bg-yellow-500";

          return (
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-3 h-3 rounded-full ${colorClass}`}
              ></span>
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Device Name",
        meta: {
          sortable: true,
        },
      },
      {
        accessorKey: "lastActive",
        header: "Last Active",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => fDateTime(row.getValue("lastActive")),
      },
    ];
  }, []);

  return (
    <Card className="h-full p-4 overflow-hidden flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        {/* search input */}
        <InputGroup>
          <InputGroupInput
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Submit">
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add a new device</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="overflow-auto max-h-full flex-1">
        <TableList
          columns={columns}
          data={filteredData}
          setSorting={setSorting}
          sorting={sorting}
          showPagination={false}
          pageSize={filteredData.length}
          rowClassName="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          onRowClick={(device) => {
            console.log("Clicked device:", device);
          }}
          tableProps={{
            initialState: {
              pagination: { pageIndex: 0, pageSize: filteredData.length },
            },
          }}
        />
      </div>
    </Card>
  );
}

export default DeviceCard;

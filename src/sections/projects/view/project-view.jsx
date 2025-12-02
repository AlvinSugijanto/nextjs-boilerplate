"use client";

import React, { useState, use, useMemo, useCallback, useEffect } from "react";
import { useDebounce } from "react-use";

import { TypographyH4 } from "@/components/typography";
import { TableList } from "@/components/table";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fDate, fDateTime } from "@/utils/format-time";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Drawer } from "@/components/ui/drawer";
import DrawerAddEditProject from "../drawer-add-edit-project";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { useBoolean } from "@/hooks/useBoolean";
import { toast } from "sonner";
import { RowProjectActions } from "../row-project-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { faker } from "@faker-js/faker";

const dummyData = [...new Array(3)].map((item) => {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    project_id: faker.string.alphanumeric({ length: 8, casing: "upper" }),
    startDate: faker.date.past().toISOString(),
    endDate: faker.date.future().toISOString(),
    expectedEndDate: faker.date.future().toISOString(),
    status: faker.helpers.arrayElement([
      "Proposed and Requested",
      "Planning",
      "Approved",
      "In Progress",
      "On Hold",
      "Complete",
    ]),
    strategic_objective: faker.helpers.arrayElements(
      [
        "Operational Excellence",
        "Customer Intimacy",
        "Product Leadership",
        "Sustainability",
        "Innovation & Growth",
        "Stakeholder & Customer Value",
      ],
      { min: 1, max: 3 }
    ),
    created_by: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
    },
  };
});

const ProjectView = () => {
  // hook
  const isMobile = useIsMobile();
  const openDrawer = useBoolean();
  const loadingData = useBoolean();
  const loadingDelete = useBoolean();
  const openConfirm = useBoolean();

  // state
  const [data, setData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState([
    {
      id: "name",
      desc: false,
    },
  ]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useDebounce(
    () => {
      setDebouncedSearch(search);
      setPage(1);
    },
    400, // delay
    [search] // dependencies
  );

  const filteredData = useMemo(() => {
    if (!debouncedSearch) {
      return data;
    }

    return data.filter((item) => {
      const allowedFields = ["name", "projectId", "status", "objective"];

      return allowedFields.some((field) => {
        const value = item[field];
        return (
          typeof value === "string" &&
          value.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      });
    });
  }, [debouncedSearch, data]);

  const fetchData = useCallback(async () => {
    setData(dummyData);
  });

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = useCallback(async (id) => {
    loadingDelete.onTrue();

    try {
      setData((prev) => prev.filter((item) => item.id !== id));
      openConfirm.onFalse();
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while deleting the project.");
    } finally {
      loadingDelete.onFalse();
    }
  }, []);

  const columns = useMemo(() => {
    return [
      {
        accessorKey: "no",
        header: "No",
        cell: ({ row, table }) => {
          // get the list of rows currently visible on this page
          const visibleRows = table.getRowModel().rows;
          // find this row's position in the current visible list
          const rowPosition = visibleRows.findIndex((r) => r.id === row.id);
          // compute number based on page
          const { pageIndex, pageSize } = table.getState().pagination;
          return pageIndex * pageSize + (rowPosition + 1);
        },
        size: 50,
      },
      {
        accessorKey: "name",
        header: "Name",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => (
          <div className="font-medium text-xs hover:underline hover:text-blue-400">
            <Link href={`/example-table/${row.original.id}`}>
              {row.getValue("name")}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: "project_id",
        header: "Project ID",
        meta: {
          sortable: true,
        },
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => {
          const value = row.getValue("startDate");
          const formatted = value ? fDate(value) : null;
          const fullFormatted = value ? fDateTime(value) : null;

          if (!value) {
            return <div className="text-xs">-</div>;
          }

          return (
            <div className="inline-block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs">{formatted}</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{fullFormatted}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => {
          const value = row.getValue("endDate");
          const formatted = value ? fDate(value) : "-";
          const fullFormatted = value ? fDateTime(value) : null;

          if (!value) {
            return <div className="text-xs">-</div>;
          }

          return (
            <div className="inline-block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs">{formatted}</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{fullFormatted}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
      {
        accessorKey: "expectedEndDate",
        header: "Expected End Date",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => {
          const value = row.getValue("expectedEndDate");
          const formatted = value ? fDate(value) : "-";
          const fullFormatted = value ? fDateTime(value) : null;

          if (!value) {
            return <div className="text-xs">-</div>;
          }

          return (
            <div className="inline-block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs">{formatted}</div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{fullFormatted}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => {
          const value = row.getValue("status");

          let color = "bg-gray-500";

          switch (value) {
            case "Proposed and Requested":
            case "Planning":
            case "Monitor":
            case "In Progress":
              color = "bg-blue-500";
              break;
            case "Approved":
            case "Complete":
              color = "bg-green-500";
              break;
            case "On Hold":
              color = "bg-yellow-500";
              break;
          }

          return (
            <div className="flex items-center">
              <span
                className={`inline-block w-2 h-2 rounded-full mr-2 ${color}`}
              ></span>
              <span className="text-xs capitalize">{value || "-"}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "strategic_objective",
        header: "Strategic objectives",
        cell: ({ row }) => {
          const values = row.getValue("strategic_objective") || [];

          return (
            <div className="text-xs">
              {values.length > 0 ? values.join(", ") : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "created_by",
        header: "Created By",
        cell: ({ row }) => {
          const value = row.getValue("created_by");

          if (!value) {
            return <div className="text-xs">-</div>;
          }

          return (
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5 border border-background">
                <AvatarImage
                  src={value.avatar}
                  alt={value.name || value.email}
                />
                <AvatarFallback>{value.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-xs capitalize">
                {value.name || value.email || "-"}
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        meta: {
          align: "right",
        },
        cell: ({ row }) => {
          return (
            <RowProjectActions
              id={row.original.id}
              onEdit={() => {
                setEditData(row.original);
                openDrawer.onTrue();
              }}
              onDelete={() => handleDelete(row.original.id)}
              confirmDialog={{
                open: openConfirm.value,
                onClose: openConfirm.onFalse,
                loading: loadingDelete.value,
                onOpen: openConfirm.onTrue,
              }}
            />
          );
        },
      },
    ];
  }, [openConfirm, handleDelete, loadingDelete]);

  return (
    <div>
      <TypographyH4 className="mb-4">Projects</TypographyH4>

      <Drawer
        direction={isMobile ? "bottom" : "right"}
        open={openDrawer.value}
        onOpenChange={(value) => {
          if (value) {
            openDrawer.onTrue();
          } else {
            setEditData(null);
            openDrawer.onFalse();
          }
        }}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <InputGroup className="w-full sm:w-1/3">
              <InputGroupInput
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>

            <Button
              className="mt-2 w-full sm:w-auto"
              onClick={openDrawer.onTrue}
            >
              Create New Project <Plus />
            </Button>
          </div>

          <TableList
            columns={columns}
            data={filteredData}
            tableProps={{
              initialState: { pagination: { pageIndex: page - 1, pageSize } },
            }}
            setSorting={setSorting}
            sorting={sorting}
          />
        </div>

        <DrawerAddEditProject
          onUpdateData={setData}
          onClose={() => {
            openDrawer.onFalse();
            setEditData(null);
          }}
          editData={editData}
        />
      </Drawer>
    </div>
  );
};

export default ProjectView;

import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Search, Trash } from "lucide-react";
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
import { useBoolean } from "@/hooks/use-boolean";
import { DeviceAddDialog } from "./device-add-dialog";
import { DeviceEditDialog } from "./device-edit-dialog";
import ConfirmDialog from "@/components/dialog/dialog-confirm";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { toast } from "sonner";

function DeviceCard({
  devices = [],
  onDeviceClick,
  loading = false,
  selectedDeviceId,
  onRefresh,
}) {
  const { token } = useAuth();
  // state
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "name", desc: false }]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const addDeviceDialog = useBoolean();
  const editDeviceDialog = useBoolean();
  const deleteDeviceDialog = useBoolean();

  const handleEdit = (device) => {
    setSelectedDevice(device);
    editDeviceDialog.onTrue();
  };

  const handleDelete = (device) => {
    setSelectedDevice(device);
    deleteDeviceDialog.onTrue();
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/proxy/traccar/devices/${selectedDevice.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Device deleted successfully");
      onRefresh();
      deleteDeviceDialog.onFalse();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete device. Please try again.");
    }
  };

  // memo
  const filteredData = useMemo(() => {
    const transformedData = devices.map((item) => {
      return {
        id: item.id,
        name: item.name,
        status: item.status,
        lastActive: item.lastUpdate || null,
        uniqueId: item.uniqueId,
      };
    });

    if (!search) return transformedData;
    return transformedData.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, devices]);

  const columns = useMemo(() => {
    return [
      {
        accessorKey: "status",
        header: "Status",
        meta: { sortable: true },
        size: 30,
        cell: ({ row }) => {
          const status = row.getValue("status");
          let colorClass = "bg-gray-500";
          if (status === "online") colorClass = "bg-green-500";
          else if (status === "offline") colorClass = "bg-red-500";
          else if (status === "idle") colorClass = "bg-yellow-500";
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
        meta: { sortable: true },
      },
      {
        accessorKey: "lastActive",
        header: "Last Active",
        meta: { sortable: true },
        cell: ({ row }) =>
          row.getValue("lastActive")
            ? fDateTime(row.getValue("lastActive"))
            : "-",
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="size-4 hover:bg-transparent!"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(row.original);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Device</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="size-4 hover:bg-transparent!"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(row.original);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Device</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices]);

  return (
    <>
      <Card className="h-full p-4 overflow-hidden flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          {/* search input */}
          <InputGroup>
            <InputGroupInput
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-0"
            />
            <InputGroupAddon>
              <Search className="w-3! h-3!" />
            </InputGroupAddon>
          </InputGroup>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Submit"
                onClick={addDeviceDialog.onTrue}
              >
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
            key={filteredData.length}
            columns={columns}
            data={filteredData}
            setSorting={setSorting}
            sorting={sorting}
            showPagination={false}
            pageSize={filteredData.length}
            rowClassName="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            rowClassNameProps={(device) =>
              device.id === selectedDeviceId
                ? "bg-gray-200 dark:bg-gray-700"
                : ""
            }
            onRowClick={(device) => {
              if (onDeviceClick) {
                onDeviceClick(device);
              }
            }}
            loading={loading}
            tableProps={{
              initialState: {
                pagination: { pageIndex: 0, pageSize: filteredData.length },
              },
            }}
          />
        </div>
      </Card>
      <DeviceAddDialog
        open={addDeviceDialog.value}
        onClose={addDeviceDialog.onFalse}
        onRefresh={onRefresh}
      />
      <DeviceEditDialog
        open={editDeviceDialog.value}
        onClose={editDeviceDialog.onFalse}
        device={selectedDevice}
        onRefresh={onRefresh}
      />
      <ConfirmDialog
        open={deleteDeviceDialog.value}
        onClose={deleteDeviceDialog.onFalse}
        onConfirm={handleDeleteConfirm}
        title="Delete Device"
        description={`Are you sure you want to delete ${selectedDevice?.name}? This action cannot be undone.`}
      />
    </>
  );
}

export default DeviceCard;

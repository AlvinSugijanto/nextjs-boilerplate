import React, { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Play, Plus, Search, Trash, Square } from "lucide-react";
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
import { DeviceSimulationDialog } from "./device-simulation-dialog";
import ConfirmDialog from "@/components/dialog/dialog-confirm";
import axios from "axios";
import { toast } from "sonner";

function DeviceCard({
  devices = [],
  onDeviceClick,
  loading = false,
  selectedDeviceId,
  onDeviceAdd,
  onDeviceUpdate,
  onDeviceDelete,
}) {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([{ id: "name", desc: false }]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceSimulations, setDeviceSimulations] = useState({});
  const [runningSimulations, setRunningSimulations] = useState({});

  const addDeviceDialog = useBoolean();
  const playSimulationDialog = useBoolean();
  const editDeviceDialog = useBoolean();
  const deleteDeviceDialog = useBoolean();

  // Load device simulations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("deviceSimulations");
    if (stored) {
      try {
        setDeviceSimulations(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse stored simulations:", error);
      }
    }
  }, []);

  // Save device simulations to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(deviceSimulations).length > 0) {
      localStorage.setItem("deviceSimulations", JSON.stringify(deviceSimulations));
    }
  }, [deviceSimulations]);

  // Check simulation status when selected device changes
  useEffect(() => {
    if (selectedDeviceId) {
      checkSelectedDeviceSimulation();
    }
  }, [selectedDeviceId, deviceSimulations]);

  const checkSelectedDeviceSimulation = async () => {
    if (!selectedDeviceId) return;

    const simulationId = deviceSimulations[selectedDeviceId];
    if (!simulationId) {
      setRunningSimulations((prev) => ({
        ...prev,
        [selectedDeviceId]: null,
      }));
      return;
    }

    try {
      const { data } = await axios.post("/api/simulate/status", {
        simulationId,
      });

      if (data.hasRunningSimulation) {
        setRunningSimulations((prev) => ({
          ...prev,
          [selectedDeviceId]: data.simulation,
        }));
      } else {
        // Simulation completed or stopped, remove from mapping
        setRunningSimulations((prev) => ({
          ...prev,
          [selectedDeviceId]: null,
        }));
        setDeviceSimulations((prev) => {
          const updated = { ...prev };
          delete updated[selectedDeviceId];
          return updated;
        });
      }
    } catch (error) {
      console.error("Error checking simulation status:", error);
      // Remove from mapping if there's an error (likely 404)
      setRunningSimulations((prev) => ({
        ...prev,
        [selectedDeviceId]: null,
      }));
      setDeviceSimulations((prev) => {
        const updated = { ...prev };
        delete updated[selectedDeviceId];
        return updated;
      });
    }
  };

  const handleEdit = (device) => {
    const originalDevice = devices.find((d) => d.id === device.id);
    setSelectedDevice(originalDevice);
    editDeviceDialog.onTrue();
  };

  const handleDelete = (device) => {
    setSelectedDevice(device);
    deleteDeviceDialog.onTrue();
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/proxy/traccar/devices/${selectedDevice.id}`);
      toast.success("Device deleted successfully");
      onDeviceDelete(selectedDevice.id);

      // Clean up simulation mapping
      setDeviceSimulations((prev) => {
        const updated = { ...prev };
        delete updated[selectedDevice.id];
        return updated;
      });

      deleteDeviceDialog.onFalse();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete device. Please try again.");
    }
  };

  const handleStopSimulation = async () => {
    if (!selectedDeviceId || !runningSimulations[selectedDeviceId]) return;

    try {
      const simulation = runningSimulations[selectedDeviceId];
      await axios.post("/api/simulate/stop", {
        simulationId: simulation.simulation_id,
      });

      toast.success("Simulation stopped successfully");

      // Update state and remove from mapping
      setRunningSimulations((prev) => ({
        ...prev,
        [selectedDeviceId]: null,
      }));
      setDeviceSimulations((prev) => {
        const updated = { ...prev };
        delete updated[selectedDeviceId];
        return updated;
      });
    } catch (error) {
      console.error("Error stopping simulation:", error);
      toast.error("Failed to stop simulation");
    }
  };

  const handleSimulationStart = (simulationData) => {
    // Store device ID -> simulation ID mapping
    setDeviceSimulations((prev) => ({
      ...prev,
      [simulationData.deviceId]: simulationData.simulationId,
    }));

    // Update running simulations state
    setRunningSimulations((prev) => ({
      ...prev,
      [simulationData.deviceId]: simulationData.simulation,
    }));
  };

  const handlePlayStopClick = () => {
    const hasRunningSimulation = selectedDeviceId && runningSimulations[selectedDeviceId];

    if (hasRunningSimulation) {
      handleStopSimulation();
    } else {
      playSimulationDialog.onTrue();
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

  const hasRunningSimulation = selectedDeviceId && runningSimulations[selectedDeviceId];
  const playStopIcon = hasRunningSimulation ? Square : Play;
  const playStopTooltip = hasRunningSimulation ? "Stop simulation" : "Play simulation";

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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Play or Stop Simulation"
                onClick={handlePlayStopClick}
              >
                {React.createElement(playStopIcon)}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{playStopTooltip}</p>
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
        onDeviceAdd={onDeviceAdd}
      />
      <DeviceEditDialog
        open={editDeviceDialog.value}
        onClose={editDeviceDialog.onFalse}
        device={selectedDevice}
        onDeviceUpdate={onDeviceUpdate}
      />
      <DeviceSimulationDialog
        open={playSimulationDialog.value}
        onClose={playSimulationDialog.onFalse}
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        onSimulationStart={handleSimulationStart}
        deviceSimulations={deviceSimulations}
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

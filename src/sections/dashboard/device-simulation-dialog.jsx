"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import RHFSelect from "@/components/hook-form/rhf-select";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import ConfirmDialog from "@/components/dialog/dialog-confirm";

const schema = Yup.object().shape({
  deviceId: Yup.string().required("Device is required"),
  routeId: Yup.string().required("Route is required"),
});

export function DeviceSimulationDialog({
  open,
  onClose,
  devices = [],
  selectedDeviceId = null,
  onSimulationStart,
  deviceSimulations = {},
}) {
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [runningSimulation, setRunningSimulation] = useState(null);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      deviceId: selectedDeviceId || "",
      routeId: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
    watch,
  } = methods;

  const selectedDevice = watch("deviceId");

  // Fetch routes when dialog opens
  useEffect(() => {
    if (open) {
      fetchRoutes();
      // Set selected device if available
      if (selectedDeviceId) {
        setValue("deviceId", String(selectedDeviceId));
      }
    } else {
      // Reset state when dialog closes
      setRunningSimulation(null);
      setPendingSubmitData(null);
    }
  }, [open, selectedDeviceId]);

  // Check simulation status when device changes or deviceSimulations changes
  useEffect(() => {
    if (selectedDevice && open) {
      checkSimulationStatus(selectedDevice);
    }
  }, [selectedDevice, open, deviceSimulations]);

  const fetchRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const { data } = await axios.get("/api/collection/route", {
        headers: {
          type: "getFullList",
        },
      });
      setRoutes(data);
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.error("Failed to fetch routes");
    } finally {
      setLoadingRoutes(false);
    }
  };

  const checkSimulationStatus = async (deviceId) => {
    // Get simulation ID for the selected device
    const simulationId = deviceSimulations[deviceId];

    // If no simulation ID stored for this device, no need to check
    if (!simulationId) {
      setRunningSimulation(null);
      return;
    }

    setCheckingStatus(true);
    try {
      const { data } = await axios.post("/api/simulate/status", {
        simulationId,
      });

      if (data.hasRunningSimulation) {
        setRunningSimulation(data.simulation);
      } else {
        setRunningSimulation(null);
      }
    } catch (error) {
      console.error("Error checking simulation status:", error);
      setRunningSimulation(null);
    } finally {
      setCheckingStatus(false);
    }
  };

  const stopSimulation = async (simulationId) => {
    try {
      await axios.post("/api/simulate/stop", {
        simulationId,
      });
      toast.success("Simulation stopped successfully");
      setRunningSimulation(null);

      // If we have pending data, proceed with new simulation
      if (pendingSubmitData) {
        await startSimulation(pendingSubmitData);
        setPendingSubmitData(null);
      }
    } catch (error) {
      console.error("Error stopping simulation:", error);
      toast.error("Failed to stop simulation");
    }
  };

  const startSimulation = async (data) => {
    try {
      const device = devices.find((d) => d.id === parseInt(data.deviceId));
      const route = routes.find((r) => r.id === data.routeId);

      if (!device || !route) {
        toast.error("Invalid device or route selection");
        return;
      }

      const response = await axios.post("/api/simulate", {
        deviceId: device.id,
        uniqueId: device.uniqueId,
        sourceGeofenceId: route.Source,
        destinationGeofenceId: route.Destination,
      });

      toast.success("Simulation started successfully");

      // Notify parent component with simulation ID
      if (onSimulationStart) {
        onSimulationStart({
          deviceId: device.id,
          simulationId: response.data.data.simulation_id,
          simulation: response.data.data,
        });
      }

      reset();
      onClose();
    } catch (error) {
      console.error("Error starting simulation:", error);
      toast.error(
        error.response?.data?.error || "Failed to start simulation. Please try again."
      );
    }
  };

  const onSubmit = async (data) => {
    // Check if there's a running simulation for this device
    if (runningSimulation) {
      // Store data and show confirmation dialog
      setPendingSubmitData(data);
      setShowStopConfirm(true);
    } else {
      // No running simulation, start directly
      await startSimulation(data);
    }
  };

  const handleStopConfirm = async () => {
    setShowStopConfirm(false);
    if (runningSimulation?.simulation_id) {
      await stopSimulation(runningSimulation.simulation_id);
    }
  };

  const deviceOptions = devices.map((device) => ({
    value: String(device.id),
    label: device.name,
  }));

  const routeOptions = routes.map((route) => ({
    value: route.id,
    label: route.name,
  }));

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Play Device Simulation</DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <RHFSelect
                name="deviceId"
                label="Device"
                placeholder="Select a device"
                options={deviceOptions}
              />

              {checkingStatus && (
                <p className="text-sm text-muted-foreground">
                  Checking simulation status...
                </p>
              )}

              {runningSimulation && !checkingStatus && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ This device has a running simulation. Starting a new simulation will stop the current one.
                  </p>
                </div>
              )}

              <RHFSelect
                name="routeId"
                label="Route"
                placeholder={loadingRoutes ? "Loading routes..." : "Select a route"}
                options={routeOptions}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || loadingRoutes || checkingStatus}>
                  {isSubmitting ? "Starting..." : "Play"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showStopConfirm}
        onClose={() => {
          setShowStopConfirm(false);
          setPendingSubmitData(null);
        }}
        onConfirm={handleStopConfirm}
        title="Stop Current Simulation?"
        description="This device already has a running simulation. Do you want to stop it and start a new one?"
      />
    </>
  );
}

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

const schema = Yup.object().shape({
  deviceId: Yup.string().required("Device is required"),
  routeId: Yup.string().required("Route is required"),
});

export function DeviceSimulationDialog({
  open,
  onClose,
  devices = [],
  selectedDeviceId = null
}) {
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

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
  } = methods;

  useEffect(() => {
    if (open) {
      fetchRoutes();
      if (selectedDeviceId) {
        setValue("deviceId", String(selectedDeviceId));
      }
    }
  }, [open, selectedDeviceId]);

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

  const onSubmit = async (data) => {
    try {
      const device = devices.find((d) => d.id === parseInt(data.deviceId));
      const route = routes.find((r) => r.id === data.routeId);

      if (!device || !route) {
        toast.error("Invalid device or route selection");
        return;
      }

      await axios.post("/api/simulate", {
        deviceId: device.id,
        uniqueId: device.uniqueId,
        sourceGeofenceId: route.Source,
        destinationGeofenceId: route.Destination,
      });

      toast.success("Simulation started successfully");
      reset();
      onClose();
    } catch (error) {
      console.error("Error starting simulation:", error);
      toast.error(
        error.response?.data?.error || "Failed to start simulation. Please try again."
      );
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
              <Button type="submit" disabled={isSubmitting || loadingRoutes}>
                {isSubmitting ? "Starting..." : "Play"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

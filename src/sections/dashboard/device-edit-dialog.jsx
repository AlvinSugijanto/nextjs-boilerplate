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
import { RHFTextField, RhfMultiSelect } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { useCallback, useEffect, useState } from "react";
import { useBoolean } from "@/hooks/use-boolean";

const schema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  uniqueId: Yup.string().required("Identifier is required"),
});

export function DeviceEditDialog({ open, onClose, device, onDeviceUpdate }) {
  const loadingFetch = useBoolean();
  const [geofenceData, setGeofenceData] = useState([]);
  const [selectedGeofences, setSelectedGeofences] = useState([]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      uniqueId: "",
      geofences: [],
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (data) => {
    const updatedDevice = { ...device, ...data };
    delete updatedDevice.geofences;
    try {
      const response = await axios.put(
        `/api/proxy/traccar/devices/${device.id}`,
        updatedDevice,
      );

      const initialGeofences = new Set(selectedGeofences);
      const newGeofences = new Set(data.geofences);

      const geofencesToAdd = [...newGeofences].filter(
        (id) => !initialGeofences.has(id),
      );
      const geofencesToRemove = [...initialGeofences].filter(
        (id) => !newGeofences.has(id),
      );

      const addPromises = geofencesToAdd.map((geofenceId) =>
        axios.post("/api/proxy/traccar/permissions", {
          deviceId: device.id,
          geofenceId,
        }),
      );

      const removePromises = geofencesToRemove.map((geofenceId) =>
        axios.delete("/api/proxy/traccar/permissions", {
          data: {
            deviceId: device.id,
            geofenceId,
          },
        }),
      );

      await Promise.all([...addPromises, ...removePromises]);

      toast.success("Device updated successfully");
      onDeviceUpdate(response.data);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update device. Please try again.");
    }
  };

  const fetchGeofenceData = useCallback(async () => {
    if (!device?.id) return;
    loadingFetch.onTrue();

    try {
      const [{ data: all }, { data: selected }] = await Promise.all([
        axios.get("/api/proxy/traccar/geofences"),
        axios.get(`/api/proxy/traccar/geofences?deviceId=${device.id}`),
      ]);

      const selectedIds = selected.map((g) => g.id);
      setGeofenceData(all);
      setSelectedGeofences(selectedIds);
      reset({
        name: device.name,
        uniqueId: device.uniqueId,
        geofences: selectedIds,
      });
    } catch (error) {
      console.error("Error fetching geofence data: ", error);
    } finally {
      loadingFetch.onFalse();
    }
  }, [device]);

  useEffect(() => {
    if (open && device?.id) {
      fetchGeofenceData();
    }
  }, [open, device?.id, fetchGeofenceData]);


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <RHFTextField name="name" label="Name" />
            <RHFTextField
              name="uniqueId"
              label="Identifier"
              helperText="IMEI, serial number or other id. It has to match the identifier device reports to the server."
            />
            <RhfMultiSelect
              name="geofences"
              label="Geofences Connection"
              placeholder="Select Geofences"
              options={geofenceData?.map((geofence) => ({
                label: geofence.name,
                value: geofence.id,
              }))}
              searchable
              hideSelectAll={false}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Device"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

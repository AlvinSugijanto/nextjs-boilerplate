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

export function DeviceAddDialog({ open, onClose, onDeviceAdd }) {
  const loadingFetch = useBoolean();
  const [geofenceData, setGeofenceData] = useState([]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      uniqueId: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "/api/proxy/traccar/devices",
        {
          name: data.name,
          uniqueId: data.uniqueId,
        },
      );

      if (data.geofences.length > 0) {
        for (const geofenceId of data.geofences) {
          await axios.post(
            "api/proxy/traccar/permissions",
            {
              deviceId: response.data.id.toString(),
              geofenceId: geofenceId,
            },
          );
        }
      }

      toast.success("Device added successfully");
      onDeviceAdd(response.data);
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add device. Please try again.");
    }
  };

  const fetchGeofenceData = useCallback(async () => {
    loadingFetch.onTrue();

    try {
      const { data } = await axios.get("/api/proxy/traccar/geofences");

      setGeofenceData(data);
    } catch (error) {
      console.error("Error fetching geofence data: ", error);
    } finally {
      loadingFetch.onFalse();
    }
  }, []);

  useEffect(() => {
    fetchGeofenceData();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Device</DialogTitle>
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
                {isSubmitting ? "Adding..." : "Add Device"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

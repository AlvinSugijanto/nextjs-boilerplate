"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { RHFTextField } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { toast } from "sonner";
import { useEffect } from "react";

const schema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  uniqueId: Yup.string().required("Identifier is required"),
});

export function DeviceEditDialog({ open, onClose, device, onDeviceUpdate }) {
  const { token } = useAuth();

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

  useEffect(() => {
    if (device) {
      reset({
        name: device.name,
        uniqueId: device.uniqueId,
      });
    }
  }, [device, reset]);

  const onSubmit = async (data) => {
    const updatedDevice = { ...device, ...data };
    try {
      const response = await axios.put(
        `/api/proxy/traccar/devices/${device.id}`,
        updatedDevice,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Device updated successfully");
      onDeviceUpdate(response.data);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update device. Please try again.");
    }
  };

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

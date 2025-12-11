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
import { RHFTextField } from "@/components/hook-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { toast } from "sonner";

const schema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  uniqueId: Yup.string().required("Identifier is required"),
});

export function DeviceAddDialog({ open, onClose, setDevices }) {
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

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("/api/proxy/traccar/devices", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDevices((prev) => [...prev, response.data]);
      toast.success("Device added successfully");
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add device. Please try again.");
    }
  };

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

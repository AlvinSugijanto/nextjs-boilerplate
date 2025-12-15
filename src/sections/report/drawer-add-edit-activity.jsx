import { FormProvider, useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  RHFTextField,
  RHFDatePicker,
  RHFTextArea,
  RHFSelect,
  RhfMultiSelect,
} from "@/components/hook-form";
import { useEffect, useMemo } from "react";
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useBoolean } from "@/hooks/use-boolean";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Trash2, Plus } from "lucide-react";
import axios from "axios";

const schemaValidation = Yup.object().shape({
  vehicle: Yup.string().required("Digger must be selected"),
  operator: Yup.string().required("Operator must be selected"),
  type: Yup.string().required("Activity must be selected"),
  plan: Yup.number().min(1, "Plan cannot be zero").required("Plan is required"),
  dumpTrucks: Yup.array()
    .of(
      Yup.object().shape({
        vehicle: Yup.string().required("Dump Truck must be selected"),
        operator: Yup.string().required("Operator must be selected"),
      })
    )
    .min(1, "At least one Dump Truck is required"),
  route: Yup.string().required("Route must be selected"),
  data_timbang: Yup.number()
    .min(1, "Data Timbang cannot be zero")
    .required("Data Timbang is required"),
  project: Yup.string().required("Route must be selected"),
  activity: Yup.string().required("Activity must be selected"),
});

const LIST_ACTIVITY = [
  {
    label: "OVERBURDEN",
    value: "overburden",
  },
  {
    label: "COAL GETTING",
    value: "coal getting",
  },
  {
    label: "COAL HAULING",
    value: "coal hauling",
  },
];

const DrawerAddEditActivity = ({
  onClose,
  geoFencesData = [],
  vehicleData = [],
  operatorData = [],
  routeData = [],
  projectData = [],
}) => {
  // hooks
  const loadingSubmit = useBoolean();

  const geoFenceOptions = useMemo(() => {
    if (!geoFencesData?.length) return [];

    const uniqueNames = [...new Set(geoFencesData.map((g) => g.name))];

    return uniqueNames.map((name) => ({
      label: name,
      value: name,
    }));
  }, [geoFencesData]);

  const vehicleOptions = useMemo(() => {
    if (!vehicleData?.length) return [];

    return vehicleData.map((item) => ({
      label: item.name,
      value: item.id,
      type: item.type,
    }));
  }, [vehicleData]);

  const operatorOptions = useMemo(() => {
    if (!operatorData?.length) return [];

    return operatorData.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }, [operatorData]);

  const routeOptions = useMemo(() => {
    if (!routeData?.length) return [];

    return routeData.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }, [routeData]);

  const projectOptions = useMemo(() => {
    if (!projectData?.length) return [];

    return projectData.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  }, [projectData]);

  const defaultValues = useMemo(() => {
    return {
      vehicle: "",
      operator: "",
      type: "",
      plan: 0,
      dumpTrucks: [{ vehicle: "", operator: "" }],
      route: "",
      data_timbang: 0,
      project: "",
      activity: "",
    };
  }, []);

  const methods = useForm({
    resolver: yupResolver(schemaValidation),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    reset,
    watch,
    control,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dumpTrucks",
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      loadingSubmit.onTrue();

      let child = [];

      for (let i = 0; i < data.dumpTrucks.length; i++) {
        const payload = {
          ...data,
          operator: data?.dumpTrucks[i].operator,
          vehicle: data?.dumpTrucks[i].vehicle,
        };
        const result = await axios.post(
          "/api/collection/daily_productivity",
          payload
        );
        child.push(result.data.id);
      }

      // create parent,
      const payloadParent = {
        ...data,
        hauler: child,
      };
      await axios.post("/api/collection/daily_productivity", payloadParent);
      onClose();
      reset(defaultValues);

      toast.success("Succesfully created Activity!");
    } catch (error) {
      toast.error("Something wrong happened:", error?.message);
    } finally {
      loadingSubmit.onFalse();
    }
  });

  const handleAddDumpTruck = () => {
    append({ vehicle: "", operator: "" });
  };

  const handleRemoveDumpTruck = (index) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("At least one Dump Truck is required");
    }
  };

  return (
    <DrawerContent className="max-w-lg!">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-auto h-full"
        >
          <FieldGroup>
            <DrawerHeader>
              <DrawerTitle>{"Add New Activity"}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 space-y-3 overflow-y-auto pb-32">
              <Field>
                <RHFSelect
                  name="vehicle"
                  label="Digger"
                  placeholder="Select Digger"
                  options={vehicleOptions?.filter(
                    (item) => item.type === "digger"
                  )}
                />
              </Field>
              <Field>
                <RHFSelect
                  name="operator"
                  label="Operator"
                  placeholder="Select Operator"
                  options={operatorOptions}
                />
              </Field>
              <Field>
                <RHFSelect
                  name="type"
                  label="Type"
                  placeholder="Select Type"
                  options={LIST_ACTIVITY}
                />
              </Field>

              {/* Dump Truck Dynamic Fields */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Dump Truck</label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddDumpTruck}
                    className="h-8"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex gap-2 items-end p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">
                          Vehicle
                        </label>
                        <Field>
                          <RHFSelect
                            name={`dumpTrucks.${index}.vehicle`}
                            placeholder="Select Dump Truck"
                            options={vehicleOptions?.filter(
                              (item) => item.type === "dump truck"
                            )}
                          />
                        </Field>
                      </div>

                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">
                          Operator
                        </label>

                        <Field>
                          <RHFSelect
                            name={`dumpTrucks.${index}.operator`}
                            placeholder="Select Operator"
                            options={operatorOptions}
                          />
                        </Field>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveDumpTruck(index)}
                        className="h-8 w-8 text-destructive hover:text-destructive mt-1"
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {errors.dumpTrucks && (
                  <p className="text-sm text-destructive">
                    {errors.dumpTrucks.message}
                  </p>
                )}
              </div>
              <Field>
                <RHFSelect
                  name="route"
                  label="Route"
                  placeholder="Select Route"
                  options={routeOptions}
                />
              </Field>
              <Field>
                <RHFSelect
                  name="project"
                  label="Project"
                  placeholder="Select Project"
                  options={projectOptions}
                />
              </Field>
              <Field>
                <RHFTextField name="activity" label="Activity" />
              </Field>
              <Field>
                <RHFTextField
                  name="data_timbang"
                  label="Data Timbang"
                  type="number"
                />
              </Field>
              <Field>
                <RHFTextField name="plan" label="Plan" type="number" />
              </Field>
            </div>
            <DrawerFooter className="border-t border-dashed p-4 absolute bottom-0 w-full bg-background">
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DrawerFooter>
          </FieldGroup>
        </form>
      </FormProvider>
    </DrawerContent>
  );
};

export default DrawerAddEditActivity;

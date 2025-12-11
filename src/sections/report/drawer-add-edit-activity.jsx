import { FormProvider, useForm } from "react-hook-form";
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
import { LIST_PRIORITY_LEVELS } from "../projects/variable";

const schemaValidation = Yup.object().shape({
  digger: Yup.string().required("Digger must be selected"),
  operator: Yup.string().required("Operator must be selected"),
  activity: Yup.string().required("Activity must be selected"),
  plan: Yup.number().min(1, "Plan cannot be zero"),
  dumpTruck: Yup.array().min(1, "Dump Truck must be at least 1"),
  source: Yup.string().required("Source must be selected"),
  destination: Yup.string().required("Destination must be selected"),
});

const DrawerAddEditActivity = ({
  onUpdateData,
  onClose,
  editData,
  geoFencesData = [],
}) => {
  // hooks
  const { user } = useAuth();
  const loadingSubmit = useBoolean();

  const geoFenceOptions = useMemo(() => {
    if (!geoFencesData?.length) return [];

    const uniqueNames = [...new Set(geoFencesData.map((g) => g.name))];

    return uniqueNames.map((name) => ({
      label: name,
      value: name,
    }));
  }, [geoFencesData]);

  const defaultValues = useMemo(() => {
    return {
      digger: editData?.digger || "",
      operator: editData?.operator || "",
      activity: editData?.activity || "",
      plan: editData?.plan || 0,
      dumpTruck: editData?.dumpTruck || [],
      source: editData?.source || "",
      destination: editData?.destination || "",
    };
  }, [editData]);

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
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    loadingSubmit.onTrue();

    try {
      if (editData) {
        onUpdateData((prev) =>
          prev.map((item) =>
            item.id === editData.id
              ? {
                  ...item,
                  ...values,
                  endDate: values.expectedEndDate,
                  status: editData.project_status,
                }
              : item
          )
        );

        toast.success("Activity updated successfully.");
      } else {
        onUpdateData((prev) => [
          ...prev,
          {
            ...values,
            id: editData.id,
            endDate: values.expectedEndDate,
            status: editData.project_status,
            created_by: user,
          },
        ]);
      }

      onClose();
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);

      toast.error("An error occurred while submitting the form.");
    } finally {
      loadingSubmit.onFalse();
    }
  });

  return (
    <DrawerContent>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-auto h-full"
        >
          <FieldGroup>
            <DrawerHeader>
              <DrawerTitle>
                {editData ? "Edit Activity" : "Add New Activity"}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 space-y-3 overflow-y-auto pb-32">
              <Field>
                {/* <RHFTextField name="name" label="Digger" placeholder="Digger" /> */}
                <RHFSelect
                  name="digger"
                  label="Digger"
                  placeholder="Select Digger"
                  options={LIST_PRIORITY_LEVELS}
                />
              </Field>
              <Field>
                <RHFSelect
                  name="operator"
                  label="Operator"
                  placeholder="Select Operator"
                  options={LIST_PRIORITY_LEVELS}
                />
              </Field>
              <Field>
                <RHFSelect
                  name="activity"
                  label="Activity"
                  placeholder="Select Activity"
                  options={LIST_PRIORITY_LEVELS}
                />
              </Field>
              <Field>
                <RHFTextField name="plan" label="Plan" type="number" />
              </Field>
              <Field>
                <RhfMultiSelect
                  name="dumpTruck"
                  label="Dump Truck"
                  placeholder="Select Dump Truck"
                  options={LIST_PRIORITY_LEVELS}
                  searchable
                  hideSelectAll={false}
                />
              </Field>

              <Field>
                <RHFSelect
                  name="source"
                  label="Source"
                  placeholder="Select Source"
                  options={geoFenceOptions}
                />
              </Field>
              <Field>
                <RHFSelect
                  name="destination"
                  label="Destination"
                  placeholder="Select Destination"
                  options={geoFenceOptions}
                />
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

import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  RHFTextField,
  RHFDatePicker,
  RHFTextArea,
  RHFSelect,
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
import { LIST_PROJECT_STATUS } from "./variable";
import { useAuth } from "@/context/auth-context";

const schemaValidation = Yup.object().shape({
  name: Yup.string().required("Name must be filled"),
  project_id: Yup.string().required("Project ID must be filled"),
  project_abbreviation: Yup.string().required("Abbreviation must be filled"),
  startDate: Yup.date()
    .required("Start Date must be filled")
    .typeError("Start Date must be a valid date"),
  expectedEndDate: Yup.date()
    .required("Expected End Date must be filled")
    .typeError("Expected End Date must be a valid date")
    .min(Yup.ref("startDate"), "Expected End Date cannot be before Start Date"),
  status: Yup.string().required("Status must be filled"),
  description: Yup.string(),
});

const DrawerAddEditProject = ({ onUpdateData, onClose, editData }) => {
  // hooks
  const { user } = useAuth();
  const loadingSubmit = useBoolean();

  const defaultValues = useMemo(() => {
    return {
      name: editData?.name || "",
      project_id: editData?.project_id || "",
      project_abbreviation: editData?.project_abbreviation || "",
      startDate: editData?.startDate || "",
      expectedEndDate: editData?.expectedEndDate || "",
      status: editData?.status,
      description: editData?.description || "",
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

        toast.success("Project updated successfully.");
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
                {editData ? "Edit Project" : "Add New Project"}
              </DrawerTitle>
              <DrawerDescription>
                {editData
                  ? "Edit the project details."
                  : "Add a new project to the system."}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 space-y-3 overflow-y-auto pb-32">
              <Field>
                <RHFTextField
                  name="name"
                  label="Project Name"
                  placeholder="Project Name"
                />
              </Field>
              <Field>
                <RHFTextField
                  name="project_id"
                  label="Project ID"
                  placeholder="Project ID"
                />
              </Field>
              <Field>
                <RHFTextField
                  name="project_abbreviation"
                  label="Abbreviation"
                  placeholder="Abbreviation"
                />
              </Field>
              <Field>
                <RHFDatePicker
                  name="startDate"
                  label="Start Date"
                  placeholder="Select project start date"
                />
              </Field>

              <Field>
                <RHFDatePicker
                  name="expectedEndDate"
                  label="Expected End Date"
                  placeholder="Select expected end date"
                />
              </Field>

              <Field>
                <RHFSelect
                  name="status"
                  label="Status"
                  placeholder="Select project status"
                  options={LIST_PROJECT_STATUS}
                />
              </Field>

              <Field>
                <RHFTextArea
                  name="description"
                  label="Description"
                  placeholder="Project Description"
                  rows={4}
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

export default DrawerAddEditProject;

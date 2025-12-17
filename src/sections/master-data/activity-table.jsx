import React, { useState, useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

// Components
import { TypographyLarge } from "@/components/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TableList } from "@/components/table";
import { ConfirmDialog } from "@/components/dialog";
import { RHFSelect, RHFTextField } from "@/components/hook-form";
import Iconify from "@/components/iconify";
import ColumnActions from "./column-actions";

// Utils & Hooks
import { useBoolean } from "@/hooks/use-boolean";
import { fDateTime } from "@/utils/format-time";
import { activitySchema } from "./schema-validation";

// Default form values
const DEFAULT_VALUES = {
  name: "",
  sub_activity: "",
  process_method: "",
};

const ActivityTable = () => {
  // ====== Boolean Flags ======
  const loadingFetch = useBoolean();
  const loadingSubmit = useBoolean();
  const loadingDelete = useBoolean();
  const openDrawer = useBoolean();
  const openConfirm = useBoolean();

  // ====== State ======
  const [data, setData] = useState([]);
  const [processMethod, setProcessMethod] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState([{ id: "name", desc: false }]);

  // ====== Form Setup ======
  const methods = useForm({
    resolver: yupResolver(activitySchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { handleSubmit, reset, setError } = methods;

  // ====== Helper Variables ======
  const isEditMode = Boolean(selectedData?.id);
  const dialogTitle = isEditMode ? "Edit Activity" : "Add New Activity";
  const dialogDescription = isEditMode
    ? "Update the activity details below."
    : "Fill in the details to add a new activity.";

  // ====== API Calls ======
  const fetchData = useCallback(async () => {
    loadingFetch.onTrue();
    try {
      const { data } = await axios.get("/api/collection/activity", {
        headers: {
          type: "getfulllist",
          expand: "sub_activity, process_method",
        },
      });
      setData(data);
    } catch (error) {
      console.error("Error fetching activity data:", error);
    } finally {
      loadingFetch.onFalse();
    }
  }, []);

  const fetchProcessMethod = useCallback(async () => {
    loadingFetch.onTrue();
    try {
      const { data } = await axios.get("/api/collection/activity_method", {
        headers: {
          type: "getfulllist",
        },
      });
      setProcessMethod(data);
    } catch (error) {
      console.error("Error fetching process method data:", error);
    } finally {
      loadingFetch.onFalse();
    }
  }, []);

  // ====== Event Handlers ======
  const handleOpenDrawerForAdd = useCallback(() => {
    setSelectedData(null); // Clear selection for add mode
    reset(DEFAULT_VALUES); // Reset form to default
    openDrawer.onTrue();
  }, [reset, openDrawer]);

  const handleOpenDrawerForEdit = useCallback(
    (rowData) => {
      setSelectedData(rowData); // Set selected data for edit mode
      reset(rowData); // Populate form with existing data
      openDrawer.onTrue();
    },
    [reset, openDrawer]
  );

  const handleCloseDrawer = useCallback(() => {
    setSelectedData(null); // Clear selection
    reset(DEFAULT_VALUES); // Reset form
    openDrawer.onFalse();
  }, [reset, openDrawer]);

  const onSubmit = handleSubmit(async (values) => {
    loadingSubmit.onTrue();
    try {
      if (isEditMode) {
        // Update existing activity
        const { data: res } = await axios.put(
          `/api/collection/activity/${selectedData.id}`,
          values
        );

        const transformedData = {
          ...res,
          expand: {
            ...res.expand,
            sub_activity: data.find((item) => item.id === res.sub_activity),
            process_method: processMethod.find(
              (item) => item.id === res.process_method
            ),
          },
        };

        setData((prevData) =>
          prevData.map((item) =>
            item.id === selectedData.id ? transformedData : item
          )
        );
        toast.success("Activity updated successfully!");
      } else {
        // Create new activity
        const { data: res } = await axios.post(
          "/api/collection/activity",
          values
        );

        const transformedData = {
          ...res,
          expand: {
            ...res.expand,
            sub_activity: data.find((item) => item.id === res.sub_activity),
            process_method: processMethod.find(
              (item) => item.id === res.process_method
            ),
          },
        };

        setData((prevData) => [...prevData, transformedData]);
        toast.success("Activity created successfully!");
      }
      handleCloseDrawer();
    } catch (error) {
      console.error("Error submitting activity:", error);

      // Handle API validation errors
      if (error.response?.data?.data) {
        const apiErrors = error.response.data.data;

        // Iterate through each field error
        Object.keys(apiErrors).forEach((fieldName) => {
          const fieldError = apiErrors[fieldName];

          // Handle unique constraint violation
          if (fieldError.code === "validation_not_unique") {
            setError(fieldName, {
              type: "manual",
              message: `${
                fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
              } must be unique. This value already exists.`,
            });
          } else {
            // Handle other validation errors
            setError(fieldName, {
              type: "manual",
              message: fieldError.message || "Validation error",
            });
          }
        });

        toast.error("Validation failed. Please check the form.");
      } else {
        // Generic error message
        toast.error(
          error.response?.data?.message ||
            "Failed to save activity. Please try again."
        );
      }
    } finally {
      loadingSubmit.onFalse();
    }
  });

  const handleDelete = async () => {
    loadingDelete.onTrue();
    try {
      await axios.delete(`/api/collection/activity/${selectedData.id}`);
      setData((prevData) =>
        prevData.filter((item) => item.id !== selectedData.id)
      );
      setSelectedData(null);
      openConfirm.onFalse();
    } catch (error) {
      console.error("Error deleting activity:", error);
    } finally {
      loadingDelete.onFalse();
    }
  };

  const handleOpenDeleteConfirm = useCallback(
    (rowData) => {
      setSelectedData(rowData);
      openConfirm.onTrue();
    },
    [openConfirm]
  );

  // ====== Table Columns ======
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Activity",
        meta: { sortable: true },
        cell: ({ row }) => (
          <p className="font-semibold text-xs">{row.getValue("name")}</p>
        ),
      },
      {
        accessorKey: "expand.sub_activity.name",
        header: "Sub Activity",
        meta: { sortable: true },
      },
      {
        accessorKey: "expand.process_method.name",
        header: "Process Method",
        meta: { sortable: true },
      },
      {
        accessorKey: "created",
        header: "Created Date",
        meta: { sortable: true },
        cell: ({ row }) => (
          <p className="text-xs">{fDateTime(row.getValue("created"))}</p>
        ),
      },
      {
        accessorKey: "updated",
        header: "Updated Date",
        meta: { sortable: true },
        cell: ({ row }) => (
          <p className="text-xs">{fDateTime(row.getValue("updated"))}</p>
        ),
      },
      {
        id: "actions",
        meta: { align: "right" },
        size: 50,
        cell: ({ row }) => (
          <ColumnActions
            onEdit={() => handleOpenDrawerForEdit(row.original)}
            onDelete={() => handleOpenDeleteConfirm(row.original)}
          />
        ),
      },
    ],
    [handleOpenDrawerForEdit, handleOpenDeleteConfirm]
  );

  // ====== Effects ======
  useEffect(() => {
    fetchData();
    fetchProcessMethod();
  }, []);

  // ====== Render ======
  return (
    <>
      <Card className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <TypographyLarge>Activity</TypographyLarge>

          <Sheet
            open={openDrawer.value}
            onOpenChange={(open) => {
              if (!open) handleCloseDrawer();
            }}
          >
            <SheetTrigger asChild>
              <Button size="sm" onClick={handleOpenDrawerForAdd}>
                <Iconify icon="ic:round-plus" className="size-5" />
                Add Activity
              </Button>
            </SheetTrigger>

            <SheetContent>
              <SheetHeader>
                <SheetTitle>{dialogTitle}</SheetTitle>
                <SheetDescription>{dialogDescription}</SheetDescription>
              </SheetHeader>

              <FormProvider {...methods}>
                <form onSubmit={onSubmit} className="flex flex-col h-full">
                  <div className="flex-1 overflow-auto py-4">
                    <div className="grid gap-6 px-4">
                      <RHFTextField
                        name="name"
                        label="Activity Name"
                        placeholder="Enter activity name"
                      />
                      <RHFSelect
                        name="sub_activity"
                        label="Sub Activity"
                        placeholder="Select sub activity"
                        options={data.map((item) => ({
                          value: item.id,
                          label: item.name,
                        }))}
                      />
                      <RHFSelect
                        name="process_method"
                        label="Process Method"
                        placeholder="Select process method"
                        options={processMethod.map((item) => ({
                          value: item.id,
                          label: item.name,
                        }))}
                      />
                    </div>
                  </div>

                  <SheetFooter>
                    <Button
                      type="button"
                      onClick={onSubmit}
                      disabled={loadingSubmit.value}
                    >
                      {loadingSubmit.value
                        ? "Saving..."
                        : isEditMode
                        ? "Update"
                        : "Save"}
                    </Button>
                    <SheetClose asChild>
                      <Button variant="outline" onClick={handleCloseDrawer}>
                        Cancel
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </form>
              </FormProvider>
            </SheetContent>
          </Sheet>
        </div>

        {/* Table */}
        <TableList
          columns={columns}
          data={data}
          tableProps={{
            initialState: { pagination: { pageIndex: page - 1, pageSize } },
          }}
          setSorting={setSorting}
          sorting={sorting}
          loading={loadingFetch.value}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openConfirm.value}
        onClose={openConfirm.onFalse}
        onConfirm={handleDelete}
        title={`Delete activity "${selectedData?.name}"?`}
        description="This action will permanently remove this record. You can't undo it."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loadingDelete.value}
      />
    </>
  );
};

export default ActivityTable;

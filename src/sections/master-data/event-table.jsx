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
import { eventSchema } from "./schema-validation";

// Default form values
const DEFAULT_VALUES = {
  name: "",
  status: "",
};

const EventTable = () => {
  // ====== Boolean Flags ======
  const loadingFetch = useBoolean();
  const loadingSubmit = useBoolean();
  const loadingDelete = useBoolean();
  const openDrawer = useBoolean();
  const openConfirm = useBoolean();

  // ====== State ======
  const [data, setData] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState([{ id: "name", desc: false }]);

  // ====== Form Setup ======
  const methods = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { handleSubmit, reset, setError } = methods;

  // ====== Helper Variables ======
  const isEditMode = Boolean(selectedData?.id);
  const dialogTitle = isEditMode ? "Edit Event" : "Add New Event";
  const dialogDescription = isEditMode
    ? "Update the event details below."
    : "Fill in the details to add a new event.";

  // ====== API Calls ======
  const fetchData = useCallback(async () => {
    loadingFetch.onTrue();
    try {
      const { data } = await axios.get("/api/collection/events", {
        headers: { type: "getfulllist", expand: "status" },
      });
      setData(data);
    } catch (error) {
      console.error("Error fetching event data:", error);
    } finally {
      loadingFetch.onFalse();
    }
  }, []);

  const fetchDataEvents = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/collection/event_type", {
        headers: { type: "getfulllist" },
      });
      setEventTypes(data);
    } catch (error) {
      console.error("Error fetching event data:", error);
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

    // make array with same status
    let lastCode = "";
    const sameStatus = data.filter((item) => item.status === values.status);

    if (sameStatus.length > 0) {
      console.log("sameStatus", sameStatus);

      // sort by code
      const sortedSameStatus = sameStatus.sort((a, b) => {
        return parseInt(a.code) - parseInt(b.code);
      });

      console.log("sortedSameStatus", sortedSameStatus);

      const sortedLastCode = sortedSameStatus[sameStatus.length - 1].code;
      const newCode = parseInt(sortedLastCode) + 1;
      lastCode = newCode.toString().padStart(4, "0");
    }

    try {
      if (isEditMode) {
        // Update existing event
        const { data: res } = await axios.put(
          `/api/collection/events/${selectedData.id}`,
          {
            ...values,
            code: lastCode,
          }
        );

        const transformedData = {
          ...res,
          code: lastCode,
          expand: {
            status: eventTypes.find((item) => item.id === res.status),
          },
        };

        setData((prevData) =>
          prevData.map((item) =>
            item.id === selectedData.id ? transformedData : item
          )
        );
        toast.success("Event updated successfully!");
      } else {
        // Create new event
        const { data: res } = await axios.post("/api/collection/events", {
          ...values,
          code: lastCode,
        });

        const transformedData = {
          ...res,
          code: lastCode,
          expand: {
            status: eventTypes.find((item) => item.id === res.status),
          },
        };

        setData((prevData) => [...prevData, transformedData]);
        toast.success("Event created successfully!");
      }
      handleCloseDrawer();
    } catch (error) {
      console.error("Error submitting event:", error);

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
            "Failed to save event. Please try again."
        );
      }
    } finally {
      loadingSubmit.onFalse();
    }
  });

  const handleDelete = async () => {
    loadingDelete.onTrue();
    try {
      await axios.delete(`/api/collection/events/${selectedData.id}`);
      setData((prevData) =>
        prevData.filter((item) => item.id !== selectedData.id)
      );
      setSelectedData(null);
      openConfirm.onFalse();
    } catch (error) {
      console.error("Error deleting event:", error);
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
        header: "Event Activity",
        meta: { sortable: true },
        cell: ({ row }) => (
          <p className="font-semibold text-xs">{row.getValue("name")}</p>
        ),
      },
      {
        accessorKey: "expand.status.name",
        header: "Event",
        meta: { sortable: true },
      },
      {
        accessorKey: "expand.status.event_number",
        header: "Event Number",
        meta: { sortable: true },
      },
      {
        accessorKey: "expand.status.code",
        header: "Event Code",
        meta: { sortable: true },
        cell: ({ row }) => {
          const value = row.original;
          const statusCode = value.expand.status.code;
          const eventCode = value.code;

          return (
            <p className="text-xs">
              {statusCode}
              {eventCode}
            </p>
          );
        },
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
    fetchDataEvents();
  }, []);

  // ====== Render ======
  return (
    <>
      <Card className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <TypographyLarge>Event</TypographyLarge>

          <Sheet
            open={openDrawer.value}
            onOpenChange={(open) => {
              if (!open) handleCloseDrawer();
            }}
          >
            <SheetTrigger asChild>
              <Button size="sm" onClick={handleOpenDrawerForAdd}>
                <Iconify icon="ic:round-plus" className="size-5" />
                Add Event
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
                        label="Event Activity"
                        placeholder="Enter event activity"
                      />
                      <RHFSelect
                        name="status"
                        label="Event"
                        placeholder="Select event"
                        options={eventTypes.map((item) => ({
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
        title={`Delete event "${selectedData?.name}"?`}
        description="This action will permanently remove this record. You can't undo it."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loadingDelete.value}
      />
    </>
  );
};

export default EventTable;

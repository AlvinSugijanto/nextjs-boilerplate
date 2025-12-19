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
import { shiflySchema } from "./schema-validation";
import { LIST_SHIFT_HOURS } from "./constants";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

// Default form values
const DEFAULT_VALUES = {
  project: "",
  start: "",
  end: "",
  duration: "",
};

const ShiftlyTable = () => {
  // ====== Boolean Flags ======
  const loadingFetch = useBoolean();
  const loadingSubmit = useBoolean();
  const loadingDelete = useBoolean();
  const openDrawer = useBoolean();
  const openConfirm = useBoolean();

  // ====== State ======
  const [data, setData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState([{ id: "created", desc: true }]);

  // ====== Form Setup ======
  const methods = useForm({
    resolver: yupResolver(shiflySchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { handleSubmit, reset, setError } = methods;

  // ====== Helper Variables ======
  const isEditMode = Boolean(selectedData?.id);
  const dialogTitle = isEditMode ? "Edit Shifly" : "Add New Shifly";
  const dialogDescription = isEditMode
    ? "Update the shifly details below."
    : "Fill in the details to add a new shifly.";

  // ====== API Calls ======
  const fetchData = useCallback(async () => {
    loadingFetch.onTrue();
    try {
      const { data } = await axios.get("/api/collection/shift", {
        headers: { type: "getfulllist", expand: "project" },
      });
      setData(data);
    } catch (error) {
      console.error("Error fetching shifly data:", error);
    } finally {
      loadingFetch.onFalse();
    }
  }, []);

  const fetchProjectData = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/collection/project", {
        headers: { type: "getfulllist" },
      });
      setProjectData(data);
    } catch (error) {
      console.error("Error fetching project data:", error);
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

  const handleSearch = useCallback(
    (e) => {
      const searchValue = e.target.value.toLowerCase();
      const keysSearch = [
        "expand.project.name",
        "shift_id",
        "start",
        "end",
        "duration",
      ];

      if (!searchValue) {
        fetchData();
        return;
      }

      // inline helper: get nested value by path string
      const getValueByPath = (obj, path) =>
        path.split(".").reduce((acc, key) => acc?.[key], obj);

      const filteredData = data.filter((item) =>
        keysSearch.some((key) => {
          const value = getValueByPath(item, key);
          if (value === null || value === undefined) return false;

          return String(value).toLowerCase().includes(searchValue);
        })
      );

      setData(filteredData);
    },
    [data]
  );

  const onSubmit = handleSubmit(async (values) => {
    loadingSubmit.onTrue();

    const hourFields = generateHourFields(values.start, values.duration);

    let shiftId = 1;

    // filter same project
    const filteredData = data.filter((item) => item.project === values.project);

    if (filteredData.length > 0) {
      // sort by shiftId
      const sortedData = filteredData.sort((a, b) => b.shift_id - a.shift_id);

      shiftId = sortedData[0].shift_id + 1;
    }

    const payload = {
      ...values,
      shift_id: shiftId,
      ...hourFields,
    };

    try {
      if (isEditMode) {
        // Update existing shifly
        const { data: res } = await axios.put(
          `/api/collection/shift/${selectedData.id}`,
          payload
        );

        const transformData = {
          ...res,
          expand: {
            project: projectData.find((item) => item.id === res.project),
          },
        };

        setData((prevData) =>
          prevData.map((item) =>
            item.id === selectedData.id ? transformData : item
          )
        );
        toast.success("Shifly updated successfully!");
      } else {
        // Create new shifly
        const { data: res } = await axios.post(
          "/api/collection/shift",
          payload
        );

        const transformData = {
          ...res,
          expand: {
            project: projectData.find((item) => item.id === res.project),
          },
        };

        setData((prevData) => [...prevData, transformData]);
        toast.success("Shifly created successfully!");
      }
      handleCloseDrawer();
    } catch (error) {
      console.error("Error submitting shifly:", error);

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
            "Failed to save shifly. Please try again."
        );
      }
    } finally {
      loadingSubmit.onFalse();
    }
  });

  const handleDelete = async () => {
    loadingDelete.onTrue();
    try {
      await axios.delete(`/api/collection/shift/${selectedData.id}`);
      setData((prevData) =>
        prevData.filter((item) => item.id !== selectedData.id)
      );
      setSelectedData(null);
      openConfirm.onFalse();
    } catch (error) {
      console.error("Error deleting shifly:", error);
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
        accessorKey: "expand.project.name",
        header: "Project Name",
        meta: { sortable: true },
        cell: ({ row }) => {
          const value = row.original.expand?.project?.name;

          return <p className="font-semibold text-xs">{value}</p>;
        },
      },
      {
        accessorKey: "shift_id",
        header: "Shift ID",
        meta: { sortable: true },
      },
      {
        accessorKey: "start",
        header: "Start",
        meta: { sortable: true },
      },
      {
        accessorKey: "end",
        header: "Stop",
        meta: { sortable: true },
      },
      {
        accessorKey: "duration",
        header: "Duration",
        meta: { sortable: true },
      },
      ...Array.from({ length: 16 }, (_, index) => ({
        accessorKey: `h${index + 1}`,
        header: `H${index + 1}`,
        meta: { sortable: false },
        cell: ({ row }) => {
          const value = row.original[`h${index + 1}`];

          return <p className="font-semibold text-xs">{value || "-"}</p>;
        },
      })),
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
    fetchProjectData();
  }, []);

  // ====== Render ======
  return (
    <>
      <Card className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="w-[350px]">
            <InputGroup>
              <InputGroupInput
                placeholder="Search..."
                onChange={handleSearch}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>
          </div>

          <Sheet
            open={openDrawer.value}
            onOpenChange={(open) => {
              if (!open) handleCloseDrawer();
            }}
          >
            <SheetTrigger asChild>
              <Button size="sm" onClick={handleOpenDrawerForAdd}>
                <Iconify icon="ic:round-plus" className="size-5" />
                Add Shifly
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
                    <div className="grid gap-2 px-4">
                      <RHFSelect
                        name="project"
                        label="Project"
                        placeholder="Select project"
                        options={projectData.map((item) => ({
                          value: item.id,
                          label: item.name,
                        }))}
                      />
                      <RHFSelect
                        name="start"
                        label="Start"
                        placeholder="Select Start"
                        options={LIST_SHIFT_HOURS}
                        onChange={(value) => {
                          const start = value;
                          const end = methods.getValues("end");
                          const duration = calculateTotalHours(start, end);
                          methods.setValue("duration", duration);
                        }}
                      />
                      <RHFSelect
                        name="end"
                        label="Stop"
                        placeholder="Select Stop"
                        options={LIST_SHIFT_HOURS}
                        onChange={(value) => {
                          const start = methods.getValues("start");
                          const end = value;
                          const duration = calculateTotalHours(start, end);

                          methods.setValue("duration", duration);
                        }}
                      />
                      <RHFTextField
                        name="duration"
                        label="Duration"
                        placeholder="Duration"
                        disabled
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
        title={`Delete shifly "${selectedData?.expand?.project?.name}"?`}
        description="This action will permanently remove this record. You can't undo it."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loadingDelete.value}
      />
    </>
  );
};

export default ShiftlyTable;

function generateHourFields(start, duration, maxHour = 16) {
  const result = {};

  // Default semua h1–h16 = null
  for (let i = 1; i <= maxHour; i++) {
    result[`h${i}`] = null;
  }

  if (!start || !duration) return result;

  let [hour, minute] = start.split(":").map(Number);

  // h1 = start time
  result.h1 = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}`;

  // h2 sampai h(duration + 1)
  for (let i = 2; i <= Math.min(duration + 1, maxHour); i++) {
    hour = (hour + 1) % 24;

    const h = String(hour).padStart(2, "0");
    const m = String(minute).padStart(2, "0");

    result[`h${i}`] = `${h}:${m}`;
  }

  return result;
}

function calculateTotalHours(start, end) {
  if (!start || !end) return 0;

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  // Jika end lebih kecil dari start, anggap lewat tengah malam
  let diffMinutes = endTotalMinutes - startTotalMinutes;
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }

  return diffMinutes / 60;
}

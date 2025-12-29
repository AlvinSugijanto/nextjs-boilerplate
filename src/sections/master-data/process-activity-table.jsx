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
import { processActivitySchema } from "./schema-validation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

// Default form values
const DEFAULT_VALUES = {
  process_activity: "",
  process_loading: null,
  process_material: null,
  method_count: "",
  vol_uom: "",
  dist_uom: "",
};

const ProcessActivityTable = () => {
  // ====== Boolean Flags ======
  const loadingFetch = useBoolean();
  const loadingSubmit = useBoolean();
  const loadingDelete = useBoolean();
  const openDrawer = useBoolean();
  const openConfirm = useBoolean();

  // ====== State ======
  const [data, setData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [processLoadingData, setProcessLoadingData] = useState([]);
  const [processMaterialData, setProcessMaterialData] = useState([]);
  const [materialCountData, setMaterialCountData] = useState([]);
  const [uomData, setUomData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState([{ id: "created", desc: true }]);

  // ====== Form Setup ======
  const methods = useForm({
    resolver: yupResolver(processActivitySchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { handleSubmit, reset, setError } = methods;

  // ====== Helper Variables ======
  const isEditMode = Boolean(selectedData?.id);
  const dialogTitle = isEditMode
    ? "Edit ProcessActivity"
    : "Add New ProcessActivity";
  const dialogDescription = isEditMode
    ? "Update the processActivity details below."
    : "Fill in the details to add a new processActivity.";

  // ====== API Calls ======
  const fetchData = useCallback(async () => {
    loadingFetch.onTrue();
    try {
      const { data } = await axios.get("/api/collection/process_activity", {
        headers: {
          type: "getfulllist",
          expand:
            "process_activity.sub_activity, process_activity.process_method, process_loading, process_material, method_count, vol_uom, dist_uom",
        },
      });
      setData(data);
    } catch (error) {
      console.error("Error fetching processActivity data:", error);
    } finally {
      loadingFetch.onFalse();
    }
  }, []);

  const fetchListData = useCallback(async () => {
    const headers = {
      headers: {
        type: "getfulllist",
      },
    };

    try {
      const { data: resAcitvity } = await axios.get(
        "/api/collection/activity",
        {
          headers: {
            type: "getfulllist",
            expand: "sub_activity, process_method",
          },
        }
      );
      setActivityData(resAcitvity);

      const { data: resProcessLoading } = await axios.get(
        "/api/collection/process_loading",
        headers
      );
      setProcessLoadingData(resProcessLoading);

      const { data: resProcessMaterial } = await axios.get(
        "/api/collection/process_material",
        headers
      );
      setProcessMaterialData(resProcessMaterial);

      const { data: resMethodCount } = await axios.get(
        "/api/collection/material_count",
        headers
      );
      setMaterialCountData(resMethodCount);

      const { data: resVolUom } = await axios.get(
        "/api/collection/uom",
        headers
      );
      setUomData(resVolUom);
    } catch (error) {
      console.error("Error fetching processActivity data:", error);
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
        "expand.process_activity.name",
        "expand.process_activity.expand.sub_activity.name",
        "expand.process_activity.expand.process_method.name",
        "expand.process_loading.name",
        "expand.process_material.name",
        "expand.method_count.name",
        "expand.vol_uom.name",
        "expand.dist_uom.name",
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

    // make array with same process method code
    let lastCode = "";
    const sameProcessMethod = data.filter(
      (item) => item.process_activity === values.process_activity
    );

    if (sameProcessMethod.length > 0) {
      // sort by code
      const sortedSameStatus = sameProcessMethod.sort((a, b) => {
        return parseInt(a.process_code) - parseInt(b.process_code);
      });

      const sortedLastCode =
        sortedSameStatus[sameProcessMethod.length - 1].process_code;
      const newCode = parseInt(sortedLastCode) + 1;
      lastCode = newCode.toString().padStart(3, "0");
    }

    try {
      if (isEditMode) {
        // Update existing processActivity
        const { data: res } = await axios.put(
          `/api/collection/process_activity/${selectedData.id}`,
          {
            ...values,
            process_loading:
              values.process_loading === "null" ? null : values.process_loading,
            process_material:
              values.process_material === "null"
                ? null
                : values.process_material,
            process_code: lastCode,
          }
        );

        const transformedData = {
          ...res,
          expand: {
            process_activity: activityData.find(
              (item) => item.id === res.process_activity
            ),
            process_loading: processLoadingData.find(
              (item) => item.id === res.process_loading
            ),
            process_material: processMaterialData.find(
              (item) => item.id === res.process_material
            ),
            method_count: materialCountData.find(
              (item) => item.id === res.method_count
            ),
            vol_uom: uomData.find((item) => item.id === res.vol_uom),
            dist_uom: uomData.find((item) => item.id === res.dist_uom),
          },
        };

        setData((prevData) =>
          prevData.map((item) =>
            item.id === selectedData.id ? transformedData : item
          )
        );
        toast.success("Process Activity updated successfully!");
      } else {
        // Create new processActivity
        const { data: res } = await axios.post(
          "/api/collection/process_activity",
          {
            ...values,
            process_loading:
              values.process_loading === "null" ? null : values.process_loading,
            process_material:
              values.process_material === "null"
                ? null
                : values.process_material,
            process_code: lastCode,
          }
        );

        const transformedData = {
          ...res,
          expand: {
            process_activity: activityData.find(
              (item) => item.id === res.process_activity
            ),
            process_loading: processLoadingData.find(
              (item) => item.id === res.process_loading
            ),
            process_material: processMaterialData.find(
              (item) => item.id === res.process_material
            ),
            method_count: materialCountData.find(
              (item) => item.id === res.method_count
            ),
            vol_uom: uomData.find((item) => item.id === res.vol_uom),
            dist_uom: uomData.find((item) => item.id === res.dist_uom),
          },
        };

        setData((prevData) => [...prevData, transformedData]);
        toast.success("Process Activity created successfully!");
      }
      handleCloseDrawer();
    } catch (error) {
      console.error("Error submitting processActivity:", error);

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
              message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
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
          "Failed to save Process Activity. Please try again."
        );
      }
    } finally {
      loadingSubmit.onFalse();
    }
  });

  const handleDelete = async () => {
    loadingDelete.onTrue();
    try {
      await axios.delete(`/api/collection/process_activity/${selectedData.id}`);
      setData((prevData) =>
        prevData.filter((item) => item.id !== selectedData.id)
      );
      setSelectedData(null);
      openConfirm.onFalse();
    } catch (error) {
      console.error("Error deleting processActivity:", error);
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
        accessorKey: "expand.process_activity.name",
        header: "Process Activity",
        meta: { sortable: true },
        cell: ({ row }) => {
          const value = row.original.expand?.process_activity?.name;
          return <p className="font-semibold text-xs">{value}</p>;
        },
      },
      {
        accessorKey: "expand.process_activity.expand.sub_activity.name",
        header: "Sub Activity",
        meta: { sortable: true },
      },
      {
        accessorKey: "expand.process_activity.expand.process_method.name",
        header: "Process Method",
        meta: { sortable: true },
      },
      {
        accessorKey: "expand.process_loading.name",
        header: "Process Loading",
        meta: { sortable: true },
        cell: ({ row }) => {
          const value = row.original.expand?.process_loading?.name;
          return <p className="font-semibold text-xs">{value || "-"}</p>;
        },
      },
      {
        accessorKey: "expand.process_material.name",
        header: "Process Material",
        meta: { sortable: true },
        cell: ({ row }) => {
          const value = row.original.expand?.process_material?.name;
          return <p className="font-semibold text-xs">{value || "-"}</p>;
        },
      },
      {
        accessorKey: "expand.method_count.name",
        header: "Method Count",
        meta: { sortable: true },
        cell: ({ row }) => {
          const value = row.original.expand?.method_count?.name;
          return <p className="font-semibold text-xs">{value || "-"}</p>;
        },
      },
      {
        accessorKey: "expand.vol_uom.name",
        header: "Volume UOM",
        meta: { sortable: true },
      },
      {
        accessorKey: "expand.dist_uom.name",
        header: "Distance UOM",
        meta: { sortable: true },
      },
      {
        accessorKey: "expand.process_activity.expand.process_method.code",
        header: "Process Code",
        meta: { sortable: true },
        cell: ({ row }) => {
          const value =
            row.original.expand?.process_activity?.expand?.process_method?.code;
          const processActivityCode = row.original?.process_code;
          return (
            <p className="font-semibold text-xs">
              {value}
              {processActivityCode}
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
    fetchListData();
  }, []);

  // ====== Render ======
  return (
    <>
      <Card className="p-4 flex flex-col max-h-[calc(100vh-10rem)] gap-4">
        <div className="flex items-center justify-between shrink-0">
          <div className="w-87.5">
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
                Add Process Activity
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
                      <RHFSelect
                        name="process_activity"
                        label="Process Activity"
                        placeholder="Select process activity"
                        options={transformedDataList(activityData)}
                      />
                      <RHFSelect
                        name="process_loading"
                        label="Process Loading"
                        placeholder="Select process loading"
                        options={[
                          { value: null, label: "-" },
                          ...transformedDataList(processLoadingData),
                        ]}
                      />
                      <RHFSelect
                        name="process_material"
                        label="Process Material"
                        placeholder="Select process material"
                        options={[
                          { value: null, label: "-" },
                          ...transformedDataList(processMaterialData),
                        ]}
                      />
                      <RHFSelect
                        name="method_count"
                        label="Method Count"
                        placeholder="Select method count"
                        options={transformedDataList(materialCountData)}
                      />
                      <RHFSelect
                        name="vol_uom"
                        label="Volume UOM"
                        placeholder="Select volume uom"
                        options={transformedDataList(uomData)}
                      />
                      <RHFSelect
                        name="dist_uom"
                        label="Distance UOM"
                        placeholder="Select distance uom"
                        options={transformedDataList(uomData)}
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

        <div className="overflow-auto">
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
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openConfirm.value}
        onClose={openConfirm.onFalse}
        onConfirm={handleDelete}
        title={`Delete Process Activity "${selectedData?.expand?.process_activity?.name}"?`}
        description="This action will permanently remove this record. You can't undo it."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loadingDelete.value}
      />
    </>
  );
};

export default ProcessActivityTable;

const transformedDataList = (data) => {
  return data.map((item) => ({
    value: item.id,
    label: item.name,
  }));
};

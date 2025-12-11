import React, { useMemo } from "react";

import { TypographyLarge } from "@/components/typography";
import { Card } from "@/components/ui/card";
import DrawerAddEdit from "./drawer-add-edit";
import { vehicleSchema } from "./schema-validation";
import { RHFSelect, RHFTextField } from "@/components/hook-form";
import { TableList } from "@/components/table";
import ColumnActions from "./column-actions";
import { useBoolean } from "@/hooks/use-boolean";
import { LIST_VEHICLE_TYPE } from "./constants";
import { fDate } from "@/utils/format-time";
import { ConfirmDialog } from "@/components/dialog";

const DUMMY_DATA_VEHICLE = [
  {
    id: "1",
    name: "Excavator A",
    unit_model: "CAT 320",
    model: "2020",
    type: "digger",
    created: new Date("2023-01-15"),
  },
  {
    id: "2",
    name: "Dump Truck B",
    unit_model: "Volvo FH16",
    model: "2019",
    type: "dump truck",
    created: new Date("2023-02-20"),
  },
];

const VehicleTable = () => {
  // hooks
  const openConfirm = useBoolean();
  const loadingDelete = useBoolean();
  const openDrawer = useBoolean();

  // STATE
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [selectedData, setSelectedData] = React.useState([]);
  const [sorting, setSorting] = React.useState([
    {
      id: "name",
      desc: false,
    },
  ]);

  // handle
  const handleSubmit = async (data) => {
    try {
      console.log("Submitted data: ", data);
    } catch (error) {
      throw new Error("Submission error", error);
    }
  };

  const handleDelete = async () => {
    loadingDelete.onTrue();
    // Simulate API call
    setTimeout(() => {
      console.log("Deleted data: ", selectedData);
      loadingDelete.onFalse();
      openConfirm.onFalse();
    }, 1000);
  };

  const columnVehicle = useMemo(() => {
    return [
      {
        accessorKey: "name",
        header: "Name",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => (
          <p className="font-medium text-xs">{row.getValue("name")}</p>
        ),
      },
      {
        accessorKey: "unit_model",
        header: "Unit Model",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => (
          <p className="text-xs">{row.getValue("unit_model")}</p>
        ),
      },
      {
        accessorKey: "model",
        header: "Model",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => <p className="text-xs">{row.getValue("model")}</p>,
      },
      {
        accessorKey: "type",
        header: "Type",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => <p className="text-xs">{row.getValue("type")}</p>,
      },
      {
        accessorKey: "created",
        header: "Created Date",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => (
          <p className="text-xs">{fDate(row.getValue("created"))}</p>
        ),
      },
      {
        id: "actions",
        meta: {
          align: "right",
        },
        cell: ({ row }) => {
          return (
            <ColumnActions
              onEdit={() => {
                setSelectedData(row.original);
                openDrawer.onTrue();
              }}
              onDelete={() => {
                setSelectedData(row.original);
                openConfirm.onTrue();
              }}
            />
          );
        },
      },
    ];
  }, []);

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <TypographyLarge>Vehicle Master Data</TypographyLarge>
          <DrawerAddEdit
            title={`${selectedData ? "Edit" : "Add"} New Vehicle`}
            subTitle={`Fill in the details to ${
              selectedData ? "edit" : "add"
            } a new vehicle.`}
            titleButton="Add Vehicle"
            resolver={vehicleSchema}
            onOpen={openDrawer.onTrue}
            openDrawer={openDrawer.value}
            onCloseDrawer={() => {
              setSelectedData(null);
              openDrawer.onFalse();
            }}
            defaultValues={{
              id: selectedData?.id || "",
              name: selectedData?.name || "",
              unit_model: selectedData?.unit_model || "",
              model: selectedData?.model || "",
              type: selectedData?.type || "digger",
            }}
            onSubmit={handleSubmit}
          >
            <RHFTextField
              name="name"
              label="Task Name"
              placeholder="Enter task name"
            />
            <RHFTextField
              name="unit_model"
              label="Unit Model"
              placeholder="Enter unit model"
            />
            <RHFTextField
              name="model"
              label="Model"
              placeholder="Enter model"
            />
            <RHFSelect
              name="type"
              label="Type"
              placeholder="Select type"
              options={LIST_VEHICLE_TYPE}
            />
          </DrawerAddEdit>
        </div>

        <TableList
          columns={columnVehicle}
          data={DUMMY_DATA_VEHICLE}
          tableProps={{
            initialState: { pagination: { pageIndex: page - 1, pageSize } },
          }}
          setSorting={setSorting}
          sorting={sorting}
        />
      </Card>

      <ConfirmDialog
        open={openConfirm.value}
        onClose={openConfirm.onFalse}
        onConfirm={handleDelete}
        title={`Delete Vehicle "${selectedData?.name}"?`}
        description="This action will permanently remove this record. You can't undo it."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loadingDelete.value}
      />
    </>
  );
};

export default VehicleTable;

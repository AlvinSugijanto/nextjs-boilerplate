import React, { useState, useCallback, useEffect, useMemo } from "react";

import { TypographyLarge } from "@/components/typography";
import { Card } from "@/components/ui/card";
import DrawerAddEdit from "./drawer-add-edit";
import { vehicleSchema } from "./schema-validation";
import { RHFSelect, RHFTextField } from "@/components/hook-form";
import { TableList } from "@/components/table";
import ColumnActions from "./column-actions";
import { useBoolean } from "@/hooks/use-boolean";
import { LIST_VEHICLE_TYPE } from "./constants";
import { fDate, fDateTime } from "@/utils/format-time";
import { ConfirmDialog } from "@/components/dialog";
import axios from "axios";

const VehicleTable = () => {
  // hooks
  const loadingFetch = useBoolean();
  const openConfirm = useBoolean();
  const loadingDelete = useBoolean();
  const openDrawer = useBoolean();

  // STATE
  const [data, setData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedData, setSelectedData] = useState([]);
  const [sorting, setSorting] = useState([
    {
      id: "name",
      desc: false,
    },
  ]);

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      // Exclude devices that are already assigned to a vehicle, except for the currently selected vehicle
      const isAssigned = data.some(
        (vehicle) =>
          vehicle.device_id === device.id && vehicle.id !== selectedData?.id
      );
      return !isAssigned;
    });
  }, [devices, data, selectedData]);

  // handle
  const handleSubmit = async (data) => {
    try {
      if (data.id) {
        const { id, ...rest } = data;

        // Edit existing vehicle
        const { data: res } = await axios.patch(
          `/api/collection/vehicle/${id}`,
          rest,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setData((prevData) =>
          prevData.map((item) => (item.id === data.id ? res : item))
        );

        // console.log("Edited data: ", data);
      } else {
        // Add new vehicle
        const { data: res } = await axios.post(
          "/api/collection/vehicle",
          data,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setData((prevData) => [...prevData, res]);
      }

      setSelectedData(null);
      openDrawer.onFalse();
    } catch (error) {
      throw new Error("Submission error", error);
    }
  };

  const handleDelete = async () => {
    loadingDelete.onTrue();

    try {
      await axios.delete(`/api/collection/vehicle/${selectedData.id}`);

      setData((prevData) =>
        prevData.filter((item) => item.id !== selectedData.id)
      );
      setSelectedData(null);
      openConfirm.onFalse();
    } catch (error) {
      console.error("Error deleting vehicle: ", error);
    } finally {
      loadingDelete.onFalse();
    }
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
          <p className="font-semibold text-xs">{row.getValue("name")}</p>
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
        accessorKey: "type",
        header: "Type",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => (
          <p className="text-xs capitalize">{row.getValue("type")}</p>
        ),
      },
      {
        accessorKey: "device_id",
        header: "Device",
        meta: {
          sortable: false,
        },
        cell: ({ row }) => {
          const value = row.original.device_id;
          const device = devices.find((device) => device.id === value);

          return <p className="text-xs">{device?.name || "-"}</p>;
        },
      },
      {
        accessorKey: "created",
        header: "Created Date",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => (
          <p className="text-xs">{fDateTime(row.getValue("created"))}</p>
        ),
      },
      {
        accessorKey: "updated",
        header: "Updated Date",
        meta: {
          sortable: true,
        },
        cell: ({ row }) => (
          <p className="text-xs">{fDateTime(row.getValue("updated"))}</p>
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
  }, [devices]);

  const fetchData = useCallback(async () => {
    loadingFetch.onTrue();

    try {
      const { data } = await axios.get("/api/collection/vehicle", {
        headers: {
          type: "getfulllist",
        },
      });

      setData(data);
    } catch (error) {
      console.error("Error fetching vehicle data: ", error);
    } finally {
      loadingFetch.onFalse();
    }
  }, []);

  const fetchDevices = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/proxy/traccar/devices");

      setDevices(data);
    } catch (error) {
      console.error("Error fetching device data: ", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchDevices();
  }, []);

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <TypographyLarge>Vehicle</TypographyLarge>
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
              type: selectedData?.type || "digger",
              device_id: selectedData?.device_id
                ? String(selectedData.device_id)
                : "",
            }}
            onSubmit={handleSubmit}
          >
            <RHFTextField
              name="name"
              label="Vehicle Name"
              placeholder="Enter vehicle name"
            />
            <RHFTextField
              name="unit_model"
              label="Unit Model"
              placeholder="Enter unit model"
            />
            <RHFSelect
              name="type"
              label="Type"
              placeholder="Select type"
              options={LIST_VEHICLE_TYPE}
            />
            <RHFSelect
              name="device_id"
              label="Device"
              placeholder="Select device"
              options={filteredDevices.map((device) => ({
                value: String(device.id),
                label: device.name,
              }))}
            />
          </DrawerAddEdit>
        </div>

        <TableList
          columns={columnVehicle}
          data={data}
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

import React, { useState, useCallback, useEffect, useMemo } from "react";

import { TypographyLarge } from "@/components/typography";
import { Card } from "@/components/ui/card";
import DrawerAddEdit from "./drawer-add-edit";
import { routeSchema } from "./schema-validation";
import { RHFSelect, RHFTextField } from "@/components/hook-form";
import { TableList } from "@/components/table";
import ColumnActions from "./column-actions";
import { useBoolean } from "@/hooks/use-boolean";
import { fDate, fDateTime } from "@/utils/format-time";
import { ConfirmDialog } from "@/components/dialog";
import axios from "axios";

const RouteTable = () => {
  // hooks
  const loadingFetch = useBoolean();
  const openConfirm = useBoolean();
  const loadingDelete = useBoolean();
  const openDrawer = useBoolean();

  // STATE
  const [data, setData] = useState([]);
  const [geofenceData, setGeofenceData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedData, setSelectedData] = useState([]);
  const [sorting, setSorting] = useState([
    {
      id: "name",
      desc: false,
    },
  ]);

  // handle
  const handleSubmit = async (data) => {
    try {
      if (data.id) {
        const { id, ...rest } = data;

        // Edit existing route
        const { data: res } = await axios.patch(
          `/api/collection/route/${id}`,
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
        // Add new route
        const { data: res } = await axios.post("/api/collection/route", data, {
          headers: {
            "Content-Type": "application/json",
          },
        });
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
      await axios.delete(`/api/collection/route/${selectedData.id}`);

      setData((prevData) =>
        prevData.filter((item) => item.id !== selectedData.id)
      );
      setSelectedData(null);
      openConfirm.onFalse();
    } catch (error) {
      console.error("Error deleting route: ", error);
    } finally {
      loadingDelete.onFalse();
    }
  };

  const columnoperator = useMemo(() => {
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
        accessorKey: "Source",
        header: "Source",
        meta: {
          sortable: false,
        },
        cell: ({ row }) => {
          const source = row.getValue("Source");
          const sourceName = geofenceData.find((g) => g.id === source)?.name;

          return (
            <div className="flex flex-col gap-1">
              <p className="text-xs">{sourceName || "-"}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "Destination",
        header: "Destination",
        meta: {
          sortable: false,
        },
        cell: ({ row }) => {
          const destination = row.getValue("Destination");
          const destinationName = geofenceData.find(
            (g) => g.id === destination
          )?.name;
          return (
            <div className="flex flex-col gap-1">
              <p className="text-xs">{destinationName || "-"}</p>
            </div>
          );
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
  }, [geofenceData]);

  const fetchData = useCallback(async () => {
    loadingFetch.onTrue();

    try {
      const { data } = await axios.get("/api/collection/route", {
        headers: {
          type: "getfulllist",
        },
      });

      setData(data);
    } catch (error) {
      console.error("Error fetching route data: ", error);
    } finally {
      loadingFetch.onFalse();
    }
  }, []);

  const fetchGeofanceData = useCallback(async () => {
    loadingFetch.onTrue();

    try {
      const { data } = await axios.get("/api/proxy/traccar/geofences", {
        headers: {
          type: "getfulllist",
        },
      });

      setGeofenceData(data);
    } catch (error) {
      console.error("Error fetching geofence data: ", error);
    } finally {
      loadingFetch.onFalse();
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchGeofanceData();
  }, []);

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <TypographyLarge>Route</TypographyLarge>
          <DrawerAddEdit
            title={`${selectedData ? "Edit" : "Add"} New Route`}
            subTitle={`Fill in the details to ${
              selectedData ? "edit" : "add"
            } a new route.`}
            titleButton="Add Route"
            resolver={routeSchema}
            onOpen={openDrawer.onTrue}
            openDrawer={openDrawer.value}
            onCloseDrawer={() => {
              setSelectedData(null);
              openDrawer.onFalse();
            }}
            defaultValues={{
              id: selectedData?.id || "",
              name: selectedData?.name || "",
              Source: selectedData?.Source || "",
              Destination: selectedData?.Destination || "",
            }}
            onSubmit={handleSubmit}
          >
            <RHFTextField
              name="name"
              label="Route Name"
              placeholder="Enter route name"
            />
            <RHFSelect
              name="Source"
              label="Source"
              placeholder="Select Source"
              multiple
              options={geofenceData.map((geofence) => ({
                value: geofence.id,
                label: geofence.name,
              }))}
            />
            <RHFSelect
              name="Destination"
              label="Destination"
              placeholder="Select Destination"
              multiple
              options={geofenceData.map((geofence) => ({
                value: geofence.id,
                label: geofence.name,
              }))}
            />
          </DrawerAddEdit>
        </div>

        <TableList
          columns={columnoperator}
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
        title={`Delete route "${selectedData?.name}"?`}
        description="This action will permanently remove this record. You can't undo it."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loadingDelete.value}
      />
    </>
  );
};

export default RouteTable;

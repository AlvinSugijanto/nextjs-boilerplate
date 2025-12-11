import React, { useState, useCallback, useEffect, useMemo } from "react";

import { TypographyLarge } from "@/components/typography";
import { Card } from "@/components/ui/card";
import DrawerAddEdit from "./drawer-add-edit";
import { operatorSchema } from "./schema-validation";
import { RHFSelect, RHFTextField } from "@/components/hook-form";
import { TableList } from "@/components/table";
import ColumnActions from "./column-actions";
import { useBoolean } from "@/hooks/use-boolean";
import { fDate, fDateTime } from "@/utils/format-time";
import { ConfirmDialog } from "@/components/dialog";
import axios from "axios";

const OperatorTable = () => {
  // hooks
  const loadingFetch = useBoolean();
  const openConfirm = useBoolean();
  const loadingDelete = useBoolean();
  const openDrawer = useBoolean();

  // STATE
  const [data, setData] = useState([]);
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

        // Edit existing operator
        const { data: res } = await axios.patch(
          `/api/collection/operator/${id}`,
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
        // Add new operator
        const { data: res } = await axios.post(
          "/api/collection/operator",
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
      await axios.delete(`/api/collection/operator/${selectedData.id}`);

      setData((prevData) =>
        prevData.filter((item) => item.id !== selectedData.id)
      );
      setSelectedData(null);
      openConfirm.onFalse();
    } catch (error) {
      console.error("Error deleting operator: ", error);
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
  }, []);

  const fetchData = useCallback(async () => {
    loadingFetch.onTrue();

    try {
      const { data } = await axios.get("/api/collection/operator", {
        headers: {
          type: "getfulllist",
        },
      });

      setData(data);
    } catch (error) {
      console.error("Error fetching operator data: ", error);
    } finally {
      loadingFetch.onFalse();
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <TypographyLarge>Operator</TypographyLarge>
          <DrawerAddEdit
            title={`${selectedData ? "Edit" : "Add"} New Operator`}
            subTitle={`Fill in the details to ${
              selectedData ? "edit" : "add"
            } a new operator.`}
            titleButton="Add Operator"
            resolver={operatorSchema}
            onOpen={openDrawer.onTrue}
            openDrawer={openDrawer.value}
            onCloseDrawer={() => {
              setSelectedData(null);
              openDrawer.onFalse();
            }}
            defaultValues={{
              id: selectedData?.id || "",
              name: selectedData?.name || "",
            }}
            onSubmit={handleSubmit}
          >
            <RHFTextField
              name="name"
              label="Operator Name"
              placeholder="Enter operator name"
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
        title={`Delete operator "${selectedData?.name}"?`}
        description="This action will permanently remove this record. You can't undo it."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loadingDelete.value}
      />
    </>
  );
};

export default OperatorTable;

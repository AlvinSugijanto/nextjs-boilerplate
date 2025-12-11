import React, { useState } from "react";
import { BarChartComponents } from "@/components/chart";
import { faker } from "@faker-js/faker";
import { TableList } from "@/components/table";

const timeColumns = [
  "07-08",
  "08-09",
  "09-10",
  "10-11",
  "11-12",
  "12-13",
  "13-14",
  "14-15",
  "15-16",
  "16-17",
];

const TableExpand = () => {
  const [sorting, setSorting] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const generateHourlyProductivityData = () => {
    return Array.from({ length: 1 }, (_, i) => ({
      id: `hourly-${i + 1}`,
      section: "OVERBURDEN",
      digger: `EX-${faker.number.int({ min: 2000, max: 2030 })}`,
      operator: faker.person.fullName().toUpperCase(),
      model: `CAT${faker.helpers.arrayElement([340, 345, 350])}`,
      activity: faker.helpers.arrayElement(["CLAY", "SUB SOIL", "OVERBURDEN"]),
      plan: faker.number.int({ min: 200, max: 300 }),
      "07-08": faker.number.int({ min: 0, max: 300 }),
      "08-09": faker.number.int({ min: 0, max: 300 }),
      "09-10": faker.number.int({ min: 0, max: 300 }),
      "10-11": faker.number.int({ min: 0, max: 300 }),
      "11-12": faker.number.int({ min: 0, max: 300 }),
      "12-13": faker.number.int({ min: 0, max: 300 }),
      "13-14": faker.number.int({ min: 0, max: 300 }),
      "14-15": faker.number.int({ min: 0, max: 300 }),
      "15-16": faker.number.int({ min: 0, max: 300 }),
      "16-17": faker.number.int({ min: 0, max: 300 }),
    }));
  };

  const productivityData = generateHourlyProductivityData();

  const columnsProductivityTable = [
    {
      accessorKey: "section",
      header: "Section",
      cell: (info) => (
        <p className="text-primary font-semibold hover:underline">
          {info.getValue()}
        </p>
      ),
    },
    {
      accessorKey: "digger",
      header: "Digger",
    },
    {
      accessorKey: "operator",
      header: "Operator",
    },
    {
      accessorKey: "model",
      header: "Model",
    },
    {
      accessorKey: "activity",
      header: "Activity",
    },
    {
      accessorKey: "plan",
      header: "Plan",
    },
    ...timeColumns.map((timeSlot) => ({
      accessorKey: timeSlot,
      header: timeSlot,
      cell: (info) => {
        const value = info.getValue();
        const plan = info.row.original.plan;

        const percentage = (value / plan) * 100;

        return (
          <div
            className={`${getBgColor(
              percentage
            )} font-medium py-2 px-1 rounded-sm text-center text-white`}
          >
            {value}
          </div>
        );
      },
    })),
  ];

  return (
    <TableList
      key={`productivity-${productivityData.length}`}
      columns={columnsProductivityTable}
      data={productivityData}
      setSorting={setSorting}
      sorting={sorting}
      showPagination={false}
      pageSize={columnsProductivityTable.length}
      rowClassName="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
      rowClassNameProps={(device) =>
        device.id === selectedDeviceId ? "bg-gray-200 dark:bg-gray-700" : ""
      }
      //   onRowClick={handleDeviceClick}
      loading={false}
      tableProps={{
        initialState: {
          pagination: { pageIndex: 0, pageSize: productivityData.length },
        },
      }}
    />
  );
};

export default TableExpand;

const getBgColor = (number) => {
  if (number >= 90) return "bg-green-500";
  if (number >= 60) return "bg-yellow-500";
  if (number >= 1) return "bg-red-500";
};

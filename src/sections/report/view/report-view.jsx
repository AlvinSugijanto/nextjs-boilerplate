"use client";

import { TableList } from "@/components/table";
import React, { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import { Progress } from "@/components/ui/progress";
import TableExpand from "../table-expand";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer } from "@/components/ui/drawer";
import { useBoolean } from "@/hooks/use-boolean";

import DrawerAddEditActivity from "../drawer-add-edit-activity";
import axios from "axios";
import { endOfDay, startOfDay } from "date-fns";

const ReportView = () => {
  const isMobile = useIsMobile();
  const openDrawer = useBoolean();
  const isLoading = useBoolean();

  const [sorting, setSorting] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [geoFencesData, setGeofencesData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [devicesData, setDevicesData] = useState([]);
  const [usersData, setUsersData] = useState([]);

  const generateOverburdenData = () => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: `overburden-${i + 1}`,
      no: i + 1,
      digger: `EX-${faker.number.int({ min: 2000, max: 2030 })}`,
      operator: faker.person.fullName().toUpperCase(),
      model: `CAT${faker.helpers.arrayElement([340, 345, 350])}`,
      activity: faker.helpers.arrayElement(["CLAY", "SUB SOIL", "OVERBURDEN"]),
      plan: faker.number.int({ min: 200, max: 300 }),
      ach: faker.number.int({ min: 0, max: 100 }),
    }));
  };

  const generateCoalGettingData = () => {
    return Array.from({ length: 2 }, (_, i) => ({
      id: `coalgetting-${i + 1}`,
      no: i + 1,
      digger: `EX-${faker.number.int({ min: 2000, max: 2030 })}`,
      operator: faker.person.fullName().toUpperCase(),
      model: `CAT${faker.helpers.arrayElement([340, 345, 350])}`,
      activity: "CG",
      plan: faker.number.int({ min: 200, max: 250 }),
      ach: faker.number.int({ min: 0, max: 100 }),
    }));
  };

  const generateCoalHaulingData = () => {
    return Array.from({ length: 1 }, (_, i) => ({
      id: `coalhauling-${i + 1}`,
      no: i + 1,
      digger: `WL-${faker.number.int({ min: 2000, max: 2030 })}`,
      operator: faker.person.fullName().toUpperCase(),
      model: `SEM${faker.number.int({ min: 600, max: 700 })}`,
      activity: "CH",
      plan: faker.number.int({ min: 80, max: 150 }),
      ach: faker.number.int({ min: 0, max: 100 }),
    }));
  };

  const overburdenData = generateOverburdenData();
  const coalGettingData = generateCoalGettingData();
  const coalHaulingData = generateCoalHaulingData();

  const columns = [
    {
      accessorKey: "no",
      header: "No",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "digger",
      header: "Digger",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "operator",
      header: "Operator",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "activity",
      header: "Activity",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "plan",
      header: "Plan",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "ach",
      header: "ACH",
      cell: ({ row }) => {
        const ach = row.original.ach;
        return (
          <div className="flex gap-2 items-center">
            <Progress value={ach} />

            <p className={` ${getTextColor(ach)}`}>{ach}</p>
          </div>
        );
      },
    },
  ];

  const handleDeviceClick = (device) => {
    setSelectedDeviceId(device.id);
  };

  const fetchInitialData = async () => {
    // setLoading(true);

    try {
      isLoading.onTrue();
      const fromISO = startOfDay(new Date()).toISOString();
      const toISO = endOfDay(new Date()).toISOString();

      // Fetch geofences dan devices secara parallel
      const [geofencesResponse, devicesResponse, userResponses] =
        await Promise.all([
          axios.get("/api/proxy/traccar/geofences"),
          axios.get("/api/proxy/traccar/devices"),
          axios.get("/api/proxy/traccar/users"),
        ]);

      // Set geofences data
      if (geofencesResponse.data) {
        setGeofencesData(geofencesResponse.data);
      }

      // Set devices data
      const devices = devicesResponse.data || [];
      if (devices.length > 0) {
        setDevicesData(devices);

        // Fetch events untuk setiap device secara parallel
        const eventPromises = devices.map((device) =>
          axios
            .get(
              `/api/proxy/traccar/reports/events?deviceId=${device.id}&from=${fromISO}&to=${toISO}`
            )
            .then((response) => response.data)
            .catch((error) => {
              console.error(
                `Error fetching events for device ${device.id}:`,
                error
              );
              return [];
            })
        );

        const allEvents = await Promise.all(eventPromises);
        const flattenedEvents = allEvents.flat();
        setEventsData(flattenedEvents);
      }

      if (userResponses.data) {
        setUsersData(userResponses.data);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setEventsData([]);
    } finally {
      isLoading.onFalse();
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // console.log("Event : ", eventsData);
  // console.log("Geofence :", geoFencesData);
  // console.log("Device :", devicesData);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="ml-2">
          <p className="text-xl font-semibold">Laporan</p>
          <p className="text-muted-foreground text-sm">
            Rekap harian & report per jam untuk overburden, coal getting dan
            coal hauling
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button variant={"default"} size="sm" onClick={openDrawer.onTrue}>
            + Add New Activity
          </Button>
          <div className="flex gap-3 items-center">
            {/* Status Indicators */}

            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-green-500"></span>
              <span className="text-sm text-muted-foreground">OK (≥ 90%)</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-yellow-500"></span>
              <span className="text-sm text-muted-foreground">
                Warning (60–89%)
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-red-500"></span>
              <span className="text-sm text-muted-foreground">Low (60%)</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* OVERBURDEN Table */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-md p-4">
          <h2 className="text-xl font-bold text-primary mb-4">OVERBURDEN</h2>
          <TableList
            key={`overburden-${overburdenData.length}`}
            columns={columns}
            data={overburdenData}
            setSorting={setSorting}
            sorting={sorting}
            showPagination={false}
            pageSize={overburdenData.length}
            rowClassName="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            rowClassNameProps={(device) =>
              device.id === selectedDeviceId
                ? "bg-gray-200 dark:bg-gray-700"
                : ""
            }
            onRowClick={handleDeviceClick}
            loading={false}
            tableProps={{
              initialState: {
                pagination: { pageIndex: 0, pageSize: overburdenData.length },
              },
            }}
          />
        </div>

        {/* COAL GETTING Table */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-md p-4">
          <h2 className="text-xl font-bold text-primary mb-4">COAL GETTING</h2>
          <TableList
            key={`coalgetting-${coalGettingData.length}`}
            columns={columns}
            data={coalGettingData}
            setSorting={setSorting}
            sorting={sorting}
            showPagination={false}
            pageSize={coalGettingData.length}
            rowClassName="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            rowClassNameProps={(device) =>
              device.id === selectedDeviceId
                ? "bg-gray-200 dark:bg-gray-700"
                : ""
            }
            onRowClick={handleDeviceClick}
            loading={false}
            tableProps={{
              initialState: {
                pagination: { pageIndex: 0, pageSize: coalGettingData.length },
              },
            }}
          />
        </div>

        {/* COAL HAULING Table */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-md p-4">
          <h2 className="text-xl font-bold text-primary mb-4">COAL HAULING</h2>
          <TableList
            key={`coalhauling-${coalHaulingData.length}`}
            columns={columns}
            data={coalHaulingData}
            setSorting={setSorting}
            sorting={sorting}
            showPagination={false}
            pageSize={coalHaulingData.length}
            rowClassName="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            rowClassNameProps={(device) =>
              device.id === selectedDeviceId
                ? "bg-gray-200 dark:bg-gray-700"
                : ""
            }
            onRowClick={handleDeviceClick}
            loading={false}
            tableProps={{
              initialState: {
                pagination: { pageIndex: 0, pageSize: coalHaulingData.length },
              },
            }}
          />
        </div>
      </div>

      <TableExpand />

      <Drawer
        direction={isMobile ? "bottom" : "right"}
        open={openDrawer.value}
        onOpenChange={(value) => {
          if (value) {
            openDrawer.onTrue();
          } else {
            // setEditData(null);
            openDrawer.onFalse();
          }
        }}
      >
        <DrawerAddEditActivity
          // onUpdateData={setData}
          onClose={() => {
            openDrawer.onFalse();
            // setEditData(null);
          }}
          geoFencesData={geoFencesData}
          // editData={editData}
        />
      </Drawer>
    </div>
  );
};

export default ReportView;

const getTextColor = (number) => {
  if (number >= 90) return "text-green-600";
  if (number >= 60) return "text-yellow-600";
  if (number >= 1) return "text-red-600";
};

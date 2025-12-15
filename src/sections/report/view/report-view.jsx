"use client";

import { TableList } from "@/components/table";
import React, { useEffect, useMemo, useState } from "react";
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
import { useGetDataDb } from "@/utils/collection";

const ReportView = () => {
  const isMobile = useIsMobile();
  const openDrawer = useBoolean();
  const isLoading = useBoolean();

  const { data: vehicleData } = useGetDataDb("/api/collection/vehicle", {
    type: "getfulllist",
  });

  const { data: operatorData } = useGetDataDb("/api/collection/operator", {
    type: "getfulllist",
  });

  const { data: routeData } = useGetDataDb("/api/collection/route", {
    type: "getfulllist",
  });

  const { data: projectData } = useGetDataDb("/api/collection/project", {
    type: "getfulllist",
  });

  const { data: activityData } = useGetDataDb(
    "/api/collection/daily_productivity",
    {
      type: "getfulllist",
      filter: "hauler:length > 0",
      expand:
        "operator,project,route,vehicle,hauler,hauler.operator,hauler.project,hauler.route,hauler.vehicle",
    }
  );

  const [sorting, setSorting] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [geoFencesData, setGeofencesData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [devicesData, setDevicesData] = useState([]);

  const calculateHourlyTrips = (events) => {
    const hourlyCount = {};

    events.forEach((event) => {
      try {
        const eventTime = new Date(event.eventTime);
        const hour = eventTime.getHours();

        // Hanya hitung jam 7-19
        if (hour >= 7 && hour <= 19) {
          const hourStr = `${hour.toString().padStart(2, "0")}:00`;
          hourlyCount[hourStr] = (hourlyCount[hourStr] || 0) + 1;
        }
      } catch (error) {
        console.error("Error parsing event time:", error);
      }
    });

    // Inisialisasi jam 07:00 sampai 19:00 saja (13 jam)
    const timeColumns = Array.from(
      { length: 13 },
      (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`
    );

    const result = {};
    timeColumns.forEach((hour) => {
      result[hour] = hourlyCount[hour] || 0;
    });

    return result;
  };

  const updatedActivityData = useMemo(() => {
    const result = activityData?.filter((item) => item.type === "overburden");

    if (!result || !eventsData?.length) return result;

    return result.map((item) => {
      const source = item?.expand?.route?.Source;
      const destination = item?.expand?.route?.Destination;
      const hauler = item?.expand?.hauler || [];

      // Clone item untuk di-update
      const updatedItem = { ...item };

      if (!updatedItem.expand) updatedItem.expand = {};
      if (!updatedItem.expand.hauler) updatedItem.expand.hauler = [];

      // Update setiap hauler dengan data per jam
      const updatedHauler = hauler.map((truck) => {
        const vehicleDeviceId = truck.expand?.vehicle?.device_id;
        if (!vehicleDeviceId) return truck;

        // Filter events untuk truck ini dan source geofence
        const truckEvents = eventsData.filter(
          (event) =>
            event.deviceId === vehicleDeviceId && event.geofenceId === source
        );

        // Hitung jumlah trip per jam
        const hourlyData = calculateHourlyTrips(truckEvents);

        // Hitung total data timbang (jumlah trip)
        const totalTrips = Object.values(hourlyData).reduce(
          (sum, count) => sum + count,
          0
        );

        return {
          ...truck,
          // Tambahkan data per jam
          hourly_data: hourlyData,
          // Update data_timbang dengan jumlah trip
          data_timbang: totalTrips,
        };
      });

      // Update hauler dengan data yang sudah dihitung
      updatedItem.expand.hauler = updatedHauler;

      // Hitung total untuk parent (digger)
      const parentHourlyData = {};

      const timeColumns = Array.from(
        { length: 13 },
        (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`
      );
      timeColumns.forEach((hour) => {
        parentHourlyData[hour] = updatedHauler.reduce((sum, truck) => {
          return sum + (truck.hourly_data?.[hour] || 0);
        }, 0);
      });

      // Tambahkan hourly_data ke parent
      updatedItem.hourly_data = parentHourlyData;

      // Hitung total achievement untuk parent
      updatedItem.total_trips = Object.values(parentHourlyData).reduce(
        (sum, count) => sum + count,
        0
      );

      return updatedItem;
    });
  }, [activityData, eventsData]);

  const overburdenData = useMemo(() => {
    return activityData?.filter((item) => item.type === "overburden");
  }, [activityData]);

  const coalGettingData = useMemo(() => {
    return activityData?.filter((item) => item.type === "coal getting");
  }, [activityData]);

  const coalHaulingData = useMemo(() => {
    return activityData?.filter((item) => item.type === "coal hauling");
  }, [activityData]);

  const columns = [
    {
      accessorKey: "no",
      header: "No",
      cell: ({ row }) => {
        return row.index + 1;
      },
    },
    {
      accessorKey: "digger",
      header: "Digger",
      cell: ({ row }) => {
        const vehicle = row?.original?.expand?.vehicle?.name;
        return vehicle;
      },
    },
    {
      accessorKey: "operator",
      header: "Operator",
      cell: ({ row }) => {
        const operator = row?.original?.expand?.operator?.name;
        return operator;
      },
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => {
        const model = row?.original?.expand?.vehicle?.model;
        return model;
      },
    },
    {
      accessorKey: "activity",
      header: "Activity",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "plan",
      header: "Plan",
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
      const [geofencesResponse, devicesResponse] = await Promise.all([
        axios.get("/api/proxy/traccar/geofences"),
        axios.get("/api/proxy/traccar/devices"),
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
        setEventsData(
          flattenedEvents?.filter((item) => item.type === "geofenceEnter")
        );
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

      <TableExpand updatedActivityData={updatedActivityData} />

      <Drawer
        direction={isMobile ? "bottom" : "right"}
        open={openDrawer.value}
        className="w-6xl"
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
          onClose={() => {
            openDrawer.onFalse();
          }}
          geoFencesData={geoFencesData}
          vehicleData={vehicleData}
          operatorData={operatorData}
          routeData={routeData}
          projectData={projectData}
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

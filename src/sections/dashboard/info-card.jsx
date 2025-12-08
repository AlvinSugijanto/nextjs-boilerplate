import React, { useCallback, useMemo, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { endOfDay, startOfDay } from "date-fns";
import axios from "axios";
import InfoSummary from "./info-summary";
import InfoDevice from "./info-device";
import { useBoolean } from "@/hooks/use-boolean";

const listTabs = [
  {
    title: "Daily Summary",
    value: 1,
  },
  {
    title: "Tracks",
    value: 2,
  },
  {
    title: "Devices Status",
    value: 3,
  },
];

function InfoCard({ devices = [], positions = [], selectedDeviceId }) {
  // hooks
  const loadingSummary = useBoolean();
  const controllerRef = useRef(null);

  // state
  const [activeTab, setActiveTab] = useState(1);
  const [selectedDeviceIdsSummary, setSelectedDeviceIdsSummary] = useState([]);
  const [dataSummary, setDataSummary] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });

  const deviceSelectData = useMemo(() => {
    const device = devices.find((d) => d.id === selectedDeviceId);
    if (!device) return null;

    const position = positions.find((p) => p.deviceId === device.id);
    return {
      ...device,
      ...position,
    };
  }, [devices, positions, selectedDeviceId]);

  const handleChangeDevicesSummary = (values) => {
    setSelectedDeviceIdsSummary(values);
    if (values.length === 0) {
      setDataSummary([]);
      return;
    }

    loadingSummary.onTrue();
    fetchDataSummary(dateRange.from, dateRange.to, values);
  };

  const handleDateRangeChangeSummary = (range) => {
    setDateRange(range);
    fetchDataSummary(range.from, range.to, selectedDeviceIdsSummary);
  };

  const fetchDataSummary = useCallback(
    async (from, to, selectedDeviceIds) => {
      if (selectedDeviceIds.length === 0) return;

      // if any previous request is ongoing, cancel it
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      setDataSummary([]);
      loadingSummary.onTrue();

      if (!from || !to) {
        loadingSummary.onFalse();
        return;
      }

      let startFrom = startOfDay(from);
      let endTo = endOfDay(to);

      try {
        for (const deviceId of selectedDeviceIds) {
          const { data: fetchedData } = await axios.get(
            `/api/proxy/traccar/reports/trips?deviceId=${deviceId}&from=${startFrom.toISOString()}&to=${endTo.toISOString()}`,
            {
              signal: controller.signal,
            }
          );

          const transformedData = fetchedData.map((item) => ({
            ...item,
            date: new Date(item.startTime),
            deviceName:
              devices.find((device) => device.id === item.deviceId)?.name ||
              "Unknown Device",
          }));

          setDataSummary((prevData) => [...prevData, ...transformedData]);
        }

        loadingSummary.onFalse();
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled");
          loadingSummary.onTrue();
          return;
        }

        console.error("Error fetching data:", error);
        loadingSummary.onFalse();
      }
    },
    [devices]
  );

  return (
    <Card className="h-full p-0 overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="gap-0 h-full"
      >
        <div className="overflow-auto bg-gray-100 dark:bg-muted">
          <TabsList className="">
            {listTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs"
              >
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={1} className="overflow-auto h-full">
          <InfoSummary
            devices={devices}
            onChangeDateRange={handleDateRangeChangeSummary}
            onChangeDevices={handleChangeDevicesSummary}
            data={dataSummary}
            from={dateRange.from}
            to={dateRange.to}
            loading={loadingSummary.value}
            onRowClick={(device) => {
              console.log("Clicked device summary:", device);
            }}
          />
        </TabsContent>
        <TabsContent value={2} className="overflow-auto h-full">
          <div className="p-4">Tracks Content</div>
        </TabsContent>
        <TabsContent value={3} className="overflow-auto h-full pb-2">
          <InfoDevice device={deviceSelectData} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export default InfoCard;

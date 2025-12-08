import React, { use, useCallback, useMemo, useRef, useState } from "react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { endOfDay, startOfDay } from "date-fns";
import axios from "axios";
import InfoSummary from "./info-summary";
import InfoDevice from "./info-device";
import { useBoolean } from "@/hooks/use-boolean";
import InfoTrack from "./info-track";

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
  const loadingTracks = useBoolean();
  const controllerRefSummary = useRef(null);
  const controllerRefTracks = useRef(null);

  // state
  const [activeTab, setActiveTab] = useState(1);
  const [selectedDeviceIdsSummary, setSelectedDeviceIdsSummary] = useState([]);
  const [selectedDeviceIdsTracks, setSelectedDeviceIdsTracks] = useState([]);
  const [dataSummary, setDataSummary] = useState([]);
  const [dataTracks, setDataTracks] = useState([]);
  const [dateTrack, setDateTrack] = useState(new Date());
  const [dateRangeSummary, setDateRangeSummary] = useState({
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
    fetchDataSummary(dateRangeSummary.from, dateRangeSummary.to, values);
  };

  const handleDateRangeChangeSummary = (range) => {
    setDateRangeSummary(range);
    fetchDataSummary(range.from, range.to, selectedDeviceIdsSummary);
  };

  const handleChangeDevicesTracks = (values) => {
    setSelectedDeviceIdsTracks(values);
    if (values.length === 0) {
      setDataTracks([]);
      return;
    }

    loadingTracks.onTrue();
    fetchDataTracks(dateTrack, dateTrack, values);
  };

  const handleChangeDateTracks = (date) => {
    // For tracks, we only use a single date, so we can ignore the range end
    setDateTrack(date);
    fetchDataTracks(date, date, selectedDeviceIdsTracks);
  };

  const fetchDataSummary = useCallback(
    async (from, to, selectedDeviceIds) => {
      setDataSummary([]);

      if (selectedDeviceIds.length === 0) return;

      // if any previous request is ongoing, cancel it
      if (controllerRefSummary.current) {
        controllerRefSummary.current.abort();
      }

      const controller = new AbortController();
      controllerRefSummary.current = controller;

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

  const fetchDataTracks = useCallback(
    async (from, to, selectedDeviceIds) => {
      if (selectedDeviceIds.length === 0) return;

      // if any previous request is ongoing, cancel it
      if (controllerRefTracks.current) {
        controllerRefTracks.current.abort();
      }

      const controller = new AbortController();
      controllerRefTracks.current = controller;

      setDataTracks([]);
      loadingTracks.onTrue();

      if (!from || !to) {
        loadingTracks.onFalse();
        return;
      }

      let startFrom = startOfDay(from);
      let endTo = endOfDay(to);

      try {
        for (const deviceId of selectedDeviceIds) {
          const { data: fetchedData } = await axios.get(
            `/api/proxy/traccar/positions?deviceId=${deviceId}&from=${startFrom.toISOString()}&to=${endTo.toISOString()}`,
            {
              signal: controller.signal,
            }
          );

          const cleanedData = cleansePositions(fetchedData);

          const transformedData = cleanedData.map((item) => ({
            ...item,
            date: new Date(item.deviceTime),
            time: new Date(item.deviceTime).toTimeString().split(" ")[0],
            deviceName:
              devices.find((device) => device.id === item.deviceId)?.name ||
              "Unknown Device",
          }));

          setDataTracks((prevData) => [...prevData, ...transformedData]);
        }

        loadingTracks.onFalse();
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled");
          loadingTracks.onTrue();
          return;
        }

        console.error("Error fetching data:", error);
        loadingTracks.onFalse();
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
            selectedDeviceIds={selectedDeviceIdsSummary}
            data={dataSummary}
            loading={loadingSummary.value}
            onRowClick={(device) => {
              console.log("Clicked device summary:", device);
            }}
          />
        </TabsContent>
        <TabsContent value={2} className="overflow-auto h-full">
          <InfoTrack
            devices={devices}
            onChangeDevices={handleChangeDevicesTracks}
            selectedDeviceIds={selectedDeviceIdsTracks}
            data={dataTracks}
            date={dateTrack}
            onChangeDate={handleChangeDateTracks}
            loading={loadingTracks.value}
            onRowClick={(device) => {
              console.log("Clicked device summary:", device);
            }}
          />
        </TabsContent>
        <TabsContent value={3} className="overflow-auto h-full pb-2">
          <InfoDevice device={deviceSelectData} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export default InfoCard;

function cleansePositions(data) {
  let cleaned = [];
  let lastValid = null;

  for (const item of data) {
    const lat = item.latitude;
    const lon = item.longitude;

    // ❌ Skip jika lat/lon kosong atau invalid
    if (
      lat == null ||
      lon == null ||
      lat === 0 ||
      lon === 0 ||
      isNaN(lat) ||
      isNaN(lon)
    ) {
      continue;
    }

    // ❌ Skip jika sama dengan data sebelumnya
    if (
      lastValid &&
      lastValid.latitude === lat &&
      lastValid.longitude === lon
    ) {
      continue;
    }

    // ✔ Valid → push
    cleaned.push(item);
    lastValid = item;
  }

  return cleaned;
}

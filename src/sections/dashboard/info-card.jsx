import React, {
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { endOfDay, startOfDay } from "date-fns";
import axios from "axios";
import InfoSummary from "./info-summary";
import InfoDevice from "./info-device";
import { useBoolean } from "@/hooks/use-boolean";
import InfoTrack from "./info-track";
import { uuidv4 } from "@/utils/uuid";

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

function brightRgbaColor(alpha = 0.7) {
  const r = Math.floor(100 + Math.random() * 155);
  const g = Math.floor(100 + Math.random() * 155);
  const b = Math.floor(100 + Math.random() * 155);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function InfoCard({
  devices = [],
  positions = [],
  selectedDeviceId,
  onTrackChanges,
  onChangePosition,
}) {
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
  const [dataAllTracks, setDataAllTracks] = useState(new Map());
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
      onTrackChanges?.([]);
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

  const handleClickRoute = ({ deviceId, data }) => {
    const newData = [...dataTracks];

    const filteredTracks = newData.map((item) => ({
      ...item,
      tracks:
        item.id === deviceId
          ? transformedDataFullTrack(data, item)
          : item.tracks,
      showRoute: item.id === deviceId ? true : item.showRoute,
    }));

    setDataTracks(filteredTracks);
    onTrackChanges?.(filteredTracks);
  };

  const handleHideTrack = ({ id, hide }) => {
    const newData = [...dataTracks];

    const findTrip = dataAllTracks.get(id);

    const filteredTracks = newData.map((item) => ({
      ...item,
      hideTrack: item.id === id ? hide : item.hideTrack,
      showRoute: item.id === id ? false : item.showRoute,
      tracks: item.id === id ? findTrip?.tracks : item.tracks,
    }));

    setDataTracks(filteredTracks);
    onTrackChanges?.(filteredTracks);
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
        let historyPositionDevices = [];

        for (const deviceId of selectedDeviceIds) {
          const { data: fetchedData } = await axios.get(
            `/api/proxy/traccar/positions?deviceId=${deviceId}&from=${startFrom.toISOString()}&to=${endTo.toISOString()}`,
            {
              signal: controller.signal,
            }
          );

          const { data: fetchTrips } = await axios.get(
            `/api/proxy/traccar/reports/trips?deviceId=${deviceId}&from=${startFrom.toISOString()}&to=${endTo.toISOString()}`,
            {
              signal: controller.signal,
            }
          );

          const color = brightRgbaColor();
          const findDevice = devices.find((f) => f.id === deviceId);

          const finalData = {
            ...findDevice,
            color: color,
            tracks: transformedDataFullTrack(fetchedData, findDevice),
            trips:
              fetchTrips.map((trip) => ({
                ...trip,
                id: uuidv4(),
              })) || [],
            hideTrack: false,
            showRoute: false,
          };

          historyPositionDevices.push(finalData);

          setDataTracks((prevData) => [...prevData, finalData]);
          setDataAllTracks((prevData) => {
            const newData = new Map(prevData);
            newData.set(finalData.id, { tracks: finalData.tracks });
            return newData;
          });
        }

        onTrackChanges?.(historyPositionDevices);

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

  useEffect(() => {
    onChangePosition?.(null);
  }, [activeTab]);

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
            from={dateRangeSummary.from}
            to={dateRangeSummary.to}
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
            onChangeHide={handleHideTrack}
            onClickRoute={handleClickRoute}
            onRowClick={onChangePosition}
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

const transformedDataFullTrack = (data, device) => {
  const cleanedData = cleansePositions(data);

  return cleanedData.map((item) => ({
    id: item.id,
    deviceId: device?.id,
    latitude: item.latitude,
    longitude: item.longitude,
    date: new Date(item.deviceTime),
    time: new Date(item.deviceTime).toTimeString().split(" ")[0],
    speed: item.speed,
    deviceName: device?.name || null,
  }));
};

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

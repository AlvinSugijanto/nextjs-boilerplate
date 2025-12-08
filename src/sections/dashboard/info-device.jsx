import React, { useCallback, useEffect, useState } from "react";

import { MultiSelect } from "@/components/ui/multi-select";
import { Car, LocateFixed, RefreshCcw, RotateCcw, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RangeDatePicker } from "@/components/date-picker";
import { fDateTime } from "@/utils/format-time";
import { useBoolean } from "@/hooks/use-boolean";
import { reverseGeocode } from "@/utils/reverse-geocode";
import { Skeleton } from "@/components/ui/skeleton";

const InfoDevice = ({ device }) => {
  // hooks
  const loadingAddress = useBoolean();

  const [address, setAddress] = useState(null);

  useEffect(() => {
    setAddress(null);
  }, [device]);

  const colorStatus = (status) => {
    switch (status) {
      case "online":
        return "text-green-500 bg-green-500/10 dark:text-green-400 dark:bg-green-400/10";
      case "offline":
        return "text-red-500 bg-red-500/10 dark:text-red-400 dark:bg-red-400/10";
      default:
        return "text-secondary bg-secondary/10 dark:text-secondary dark:bg-secondary/10";
    }
  };

  const handleShowAddress = async () => {
    loadingAddress.onTrue();

    try {
      const result = await reverseGeocode(device.latitude, device.longitude);
      setAddress(result);
    } catch (error) {
      console.error(error);
    } finally {
      loadingAddress.onFalse();
    }
  };

  if (!device) {
    return (
      <div className="w-full flex items-center justify-center flex-col h-full min-h-[120px]">
        <Car className="text-secondary w-5 h-5" />
        <p className="text-[11px] text-secondary tracking-tight pt-1">
          No Device Selected
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <div className="bg-muted p-1 rounded-md">
            <Car className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium tracking-tight">{device.name}</p>
        </div>

        {/* actions */}
        <div className="min-h-8 bg-muted flex justify-end items-center pr-2">
          <button className="hover:text-inherit text-secondary duration-300 py-1 px-1.5">
            <Route className="w-3! h-3!" />
          </button>
          <button className="hover:text-inherit text-secondary duration-300 py-1 px-1.5">
            <LocateFixed className="w-3! h-3!" />
          </button>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-3 px-4 w-full">
          <DetailInformation title="Status">
            <div className="flex justify-end">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-2xl ${colorStatus(
                  device.status
                )}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                <p className={`text-[9px] font-medium capitalize`}>
                  {device.status}
                </p>
              </div>
            </div>
          </DetailInformation>
          <DetailInformation
            title="Updated"
            desc={fDateTime(device.lastUpdate, "dd MMM yyyy HH:mm:ss")}
          />
          <DetailInformation title="Address">
            <div className="">
              <div className="flex items-center justify-end gap-2">
                {loadingAddress.value ? (
                  <Skeleton className="h-4 w-20" />
                ) : address ? (
                  <p className="text-[11px] overflow-hidden text-ellipsis">
                    {address}
                  </p>
                ) : (
                  <div onClick={handleShowAddress}>
                    <p className="text-[11px] text-blue-500 underline cursor-pointer">
                      Show Address
                    </p>
                  </div>
                )}

                {address && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddress(null);
                      handleShowAddress();
                    }}
                  >
                    <RefreshCcw className="w-3! h-3!" />
                  </button>
                )}
              </div>
            </div>
          </DetailInformation>
          <DetailInformation title="Longitude" desc={device.longitude} />
          <DetailInformation title="Latitude" desc={device.latitude} />
          <DetailInformation
            title="Speed"
            desc={`${
              device?.speed ? Number(device.speed?.toFixed(2)) : 0
            } Km/h`}
          />
          <DetailInformation title="Course" desc={device.course} />
          <DetailInformation title="Altitude" desc={`${device.altitude} m`} />
          <DetailInformation title="Accuracy" desc={`${device.accuracy} m`} />
        </div>
      </div>
    </div>
  );
};

export default InfoDevice;

const DetailInformation = ({ title, desc, children }) => {
  return (
    <div className="flex gap-2 items-start w-full">
      <div className="w-8">
        <p className="text-[11px] font-medium">{title}</p>
      </div>
      <div className="flex-1 w-full text-end overflow-hidden text-muted-foreground ml-1">
        {children ? (
          children
        ) : (
          <p className="text-[11px] overflow-hidden text-ellipsis">{desc}</p>
        )}
      </div>
    </div>
  );
};

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROCESS_LIST = [
  {
    label: "OVERBURDEN",
    value: "overburden",
  },
  {
    label: "COAL GETTING",
    value: "coal getting",
  },
  {
    label: "COAL HAULING",
    value: "coal hauling",
  },
];

// Generate time columns (00:00 - 23:00)
const timeColumns = Array.from(
  { length: 13 },
  (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`
);

const TableExpand = ({ updatedActivityData = [] }) => {
  const [expandedDiggers, setExpandedDiggers] = useState({});
  const [filterProcess, setFilterProcess] = useState(PROCESS_LIST[0].value);

  const filteredData = useMemo(() => {
    if (!filterProcess || !updatedActivityData?.length) return [];

    return updatedActivityData.filter((item) => item.type === filterProcess);
  }, [filterProcess, updatedActivityData]);

  const toggleDigger = (id) => {
    setExpandedDiggers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getBgColor = (value, plan) => {
    if (value === 0 || !value)
      return "bg-gray-200 dark:bg-gray-600 text-gray-400";
    const avgPlanPerHour = plan / 10;
    const percentage = (value / avgPlanPerHour) * 100;
    if (percentage >= 90) return "bg-green-500 text-white";
    if (percentage >= 60) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <>
      <div className="mt-4 ml-2 flex justify-between items-end">
        <div>
          <p className="text-xl font-semibold">Hourly Productivity</p>
          <p className="text-muted-foreground text-sm">
            Tampilan per jam per unit (warna cell mengikuti pencapaian terhadap
            plan)
          </p>
        </div>
        <Select
          value={filterProcess}
          onValueChange={(val) => setFilterProcess(val)}
        >
          <SelectTrigger
            className="**:data-[slot=select-value]:block **:data-[slot=select-value]:truncate w-[200px]"
            id="process-filter"
          >
            <SelectValue placeholder="Select Process" />
          </SelectTrigger>
          <SelectContent align="end">
            {PROCESS_LIST?.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
            <tr className="text-left">
              <th className="px-4 py-3 w-[60px]"></th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Digger</th>
              <th className="px-4 py-3">Operator</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3 text-center">Plan</th>
              {timeColumns.map((time) => (
                <th key={time} className="px-2 py-3 text-center font-semibold">
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={7 + timeColumns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <React.Fragment key={item.id}>
                  {/* Digger Summary Row (Clickable) */}
                  <tr
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => toggleDigger(item.id)}
                  >
                    <td className="px-4 py-3 text-center">
                      <button className="p-1">
                        {expandedDiggers[item.id] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary hover:underline">
                      {item.expand?.project?.name || "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                      {item.expand?.vehicle?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {item.expand?.operator?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {item.expand?.vehicle?.model || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {item.activity || "-"}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-800 dark:text-gray-200">
                      {item.plan || 0}
                    </td>

                    {item?.hourly_data &&
                      Object?.entries(item?.hourly_data).map(
                        ([time, value]) => (
                          <td key={time} className="px-2 py-3">
                            <div
                              className={`${getBgColor(
                                value, // Temporary, nanti bisa ambil dari data per jam
                                item.plan
                              )} font-medium py-2 px-1 text-xs rounded text-center transition-all`}
                            >
                              {value}
                            </div>
                          </td>
                        )
                      )}
                  </tr>

                  {/* Expanded Truck Detail Rows */}
                  {expandedDiggers[item.id] &&
                    item.expand?.hauler?.length > 0 && (
                      <>
                        {/* Detail Header */}
                        <tr className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 text-xs">
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2">No</td>
                          <td className="px-4 py-2">Truck</td>
                          <td className="px-4 py-2">Operator</td>
                          <td className="px-4 py-2">Route</td>
                          <td colSpan="1" className="px-4 py-2"></td>
                          <td className="px-4 py-2 text-center">
                            Data Timbang
                          </td>
                          {timeColumns.map((time) => (
                            <td key={time} className="px-2 py-2 text-center">
                              {time}
                            </td>
                          ))}
                        </tr>

                        {/* Truck Rows */}
                        {item.expand.hauler.map((truck, idx) => (
                          <tr key={truck.id} className="border-b text-xs">
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2">{idx + 1}</td>
                            <td className="px-4 py-2 font-medium">
                              {truck.expand?.vehicle?.name || "-"}
                            </td>
                            <td className="px-4 py-2">
                              {truck.expand?.operator?.name || "-"}
                            </td>
                            <td className="px-4 py-2">
                              {truck.expand?.route?.name || "-"}
                            </td>
                            <td colSpan="1" className="px-4 py-2"></td>
                            <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                              {truck.data_timbang || 0}
                            </td>
                            {Object.entries(truck?.hourly_data).map(
                              ([time, value]) => (
                                <td
                                  key={time}
                                  className="px-2 py-2 text-center text-gray-700 dark:text-gray-300"
                                >
                                  {value}
                                </td>
                              )
                            )}
                          </tr>
                        ))}

                        {/* Summary Info */}
                        <tr className="bg-gray-100 dark:bg-gray-700/50 border-b dark:border-gray-700 text-xs italic">
                          <td
                            colSpan={7 + timeColumns.length}
                            className="px-4 py-2 text-gray-500 dark:text-gray-400"
                          >
                            <span className="ml-8">
                              Total Dump Truck:{" "}
                              <strong>
                                {item.expand?.hauler?.length || 0}

                                {item.expand?.hauler?.reduce(
                                  (sum, t) => sum + (t.data_timbang || 0),
                                  0
                                ) || 0}
                              </strong>
                            </span>
                          </td>
                        </tr>
                      </>
                    )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TableExpand;

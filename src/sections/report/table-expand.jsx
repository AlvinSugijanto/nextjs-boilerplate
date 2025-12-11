import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateDummyData, timeColumns } from "./dummy";

const PROCESS_LIST = [
  {
    label: "OVERBURDEN",
    value: "OVERBURDEN",
  },
  {
    label: "COAL GETTING",
    value: "COAL GETTING",
  },
  {
    label: "COAL HAULING",
    value: "COAL HAULING",
  },
];

const TableExpand = () => {
  const [expandedDiggers, setExpandedDiggers] = useState({});
  const [data] = useState(generateDummyData());
  const [filterProcess, setFilterProcess] = useState(PROCESS_LIST[0].value);

  const filteredData = useMemo(() => {
    if (!filterProcess) return data;

    return data.filter((item) => item.section === filterProcess);
  }, [filterProcess, data]);

  const toggleDigger = (id) => {
    setExpandedDiggers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getBgColor = (value, plan) => {
    if (value === 0) return "bg-gray-200 dark:bg-gray-600 text-gray-400";
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
            className="**:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
            id={`reviewer`}
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

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
            <tr className="text-left">
              <th className="px-4 py-3 w-[60px]"></th>
              <th className="px-4 py-3">Section</th>
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
            {filteredData.map((section) => (
              <React.Fragment key={section.id}>
                {section.diggers.map((digger) => (
                  <React.Fragment key={digger.id}>
                    {/* Digger Summary Row (Clickable) */}
                    <tr
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      onClick={() => toggleDigger(digger.id)}
                    >
                      <td className="px-4 py-3 text-center">
                        <button className="p-1 ">
                          {expandedDiggers[digger.id] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary hover:underline">
                        {section.section}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                        {digger.digger}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {digger.operator}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {digger.model}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {digger.activity}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-800 dark:text-gray-200">
                        {digger.plan}
                      </td>
                      {timeColumns.map((time) => (
                        <td key={time} className="px-2 py-3">
                          <div
                            className={`${getBgColor(
                              digger[time],
                              digger.plan
                            )} font-medium py-2 px-1 text-xs rounded text-center transition-all`}
                          >
                            {digger[time]}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Expanded Truck Detail Rows */}
                    {expandedDiggers[digger.id] && (
                      <>
                        {/* Detail Header */}
                        <tr className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 text-xs">
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 ">No</td>
                          <td className="px-4 py-2 ">Truck</td>
                          <td className="px-4 py-2 ">Operator</td>
                          <td colSpan="2" className="px-4 py-2"></td>
                          <td className="px-4 py-2 text-center ">Distance</td>
                          {timeColumns.map((time) => (
                            <td key={time} className="px-2 py-2 text-center ">
                              {time}
                            </td>
                          ))}
                        </tr>

                        {/* Truck Rows */}
                        {digger.trucks.map((truck, idx) => (
                          <tr key={truck.id} className="border-b text-xs">
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2 ">{idx + 1}</td>
                            <td className="px-4 py-2 font-medium">
                              {truck.truck}
                            </td>
                            <td className="px-4 py-2 ">{truck.operator}</td>
                            <td colSpan="2" className="px-4 py-2"></td>
                            <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">
                              {truck.distance}
                            </td>
                            {timeColumns.map((time) => (
                              <td
                                key={time}
                                className="px-2 py-2 text-center text-gray-700 dark:text-gray-300"
                              >
                                {truck[time] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}

                        {/* Summary Info */}
                        <tr className="bg-gray-100 dark:bg-gray-700/50 border-b dark:border-gray-700 text-xs italic">
                          <td
                            colSpan="17"
                            className="px-4 py-2 text-gray-500 dark:text-gray-400"
                          >
                            <span className="ml-8">
                              Total Volume:{" "}
                              <strong>{digger.totalVolume}</strong> | Distance:{" "}
                              <strong>{digger.totalDistance} m</strong>
                            </span>
                          </td>
                        </tr>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TableExpand;

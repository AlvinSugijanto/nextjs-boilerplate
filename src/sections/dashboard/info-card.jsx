import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/ui/multi-select";
import { RangeDatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

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
    title: "Assets Status",
    value: 3,
  },
  // {
  //   title: "Simulator",
  //   value: 4,
  // },
];

function InfoCard({ devices = [] }) {
  const [activeTab, setActiveTab] = useState(1);
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });

  return (
    <Card className="h-full p-0 overflow-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-0">
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

        <TabsContent value={1}>
          <div className="w-full">
            <div className="flex flex-col gap-2 bg-gray-100 dark:bg-muted p-2 rounded-md">
              <MultiSelect
                options={devices.map(({ id, name }) => ({
                  label: name,
                  value: id,
                }))}
                className="w-full h-full"
                placeholder="Select Devices..."
                maxViewSelected={2}
                onValueChange={() => { }}
              />

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <RangeDatePicker
                    from={dateRange?.from}
                    to={dateRange?.to}
                    onChange={setDateRange}
                    showDescription

                  />
                </div>

                <Button variant="ghost" size="sm" aria-label="Reset" className="bg-gray-100! dark:bg-gray-800! hover:bg-gray-200! dark:hover:bg-gray-700! border" onClick={() => {
                  setDateRange({ from: new Date(), to: new Date() });
                }}>
                  <RotateCcw />
                </Button>

              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value={2}>
          <div className="p-4">Tracks Content</div>
        </TabsContent>
        <TabsContent value={3}>
          <div className="p-4">Assets Status Content</div>
        </TabsContent>
      </Tabs>
    </Card >
  );
}

export default InfoCard;

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  {
    title: "Simulator",
    value: 4,
  },
];

function InfoCard() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <Card className="h-full p-0 overflow-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
          <div className="p-4">Daily Summary Content</div>
        </TabsContent>
        <TabsContent value={2}>
          <div className="p-4">Tracks Content</div>
        </TabsContent>
        <TabsContent value={3}>
          <div className="p-4">Assets Status Content</div>
        </TabsContent>
        <TabsContent value={4}>
          <div className="p-4">Simulator Content</div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export default InfoCard;

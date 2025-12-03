import React, { useState } from "react";

import { Card } from "@/components/ui/card";
import { LayoutGrid, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import EventTableListAll from "./event-table-list-all";

const listTabs = [
  {
    value: 1,
    icon: <LayoutGrid />,
  },
  {
    value: 2,
    icon: <List />,
  },
];

function EventCard() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <Card className="h-full p-0">
      <div className="px-4 py-3 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="flex items-center justify-between gap-2">
            <TabsList className="">
              {listTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs"
                >
                  {tab.icon}
                </TabsTrigger>
              ))}
            </TabsList>

            <Button variant="outline" size="sm" className="text-xs">
              Add Custom Event
            </Button>
          </div>

          <TabsContent value={1}>
            <div className="px-2 py-4">GRID CARD</div>
          </TabsContent>
          <TabsContent value={2} className="h-full overflow-auto relative!">
            <EventTableListAll />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}

export default EventCard;

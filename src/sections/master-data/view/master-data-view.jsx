"use client";

import { TypographyH4 } from "@/components/typography";
import React, { useMemo, useState } from "react";
import ProjectTable from "../project-table";
import { LIST_TAB } from "../constants";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClusterTable from "../cluster-table";
import ActivityMethodTable from "../activity-method-table";
import EquipmentModelTable from "../equipment-model-table";
import EventTable from "../event-table";
import UomTable from "../uom-table";
import MatRecivedTable from "../mat-recived-table";
import MaterialCountTable from "../material-count-table";
import ActivityTable from "../activity-table";
import ProcessLoadingTable from "../process-loading-table";
import ProcessMaterialTable from "../process-material-table";

const MasterDataView = () => {
  const [currentTab, setCurrentTab] = useState(LIST_TAB[0].value);

  return (
    <div>
      <div className="mb-4">
        <TypographyH4>Master Data</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage Master Data, such as project.
        </p>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        className="overflow-x-auto"
      >
        <TabsList>
          {LIST_TAB.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 mt-8">
        {currentTab === "project" && <ProjectTable />}
        {currentTab === "cluster" && <ClusterTable />}
        {currentTab === "activity_method" && <ActivityMethodTable />}
        {currentTab === "equipment_model" && <EquipmentModelTable />}
        {currentTab === "event" && <EventTable />}
        {currentTab === "uom" && <UomTable />}
        {currentTab === "material_recived" && <MatRecivedTable />}
        {currentTab === "material_count" && <MaterialCountTable />}
        {currentTab === "activity" && <ActivityTable />}
        {currentTab === "process_loading" && <ProcessLoadingTable />}
        {currentTab === "process_material" && <ProcessMaterialTable />}
      </div>
    </div>
  );
};

export default MasterDataView;

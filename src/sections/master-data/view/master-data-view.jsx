"use client";

import {
  TypographyH4,
  TypographyLarge,
  TypographyMuted,
} from "@/components/typography";
import React, { useMemo } from "react";
import VehicleTable from "../vehicle-table";
import OperatorTable from "../operator-table";
import ProjectTable from "../project-table";
import RouteTable from "../route-table";

const MasterDataView = () => {
  return (
    <div>
      <TypographyH4 className="mb-4">Master Data</TypographyH4>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <VehicleTable />
        <RouteTable />
        <OperatorTable />
        <ProjectTable />
      </div>
    </div>
  );
};

export default MasterDataView;

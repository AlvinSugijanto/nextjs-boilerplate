"use client";

import {
  TypographyH4,
  TypographyLarge,
  TypographyMuted,
} from "@/components/typography";
import React, { useMemo } from "react";
import VehicleTable from "../vehicle-table";

const MasterDataView = () => {
  return (
    <div>
      <TypographyH4 className="mb-4">Master Data</TypographyH4>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <VehicleTable />
      </div>
    </div>
  );
};

export default MasterDataView;

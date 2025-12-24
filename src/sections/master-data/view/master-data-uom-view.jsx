"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import UomTable from "../uom-table";

const MasterDataUomView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Unit of Measure</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of unit of measure and their core
          information.
        </p>
      </div>
      <UomTable />
    </div>
  );
};

export default MasterDataUomView;

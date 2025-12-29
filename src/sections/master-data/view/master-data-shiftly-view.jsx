"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import ShiftlyTable from "../shiftly-table";

const MasterDataShiftlyView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Shiftly</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of shiftly and their core
          information.
        </p>
      </div>
      <ShiftlyTable />
    </div>
  );
};

export default MasterDataShiftlyView;

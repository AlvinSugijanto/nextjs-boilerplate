"use client";

import React, { useMemo, useState } from "react";

import { TypographyH4 } from "@/components/typography";
import ShiftlyTable from "../shiftly-table";

const MasterDataShiftlyView = () => {
  return (
    <div>
      <div className="mb-4">
        <TypographyH4>Shiftly</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of shiftly and their core
          information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <ShiftlyTable />
      </div>
    </div>
  );
};

export default MasterDataShiftlyView;

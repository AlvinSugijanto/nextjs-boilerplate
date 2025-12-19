"use client";

import React, { useMemo, useState } from "react";

import { TypographyH4 } from "@/components/typography";
import UomTable from "../uom-table";

const MasterDataUomView = () => {
  return (
    <div>
      <div className="mb-4">
        <TypographyH4>Unit of Measure</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of unit of measure and their core
          information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <UomTable />
      </div>
    </div>
  );
};

export default MasterDataUomView;

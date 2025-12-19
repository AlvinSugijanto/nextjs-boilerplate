"use client";

import React, { useMemo, useState } from "react";

import { TypographyH4 } from "@/components/typography";
import MaterialCountTable from "../material-count-table";

const MasterDataMaterialCountView = () => {
  return (
    <div>
      <div className="mb-4">
        <TypographyH4>Material Count</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of material count and their core
          information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <MaterialCountTable />
      </div>
    </div>
  );
};

export default MasterDataMaterialCountView;

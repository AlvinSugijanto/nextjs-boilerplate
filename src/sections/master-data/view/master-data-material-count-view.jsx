"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import MaterialCountTable from "../material-count-table";

const MasterDataMaterialCountView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Material Count</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of material count and their core
          information.
        </p>
      </div>
      <MaterialCountTable />
    </div>
  );
};

export default MasterDataMaterialCountView;

"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import ProcessMaterialTable from "../process-material-table";

const MasterDataProcessMaterialView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Process Material</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of process material and their core
          information.
        </p>
      </div>
      <ProcessMaterialTable />
    </div>
  );
};

export default MasterDataProcessMaterialView;

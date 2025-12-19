"use client";

import React, { useMemo, useState } from "react";

import { TypographyH4 } from "@/components/typography";
import ProcessMaterialTable from "../process-material-table";

const MasterDataProcessMaterialView = () => {
  return (
    <div>
      <div className="mb-4">
        <TypographyH4>Process Material</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of process material and their core
          information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <ProcessMaterialTable />
      </div>
    </div>
  );
};

export default MasterDataProcessMaterialView;

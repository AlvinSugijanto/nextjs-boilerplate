"use client";

import React, { useMemo, useState } from "react";

import { TypographyH4 } from "@/components/typography";
import ProcessLoadingTable from "../process-loading-table";

const MasterDataProcessLoadingView = () => {
  return (
    <div>
      <div className="mb-4">
        <TypographyH4>Process Loading</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of process loading and their core
          information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <ProcessLoadingTable />
      </div>
    </div>
  );
};

export default MasterDataProcessLoadingView;

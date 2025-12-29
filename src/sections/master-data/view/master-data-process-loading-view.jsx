"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import ProcessLoadingTable from "../process-loading-table";

const MasterDataProcessLoadingView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Process Loading</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of process loading and their core
          information.
        </p>
      </div>
      <ProcessLoadingTable />
    </div>
  );
};

export default MasterDataProcessLoadingView;

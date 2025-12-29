"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import ProcessActivityTable from "../process-activity-table";

const MasterDataProcessActivityView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Process Activity</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of process activity and their core
          information.
        </p>
      </div>
      <ProcessActivityTable />
    </div>
  );
};

export default MasterDataProcessActivityView;

"use client";

import React, { useMemo, useState } from "react";

import { TypographyH4 } from "@/components/typography";
import ProcessActivityTable from "../process-activity-table";

const MasterDataProcessActivityView = () => {
  return (
    <div>
      <div className="mb-4">
        <TypographyH4>Process Activity</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of process activity and their core
          information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <ProcessActivityTable />
      </div>
    </div>
  );
};

export default MasterDataProcessActivityView;

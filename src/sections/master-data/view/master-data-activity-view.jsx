"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import ActivityTable from "../activity-table";

const MasterDataActivityView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Activity</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of activity and their core
          information.
        </p>
      </div>
      <ActivityTable />
    </div>
  );
};

export default MasterDataActivityView;

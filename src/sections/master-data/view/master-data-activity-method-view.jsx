"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import ActivityMethodTable from "../activity-method-table";

const MasterDataActivityMethodView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Activity Method</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of Activity method and their core
          information.
        </p>
      </div>
      <ActivityMethodTable />
    </div>
  );
};

export default MasterDataActivityMethodView;

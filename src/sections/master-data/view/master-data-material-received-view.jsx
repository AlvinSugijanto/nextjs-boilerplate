"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import MaterialReceivedTable from "../material-received-table";

const MasterDataMaterialReceivedView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Material Received</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of material received and their
          core information.
        </p>
      </div>
      <MaterialReceivedTable />
    </div>
  );
};

export default MasterDataMaterialReceivedView;

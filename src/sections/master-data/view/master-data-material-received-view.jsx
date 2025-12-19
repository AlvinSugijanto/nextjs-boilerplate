"use client";

import React, { useMemo, useState } from "react";

import { TypographyH4 } from "@/components/typography";
import MaterialReceivedTable from "../material-received-table";

const MasterDataMaterialReceivedView = () => {
  return (
    <div>
      <div className="mb-4">
        <TypographyH4>Material Received</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of material received and their
          core information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <MaterialReceivedTable />
      </div>
    </div>
  );
};

export default MasterDataMaterialReceivedView;

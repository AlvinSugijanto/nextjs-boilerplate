"use client";

import React, { useMemo, useState } from "react";

import { TypographyH4 } from "@/components/typography";
import ClusterTable from "../cluster-table";

const MasterDataClusterView = () => {
  return (
    <div>
      <div className="mb-4">
        <TypographyH4>Cluster</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of clusters and their core
          information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <ClusterTable />
      </div>
    </div>
  );
};

export default MasterDataClusterView;

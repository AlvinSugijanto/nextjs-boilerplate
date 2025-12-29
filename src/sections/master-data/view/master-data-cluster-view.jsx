"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import ClusterTable from "../cluster-table";

const MasterDataClusterView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Cluster</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of clusters and their core
          information.
        </p>
      </div>
      <ClusterTable />
    </div>
  );
};

export default MasterDataClusterView;

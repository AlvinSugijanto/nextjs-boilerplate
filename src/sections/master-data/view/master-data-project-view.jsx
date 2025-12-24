"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import ProjectTable from "../project-table";

const MasterDataProjectView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Project</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of projects and their core
          information.
        </p>
      </div>
      <ProjectTable />
    </div>
  );
};

export default MasterDataProjectView;

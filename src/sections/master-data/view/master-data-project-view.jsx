"use client";

import React, { useMemo, useState } from "react";

import { TypographyH4 } from "@/components/typography";
import ProjectTable from "../project-table";

const MasterDataProjectView = () => {
  return (
    <div>
      <div className="mb-4">
        <TypographyH4>Project</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of projects and their core
          information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <ProjectTable />
      </div>
    </div>
  );
};

export default MasterDataProjectView;

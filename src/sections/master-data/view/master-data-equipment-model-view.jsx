"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import EquipmentModelTable from "../equipment-model-table";

const MasterDataEquipmentModelView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Equipment Model</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of Equipment model and their core
          information.
        </p>
      </div>
      <EquipmentModelTable />
    </div>
  );
};

export default MasterDataEquipmentModelView;

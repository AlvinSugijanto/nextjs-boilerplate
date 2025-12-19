"use client";

import React, { useMemo, useState } from "react";

import { TypographyH4 } from "@/components/typography";
import EquipmentModelTable from "../equipment-model-table";

const MasterDataEquipmentModelView = () => {
  return (
    <div>
      <div className="mb-4">
        <TypographyH4>Equipment Model</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of Equipment model and their core
          information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <EquipmentModelTable />
      </div>
    </div>
  );
};

export default MasterDataEquipmentModelView;

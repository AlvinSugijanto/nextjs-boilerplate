"use client";

import React, { useMemo, useState } from "react";

import { TypographyH4 } from "@/components/typography";
import EventTable from "../event-table";

const MasterDataEventView = () => {
  return (
    <div>
      <div className="mb-4">
        <TypographyH4>Event</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of events and their core
          information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8">
        <EventTable />
      </div>
    </div>
  );
};

export default MasterDataEventView;

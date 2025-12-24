"use client";

import React from "react";

import { TypographyH4 } from "@/components/typography";
import EventTable from "../event-table";

const MasterDataEventView = () => {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <TypographyH4>Event</TypographyH4>
        <p className="text-muted-foreground text-sm">
          Manage and organize the master list of events and their core
          information.
        </p>
      </div>
      <EventTable />
    </div>
  );
};

export default MasterDataEventView;

"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  LayoutDashboard,
  Presentation,
  ClipboardClock,
} from "lucide-react";

import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo, LogoMobile } from "../logo";
import { Navigations } from "./navigations";
import NavigationsList from "@/data/navigations-list";

// This is sample data.

const USER = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

export function AppSidebar({ ...props }) {
  const { open } = useSidebar();
  const LIST_NAVIGATIONS = NavigationsList();

  return (
    <Sidebar collapsible="icon" {...props} className="z-50">
      <SidebarHeader>
        <div className="flex items-center px-2">
          {open ? <Logo /> : <LogoMobile />}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Navigations navigations={LIST_NAVIGATIONS} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={USER} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

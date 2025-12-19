"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

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
import { MASTER_DATA_NAV } from "@/data/master-data-navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

// This is sample data.

const USER = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

export function AppSidebar({ ...props }) {
  const { open } = useSidebar();
  const pathname = usePathname();
  const LIST_NAVIGATIONS = NavigationsList();

  // Check if current route is master-data
  const isMasterData = pathname?.includes("master-data");

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="items-center">
          <div className="flex items-center">
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

      {/* Second sidebar - only show for master-data routes */}
      {isMasterData && (
        <Sidebar
          side="left"
          collapsible="none"
          className="border-l h-screen w-64"
        >
          <SidebarHeader className="px-4 pt-6">
            <h2 className="text-xs font-semibold tracking-wider text-foreground/80">
              MASTER DATA
            </h2>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            {MASTER_DATA_NAV.map((group) => (
              <div key={group.group} className="mb-6">
                {/* Group title */}
                <p className="px-2 mb-2 text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                  {group.group}
                </p>

                {/* Items */}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.url;

                    return (
                      <Link
                        key={item.url}
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition-all",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </SidebarContent>
        </Sidebar>
      )}
    </>
  );
}

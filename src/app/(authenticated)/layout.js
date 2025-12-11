"use client";

import { AuthGuard } from "@/components/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PersistentSidebarProvider } from "@/components/layout/persistent-sidebar-provider";
import { AutoBreadcrumb } from "@/components/layout/auto-breadcrumb";
import ThemeToggle from "@/components/layout/theme-toggle";

export default function Layout({ children }) {
  return (
    <AuthGuard>
      <PersistentSidebarProvider>
        <AppSidebar variant="inset" />

        {/* Parent utama: tidak memutus sticky */}
        <SidebarInset className="flex flex-1 flex-col w-[calc(100vw-18rem)]">
          {/* 🧭 Sticky Header */}
          <header
            className="flex sticky top-0 rounded-t-2xl bg-background/50 backdrop-blur z-20 
                   h-16 shrink-0 items-center gap-2 justify-between px-4 
                   transition-[width,height] ease-linear 
                   group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 
                   border-b border-border"
          >
            <div className="flex items-center gap-2 pr-4">
              {/* <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <AutoBreadcrumb /> */}
            </div>
            <ThemeToggle />
          </header>

          {/* 📦 Konten tanpa scroll & overflow disembunyikan */}
          <div className="flex flex-1 flex-col gap-4 px-4 h-full overflow-hidden pt-4 pb-0">
            {children}
          </div>
        </SidebarInset>
      </PersistentSidebarProvider>
    </AuthGuard>
  );
}

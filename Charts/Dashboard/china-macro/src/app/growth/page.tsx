import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { GrowthMetricsBrowser } from "@/components/growth-metrics-browser"

import payload from "./metrics.json"
import type { GrowthPayload } from "./metrics"

// new
import upcoming from "./releases.json"
import { ReleaseCards } from "@/components/release-cards"

export default function Page() {
  return (
    <SidebarProvider style={{ "--sidebar-width": "280px" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Growth" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Top KPI row → Data releases + latest prints */}
              <div className="px-4 lg:px-6">
                <ReleaseCards
                  payload={payload as unknown as GrowthPayload}
                  headlineIds={[
                    "gdp-real-yoy",
                    "industrial-production-yoy",
                    "retail-sales-yoy"
                  ]}
                  upcoming={(upcoming as any).upcoming}
                  titleUpcoming="Upcoming Releases"
                />
              </div>

              <div className="px-4 lg:px-6">
                <GrowthMetricsBrowser payload={payload as unknown as GrowthPayload} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
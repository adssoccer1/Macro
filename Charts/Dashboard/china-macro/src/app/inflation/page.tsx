import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { InflationMetricsBrowser } from "@/components/inflation-metrics-browser"

import payload from "./metrics.json"
import type { InflationPayload } from "./metrics"

// new
import upcoming from "./releases.json"
import { ReleaseCards } from "@/components/release-cards"

export default function Page() {
  return (
    <SidebarProvider style={{ "--sidebar-width": "280px" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Inflation" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Top KPI row → Data releases + latest prints */}
              <div className="px-4 lg:px-6">
                <ReleaseCards
                  payload={payload as unknown as InflationPayload}
                  headlineIds={[
                    "cpi-headline-yoy",
                    "cpi-core-yoy",
                    "ppi-exfactory-yoy"
                  ]}
                  upcoming={(upcoming as any).upcoming}
                  titleUpcoming="Upcoming Releases"
                />
              </div>

              <div className="px-4 lg:px-6">
                <InflationMetricsBrowser payload={payload as unknown as InflationPayload} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
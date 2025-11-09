import { AppSidebar } from "@/components/app-sidebar"
import { SignalCarousel } from "@/components/signal-carousel"
import { SiteHeader } from "@/components/site-header"
import { EventTape } from "@/components/event-tape"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// ⬇️ NEW: watchlist market hub
import { MarketOverview } from "@/components/market-overview"
import market from "./market-series.json"
import type { MarketPayload } from "./market-types"

// (Optional) keep if used elsewhere
// import { DataTable } from "@/components/data-table"
// import data from "./data.json"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Live Dashboard — China Markets" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SignalCarousel />

              {/* ⬇️ REPLACED: <ChartMarketFX /> */}
              <div className="px-4 lg:px-6">
                <MarketOverview payload={market as unknown as MarketPayload} />
              </div>

              <div className="mt-6 px-4 lg:px-6">
                <EventTape />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
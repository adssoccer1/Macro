"use client"

import * as React from "react"
import { GrowthMetric, GrowthPayload } from "@/app/growth/metrics"
import { GrowthMetricChart } from "@/components/growth-metric-chart"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CATEGORY_ORDER: GrowthMetric["category"][] = [
  "Core Activity",
  "Property/Construction",
  "Credit/Financing",
  "External",
  "Labor",
  "Surveys",
]

export function GrowthMetricsBrowser({ payload }: { payload: GrowthPayload }) {
  const metrics = payload.metrics
  const [selectedId, setSelectedId] = React.useState(() => metrics[0]?.id)
  const [query, setQuery] = React.useState("")

  const selected = metrics.find((m) => m.id === selectedId) ?? metrics[0]

  const quick = [
    "gdp-real-yoy",
    "industrial-production-yoy",
    "retail-sales-yoy",
    "fixed-asset-investment-ytd",
    "exports-usd-yoy",
    "credit-impulse",
  ].filter((id) => metrics.some((m) => m.id === id))

  const q = query.trim().toLowerCase()
  const matches = (m: GrowthMetric) =>
    !q ||
    m.label.toLowerCase().includes(q) ||
    m.category.toLowerCase().includes(q) ||
    m.source.toLowerCase().includes(q)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Left: simple searchable list */}
      <Card className="lg:col-span-4 p-3">
        <div className="px-1 pb-2 font-medium">Browse metrics - China
        </div>
        <div className="px-1 pb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search growth metrics… (e.g., retail, PMI)"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            aria-label="Search metrics"
          />
        </div>
        <div className="max-h-[520px] overflow-y-auto pr-1">
          {CATEGORY_ORDER.map((cat) => {
            const items = metrics.filter((m) => m.category === cat && matches(m))
            if (items.length === 0) return null
            return (
              <div key={cat} className="mb-3">
                <div className="px-1 pb-1 text-xs uppercase tracking-wide text-muted-foreground">{cat}</div>
                <div className="flex flex-col">
                  {items.map((m) => {
                    const active = m.id === selectedId
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedId(m.id)}
                        className={[
                          "text-left rounded-md px-2 py-2",
                          active ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                        ].join(" ")}
                        aria-pressed={active}
                      >
                        <div className="text-sm font-medium">{m.label}</div>
                        <div className="text-xs text-muted-foreground">{m.source} · {m.frequency} · {m.unit}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Empty state */}
          {CATEGORY_ORDER.every((cat) => metrics.filter((m) => m.category === cat && matches(m)).length === 0) && (
            <div className="px-1 py-6 text-sm text-muted-foreground">No metrics found.</div>
          )}
        </div>
      </Card>

      {/* Right: quick-picks + chart */}
      <div className="lg:col-span-8 space-y-3">
        {quick.length > 0 && (
          <Tabs value={selectedId} onValueChange={setSelectedId} className="w-full">
            <TabsList className="grid grid-flow-col auto-cols-max gap-2 overflow-x-auto">
              {quick.map((id) => {
                const m = metrics.find((x) => x.id === id)!
                return (
                  <TabsTrigger key={id} value={id} className="whitespace-nowrap">
                    {m.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        )}

        {selected && <GrowthMetricChart metric={selected} />}
      </div>
    </div>
  )
}
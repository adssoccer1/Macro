"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import type { MarketPayload, Instrument } from "@/app/dashboard/market-types"
import { MarketMiniCard } from "@/components/market-mini-card"
import { MarketBigChart } from "@/components/market-big-chart"
import { MarketMultiChart } from "@/components/market-multi-chart"
import { MarketWatchlistManager } from "@/components/market-watchlist-manager"
import { useWatchlist } from "@/lib/useWatchlist"

type RangeKey = "1D" | "7D" | "1M" | "3M" | "1Y"

const CATS: (Instrument["category"] | "Watchlist")[] = ["Watchlist", "Equities", "FX", "Rates", "Credit", "Commodities"]
const RANGES: RangeKey[] = ["1D", "7D", "1M", "3M", "1Y"]

function sliceByRange(series: { date: string; value: number }[], rk: RangeKey) {
  const now = series.length ? new Date(series.at(-1)!.date).getTime() : Date.now()
  const days = rk === "1D" ? 1 : rk === "7D" ? 7 : rk === "1M" ? 30 : rk === "3M" ? 90 : 365
  const cutoff = now - days * 24 * 3600 * 1000
  const out = series.filter((p) => new Date(p.date).getTime() >= cutoff)
  // guarantee at least 2 points for charts
  if (out.length === 1 && series.length >= 2) out.unshift(series[series.length - 2])
  return out
}

export function MarketOverview({ payload }: { payload: MarketPayload }) {
  const [cat, setCat] = React.useState<Instrument["category"] | "Watchlist">("Watchlist")
  const [range, setRange] = React.useState<RangeKey>("7D")

  const instruments = payload.instruments
  const { ids: watchIds } = useWatchlist(["csi300", "usdcnh"]) // sensible defaults

  const byCat = cat === "Watchlist"
    ? instruments.filter((i) => watchIds.includes(i.id))
    : instruments.filter((i) => i.category === cat)

  // fall back if watchlist empty
  const effective = byCat.length ? byCat : instruments.filter((i) => i.category === "Equities")

  // local selected for single-series view (non-watchlist)
  const [selectedId, setSelectedId] = React.useState<string>(() => effective[0]?.id ?? instruments[0]?.id)
  React.useEffect(() => {
    const first = (cat === "Watchlist" ? effective[0] : payload.instruments.find((i) => i.category === cat))?.id
    if (first) setSelectedId(first)
  }, [cat, payload.instruments]) // eslint-disable-line

  const selected = instruments.find((i) => i.id === selectedId) ?? effective[0]

  const adj = (i: Instrument) => ({ ...i, series: sliceByRange(i.series, range) })
  const adjList = effective.map(adj)

  const isWatchlist = cat === "Watchlist"

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Tabs value={cat} onValueChange={(v) => setCat(v as typeof cat)}>
          <TabsList className="grid grid-flow-col auto-cols-max gap-2 overflow-x-auto">
            {CATS.map((c) => (
              <TabsTrigger key={c} value={c} className="whitespace-nowrap">{c}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-1">
          {RANGES.map((rk) => (
            <button
              key={rk}
              onClick={() => setRange(rk)}
              className={`rounded-md px-2 py-1 text-sm ${range === rk ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}
            >
              {rk}
            </button>
          ))}
        </div>
      </div>

      {/* Manager only in Watchlist tab */}
      {isWatchlist && (
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <MarketWatchlistManager payload={payload} />
          </div>
          <div className="lg:col-span-7">
            <MarketMultiChart
              instruments={adjList}
              title="Watchlist"
              description="Overlay of selected instruments (toggle Rebase for cross-asset comparison)"
            />
          </div>
        </div>
      )}

      {!isWatchlist && (
        <div className="grid gap-3 lg:grid-cols-12">
          {/* Watchlist absent → show category grid + single big chart */}
          <Card className="lg:col-span-5 p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {effective.map((i) => (
                <MarketMiniCard
                  key={i.id}
                  inst={adj(i)}
                  selected={i.id === selectedId}
                  onClick={() => setSelectedId(i.id)}
                />
              ))}
            </div>
          </Card>

          <div className="lg:col-span-7">
            {selected && <MarketBigChart inst={adj(selected)} />}
          </div>
        </div>
      )}
    </div>
  )
}
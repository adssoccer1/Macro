"use client"

import * as React from "react"
import type { MarketPayload, Instrument } from "@/app/dashboard/market-types"
import { Card } from "@/components/ui/card"
import { useWatchlist } from "@/lib/useWatchlist"

export function MarketWatchlistManager({ payload }: { payload: MarketPayload }) {
  const { ids, toggle, clear } = useWatchlist()
  const [query, setQuery] = React.useState("")

  const q = query.trim().toLowerCase()
  const matches = (i: Instrument) =>
    !q ||
    i.label.toLowerCase().includes(q) ||
    i.category.toLowerCase().includes(q) ||
    i.id.toLowerCase().includes(q)

  const grouped = ["Equities", "FX", "Rates", "Credit", "Commodities"].map((cat) => ({
    cat,
    items: payload.instruments.filter((i) => i.category === (cat as Instrument["category"]) && matches(i)),
  }))

  return (
    <Card className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-medium">Manage Watchlist</div>
        <button onClick={() => clear()} className="text-xs text-muted-foreground hover:underline">
          Clear all
        </button>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search instruments… (e.g., CSI, USD/CNH, CGB)"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="max-h-[320px] overflow-y-auto pr-1">
        {grouped.map(({ cat, items }) =>
          items.length ? (
            <div key={cat} className="mb-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground px-1 pb-1">{cat}</div>
              {items.map((i) => {
                const checked = ids.includes(i.id)
                return (
                  <label
                    key={i.id}
                    className={`flex items-center justify-between rounded-md px-2 py-2 cursor-pointer ${
                      checked ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{i.label}</div>
                      <div className="text-xs text-muted-foreground">{i.id} · {i.unit}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(i.id)}
                      className="h-4 w-4"
                      aria-label={`Toggle ${i.label}`}
                    />
                  </label>
                )
              })}
            </div>
          ) : null
        )}
      </div>
    </Card>
  )
}
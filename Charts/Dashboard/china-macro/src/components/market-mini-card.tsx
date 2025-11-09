"use client"

import * as React from "react"
import { Line, LineChart, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"
import type { Instrument } from "@/app/dashboard/market-types"
import { useWatchlist } from "@/lib/useWatchlist"
import { Star } from "lucide-react"

const BLUE = "#2563eb"

function pct(a?: number, b?: number) {
  if (a == null || b == null || b === 0) return undefined
  return ((a - b) / Math.abs(b)) * 100
}

export function MarketMiniCard({
  inst,
  selected,
  onClick,
}: {
  inst: Instrument
  selected: boolean
  onClick: () => void
}) {
  const s = inst.series
  const cur = s.at(-1)?.value
  const d1 = s.length >= 2 ? s.at(-2)?.value : undefined
  const change1d = pct(cur, d1)

  const { ids, toggle } = useWatchlist()
  const watched = ids.includes(inst.id)

  return (
    <div className="relative">
      <button onClick={() => toggle(inst.id)} className="absolute right-2 top-2 text-muted-foreground hover:text-foreground" aria-label="Toggle watchlist">
        <Star size={16} fill={watched ? "currentColor" : "transparent"} />
      </button>

      <button onClick={onClick} className="text-left w-full">
        <Card className={`p-3 transition ${selected ? "ring-2 ring-ring" : "hover:bg-muted"}`}>
          <div className="text-sm font-medium truncate">{inst.label}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{inst.category} · {inst.unit}</div>
          <div className="mt-1 text-lg font-semibold">
            {cur != null ? cur : "—"} <span className="text-xs font-normal text-muted-foreground">{inst.unit}</span>
          </div>
          <div className="text-xs">
            {change1d != null && (
              <span className={change1d >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {change1d >= 0 ? "▲" : "▼"} {Math.abs(change1d).toFixed(2)}%
              </span>
            )}
          </div>
          <div className="mt-2 h-12">
            <LineChart data={s} width={220} height={48} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Line type="monotone" dataKey="value" stroke={BLUE} dot={false} strokeWidth={2} />
            </LineChart>
          </div>
        </Card>
      </button>
    </div>
  )
}
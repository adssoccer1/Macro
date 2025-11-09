"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SeriesPoint = { date: string; value: number }
type BaseMetric = {
  id: string
  label: string
  unit: string
  series: SeriesPoint[]
}

export type UpcomingRelease = {
  date: string            // ISO date (e.g., "2024-11-15")
  label: string           // e.g., "Industrial Production (Oct)"
  time?: string           // e.g., "10:00 CST"
  metricId?: string       // optional link to a metric in payload
  consensus?: number      // optional
  unit?: string           // optional override (else use metric's unit)
}

function latest<T extends SeriesPoint>(series: T[]) {
  if (!series?.length) return { cur: undefined, prev: undefined }
  const cur = series[series.length - 1]
  const prev = series.length > 1 ? series[series.length - 2] : undefined
  return { cur, prev }
}

function pctDelta(a?: number, b?: number) {
  if (a == null || b == null || b === 0) return undefined
  return ((a - b) / Math.abs(b)) * 100
}

function fmtDateISO(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function fmtNum(n?: number, digits = 1) {
  return n == null ? "—" : n.toFixed(digits)
}

function Arrow({ v }: { v?: number }) {
  if (v == null) return null
  return <span className={v >= 0 ? "text-emerald-600" : "text-rose-600"}>{v >= 0 ? "▲" : "▼"}</span>
}

export function ReleaseCards<T extends BaseMetric>({
  payload,                    // { metrics: T[] }
  headlineIds,                // the 3 metrics to show as “Latest …” cards
  upcoming,                   // upcoming releases list (2–4 best)
  titleUpcoming = "Upcoming Releases",
}: {
  payload: { metrics: T[] }
  headlineIds: string[]
  upcoming: UpcomingRelease[]
  titleUpcoming?: string
}) {
  const byId = React.useMemo(() => {
    const map = new Map<string, T>()
    for (const m of payload.metrics) map.set(m.id, m)
    return map
  }, [payload.metrics])

  // build headline cards
  const headlines = headlineIds
    .map((id) => byId.get(id))
    .filter(Boolean) as T[]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Card 1: Upcoming Releases */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{titleUpcoming}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {upcoming.length === 0 && <div className="text-muted-foreground">No scheduled releases</div>}
          <ul className="space-y-2">
            {upcoming.slice(0, 4).map((r, idx) => {
              const linked = r.metricId ? byId.get(r.metricId) : undefined
              const unit = r.unit ?? linked?.unit
              return (
                <li key={idx} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{r.label}</div>
                    <div className="text-muted-foreground">
                      {fmtDateISO(r.date)}
                      {r.time ? ` · ${r.time}` : ""}
                    </div>
                  </div>
                  <div className="text-right shrink-0 text-muted-foreground">
                    {r.consensus != null ? (
                      <span title="Consensus">{fmtNum(r.consensus)} {unit ?? ""}</span>
                    ) : (
                      <span className="text-xs"> </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Cards 2–4: Latest headline prints */}
      {headlines.slice(0, 3).map((m) => {
        const { cur, prev } = latest(m.series)
        const delta = pctDelta(cur?.value, prev?.value)
        return (
          <Card key={m.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{m.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {fmtNum(cur?.value)} <span className="text-base font-normal text-muted-foreground">{m.unit}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                <Arrow v={delta} />{" "}
                {delta == null ? "No prior point" : `${Math.abs(delta).toFixed(1)}% vs prior`}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Last point: {cur?.date ? new Date(cur.date).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—"}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
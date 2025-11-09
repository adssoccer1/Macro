"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Instrument } from "@/app/dashboard/market-types"

const COLORS = ["#2563eb", "#0ea5e9", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#14b8a6", "#8b5cf6"]

// Use a stable formatter (UTC) to avoid hydration issues later
const fmtDate = (s: string) =>
  new Date(s).toLocaleString("en-US", { timeZone: "UTC", month: "short", day: "numeric", hour: "2-digit" })

function unifyDates(seriesList: { date: string; value: number }[][]) {
  const all = new Set<string>()
  for (const s of seriesList) for (const p of s) all.add(p.date)
  const dates = Array.from(all).sort((a, b) => +new Date(a) - +new Date(b))
  return dates
}

function rebaseTo100(series: { date: string; value: number }[]) {
  if (!series.length) return series
  const base = series[0].value || 1
  return series.map((p) => ({ date: p.date, value: (p.value / base) * 100 }))
}

export function MarketMultiChart({
  instruments,
  title = "Watchlist",
  description,
  rebaseDefault = true,
  horizon = "custom", // ⬅️ add this line
}: {
  instruments: Instrument[]
  title?: string
  description?: string
  rebaseDefault?: boolean
  horizon?: "3m" | "30d" | "7d" | "1d" | "custom" // ⬅️ add this line
}) {
  const [rebase, setRebase] = React.useState(rebaseDefault)

  const dates = unifyDates(instruments.map((i) => (rebase ? rebaseTo100(i.series) : i.series)))
  const rows = dates.map((d) => {
    const row: Record<string, number | string | null> = { date: d }
    for (const i of instruments) {
      const src = rebase ? rebaseTo100(i.series) : i.series
      const pt = src.find((p) => p.date === d)
      row[i.id] = pt?.value ?? null
    }
    return row
  })

  // ⬇️ snapshot for the AI route
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__kc_market = {
        horizon,
        instruments: instruments.map(({ id, label }) => ({ id, label })),
        latest: rows.at(-1) ?? null,
        sample: rows.slice(-50),
      }
    }
  }, [rows, instruments, horizon])

  return (
    <Card className="@container">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rebase}
              onChange={(e) => setRebase(e.target.checked)}
              className="h-4 w-4"
            />
            Rebase to 100
          </label>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <LineChart data={rows} width={900} height={320} margin={{ left: 12, right: 12, top: 6, bottom: 6 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={fmtDate} minTickGap={28} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={56} />
          {instruments.map((inst, idx) => (
            <Line
              key={inst.id}
              type="monotone"
              dataKey={inst.id}
              name={inst.label}
              stroke={COLORS[idx % COLORS.length]}
              dot={{ r: 3 }}
              activeDot={{ r: 4 }}
              strokeWidth={2}
              connectNulls
            />
          ))}
          <Tooltip
            labelFormatter={(l) => fmtDate(String(l))}
            formatter={(value, key) => {
              const inst = instruments.find((i) => i.id === key)
              if (!inst) return [value, key as string]
              return [Number(value as number).toFixed(2), inst.label + (rebase ? " (rebased)" : "")]
            }}
          />
          <Legend />
        </LineChart>
      </CardContent>
    </Card>
  )
}
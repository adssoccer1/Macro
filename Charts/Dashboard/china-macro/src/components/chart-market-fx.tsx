"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import raw from "@/app/dashboard/market-fx.json"

type Row = { date: string; csi: number; usdcnh: number }
const rows: Row[] = raw as any

// ---- index both series to 100 and invert CNH so "up" = stronger CNH
const BASE_CSI = rows[0].csi
const BASE_INV_CNH = 1 / rows[0].usdcnh
const indexed = rows.map((d) => {
  const csiN = (d.csi / BASE_CSI) * 100
  const cnhN = ((1 / d.usdcnh) / BASE_INV_CNH) * 100
  return { date: d.date, csiN, cnhN }
})

// ---- helper to filter by last N days (falls back gracefully if data is sparse)
function lastNDays(n: number) {
  const end = new Date(rows[rows.length - 1].date + "T00:00:00")
  const start = new Date(end)
  start.setDate(end.getDate() - (n - 1))
  const filtered = indexed.filter((d) => new Date(d.date + "T00:00:00") >= start)
  return filtered.length ? filtered : indexed.slice(-Math.max(1, Math.min(n, indexed.length)))
}

const RANGES: Record<string, number> = { "3m": 90, "30d": 30, "7d": 7, "1d": 1 }

export function ChartMarketFX() {
  const [range, setRange] = React.useState<keyof typeof RANGES>("3m")

  const data = React.useMemo(() => {
    const days = RANGES[range]
    return lastNDays(days)
  }, [range])

  return (
    <Card className="@container">
      <CardHeader className="pb-0 flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Equities &amp; FX — CSI300 vs CNH (indexed)</CardTitle>
          <CardDescription>Indexed to 100 on {rows[0].date}; CNH inverted so “up” = stronger CNH.</CardDescription>
        </div>
        <Tabs value={range} onValueChange={(v) => setRange(v as keyof typeof RANGES)}>
          <TabsList>
            <TabsTrigger value="3m">Last 3 months</TabsTrigger>
            <TabsTrigger value="30d">Last 30 days</TabsTrigger>
            <TabsTrigger value="7d">Last 7 days</TabsTrigger>
            <TabsTrigger value="1d">Last 1 day</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-4">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 8, right: 12, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="fillCsi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillCnh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeOpacity={0.25} vertical={false} />
              <XAxis dataKey="date" tickMargin={8} />
              <YAxis tickFormatter={(v) => `${Math.round(v)}`} domain={["auto", "auto"]} />
              <Tooltip formatter={(v: any, name) => [typeof v === "number" ? v.toFixed(1) : v, name]} />
              <Legend />
              <Area type="monotone" dataKey="csiN" name="CSI300 (idx)" stroke="#3b82f6" fill="url(#fillCsi)" strokeWidth={1.75} />
              <Area type="monotone" dataKey="cnhN" name="CNH inv. (idx)" stroke="#f59e0b" fill="url(#fillCnh)" strokeWidth={1.75} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
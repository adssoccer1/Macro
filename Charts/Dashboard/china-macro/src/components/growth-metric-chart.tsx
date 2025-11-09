"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { GrowthMetric } from "@/app/growth/metrics"
import { cn } from "@/lib/utils"

const fmtDate = (s: string) => new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short" })
const last = <T,>(a: T[]) => (a.length ? a[a.length - 1] : undefined)

// Blue palette
const BLUE = "#2563eb"      // tailwind blue-600
const BLUE_LIGHT = "#60a5fa" // tailwind blue-400

function pctDelta(a?: number, b?: number) {
  if (a == null || b == null || b === 0) return undefined
  return ((a - b) / Math.abs(b)) * 100
}
function rollingMean(series: { date: string; value: number }[], n = 3) {
  const out: { date: string; value: number }[] = []
  for (let i = 0; i < series.length; i++) {
    const w = series.slice(Math.max(0, i - n + 1), i + 1)
    const avg = w.reduce((s, d) => s + d.value, 0) / w.length
    out.push({ date: series[i].date, value: avg })
  }
  return out
}

export function GrowthMetricChart({ metric }: { metric: GrowthMetric }) {
  const latest = last(metric.series)
  const prev = metric.series.length > 1 ? metric.series[metric.series.length - 2] : undefined
  const delta = pctDelta(latest?.value, prev?.value)
  const smooth = metric.frequency === "monthly" ? rollingMean(metric.series, 3) : metric.series

  const chartConfig: ChartConfig = {
    value: { label: metric.label, color: BLUE },
    smooth: { label: "3M avg", color: BLUE_LIGHT },
  }

  return (
    <Card className="@container">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{metric.label}</CardTitle>
        <CardDescription>
          {metric.category} · {metric.source} · {metric.frequency} · {metric.unit}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={metric.series} margin={{ left: 12, right: 12, top: 6, bottom: 6 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={fmtDate} minTickGap={32} tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={42} />
            <Area
              dataKey="value"
              type="monotone"
              fill={BLUE}
              stroke={BLUE}
              fillOpacity={0.15}
              dot={{ r: 3, stroke: BLUE, fill: "#ffffff", strokeWidth: 1.5 }}
              activeDot={{ r: 4 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(l) => fmtDate(String(l))} />} />
          </AreaChart>
        </ChartContainer>

        {metric.frequency === "monthly" && (
          <div className="mt-3">
            <ChartContainer config={chartConfig} className="h-[110px] w-full">
              <LineChart data={smooth} margin={{ left: 12, right: 12, top: 6, bottom: 6 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Line dataKey="value" stroke={BLUE_LIGHT} dot={false} strokeWidth={2} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(l) => fmtDate(String(l))} />} />
              </LineChart>
            </ChartContainer>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Latest: <span className="font-medium text-foreground">{latest?.value.toFixed(1)}</span> {metric.unit}
            {prev && (
              <span className={cn("ml-2", delta && (delta >= 0 ? "text-emerald-600" : "text-rose-600"))}>
                {delta && `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)}% vs prior`}
              </span>
            )}
          </div>
          <div>Last point: {latest ? fmtDate(latest.date) : "—"}</div>
        </div>
      </CardContent>
    </Card>
  )
}
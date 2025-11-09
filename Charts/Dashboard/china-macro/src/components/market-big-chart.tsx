"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Instrument } from "@/app/dashboard/market-types"

const BLUE = "#2563eb"

const fmtDate = (s: string) => new Date(s).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit" })

export function MarketBigChart({ inst }: { inst: Instrument }) {
  const chartConfig: ChartConfig = {
    value: { label: inst.label, color: BLUE }
  }

  const last = inst.series.at(-1)
  const prev = inst.series.length > 1 ? inst.series.at(-2) : undefined
  const delta = last && prev ? last.value - prev.value : undefined

  return (
    <Card className="@container">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{inst.label}</CardTitle>
        <CardDescription>
          {inst.category} · {inst.unit}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={inst.series} margin={{ left: 12, right: 12, top: 6, bottom: 6 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={fmtDate} minTickGap={24} tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={56} />
            <Area
              dataKey="value"
              type="monotone"
              fill={BLUE}
              stroke={BLUE}
              fillOpacity={0.15}
              dot={{ r: 3, stroke: BLUE, fill: "#fff", strokeWidth: 1.5 }}
              activeDot={{ r: 4 }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(l) => fmtDate(String(l))} />} />
          </AreaChart>
        </ChartContainer>
        <div className="mt-3 text-sm text-muted-foreground">
          Latest: <span className="text-foreground font-medium">{last?.value}</span> {inst.unit}
          {delta != null && (
            <span className={`ml-2 ${delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(2)} vs prior
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
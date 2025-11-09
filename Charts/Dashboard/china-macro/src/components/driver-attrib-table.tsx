"use client"

import * as React from "react"
import dataRaw from "@/app/dashboard/driver-attrib.json"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type Row = {
  date: string
  asset: string
  ret_pct: number
  growth: number
  inflation_tot: number
  policy: number
  usd_global: number
  property_credit: number
  residual: number
  note?: string
}

const rows: Row[] = (dataRaw as any) as Row[]

const RANGE_DAYS: Record<string, number> = { "3m": 90, "30d": 30, "7d": 7 }

function byDateDesc(a: Row, b: Row) {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}

function fmtPct(x: number) {
  const sign = x > 0 ? "+" : ""
  return `${sign}${x.toFixed(2)}%`
}

function heat(v: number) {
  // stronger tint as |v| grows
  const a = Math.min(0.6, Math.abs(v) / 0.8) // scale sensitivity
  return v >= 0
    ? `rgba(34,197,94,${a})` // green
    : `rgba(244,63,94,${a})` // red
}

function CellPct({ v }: { v: number }) {
  return (
    <div className="relative rounded-md px-2 py-1">
      <div
        className="absolute inset-0 rounded-md"
        style={{ background: heat(v), opacity: 0.15 }}
      />
      <span className="relative font-medium tabular-nums">{fmtPct(v)}</span>
    </div>
  )
}

function ExplainedBadge({ ret, sum }: { ret: number; sum: number }) {
  const denom = Math.max(0.01, Math.abs(ret))
  const pct = Math.max(0, Math.min(100, Math.round((Math.abs(sum) / denom) * 100)))
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs">
      <span className="opacity-70">Explained</span>
      <span className="font-semibold">{pct}%</span>
    </span>
  )
}

export function DriverAttributionTable() {
  const [range, setRange] = React.useState<keyof typeof RANGE_DAYS>("30d")

  const data = React.useMemo(() => {
    const copy = [...rows].sort(byDateDesc)
    if (range === "3m") return copy
    const end = new Date(copy[0]?.date ?? new Date())
    const start = new Date(end)
    start.setDate(end.getDate() - (RANGE_DAYS[range] - 1))
    return copy.filter((r) => new Date(r.date) >= start)
  }, [range])

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Driver Attribution — China</CardTitle>
        <Tabs value={range} onValueChange={(v) => setRange(v as any)}>
          <TabsList>
            <TabsTrigger value="3m">Last 3 months</TabsTrigger>
            <TabsTrigger value="30d">Last 30 days</TabsTrigger>
            <TabsTrigger value="7d">Last 7 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Date</TableHead>
                <TableHead className="min-w-[120px]">Asset</TableHead>
                <TableHead className="text-right">Return</TableHead>
                <TableHead className="text-right">Growth</TableHead>
                <TableHead className="text-right">Infl./ToT</TableHead>
                <TableHead className="text-right">Policy/Liq.</TableHead>
                <TableHead className="text-right">USD/Global</TableHead>
                <TableHead className="text-right">Property/Credit</TableHead>
                <TableHead className="text-right">Residual</TableHead>
                <TableHead className="min-w-[220px]">Note</TableHead>
                <TableHead className="text-right">Σ Explained</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r, idx) => {
                const sum = r.growth + r.inflation_tot + r.policy + r.usd_global + r.property_credit
                return (
                  <TableRow key={`${r.date}-${r.asset}-${idx}`}>
                    <TableCell className="whitespace-nowrap tabular-nums">{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.asset}</TableCell>
                    <TableCell className="text-right"><CellPct v={r.ret_pct} /></TableCell>
                    <TableCell className="text-right"><CellPct v={r.growth} /></TableCell>
                    <TableCell className="text-right"><CellPct v={r.inflation_tot} /></TableCell>
                    <TableCell className="text-right"><CellPct v={r.policy} /></TableCell>
                    <TableCell className="text-right"><CellPct v={r.usd_global} /></TableCell>
                    <TableCell className="text-right"><CellPct v={r.property_credit} /></TableCell>
                    <TableCell className="text-right"><CellPct v={r.residual} /></TableCell>
                    <TableCell className="text-muted-foreground">{r.note}</TableCell>
                    <TableCell className="text-right"><ExplainedBadge ret={r.ret_pct} sum={sum} /></TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

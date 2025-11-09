"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dataRaw from "@/app/dashboard/event-tape.json"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

type Row = {
  id: string
  datetime: string
  category: "Policy" | "FX" | "Rates" | "Equities" | "Commodities" | "Credit" | "Housing" | "Activity"
  asset: string
  sourceName?: string
  headline: string
  score: number
  why: string
  url?: string
  pinned?: boolean
}

const rows0: Row[] = (dataRaw as any) as Row[]

const CATS: Row["category"][] = ["Policy","FX","Rates","Equities","Commodities","Credit","Housing","Activity"]
const RANGE_DAYS: Record<string, number> = { "30d": 30, "7d": 7, "1d": 1 }

function byDatetimeDesc(a: Row, b: Row) {
  return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
}

function ScorePill({score}:{score:number}) {
  const s = Math.min(3.5, Math.abs(score))
  const hue = score >= 0 ? 210 : 0           // blue for pos, red for neg (we only use magnitude visually)
  const bg = `hsla(${hue} 90% 50% / ${0.12 + s*0.08})`
  return (
    <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: bg }}>
      σ {score.toFixed(1)}
    </span>
  )
}

export function EventTape() {
  const [range, setRange] = React.useState<keyof typeof RANGE_DAYS>("30d")
  const [cats, setCats] = React.useState<Set<Row["category"]>>(new Set(CATS))
  const [items, setItems] = React.useState<Row[]>(rows0.sort(byDatetimeDesc))

  // avoid hydration mismatch for dates
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const toggleCat = (c: Row["category"]) =>
    setCats(prev => {
      const n = new Set(prev)
      n.has(c) ? n.delete(c) : n.add(c)
      return n
    })

  const filtered = React.useMemo(() => {
    const end = new Date(items[0]?.datetime ?? new Date())
    const start = new Date(end); start.setDate(end.getDate() - (RANGE_DAYS[range] - 1))
    return items
      .filter(r => cats.has(r.category))
      .filter(r => new Date(r.datetime) >= start)
      .sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0) || byDatetimeDesc(a,b))
  }, [items, cats, range])

  const remove = (id: string) => setItems(prev => prev.filter(r => r.id !== id))
  const pin = (id: string) => setItems(prev => prev.map(r => r.id === id ? {...r, pinned: !r.pinned} : r))

  if (!mounted) return null

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>AI Derived Events &amp; Moves — China</CardTitle>
        <Tabs value={range} onValueChange={(v)=>setRange(v as any)}>
          <TabsList>
            <TabsTrigger value="30d">Last 30 days</TabsTrigger>
            <TabsTrigger value="7d">Last 7 days</TabsTrigger>
            <TabsTrigger value="1d">Last 1 day</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="px-2 sm:px-4">
        {/* Category filter bar */}
        <div className="mb-3 flex flex-wrap gap-2">
          {CATS.map(c => (
            <Button
              key={c}
              variant={cats.has(c) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCat(c)}
              className="rounded-full"
            >
              {c}
            </Button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[110px]">Date/Time (UTC)</TableHead>
              <TableHead className="min-w-[110px]">Category</TableHead>
              <TableHead className="min-w-[140px]">Asset</TableHead>
              <TableHead className="min-w-[380px]">Headline</TableHead>
              <TableHead className="min-w-[360px]">Why it matters</TableHead>
              <TableHead className="min-w-[160px]">Source / Link</TableHead>
              <TableHead className="text-right min-w-[90px]">Score</TableHead>
              <TableHead className="min-w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap tabular-nums">
                  {r.datetime.slice(0,10)} {r.datetime.slice(11,16)}
                </TableCell>
                <TableCell><Badge variant="secondary">{r.category}</Badge></TableCell>
                <TableCell>{r.asset}</TableCell>
                <TableCell className="font-medium">{r.headline}</TableCell>
                <TableCell className="text-muted-foreground">{r.why}</TableCell>

                {/* NEW: Source / Link */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{r.sourceName ?? "Kate AI"}</Badge>
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                      >
                        Open <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right"><ScorePill score={r.score} /></TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    <Button variant={r.pinned ? "default" : "outline"} size="sm" onClick={() => pin(r.id)}>
                      {r.pinned ? "Unpin" : "Pin"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => remove(r.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import signalsRaw from "@/app/dashboard/signals.json"
import { cn } from "@/lib/utils"

type Signal = {
  id: string
  date: string   // YYYY-MM-DD
  type: string   // category label
  headline: string
  detail?: string
  severity?: "low" | "medium" | "high"
}

const SEVERITY_STYLES: Record<NonNullable<Signal["severity"]>, string> = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
}

export function SignalCarousel() {
  const [signals, setSignals] = React.useState<Signal[]>(signalsRaw as any)
  const viewportRef = React.useRef<HTMLDivElement>(null)

  // avoid hydration mismatch if we later persist
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const scrollBy = (dir: "left" | "right") => {
    const el = viewportRef.current
    if (!el) return
    const delta = el.clientWidth * 0.9
    el.scrollBy({ left: dir === "left" ? -delta : delta, behavior: "smooth" })
  }

  const onDelete = (id: string) => {
    setSignals((prev) => prev.filter((s) => s.id !== id))
  }

  if (!signals.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Signals</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No active signals. (They’ll appear here as they trigger.)
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative px-4 lg:px-6">
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-base font-medium">Real Time Signals - China</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => scrollBy("left")} aria-label="Previous signals">
            ←
          </Button>
          <Button variant="outline" size="sm" onClick={() => scrollBy("right")} aria-label="Next signals">
            →
          </Button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {signals.map((s) => (
          <Card
            key={s.id}
            className="min-w-[260px] sm:min-w-[300px] md:min-w-[320px] snap-start shrink-0"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{s.type}</Badge>
                {s.severity && (
                  <span className={cn("rounded px-2 py-0.5 text-xs font-medium", SEVERITY_STYLES[s.severity])}>
                    {s.severity}
                  </span>
                )}
              </div>
              <CardTitle className="text-base leading-snug">{s.headline}</CardTitle>
              <div className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString()}</div>
            </CardHeader>
            <CardContent className="flex items-start justify-between gap-2">
              <p className="text-sm text-muted-foreground">{s.detail}</p>
              <Button variant="destructive" size="sm" onClick={() => onDelete(s.id)}>
                Ack/Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
export type SeriesPoint = { date: string; value: number }

export type InflationMetric = {
  id: string
  label: string
  category: "Consumer Prices" | "Producer Prices" | "Surveys"
  source: "NBS" | "PBoC" | "GAC" | "Caixin" | "Custom"
  frequency: "monthly" | "quarterly"
  unit: "% y/y" | "index" | "% m/m" | "% q/q saar"
  description?: string
  transform?: "yoy" | "saar" | "level"
  series: SeriesPoint[]
}

export type InflationPayload = { updated?: string; metrics: InflationMetric[] }
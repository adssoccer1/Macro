export type SeriesPoint = { date: string; value: number }

export type GrowthMetric = {
  id: string
  label: string
  category: "Core Activity" | "Property/Construction" | "Credit/Financing" | "External" | "Labor" | "Surveys"
  source: "NBS" | "PBoC" | "GAC" | "Caixin" | "Custom"
  frequency: "monthly" | "quarterly"
  unit: "% y/y" | "% q/q saar" | "index" | "%" | "% of GDP"
  description?: string
  transform?: "yoy" | "saar" | "level"
  series: SeriesPoint[]
}

export type GrowthPayload = { updated?: string; metrics: GrowthMetric[] }
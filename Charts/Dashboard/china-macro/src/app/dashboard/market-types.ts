export type Point = { date: string; value: number }

export type Instrument = {
  id: string
  label: string
  category: "Equities" | "FX" | "Rates" | "Credit" | "Commodities"
  unit: string
  series: Point[]
}

export type MarketPayload = {
  updated?: string
  instruments: Instrument[]
}
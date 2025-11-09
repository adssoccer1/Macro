export type MarketSnapshot = {
    horizon: string;
    instruments: { key: string; label: string }[];
    latest: Record<string, any> | null;
    sample: Record<string, any>[];
  } | null;
  
  export function readMarketSnapshot(): MarketSnapshot {
    if (typeof window === "undefined") return null;
    return (window as any).__kc_market ?? null;
  }
// Shared market-sizing math for the validation flow. The same total/reachable/
// realistic calculation and money formatting were copy-pasted across the
// validation strategy, the problem canvas cards, and the summary dialog; this
// is the single source of truth.

// Clamp a percentage into the 0 to 100 range.
export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value))
}

export type MarketInputs = {
  customers: number
  frequency: number
  price: number
  reachableShare: number
  obtainableShare: number
}

export type MarketEstimate = {
  // TAM: the whole pie.
  totalMarket: number
  // SAM: the slice you can actually serve.
  reachableMarket: number
  // SOM: what you could realistically win out of that slice.
  realisticShare: number
  reachPct: number
  obtainPct: number
  ready: boolean
}

// Total = customers x frequency (at least 1) x price. Reachable and realistic
// are successive percentage slices of it.
export function computeMarket({
  customers,
  frequency,
  price,
  reachableShare,
  obtainableShare,
}: MarketInputs): MarketEstimate {
  const reachPct = clampPercent(reachableShare)
  const obtainPct = clampPercent(obtainableShare)
  const totalMarket = customers * Math.max(1, frequency) * price
  const reachableMarket = totalMarket * (reachPct / 100)
  const realisticShare = reachableMarket * (obtainPct / 100)
  return {
    totalMarket,
    reachableMarket,
    realisticShare,
    reachPct,
    obtainPct,
    ready: customers > 0 && price > 0,
  }
}

// Format a money figure. With a currency, uses the locale currency style and
// falls back to a "CODE 1,234" string if the code is not recognised. Without a
// currency, returns a plain grouped integer. `compact` switches to short
// notation (1.2M) for values at or above a million.
export function formatMoney(
  value: number,
  { currency, compact = false }: { currency?: string; compact?: boolean } = {},
): string {
  if (!Number.isFinite(value)) return "0"
  if (currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
        notation: compact && Math.abs(value) >= 1_000_000 ? "compact" : "standard",
      }).format(value)
    } catch {
      return `${currency} ${Math.round(value).toLocaleString()}`
    }
  }
  return Math.round(value).toLocaleString()
}

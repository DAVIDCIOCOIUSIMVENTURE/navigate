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

// How many decimal places a money figure keeps. Market sizes are shown as
// whole units, since pennies add nothing at that scale, but a price can
// genuinely be a fraction of a unit (5p each time the problem occurs), and
// rounding that to zero makes the whole calculation look broken. So a
// non-integer figure keeps enough places to stay visible: two for anything
// down to a penny, more for the very small ones.
export function moneyFractionDigits(value: number): number {
  if (!Number.isFinite(value) || Number.isInteger(value)) return 0
  const abs = Math.abs(value)
  if (abs >= 100) return 0
  return Math.min(8, Math.max(2, -Math.floor(Math.log10(abs))))
}

// Format a money figure. With a currency, uses the locale currency style and
// falls back to a "CODE 1,234" string if the code is not recognised. Without a
// currency, returns a plain grouped number. `compact` switches to short
// notation (1.2M) for values at or above a million.
export function formatMoney(
  value: number,
  { currency, compact = false }: { currency?: string; compact?: boolean } = {},
): string {
  if (!Number.isFinite(value)) return "0"
  // Short notation keeps one decimal place, so 2.4 million does not read as 2
  // million; everywhere else the figure decides for itself.
  const short = compact && Math.abs(value) >= 1_000_000
  const digits = short ? 0 : moneyFractionDigits(value)
  if (currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: digits,
        maximumFractionDigits: short ? 1 : digits,
        notation: short ? "compact" : "standard",
      }).format(value)
    } catch {
      return `${currency} ${value.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })}`
    }
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

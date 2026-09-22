import { clampPercent, computeMarket, formatMoney, moneyFractionDigits } from "./market"

describe("clampPercent", () => {
  it("holds a percentage inside 0 to 100", () => {
    expect(clampPercent(-5)).toBe(0)
    expect(clampPercent(42)).toBe(42)
    expect(clampPercent(140)).toBe(100)
  })
})

describe("computeMarket", () => {
  it("multiplies customers, frequency and price, then takes the two slices", () => {
    const { totalMarket, reachableMarket, realisticShare, ready } = computeMarket({
      customers: 1000,
      frequency: 12,
      price: 5,
      reachableShare: 50,
      obtainableShare: 10,
    })
    expect(totalMarket).toBe(60000)
    expect(reachableMarket).toBe(30000)
    expect(realisticShare).toBe(3000)
    expect(ready).toBe(true)
  })

  it("treats an empty frequency as one", () => {
    const { totalMarket } = computeMarket({
      customers: 200,
      frequency: 0,
      price: 25,
      reachableShare: 100,
      obtainableShare: 100,
    })
    expect(totalMarket).toBe(5000)
  })

  it("counts a price of a few pence as ready, and carries it through", () => {
    const { totalMarket, ready } = computeMarket({
      customers: 20000,
      frequency: 52,
      price: 0.05,
      reachableShare: 100,
      obtainableShare: 100,
    })
    expect(ready).toBe(true)
    expect(totalMarket).toBe(52000)
  })
})

describe("moneyFractionDigits", () => {
  it("keeps whole figures whole", () => {
    expect(moneyFractionDigits(0)).toBe(0)
    expect(moneyFractionDigits(1500)).toBe(0)
  })

  it("keeps pennies on a small price rather than rounding it away", () => {
    expect(moneyFractionDigits(0.05)).toBe(2)
    expect(moneyFractionDigits(0.5)).toBe(2)
    expect(moneyFractionDigits(12.5)).toBe(2)
  })

  it("goes further for a price smaller than a penny", () => {
    expect(moneyFractionDigits(0.004)).toBe(3)
    expect(moneyFractionDigits(0.0002)).toBe(4)
  })

  it("rounds large figures, where pennies add nothing", () => {
    expect(moneyFractionDigits(1234.56)).toBe(0)
  })
})

describe("formatMoney", () => {
  it("shows a price of five pence as five pence, not zero", () => {
    expect(formatMoney(0.05, { currency: "GBP" })).toBe("£0.05")
  })

  it("shows a whole price without decimals", () => {
    expect(formatMoney(1500, { currency: "GBP" })).toBe("£1,500")
  })

  it("falls back to the code when the currency is not recognised", () => {
    expect(formatMoney(0.05, { currency: "not-a-currency" })).toBe("not-a-currency 0.05")
  })

  it("compacts large figures", () => {
    expect(formatMoney(2_400_000, { currency: "GBP", compact: true })).toBe("£2.4M")
  })

  it("returns zero for a figure that is not a number", () => {
    expect(formatMoney(Number.NaN, { currency: "GBP" })).toBe("0")
  })
})

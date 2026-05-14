"use client"

import { MetricStep } from "../_metric-step"
import { useSolution } from "../context"
import { IMPACT_CONTENT } from "@/components/solution-strategies/metric-content"

export default function ImpactPage() {
  const { impact, setImpact } = useSolution()
  return <MetricStep content={IMPACT_CONTENT} value={impact} onChange={setImpact} iconBg="bg-green-800" />
}

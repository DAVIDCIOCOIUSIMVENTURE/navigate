"use client"

import { MetricStep } from "../_metric-step"
import { useSolution } from "../context"
import { FEASIBILITY_CONTENT } from "@/components/solution-strategies/metric-content"

export default function FeasibilityPage() {
  const { feasibility, setFeasibility } = useSolution()
  return (
    <MetricStep content={FEASIBILITY_CONTENT} value={feasibility} onChange={setFeasibility} iconBg="bg-tertiary" />
  )
}

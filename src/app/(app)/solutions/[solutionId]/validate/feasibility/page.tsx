"use client"

import { MetricStep } from "../_metric-step"
import { useSolutionValidation } from "../context"
import { FEASIBILITY_CONTENT } from "@/components/solution-strategies/metric-content"

export default function FeasibilityPage() {
  const { feasibility, setFeasibility } = useSolutionValidation()
  return (
    <MetricStep content={FEASIBILITY_CONTENT} value={feasibility} onChange={setFeasibility} />
  )
}

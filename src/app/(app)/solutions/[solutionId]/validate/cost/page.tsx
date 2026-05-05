"use client"

import { MetricStep } from "../_metric-step"
import { useSolutionValidation } from "../context"
import { COST_CONTENT } from "@/components/solution-strategies/metric-content"

export default function CostPage() {
  const { cost, setCost } = useSolutionValidation()
  return <MetricStep content={COST_CONTENT} value={cost} onChange={setCost} />
}

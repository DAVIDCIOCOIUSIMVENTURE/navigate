"use client"

import { MetricStep } from "../_metric-step"
import { useSolution } from "../context"
import { COST_CONTENT } from "@/components/solution-strategies/metric-content"

export default function CostPage() {
  const { cost, setCost } = useSolution()
  return <MetricStep content={COST_CONTENT} value={cost} onChange={setCost} iconBg="bg-tertiary" />
}

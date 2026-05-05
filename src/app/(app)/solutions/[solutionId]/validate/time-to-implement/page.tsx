"use client"

import { MetricStep } from "../_metric-step"
import { useSolutionValidation } from "../context"
import { TIME_CONTENT } from "@/components/solution-strategies/metric-content"

export default function TimeToImplementPage() {
  const { timeToImplement, setTimeToImplement } = useSolutionValidation()
  return <MetricStep content={TIME_CONTENT} value={timeToImplement} onChange={setTimeToImplement} />
}

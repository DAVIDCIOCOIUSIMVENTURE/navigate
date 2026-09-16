"use client"

import { MetricStep } from "../_metric-step"
import { useSolution } from "../context"
import { TIME_CONTENT } from "@/components/solution-strategies/metric-content"

export default function TimeToImplementPage() {
  const { timeToImplement, setTimeToImplement } = useSolution()
  return <MetricStep content={TIME_CONTENT} value={timeToImplement} onChange={setTimeToImplement} />
}

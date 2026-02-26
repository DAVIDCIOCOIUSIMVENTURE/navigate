"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { BASE } from "../context"
import { BookOpen } from "lucide-react"

const STEPS = [
  {
    label: "Customers",
    description: "Define who your customers are — their background, occupation, goals, and frustrations.",
    color: "#3b82f6",
  },
  {
    label: "Jobs to Be Done",
    description: "Identify what your customers are trying to accomplish — functionally, emotionally, and socially.",
    color: "#0d9488",
  },
  {
    label: "Problems",
    description: "List the problems your customers face for each job to be done — add as many as you like.",
    color: "#f43f5e",
  },
  {
    label: "Pick a Problem",
    description: "Select the single most important problem to focus on. This becomes your canvas problem.",
    color: "#6366f1",
  },
  {
    label: "Alternatives",
    description: "List how customers currently solve or work around this problem.",
    color: "#a855f7",
  },
  {
    label: "Context",
    description: "Describe when and where the problem occurs — the trigger or situation.",
    color: "#f59e0b",
  },
  {
    label: "Alternatives Shortcomings",
    description: "Explain why existing alternatives fall short and what frustrations they leave behind.",
    color: "#10b981",
  },
  {
    label: "Emotional Impact",
    description: "Capture how the problem makes your customers feel.",
    color: "#ec4899",
  },
  {
    label: "Quantifiable Impact",
    description: "Quantify the measurable cost of the problem in concrete terms.",
    color: "#f97316",
  },
]

export default function IntroductionPage() {
  const router = useRouter()

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center w-5 h-5 rounded bg-amber-500">
            <BookOpen className="h-3 w-3 text-white" />
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            Problem Discovery — Guided Workflow
          </span>
        </div>

        <h2 className="text-xl font-semibold">Introduction</h2>

        <p className="text-sm text-muted-foreground">
          The guided workflow walks you through each section of the Problem Statement Canvas one step at a
          time. By the end, you&apos;ll have a comprehensive picture of the problem you are solving — from
          understanding your customers to quantifying the impact.
        </p>

        <p className="font-medium text-sm">We&apos;ll cover 9 areas:</p>

        <ol className="flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <li key={step.label} className="flex gap-3 items-start">
              <span
                className="flex items-center justify-center w-8 h-8 rounded text-white font-semibold text-sm shrink-0"
                style={{ backgroundColor: step.color }}
              >
                {i + 1}
              </span>
              <div className="flex flex-col gap-0.5 justify-center">
                <span className="font-medium text-sm">{step.label}</span>
                <span className="text-xs text-muted-foreground">{step.description}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-2">
          <Button onClick={() => router.push(`${BASE}/customers`)}>Get Started</Button>
        </div>
      </CardContent>
    </Card>
  )
}

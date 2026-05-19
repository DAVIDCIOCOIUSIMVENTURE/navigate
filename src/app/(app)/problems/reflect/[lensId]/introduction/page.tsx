"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock } from "lucide-react"
import { useReflect } from "../context"

export default function LensIntroductionPage() {
  const { lens } = useReflect()
  const Icon = lens.icon
  const isSingleForm = lens.flowKind === "single-form"

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card>
        <CardHeader className="space-y-6">
          <CardTitle icon={Icon} iconBg={lens.tileColor}>
            {lens.title}
          </CardTitle>
          <p className="text-base leading-relaxed">{lens.longDescription}</p>
          <div className="flex items-center gap-1.5 text-base">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>About {lens.estimatedMinutes} minutes</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="rounded-lg border bg-card p-5 flex flex-col gap-3">
            <h3 className="text-base font-semibold">What you&apos;ll get out of this</h3>
            <ul className="text-base leading-relaxed list-disc pl-5 space-y-1">
              <li>Short prompts to react to, instead of a blank canvas.</li>
              <li>Your answers saved as candidate problems you can curate before refining.</li>
              <li>A nudge to look at a part of your experience you may not have mined yet.</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button asChild className="gap-2">
              <Link
                href={
                  isSingleForm
                    ? `/problems/reflect/${lens.id}/capture`
                    : `/problems/reflect/${lens.id}/prompts`
                }
              >
                Start journey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

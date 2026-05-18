"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Lightbulb, RotateCcw } from "lucide-react"
import { useReflect } from "../context"

export default function LensDonePage() {
  const params = useSearchParams()
  const { lens } = useReflect()
  const rawCount = params.get("count")
  const count = rawCount && /^\d+$/.test(rawCount) ? Number(rawCount) : 0

  return (
    <div className="flex flex-col gap-4 w-full">
      <Card>
        <CardHeader className="space-y-6">
          <CardTitle icon={CheckCircle2} iconBg="bg-success">
            All saved
          </CardTitle>
          <p className="text-base leading-relaxed">
            {count === 0 ? (
              <>
                Nothing was saved this time. That&apos;s fine: come back when you&apos;ve had time
                to sit with the prompts, or try a different lens.
              </>
            ) : (
              <>
                Saved <span className="font-semibold">{count}</span>{" "}
                {count === 1 ? "candidate" : "candidates"} from the{" "}
                <span className="font-semibold">{lens.title}</span> lens. They live on the
                Reflect hub. Promote the ones worth refining into your problem library.
              </>
            )}
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button asChild className="gap-2">
            <Link href="/problems/reflect#candidates">
              <Lightbulb className="h-4 w-4" />
              Review candidates
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/problems/reflect">
              <RotateCcw className="h-4 w-4" />
              Try another lens
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

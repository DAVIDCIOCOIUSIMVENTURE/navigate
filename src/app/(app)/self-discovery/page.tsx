"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardEyebrow, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { Compass } from "lucide-react"

export default function SelfDiscoveryPage() {
  const router = useRouter()
  const firstCategoryUrl = SELF_DISCOVERY_CATEGORIES[0].url

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardEyebrow icon={Compass}>Self Discovery</CardEyebrow>
        <CardTitle icon={Compass} className="text-primary">Introduction</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <p className="text-md text-muted-foreground leading-relaxed">
          This guided journey will help you uncover your unique strengths, interests, and potential as a founder.
          Through a series of questions and exercises, you&apos;ll gain valuable insights about yourself and your entrepreneurial path.
          At the end of this exercise, you&apos;ll have a set of problem triggers that you can take into the Ideas section.
        </p>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What you&apos;ll work through</p>
          <ul className="list-disc list-inside space-y-2 text-md text-muted-foreground">
            <li>Answer the questions within each category</li>
            <li>Optionally use suggestion exercises to discover more insights</li>
            <li>Take your time to reflect deeply on each question</li>
            <li>Be honest and specific in your responses</li>
            <li>Return to update your answers as you grow and learn</li>
          </ul>
        </div>

        <div className="flex justify-end mt-2">
          <Button onClick={() => router.push(`/self-discovery/${firstCategoryUrl}`)}>
            Get Started
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

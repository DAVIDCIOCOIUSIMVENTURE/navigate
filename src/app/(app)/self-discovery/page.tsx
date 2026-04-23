"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { Compass } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function SelfDiscoveryPage() {
  const router = useRouter()
  const firstCategoryUrl = SELF_DISCOVERY_CATEGORIES[0].url
  const size = useContainerSize()
  const roomy = size !== "narrow"

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className={cn("pb-0 shrink-0", roomy ? "px-10 pt-10" : "px-6 pt-6")}>
        <CardTitle icon={Compass}>Introduction</CardTitle>
      </CardHeader>
      <CardContent className={cn("flex-1 flex flex-col gap-6 overflow-y-auto min-h-0", roomy ? "p-10 pt-6" : "p-6 pt-4")}>
        <p className="text-md text-foreground leading-relaxed">
          This guided journey will help you uncover your unique strengths, interests, and potential as a founder.
          Through a series of questions and exercises, you&apos;ll gain valuable insights about yourself and your entrepreneurial path.
          At the end of this exercise, you&apos;ll have a set of problem triggers that you can take into the Ideas section.
        </p>

        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-foreground">What you&apos;ll do</h3>
          <div className="flex flex-col gap-3">
            <div className={cn("flex gap-3", roomy ? "items-center" : "items-start")}>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-white text-sm font-bold shrink-0">1</span>
              <div>
                <p className="font-semibold text-foreground">Answer the questions within each category</p>
                <p className="text-md text-foreground">Reflect on your strengths, interests, and experiences.</p>
              </div>
            </div>
            <div className={cn("flex gap-3", roomy ? "items-center" : "items-start")}>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm font-bold shrink-0">2</span>
              <div>
                <p className="font-semibold text-foreground">Use suggestion exercises to discover more insights</p>
                <p className="text-md text-foreground">Browse curated suggestions or add your own.</p>
              </div>
            </div>
            <div className={cn("flex gap-3", roomy ? "items-center" : "items-start")}>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-bold shrink-0">3</span>
              <div>
                <p className="font-semibold text-foreground">Build your problem triggers</p>
                <p className="text-md text-foreground">Your answers become triggers you can take into the Ideas section.</p>
              </div>
            </div>
          </div>
        </div>

      </CardContent>
      <CardFooter className={cn("shrink-0 flex justify-end border-t", roomy ? "px-10 py-6" : "px-6 py-4")}>
        <Button onClick={() => router.push(`/self-discovery/${firstCategoryUrl}`)}>
          Get Started
        </Button>
      </CardFooter>
    </Card>
  )
}

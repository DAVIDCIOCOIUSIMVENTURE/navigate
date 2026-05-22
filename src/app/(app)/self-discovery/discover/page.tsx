"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { Compass } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function SelfDiscoveryDiscoverIntroPage() {
  const router = useRouter()
  const firstCategoryUrl = SELF_DISCOVERY_CATEGORIES[0].url
  const size = useContainerSize()
  const roomy = size !== "narrow"

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className={cn("pb-0 shrink-0", roomy ? "px-10 pt-10" : "px-6 pt-6")}>
        <CardTitle icon={Compass} iconBg="bg-secondary-brand">Introduction</CardTitle>
      </CardHeader>
      <CardContent className={cn("flex-1 flex flex-col gap-6 overflow-y-auto min-h-0", roomy ? "p-10 pt-6" : "p-6 pt-4")}>
        <div className="@container">
          <div className="flex flex-col gap-6 @[800px]:flex-row @[800px]:items-center">
            <div className="flex flex-col gap-4 flex-1 min-w-0">
              <p className="text-base text-foreground leading-relaxed">
                This guided journey will help you uncover your unique strengths, interests, and potential as a founder.
                Through a series of questions and exercises, you&apos;ll surface the experiences that shaped you, the skills you reach for instinctively, and the problems you already care about.
              </p>
              <p className="text-base text-foreground leading-relaxed">
                The best founders tend to build on problems they understand from the inside, drawn from their own work, life, or expertise. Self discovery is how you surface those threads, so your problem search has something to pull on instead of starting from a blank page.
              </p>
              <p className="text-base text-foreground leading-relaxed">
                At the end of this exercise, you&apos;ll have a set of problem triggers saved to your self discovery library. You can revisit them any time, add new ones as you go, and bring them into the Problems section as starting points for the ideas you&apos;ll explore next.
              </p>
            </div>
            <img
              src="/illustrations/03-telescope.svg"
              alt=""
              className="hidden @[900px]:block w-96 h-auto shrink-0 rounded-lg"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-bold text-foreground">What you&apos;ll do</h3>
          <div className="flex flex-col gap-3">
            <div className={cn("flex gap-3", roomy ? "items-center" : "items-start")}>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-tertiary text-tertiary-foreground text-sm font-bold shrink-0">1</span>
              <div>
                <p className="font-semibold text-foreground">Answer the questions within each category</p>
                <p className="text-base text-foreground">Reflect on your strengths, interests, and experiences.</p>
              </div>
            </div>
            <div className={cn("flex gap-3", roomy ? "items-center" : "items-start")}>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-tertiary text-tertiary-foreground text-sm font-bold shrink-0">2</span>
              <div>
                <p className="font-semibold text-foreground">Use suggestion exercises to discover more insights</p>
                <p className="text-base text-foreground">Browse curated suggestions or add your own.</p>
              </div>
            </div>
            <div className={cn("flex gap-3", roomy ? "items-center" : "items-start")}>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-tertiary text-tertiary-foreground text-sm font-bold shrink-0">3</span>
              <div>
                <p className="font-semibold text-foreground">Build your problem triggers</p>
                <p className="text-base text-foreground">Your answers become triggers you can take into the Ideas section.</p>
              </div>
            </div>
          </div>
        </div>

      </CardContent>
      <CardFooter className={cn("shrink-0 flex justify-end", roomy ? "px-10 pb-6 pt-0" : "px-6 pb-4 pt-0")}>
        <Button onClick={() => router.push(`/self-discovery/discover/${firstCategoryUrl}`)}>
          Get Started
        </Button>
      </CardFooter>
    </Card>
  )
}

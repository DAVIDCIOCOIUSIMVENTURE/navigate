"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown, Clock, HelpCircle, Sparkles, Telescope, X } from "lucide-react"
import { REFLECT_LENSES } from "@/data/reflectLenses"
import { useContainerSize } from "@/context/container-size-context"
import { useGuidance } from "@/context/guidance-context"
import { getRecommendedLensIds } from "@/lib/reflect-recommendations"
import { cn } from "@/lib/utils"
import { CandidatesTray } from "@/components/reflect/candidates-tray"

export default function ReflectHubPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { openGuidance } = useGuidance()
  const isWide = useContainerSize() === "wide"
  const introDismissed = useSelector(
    (s: RootState) => s.settings.reflectIntroDismissed
  )
  const selfDiscoveryItems = useSelector(
    (s: RootState) => s.selfDiscoveryItems.items
  )

  // Avoid hydration mismatch on the dismiss state by holding "expanded" until mount.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const recommended = useMemo(
    () => (mounted ? getRecommendedLensIds(selfDiscoveryItems) : new Set<string>()),
    [mounted, selfDiscoveryItems]
  )

  const showFullIntro = !mounted || !introDismissed

  return (
    <div
      className={cn(
        "flex flex-col gap-4 w-full flex-1 min-h-0",
        isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)] overflow-y-auto"
      )}
    >
      {showFullIntro ? (
        <Card>
          <CardHeader className="space-y-6">
            <div className="flex items-start justify-between gap-3">
              <CardTitle icon={Telescope} iconBg="bg-secondary-brand">
                Reflect on Problems
              </CardTitle>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => openGuidance("reflect-hub")}
                  aria-label="Open guidance for Reflect"
                  title="Open guidance"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => dispatch.settings.setReflectIntroDismissed(true)}
                  aria-label="Hide the introduction"
                  title="Hide introduction"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-base leading-relaxed">
              Reflect is a guided way to surface problems worth solving by answering short
              prompts about your work, your life, the organizations you know, the people
              around you, and what you spot in the wider world. Each lens takes a few minutes
              and saves your answers as <span className="font-semibold">candidates</span>{" "}
              you can review before promoting them into your problem library.
            </p>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardContent className="px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary-brand shrink-0"
                aria-hidden="true"
              >
                <Telescope className="h-4 w-4 text-secondary-brand-foreground" />
              </span>
              <span className="text-base font-medium truncate">Reflect on Problems</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => openGuidance("reflect-hub")}
                aria-label="Open guidance for Reflect"
                title="Open guidance"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => dispatch.settings.setReflectIntroDismissed(false)}
                className="gap-2"
              >
                <ChevronDown className="h-4 w-4" />
                Show intro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Choose a lens</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REFLECT_LENSES.map((lens) => {
            const Icon = lens.icon
            const isRecommended = recommended.has(lens.id)
            return (
              <Link
                key={lens.id}
                href={`/problems/reflect/${lens.id}/introduction`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
              >
                <Card className="h-full transition-colors group-hover:border-primary/40">
                  <CardContent className="p-5 flex flex-col gap-3 h-full">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                          lens.tileColor
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {isRecommended && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-tertiary/15 px-2 py-0.5 text-base font-medium"
                            title="Recommended based on your self-discovery"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-tertiary" />
                            Recommended
                          </span>
                        )}
                        <ArrowRight className="h-4 w-4 self-center transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-base font-semibold leading-tight">{lens.title}</h3>
                      <p className="text-base leading-relaxed">{lens.shortDescription}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-1.5 text-base">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      <span>About {lens.estimatedMinutes} minutes</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      <CandidatesTray />
    </div>
  )
}

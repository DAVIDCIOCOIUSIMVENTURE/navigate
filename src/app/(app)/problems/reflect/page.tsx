"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Clock, Compass } from "lucide-react"
import { REFLECT_LENSES } from "@/data/reflectLenses"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"
import { CandidatesTray } from "@/components/reflect/candidates-tray"

export default function ReflectHubPage() {
  const isWide = useContainerSize() === "wide"

  return (
    <div
      className={cn(
        "flex flex-col gap-4 w-full flex-1 min-h-0",
        isWide && "overflow-y-auto"
      )}
    >
      <Card>
        <CardHeader className="space-y-6">
          <CardTitle icon={Compass}>Choose your discovery method</CardTitle>
          <p className="text-base leading-relaxed">
            Reflect is a guided way to surface problems worth solving by answering short
            prompts about your work, your life, the organizations you know, the people
            around you, and what you spot in the wider world. Each lens takes a few minutes
            and saves your answers as <span className="font-semibold">candidates</span>{" "}
            you can review before promoting them into your problem library.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {REFLECT_LENSES.map((lens) => {
            const Icon = lens.icon
            const isEnabled = lens.id === "life"

            const cardInner = (
              <Card
                className={cn(
                  "h-full transition-colors",
                  isEnabled && "group-hover:border-primary/40 group-hover:bg-primary/5",
                  !isEnabled && "opacity-60"
                )}
              >
                <CardContent className="p-5 flex flex-col gap-3 h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                          lens.tileColor
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-base font-semibold leading-tight truncate">
                        {lens.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isEnabled && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-base font-medium">
                          Coming soon
                        </span>
                      )}
                      {isEnabled && (
                        <ArrowRight className="h-4 w-4 self-center transition-transform group-hover:translate-x-0.5" />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-base leading-relaxed">{lens.shortDescription}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1.5 text-base">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    <span>About {lens.estimatedMinutes} minutes</span>
                  </div>
                </CardContent>
              </Card>
            )

            if (!isEnabled) {
              return (
                <div
                  key={lens.id}
                  aria-disabled="true"
                  className="block cursor-not-allowed rounded-xl"
                >
                  {cardInner}
                </div>
              )
            }

            return (
              <Link
                key={lens.id}
                href={`/problems/reflect/${lens.id}/introduction`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
              >
                {cardInner}
              </Link>
            )
          })}
          </div>
        </CardContent>
      </Card>

      <CandidatesTray />
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, CheckCircle2, Clock, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useContainerSize } from "@/context/container-size-context"
import { MethodTile } from "@/components/method-tile"
import { cn } from "@/lib/utils"

export type MethodPickerItem = {
  id: string
  title: string
  shortDescription: string
  longDescription: string
  helperText?: string
  icon: LucideIcon
  /** Optional photo shown beside the description on the wide layout. */
  image?: { src: string; alt: string; position?: string }
  estimatedMinutes: number
  enabled: boolean
}

export function MethodPickerBoard({
  items,
  selectedId,
  onPick,
  ctaLabel = "Use this method",
  reselectLabel = "Continue with this method",
}: {
  items: MethodPickerItem[]
  selectedId: string | null
  onPick: (id: string) => void
  ctaLabel?: string
  reselectLabel?: string
}) {
  const isWide = useContainerSize() === "wide"

  const initialActive = useMemo(() => {
    const selected = items.find((i) => i.id === selectedId && i.enabled)
    if (selected) return selected.id
    const firstEnabled = items.find((i) => i.enabled)
    return (firstEnabled ?? items[0])?.id ?? null
  }, [items, selectedId])

  const [activeId, setActiveId] = useState<string | null>(initialActive)

  useEffect(() => {
    if (!activeId && initialActive) {
      setActiveId(initialActive)
      return
    }
    const selectedEnabled = items.find((i) => i.id === selectedId && i.enabled)
    if (selectedEnabled && selectedEnabled.id !== activeId) {
      setActiveId(selectedEnabled.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  if (!isWide) {
    return (
      <Accordion
        type="single"
        collapsible
        defaultValue={initialActive ?? undefined}
        className="flex flex-col gap-2"
      >
        {items.map((item) => {
          const isSelected = selectedId === item.id
          return (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="rounded-lg border bg-card overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
                <span className="flex items-center gap-3 flex-1 min-w-0">
                  <MethodTile icon={item.icon} />
                  <span className="flex-1 min-w-0 text-left truncate">{item.title}</span>
                  {!item.enabled && (
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-base font-medium shrink-0">
                      Coming soon
                    </span>
                  )}
                  {item.enabled && isSelected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-base font-semibold shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Selected
                    </span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <MethodPreview
                  item={item}
                  isSelected={isSelected}
                  onPick={onPick}
                  ctaLabel={ctaLabel}
                  reselectLabel={reselectLabel}
                  showHeader={false}
                />
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    )
  }

  const activeItem = items.find((i) => i.id === activeId) ?? null

  return (
    <div className="rounded-lg border bg-card overflow-hidden grid grid-cols-[260px,1fr]">
      <nav className="border-r p-2 flex flex-col gap-1 bg-background/40" aria-label="Available methods">
        {items.map((item) => {
          const isActive = activeId === item.id
          const isSelected = selectedId === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              aria-pressed={isActive}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-secondary-brand/10 text-secondary-brand"
                  : "hover:bg-accent hover:text-accent-foreground",
                !item.enabled && "opacity-70",
              )}
            >
              <MethodTile icon={item.icon} />
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-base font-semibold leading-tight truncate">{item.title}</span>
                {!item.enabled ? (
                  <span className="text-base leading-snug opacity-80">Coming soon</span>
                ) : isSelected ? (
                  <span className="inline-flex items-center gap-1 text-base font-medium leading-snug">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Selected
                  </span>
                ) : null}
              </span>
            </button>
          )
        })}
      </nav>

      {activeItem ? (
        <MethodPreview
          item={activeItem}
          isSelected={selectedId === activeItem.id}
          onPick={onPick}
          ctaLabel={ctaLabel}
          reselectLabel={reselectLabel}
          showHeader
          className="p-6"
        />
      ) : null}
    </div>
  )
}

function MethodPreview({
  item,
  isSelected,
  onPick,
  ctaLabel,
  reselectLabel,
  showHeader,
  className,
}: {
  item: MethodPickerItem
  isSelected: boolean
  onPick: (id: string) => void
  ctaLabel: string
  reselectLabel: string
  showHeader: boolean
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {showHeader && (
        <div className="flex items-center gap-3">
          <MethodTile icon={item.icon} size="lg" />
          <h3 className="text-xl font-bold leading-tight tracking-tight text-secondary-brand">{item.title}</h3>
        </div>
      )}
      <div className="flex gap-6 items-start">
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          <p className="text-base leading-relaxed">{item.longDescription}</p>
          {item.helperText && (
            <div className="rounded-lg border bg-card p-4">
              <p className="text-base leading-relaxed">{item.helperText}</p>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-base">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>About {item.estimatedMinutes} minutes</span>
          </div>
          <div>
            <Button
              type="button"
              onClick={() => onPick(item.id)}
              disabled={!item.enabled}
              className="gap-2"
            >
              {isSelected ? reselectLabel : ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {showHeader && item.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.image.src}
            alt={item.image.alt}
            className={cn("w-72 aspect-[4/3] object-cover shrink-0 rounded-lg", item.image.position ?? "object-center")}
          />
        )}
      </div>
    </div>
  )
}

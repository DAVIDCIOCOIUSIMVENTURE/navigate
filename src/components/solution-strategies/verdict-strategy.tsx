"use client"

import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useSolution } from "@/app/(app)/solutions/[solutionId]/validate/context"
import type { ValidationStatus } from "@/types/validation"
import { CheckCircle2, HelpCircle, XCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type VerdictKey = "valid" | "unsure" | "invalid"

const VERDICT_OPTIONS: { value: VerdictKey; label: string; icon: LucideIcon; color: string; dotColor: string }[] = [
  {
    value: "valid",
    label: "Valid: Worth Pursuing",
    icon: CheckCircle2,
    color: "text-success border-success bg-success-foreground",
    dotColor: "border-success bg-success",
  },
  {
    value: "unsure",
    label: "Unsure: Needs More Evidence",
    icon: HelpCircle,
    color: "text-tertiary border-tertiary bg-tertiary-foreground",
    dotColor: "border-tertiary bg-tertiary",
  },
  {
    value: "invalid",
    label: "Invalid: Not Worth Pursuing",
    icon: XCircle,
    color: "text-destructive border-destructive bg-destructive-foreground",
    dotColor: "border-destructive bg-destructive",
  },
]

export const VERDICT_GUIDANCE: string[] = [
  "Look at the spread of scores, not just the average. A single very low score on impact or feasibility can sink an otherwise promising solution.",
  "Strong valids tend to combine high impact with achievable feasibility, manageable cost, and reasonable time. Strong invalids fail on impact or stack two or more weak metrics.",
  "If the scores are mixed and you can name what would tip the decision, you're in \"unsure\" territory. Capture the open question rather than forcing a verdict.",
  "Pressure-test extremes. Optimism bias inflates impact; pessimism inflates cost. Ask what evidence each score is built on.",
  "A slow or expensive solution can still be valid when the impact is large and the alternatives are worse. Don't reject big bets just because they're hard.",
]

/**
 * Editable verdict block: optional reasoning textarea plus three radio-style
 * verdict buttons. Reused by the verdict step page, the hub, and (in
 * readOnly mode) the validation summary.
 */
export function VerdictStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const { validationStatus, setValidationStatus, validationReason, setValidationReason } = useSolution()

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const currentKey = (["valid", "unsure", "invalid"] as const).includes(validationStatus as VerdictKey)
    ? (validationStatus as VerdictKey)
    : null

  const hasVerdict = currentKey !== null
  const reasonText = validationReason ?? ""

  if (readOnly && !hasVerdict && !reasonText.trim()) {
    return (
      <div className="bg-secondary-brand rounded-xl p-8">
        <p className="text-sm text-white/70 italic">No verdict captured.</p>
      </div>
    )
  }

  const handleChoose = (key: VerdictKey) => {
    setValidationStatus(key as ValidationStatus)
  }

  return (
    <div className="rounded-xl bg-primary p-8 flex flex-col gap-5">
      {!readOnly && (
        <div className="flex flex-col gap-3">
          <p className="text-base font-medium text-white">How to weigh your scores</p>
          <ul className="flex flex-col gap-2">
            {VERDICT_GUIDANCE.map((g) => (
              <li key={g} className="text-sm text-white flex items-start gap-2">
                <span className="text-white/50 mt-0.5">&bull;</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(!readOnly || reasonText) && (
        <div className={cn("flex flex-col gap-2", !readOnly && "pt-2 border-t border-white/20")}>
          <p className="text-base font-medium text-white">Reasoning{!readOnly && " (optional)"}</p>
          <Textarea
            rows={3}
            placeholder="Capture the thinking behind your verdict. What clinched it? What would change your mind?"
            value={reasonText}
            onChange={(e) => setValidationReason(e.target.value)}
            readOnly={readOnly}
            className="resize-none text-base focus-visible:ring-1 bg-white border-white text-foreground read-only:cursor-default"
          />
        </div>
      )}

      {(!readOnly || hasVerdict) && (
        <div className={cn("flex flex-col gap-3", !readOnly && "pt-2 border-t border-white/20")}>
          <p className="text-base font-medium text-white">Your verdict</p>
          {VERDICT_OPTIONS.filter((option) => !readOnly || (mounted && currentKey === option.value)).map((option) => {
            const Icon = option.icon
            const selected = mounted && currentKey === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => { if (!readOnly) handleChoose(option.value) }}
                aria-pressed={selected}
                disabled={readOnly}
                className={cn(
                  "flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all",
                  readOnly && "cursor-default",
                  selected
                    ? option.color
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors",
                  selected ? option.dotColor : "border-white/50",
                )}>
                  {selected && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-base font-medium">{option.label}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

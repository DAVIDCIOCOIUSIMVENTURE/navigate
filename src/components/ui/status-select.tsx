"use client"

import { CheckCircle2, HelpCircle, XCircle, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ValidationStatus } from "@/types/validation"

const STATUS_OPTIONS: { value: ValidationStatus; label: string; icon: React.ElementType; iconClass: string }[] = [
  { value: "unvalidated", label: "Not validated", icon: Clock,        iconClass: "text-muted-foreground" },
  { value: "valid",       label: "Valid",         icon: CheckCircle2, iconClass: "text-success" },
  { value: "unsure",      label: "Unsure",        icon: HelpCircle,   iconClass: "text-tertiary" },
  { value: "invalid",     label: "Invalid",       icon: XCircle,      iconClass: "text-destructive" },
]

export function StatusSelect({ status, setStatus }: { status: ValidationStatus; setStatus: (v: ValidationStatus) => void }) {
  const current = STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0]
  const CurrentIcon = current.icon
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor="validation-status">
        Validation Status
      </label>
      <Select value={status} onValueChange={(v) => setStatus(v as ValidationStatus)}>
        <SelectTrigger id="validation-status" className="bg-white">
          <SelectValue>
            <span className="flex items-center gap-1.5">
              <CurrentIcon className={`h-3.5 w-3.5 shrink-0 ${current.iconClass}`} />
              {current.label}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(({ value, label, icon: Icon, iconClass }) => (
            <SelectItem key={value} value={value}>
              <span className="flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} />
                {label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

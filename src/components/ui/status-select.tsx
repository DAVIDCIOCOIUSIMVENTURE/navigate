"use client"

import { CheckCircle2, HelpCircle, XCircle, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ValidationStatus } from "@/types/idea"

const STATUS_OPTIONS: { value: ValidationStatus; label: string; icon: React.ElementType; iconClass: string }[] = [
  { value: "unvalidated", label: "Not validated", icon: Clock,        iconClass: "text-muted-foreground" },
  { value: "valid",       label: "Valid",         icon: CheckCircle2, iconClass: "text-green-600" },
  { value: "unsure",      label: "Unsure",        icon: HelpCircle,   iconClass: "text-orange-500" },
  { value: "invalid",     label: "Invalid",       icon: XCircle,      iconClass: "text-red-500" },
]

export function StatusSelect({ status, setStatus }: { status: ValidationStatus; setStatus: (v: ValidationStatus) => void }) {
  const current = STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0]
  const CurrentIcon = current.icon
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Validation Status</span>
      <Select value={status} onValueChange={(v) => setStatus(v as ValidationStatus)}>
        <SelectTrigger className="h-8 w-40 bg-white text-xs font-medium">
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

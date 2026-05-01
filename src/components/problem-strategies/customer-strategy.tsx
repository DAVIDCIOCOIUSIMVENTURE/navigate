"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useProblemValidation } from "@/app/(app)/problems/[problemRef]/validation/context"

export function CustomerStrategy({ readOnly = false }: { readOnly?: boolean }) {
  const { segmentSize, setSegmentSize, customerDescription, setCustomerDescription } = useProblemValidation()

  if (readOnly && segmentSize === null && !customerDescription.trim()) {
    return (
      <div className="bg-primary rounded-xl p-8">
        <p className="text-sm text-white/70 italic">No customer details captured.</p>
      </div>
    )
  }

  return (
    <div className="bg-primary rounded-xl p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="customer-description" className="text-sm font-medium text-white">
            Describe your customer
          </label>
          <Textarea
            id="customer-description"
            placeholder="e.g. Early-career freelance designers (1-3 years experience) in the UK who struggle to price their work competitively..."
            value={customerDescription}
            onChange={(e) => setCustomerDescription(e.target.value)}
            rows={3}
            readOnly={readOnly}
            className="text-md bg-white border-white text-foreground read-only:cursor-default"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="segment-size" className="text-sm font-medium text-white">
            Estimated number of people affected
          </label>
          <Input
            id="segment-size"
            type="number"
            min={0}
            placeholder="e.g. 500000"
            value={segmentSize ?? ""}
            onChange={(e) => {
              const val = e.target.value
              setSegmentSize(val === "" ? null : Number(val))
            }}
            readOnly={readOnly}
            className="text-md h-9 max-w-xs bg-white border-white text-foreground read-only:cursor-default"
          />
          {!readOnly && (
            <p className="text-sm text-white/70 mt-1">
              An order-of-magnitude estimate is fine: thousands, hundreds of thousands, or millions.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

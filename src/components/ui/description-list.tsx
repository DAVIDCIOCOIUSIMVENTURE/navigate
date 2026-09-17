import { cn } from "@/lib/utils"

/**
 * A list of label / value pairs rendered as a real `<dl>`, so assistive
 * technology announces each value together with the label it belongs to
 * rather than as two loose pieces of text. Each pair reads "label: value"
 * with the two sitting next to each other rather than pushed to opposite
 * ends of the row. Wrapping each pair in a `<div>` inside the `<dl>` is
 * valid HTML and is what lets a row carry its own surface.
 *
 * Use it wherever a card lists "name: value" facts (the solution canvas
 * metrics, for example) instead of hand-rolling a flex row.
 */
export function DescriptionList({
  columns = 1,
  className,
  children,
}: {
  /** Lay the pairs out in two columns once there is room for them. */
  columns?: 1 | 2
  className?: string
  children: React.ReactNode
}) {
  return (
    <dl className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2 sm:gap-x-3", className)}>
      {children}
    </dl>
  )
}

export function DescriptionItem({
  term,
  empty,
  className,
  children,
}: {
  term: React.ReactNode
  /** Fade the value where nothing has been captured yet. */
  empty?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex items-baseline gap-2 rounded-lg bg-muted/60 px-3 py-2", className)}>
      <dt>{term}:</dt>
      <dd className={cn(empty ? "italic opacity-60" : "font-medium")}>{children}</dd>
    </div>
  )
}

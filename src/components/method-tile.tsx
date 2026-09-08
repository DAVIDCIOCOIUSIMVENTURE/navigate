import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type MethodTileSize = "sm" | "md" | "lg"

const SIZES: Record<MethodTileSize, { tile: string; icon: string }> = {
  sm: { tile: "w-7 h-7 rounded-md", icon: "h-4 w-4" },
  md: { tile: "w-9 h-9 rounded-md", icon: "h-4 w-4" },
  lg: { tile: "w-10 h-10 rounded-lg", icon: "h-5 w-5" },
}

type MethodTileProps = React.HTMLAttributes<HTMLSpanElement> & {
  icon: LucideIcon
  size?: MethodTileSize
}

/**
 * Icon tile for an identify / discovery method (Reflect lenses, Research
 * methods, the identify hubs and the discovery / refinement tool pickers).
 * Light glyph on a solid cobalt secondary-brand tile, the method counterpart
 * of the primary `CardTitle` tile. Decorative by default; pass an
 * `aria-label` when the tile is the only place the method name appears.
 */
export function MethodTile({ icon: Icon, size = "md", className, ...props }: MethodTileProps) {
  const sizes = SIZES[size]
  return (
    <span
      aria-hidden={props["aria-label"] ? undefined : true}
      className={cn("flex items-center justify-center shrink-0 bg-secondary-brand", sizes.tile, className)}
      {...props}
    >
      <Icon className={cn("text-secondary-brand-foreground [stroke-width:2.5]", sizes.icon)} />
    </span>
  )
}

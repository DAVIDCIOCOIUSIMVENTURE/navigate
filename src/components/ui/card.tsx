import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

type CardEyebrowProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ElementType
}

const CardEyebrow = React.forwardRef<HTMLDivElement, CardEyebrowProps>(
  ({ className, icon: Icon, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-1.5 mb-1", className)}
      {...props}
    >
      {Icon && <Icon className="h-3 w-3 text-muted-foreground shrink-0" />}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {children}
      </p>
    </div>
  )
)
CardEyebrow.displayName = "CardEyebrow"

type CardTitleSize = "sm" | "md" | "lg"

const cardTitleSizes: Record<CardTitleSize, { root: string; tile: string; icon: string }> = {
  sm: { root: "gap-2 text-base", tile: "w-7 h-7 rounded-md", icon: "h-3.5 w-3.5" },
  md: { root: "gap-2 text-lg", tile: "w-8 h-8 rounded-md", icon: "h-4 w-4" },
  lg: { root: "gap-2.5 text-2xl", tile: "w-10 h-10 rounded-lg", icon: "h-5 w-5" },
}

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  icon?: React.ElementType
  size?: CardTitleSize
  as?: "h1" | "h2" | "h3" | "h4"
}

/**
 * Page and card heading. Renders in the primary colour with the optional icon
 * drawn light on a solid primary tile, with a slightly heavier stroke than
 * lucide's default so it holds up at small sizes. This is the one title treatment used
 * across the app; section navs mirror it for their active row via
 * `src/lib/nav-item-styles.ts`.
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, icon: Icon, size = "lg", as: Tag = "h2", children, ...props }, ref) => {
    const sizes = cardTitleSizes[size]
    return (
      <Tag
        ref={ref}
        className={cn(
          "flex items-center font-bold leading-none tracking-tight text-primary",
          sizes.root,
          className
        )}
        {...props}
      >
        {Icon && (
          <div className={cn("flex items-center justify-center shrink-0 bg-primary", sizes.tile)}>
            <Icon className={cn("text-primary-foreground [stroke-width:2.5]", sizes.icon)} />
          </div>
        )}
        {children}
      </Tag>
    )
  }
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardEyebrow, CardDescription, CardContent }

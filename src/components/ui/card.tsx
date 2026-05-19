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

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  icon?: React.ElementType
  iconBg?: string
  as?: "h1" | "h2" | "h3" | "h4"
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, icon: Icon, iconBg = "bg-tertiary", as: Tag = "h2", children, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        "flex items-center gap-2.5 text-2xl font-bold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {Icon && (
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg shrink-0", iconBg)}>
          <Icon className="h-5 w-5 text-tertiary-foreground" />
        </div>
      )}
      {children}
    </Tag>
  )
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

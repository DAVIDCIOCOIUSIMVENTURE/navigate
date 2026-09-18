"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      closeButton
      className="toaster group [&_[data-close-button]]:!absolute [&_[data-close-button]]:!right-2 [&_[data-close-button]]:!top-2 [&_[data-close-button]]:!left-auto [&_[data-close-button]]:!transform-none [&_[data-close-button]]:!border-0 [&_[data-close-button]]:!bg-transparent"
      style={
        {
          "--normal-bg": "hsl(var(--popover))",
          "--normal-text": "hsl(var(--popover-foreground))",
          "--normal-border": "hsl(var(--border))",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

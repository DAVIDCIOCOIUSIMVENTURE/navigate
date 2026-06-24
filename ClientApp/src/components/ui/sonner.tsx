"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      closeButton
      className="toaster group [&_[data-close-button]]:!absolute [&_[data-close-button]]:!right-2 [&_[data-close-button]]:!top-2 [&_[data-close-button]]:!left-auto [&_[data-close-button]]:!transform-none [&_[data-close-button]]:!border-0 [&_[data-close-button]]:!bg-transparent"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

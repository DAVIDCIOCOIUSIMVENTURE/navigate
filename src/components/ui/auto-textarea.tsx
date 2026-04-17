"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, type ComponentProps } from "react"
import { cn } from "@/lib/utils"

const AutoTextarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea">>(
  ({ className, value, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLTextAreaElement>(null)
    useImperativeHandle(forwardedRef, () => innerRef.current as HTMLTextAreaElement)

    const resize = useCallback(() => {
      const el = innerRef.current
      if (!el) return
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }, [])

    useLayoutEffect(() => {
      resize()
    }, [value, resize])

    useEffect(() => {
      const el = innerRef.current
      if (!el || typeof ResizeObserver === "undefined") return
      let lastWidth = el.clientWidth
      const observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? el.clientWidth
        if (width !== lastWidth) {
          lastWidth = width
          resize()
        }
      })
      observer.observe(el)
      return () => observer.disconnect()
    }, [resize])

    return (
      <textarea
        ref={innerRef}
        rows={1}
        value={value}
        className={cn(
          "flex w-full min-h-7 resize-none overflow-hidden rounded-md border border-input bg-transparent px-3 py-1 text-md leading-5 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
AutoTextarea.displayName = "AutoTextarea"

export { AutoTextarea }

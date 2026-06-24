"use client"

import { createContext, useContext, useEffect, useState, type RefObject } from "react"

export type ContainerSize = "narrow" | "medium" | "wide"

const NARROW_MAX = 640
const MEDIUM_MAX = 1024

function widthToSize(width: number): ContainerSize {
    if (width < NARROW_MAX) return "narrow"
    if (width < MEDIUM_MAX) return "medium"
    return "wide"
}

const ContainerSizeContext = createContext<ContainerSize>("wide")

export { ContainerSizeContext }

export function useContainerSize(): ContainerSize {
    return useContext(ContainerSizeContext)
}

export function useObserveContainerSize(ref: RefObject<HTMLElement | null>): ContainerSize {
    const [size, setSize] = useState<ContainerSize>("wide")

    useEffect(() => {
        const el = ref.current
        if (!el) return
        setSize(widthToSize(el.clientWidth))
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (!entry) return
            setSize(widthToSize(entry.contentRect.width))
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [ref])

    return size
}

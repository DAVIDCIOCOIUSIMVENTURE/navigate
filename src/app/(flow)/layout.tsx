"use client"

import { useEffect, useRef } from "react"
import { AppStoreProvider } from "@/store/provider"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { ContainerSizeContext, useObserveContainerSize } from "@/context/container-size-context"
import { Toaster } from "@/components/ui/sonner"

function StoreInit() {
  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    dispatch.settings.init()
    dispatch.selfDiscoveryItems.init()
    dispatch.customBrainstormItems.init()
    dispatch.problems.init()
    dispatch.accountSettings.init()
    dispatch.solutions.init()
    dispatch.solutionWorkspaces.init()
    dispatch.notes.init()
  }, [dispatch.settings, dispatch.selfDiscoveryItems, dispatch.customBrainstormItems, dispatch.problems, dispatch.accountSettings, dispatch.solutions, dispatch.solutionWorkspaces, dispatch.notes])
  return null
}

function ContainerSizeRoot({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const size = useObserveContainerSize(ref)
  return (
    <div ref={ref} className="flex min-h-svh w-full flex-col bg-gray-100">
      <ContainerSizeContext.Provider value={size}>
        {children}
      </ContainerSizeContext.Provider>
    </div>
  )
}

export default function FlowGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppStoreProvider>
      <StoreInit />
      <ContainerSizeRoot>{children}</ContainerSizeRoot>
      <Toaster />
    </AppStoreProvider>
  )
}

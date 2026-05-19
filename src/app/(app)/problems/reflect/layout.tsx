"use client"

import { type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, PanelLeft, PanelTop } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { useFocusChrome } from "@/context/focus-chrome-context"
import { getReflectLens } from "@/data/reflectLenses"
import {
  getReflectNavItems,
  type ReflectNavItem,
} from "./[lensId]/context"
import { LensStepper, LensMobileStepper } from "@/components/reflect/lens-stepper"
import { useContainerSize } from "@/context/container-size-context"

const HUB_PATH = "/problems/reflect"

function getLensStep(
  pathname: string
): { lensId: string; activeIdx: number; navItems: readonly ReflectNavItem[] } | null {
  const segments = pathname.split("/").filter(Boolean)
  if (segments[0] !== "problems" || segments[1] !== "reflect" || !segments[2]) {
    return null
  }
  const lensId = segments[2]
  const lens = getReflectLens(lensId)
  if (!lens) return null
  const navItems = getReflectNavItems(lens)
  const stepPath = segments[3]
  const activeIdx = stepPath
    ? navItems.findIndex((item) => item.path === stepPath)
    : -1
  return { lensId, activeIdx, navItems }
}

export default function ReflectLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { toggleSidebar } = useSidebar()
    const { revealTopNav } = useFocusChrome()
    const isWide = useContainerSize() === "wide"

    const isHub = pathname === HUB_PATH
    const lensStep = getLensStep(pathname)
    const handleExit = () => {
        router.push(isHub ? "/problems" : HUB_PATH)
    }

    const chromeTriggers = (
        <div className="flex items-center gap-1 shrink-0">
            <Button
                variant="outline"
                size="icon"
                onClick={toggleSidebar}
                aria-label="Toggle app menu"
                title="App menu"
            >
                <PanelLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={revealTopNav}
                aria-label="Show top bar"
                title="Top bar"
            >
                <PanelTop className="h-4 w-4" />
            </Button>
        </div>
    )

    return (
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
            <Card className="sticky top-0 z-20 shrink-0">
                <CardContent className="flex items-center gap-3 flex-wrap p-3">
                    <Button variant="primary-outline" onClick={handleExit} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    {chromeTriggers}
                    {lensStep && (
                        <div className="flex-1 min-w-[16rem]">
                            {isWide ? (
                                <LensStepper
                                    navItems={lensStep.navItems}
                                    activeIdx={lensStep.activeIdx}
                                    lensId={lensStep.lensId}
                                />
                            ) : (
                                <LensMobileStepper
                                    navItems={lensStep.navItems}
                                    activeIdx={lensStep.activeIdx}
                                    lensId={lensStep.lensId}
                                />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="flex flex-col min-w-0">
                {children}
            </div>
        </div>
    )
}

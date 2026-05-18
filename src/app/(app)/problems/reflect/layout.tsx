"use client"

import { type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, PanelLeft, PanelTop, Telescope } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { useFocusChrome } from "@/context/focus-chrome-context"

const HUB_PATH = "/problems/reflect"

export default function ReflectLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { toggleSidebar } = useSidebar()
    const { revealTopNav } = useFocusChrome()

    const isHub = pathname === HUB_PATH
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
                    <h1 className="flex items-center gap-2 text-xl font-bold min-w-0">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary-brand shrink-0" aria-hidden="true">
                            <Telescope className="h-4 w-4 text-secondary-brand-foreground" />
                        </span>
                        <span className="truncate">Reflect on Problems</span>
                    </h1>
                </CardContent>
            </Card>
            <div className="flex flex-col min-w-0">
                {children}
            </div>
        </div>
    )
}

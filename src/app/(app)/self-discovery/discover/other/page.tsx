"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { SELF_DISCOVERY_CATEGORIES, SELF_DISCOVERY_CATEGORY_ICON_BG } from "@/data/selfDiscoveryData"
import type { CustomBrainstormItem } from "@/store/custom-brainstorm-items-model"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function OtherCategoryPage() {
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const size = useContainerSize()
    const roomy = size !== "narrow"

    const items = useSelector((state: RootState) => state.customBrainstormItems.byColumn.you ?? [])
    const allProblems = useSelector((state: RootState) => state.problems.problems)

    const [draft, setDraft] = useState("")
    const [pendingDelete, setPendingDelete] = useState<CustomBrainstormItem | null>(null)
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    const referencingProblemsCount = pendingDelete
        ? allProblems.filter((p) => p.you?.includes(pendingDelete.id)).length
        : 0

    const Icon = getSelfDiscoveryCategoryIcon("other")!

    const handleAdd = () => {
        const trimmed = draft.trim()
        if (!trimmed) return
        dispatch.customBrainstormItems.create({ columnId: "you", label: trimmed })
        setDraft("")
    }

    const handleDelete = (id: string) => {
        dispatch.customBrainstormItems.removeItem({ columnId: "you", id })
        setPendingDelete(null)
    }

    const handleBack = () => {
        const lastCategory = SELF_DISCOVERY_CATEGORIES[SELF_DISCOVERY_CATEGORIES.length - 1]
        if (lastCategory) {
            const lastQuestion = lastCategory.questions[lastCategory.questions.length - 1]
            if (lastQuestion) {
                router.push(`/self-discovery/discover/${lastCategory.url}/${lastQuestion.url}`)
                return
            }
            router.push(`/self-discovery/discover/${lastCategory.url}`)
            return
        }
        router.push("/self-discovery/discover")
    }

    const handleNext = () => {
        router.push("/self-discovery")
    }

    if (!mounted) {
        return <Card className="w-full flex-1">
            <CardContent className="flex p-8 w-full flex-1 flex-col gap-4">Loading...</CardContent>
        </Card>
    }

    return (
        <>
            <Card className="w-full h-full flex flex-col overflow-hidden">
                <CardHeader className={cn("pb-0 shrink-0", roomy ? "px-10 pt-10" : "px-6 pt-6")}>
                    <CardTitle icon={Icon} iconBg={SELF_DISCOVERY_CATEGORY_ICON_BG["other"] ?? "bg-primary"}>Other</CardTitle>
                </CardHeader>
                <CardContent className={cn("flex-1 min-h-0 flex flex-col overflow-y-auto", roomy ? "p-10 pt-6" : "p-6 pt-4")}>
                    <div className="flex flex-col gap-5 flex-1 min-h-0">
                        <div className="shrink-0">
                            <p className="text-base text-foreground">
                                Use this section for items you&apos;ve added that don&apos;t fit the categories above.
                                Anything you add here will appear under &ldquo;Your items&rdquo; in the brainstorm You column.
                            </p>
                        </div>
                        {items.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm"
                                    >
                                        <span className="flex-1">{item.label}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setPendingDelete(item)}
                                            className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2 shrink-0">
                            <Input
                                placeholder="Add your own..."
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        handleAdd()
                                    }
                                }}
                                className="text-sm h-9"
                            />
                            <Button onClick={handleAdd} size="sm" className="gap-1.5" disabled={!draft.trim()}>
                                <Plus className="h-3.5 w-3.5" />
                                Add
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className={cn("shrink-0 flex justify-between", roomy ? "px-10 pb-6 pt-0" : "px-6 pb-4 pt-0")}>
                    <Button variant="primary-outline" onClick={handleBack}>Previous</Button>
                    <Button onClick={handleNext}>Done</Button>
                </CardFooter>
            </Card>

            <Dialog open={!!pendingDelete} onOpenChange={() => setPendingDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete this item?</DialogTitle>
                        <DialogDescription>
                            {referencingProblemsCount > 0
                                ? `This item is referenced by ${referencingProblemsCount} saved problem${referencingProblemsCount === 1 ? "" : "s"}. Those problems will keep the reference and show "(deleted item)" in its place. This action cannot be undone.`
                                : "Are you sure you want to delete this item? This action cannot be undone."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPendingDelete(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => pendingDelete && handleDelete(pendingDelete.id)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

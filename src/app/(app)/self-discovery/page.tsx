"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  Compass,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { SelfDiscoveryItem } from "@/store/self-discovery-items-model"
import type { CustomBrainstormItem } from "@/store/custom-brainstorm-items-model"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

const FLOW_BASE = "/self-discovery/discover"

type PendingDelete =
  | { kind: "self-discovery"; item: SelfDiscoveryItem }
  | { kind: "custom-you"; item: CustomBrainstormItem }
  | null

function CategorySection({
  title,
  description,
  Icon,
  count,
  ctaUrl,
  router,
  children,
}: {
  title: string
  description?: string
  Icon: LucideIcon
  count: number
  ctaUrl: string
  router: ReturnType<typeof useRouter>
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex items-center justify-center w-9 h-9 rounded-md bg-primary shrink-0">
            <Icon className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground tabular-nums">
            {count} {count === 1 ? "item" : "items"}
          </span>
          <Button variant="outline" size="sm" onClick={() => router.push(ctaUrl)}>
            {count === 0 ? "Start" : "Edit"}
          </Button>
        </div>
      </div>
      {children}
    </section>
  )
}

export default function SelfDiscoveryPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [mounted, setMounted] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null)
  const isWide = useContainerSize() === "wide"

  const selfDiscoveryAnswers = useSelector((state: RootState) => state.selfDiscoveryItems.items)
  const customYouItems = useSelector((state: RootState) => state.customBrainstormItems.byColumn.you ?? [])
  const allProblems = useSelector((state: RootState) => state.problems.problems)

  useEffect(() => { setMounted(true) }, [])

  const totalItems = mounted ? selfDiscoveryAnswers.length + customYouItems.length : 0

  const referencingProblemsCount = useMemo(() => {
    if (!pendingDelete) return 0
    const id = pendingDelete.item.id
    return allProblems.filter((p) => p.you?.includes(id)).length
  }, [pendingDelete, allProblems])

  const confirmDelete = () => {
    if (!pendingDelete) return
    if (pendingDelete.kind === "self-discovery") {
      dispatch.selfDiscoveryItems.removeItem(pendingDelete.item.id)
    } else {
      dispatch.customBrainstormItems.removeItem({ columnId: "you", id: pendingDelete.item.id })
    }
    setPendingDelete(null)
  }

  return (
    <div className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
      <Card>
        <CardContent className="py-4 flex flex-wrap items-center gap-4">
          <p className="flex-1 min-w-[16rem] text-base leading-relaxed">
            This is your <span className="font-bold">self discovery library</span>, a place to capture what you bring to a venture: your strengths, interests, and lived experiences. Use the journey to add insights, then bring them into the Problems section as triggers.
          </p>
          <Button onClick={() => router.push(FLOW_BASE)} className="gap-2 shrink-0">
            <ArrowRight className="h-4 w-4" />
            {totalItems > 0 ? "Continue Self Discovery" : "Start Self Discovery"}
          </Button>
        </CardContent>
      </Card>

      {!mounted || totalItems === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary">
            <Compass className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center flex flex-col gap-2 max-w-sm">
            <h2 className="text-lg font-semibold">No items yet</h2>
            <p className="text-sm text-muted-foreground">
              Start the self discovery journey to add insights about your strengths, interests, and experiences.
            </p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => router.push(FLOW_BASE)}>
            <ArrowRight className="h-4 w-4" />
            Start Self Discovery
          </Button>
        </div>
      ) : (
        <Card className={cn("flex flex-col", isWide ? "flex-1 min-h-0" : "min-h-[320px] max-h-[640px]")}>
          <CardContent className="p-6 flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto">
            {SELF_DISCOVERY_CATEGORIES.map((category) => {
              const Icon = getSelfDiscoveryCategoryIcon(category.url) ?? Compass
              const itemsForCategory = category.questions.flatMap((q) =>
                selfDiscoveryAnswers
                  .filter((t) => t.questionUrl === q.url)
                  .map((t) => ({ ...t, questionTitle: q.title, questionUrl: q.url }))
              )
              return (
                <CategorySection
                  key={category.url}
                  title={category.title}
                  description={category.description}
                  Icon={Icon}
                  count={itemsForCategory.length}
                  ctaUrl={`${FLOW_BASE}/${category.url}`}
                  router={router}
                >
                  {itemsForCategory.length > 0 && (
                    <div className="flex flex-col gap-3 pl-12">
                      {category.questions.map((question) => {
                        const questionItems = itemsForCategory.filter((i) => i.questionUrl === question.url)
                        if (questionItems.length === 0) return null
                        return (
                          <div key={question.url} className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={() => router.push(`${FLOW_BASE}/${category.url}/${question.url}`)}
                              className="text-sm text-muted-foreground hover:text-primary text-left"
                            >
                              {question.title}
                            </button>
                            <div className="flex flex-wrap gap-2">
                              {questionItems.map((trigger) => (
                                <div
                                  key={trigger.id}
                                  className="flex items-center gap-2 bg-muted rounded-md px-3 py-1.5 text-sm"
                                >
                                  <span>{trigger.title}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                    onClick={() => setPendingDelete({ kind: "self-discovery", item: trigger })}
                                    aria-label={`Delete ${trigger.title}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CategorySection>
              )
            })}

            <CategorySection
              title="Other"
              description="Items you've added that don't fit the categories above."
              Icon={getSelfDiscoveryCategoryIcon("other") ?? Plus}
              count={customYouItems.length}
              ctaUrl={`${FLOW_BASE}/other`}
              router={router}
            >
              {customYouItems.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-12">
                  {customYouItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-muted rounded-md px-3 py-1.5 text-sm"
                    >
                      <span>{item.label}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 text-muted-foreground hover:text-foreground"
                        onClick={() => setPendingDelete({ kind: "custom-you", item })}
                        aria-label={`Delete ${item.label}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CategorySection>
          </CardContent>
        </Card>
      )}

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
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

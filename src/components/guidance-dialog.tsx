"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GuidanceItem {
  id: string
  title: string
  content: React.ReactNode
}

const guidanceItems: GuidanceItem[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Welcome to Navigate</h3>
        <p>This guide will help you get started with using Navigate effectively.</p>
        <div className="space-y-2">
          <h4 className="font-medium">Key Features:</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Self Discovery - Explore your personal journey</li>
            <li>Problem Discovery - Identify and analyze challenges</li>
            <li>Problem Trigger Buckets - Capture and organize your ideas</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "self-discovery",
    title: "Self Discovery",
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Self Discovery</h3>
        <p className="text-sm text-muted-foreground">
          Self Discovery is the starting point of the innovation journey. Its purpose is to help you surface
          areas of personal resonance, problems or domains worth exploring, before committing to a specific
          direction. Rather than jumping straight to a solution, you first look inward: your background,
          experiences, frustrations, and goals.
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium">What you are presented with</h4>
            <p className="text-sm text-muted-foreground mt-1">
              A series of guided questions organised into categories, for example, your professional background,
              areas of daily frustration, causes you care about, or markets you are familiar with. Each category
              focuses on a different lens through which to view potential opportunities.
            </p>
          </div>
          <div>
            <h4 className="font-medium">What to do</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Work through each question at your own pace. For each one, enter short, honest answers; these
              become <span className="font-medium text-foreground">problem triggers</span>: seeds of areas that
              might be worth investigating further. You can add multiple answers per question and return to update
              them as your thinking evolves.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Some questions include suggestion exercises to help you generate ideas if you are unsure where to start.
              Use them as prompts, not constraints.
            </p>
          </div>
          <div>
            <h4 className="font-medium">The output</h4>
            <p className="text-sm text-muted-foreground mt-1">
              At the end of the Self Discovery section you will have a collection of problem triggers visible in the
              left sidebar. These are not problems yet; they are areas of interest. You carry them into
              Problem Discovery, where you use dedicated tools to sharpen them into concrete, well-framed problems
              worth validating.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Tips</h4>
            <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground mt-1">
              <li>Be specific: &quot;healthcare admin is slow&quot; is more useful than &quot;healthcare&quot;</li>
              <li>Quantity matters at this stage; capture everything, filter later</li>
              <li>Return and update your answers as you learn more through the process</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "problem-discovery",
    title: "Problem Discovery",
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Problem Discovery</h3>
        <p className="text-sm text-muted-foreground">
          Problem Discovery is where you turn the rough areas identified in Self Discovery into concrete,
          well-framed problems worth investigating. The goal is to build a list of candidates before committing
          to validating any one of them.
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium">How it works</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Click <span className="font-medium text-foreground">Search for new problem</span> to open the
              tool selector. You can use one of the discovery tools to help you surface a problem, or define
              one directly if you already know what you want to explore.
            </p>
          </div>

          <div>
            <h4 className="font-medium">Two modes</h4>
            <p className="text-sm text-muted-foreground mt-1">
              The brainstorming tool offers two ways to work, switchable from the toggle in the top-right
              corner of the page. Choose whichever suits your thinking style; you can switch at any time
              and your progress is preserved.
            </p>
          </div>

          <div>
            <h4 className="font-medium">Problem Builder (guided mode)</h4>
            <p className="text-sm text-muted-foreground mt-1">
              The builder walks you through four steps to construct a problem systematically:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground mt-2">
              <li>
                <span className="font-medium text-foreground">Pick an element</span>: choose which
                dimension you want to start with (Customer Segment, Context, Job to Be Done, or Problem Type).
              </li>
              <li>
                <span className="font-medium text-foreground">Choose options</span>: browse and tick the
                items that resonate with you within that dimension.
              </li>
              <li>
                <span className="font-medium text-foreground">Add more elements</span>: optionally pick
                another dimension to refine the problem further, or skip straight to review. Dimensions
                you have already explored are shown with a checkmark so you can revisit them.
              </li>
              <li>
                <span className="font-medium text-foreground">Review &amp; save</span>: see all your
                selections at a glance, add an optional description, and save the problem.
              </li>
            </ol>
            <p className="text-sm text-muted-foreground mt-2">
              Your selections appear as coloured pills at the top of every step. You can remove any
              selection by clicking its <span className="font-medium text-foreground">×</span> button.
              You do not need to fill in all four dimensions; a partial combination is still useful.
            </p>
          </div>

          <div>
            <h4 className="font-medium">Canvas (freeform mode)</h4>
            <p className="text-sm text-muted-foreground mt-1">
              The canvas presents a structured four-column framework designed to help you think
              systematically about who experiences a problem, in what situation, what they are trying to do,
              and what kind of friction they face. The four columns are:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground mt-2">
              <li>
                <span className="font-medium text-foreground">Customer Segment</span>: who you are focusing on
                (e.g. early-career professionals, small business owners, parents of young children)
              </li>
              <li>
                <span className="font-medium text-foreground">Context</span>: the situation or environment in
                which the problem occurs (e.g. daily commute, managing a remote team, a life transition like
                starting a business)
              </li>
              <li>
                <span className="font-medium text-foreground">Job to Be Done</span>: the underlying goal or
                task the person is trying to accomplish (e.g. stay organised, make a confident decision,
                build a professional reputation)
              </li>
              <li>
                <span className="font-medium text-foreground">Problem Type</span>: the category of friction
                they encounter (e.g. information gaps, access and affordability, trust and safety, coordination
                overhead)
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Browse each column, tick the items that resonate with you, and click{" "}
              <span className="font-medium text-foreground">Save Problem</span> to record the combination.
              Each saved row represents one candidate problem. You can save as many as you like and come back
              to edit or remove them.
            </p>
          </div>

          <div>
            <h4 className="font-medium">Define a Problem Statement</h4>
            <p className="text-sm text-muted-foreground mt-1">
              If you already have a clear problem in mind, skip the exploration tools and write it directly.
              This is useful when you have prior knowledge of a domain or have already spoken to potential customers.
            </p>
          </div>

          <div>
            <h4 className="font-medium">What comes next</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Once you have a list of candidate problems, move on to Problem Validation to choose one and
              analyse it in depth, examining alternatives, shortcomings, emotional and quantifiable impact,
              and ultimately producing a validated problem statement.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "problem-validation",
    title: "Problem Validation",
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Problem Validation</h3>
        <p className="text-sm text-muted-foreground">
          Problem Validation is where you stress-test a candidate problem before investing in building a
          solution. The goal is not to prove the problem is valid; it is to gather enough evidence to make
          an honest, informed decision about whether it is worth pursuing.
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium">How it works</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Each problem goes through a structured sequence of steps. Work through them in order; each
              step builds on the last, but you can return and update any step as your thinking develops.
            </p>
          </div>

          <div>
            <h4 className="font-medium">Alternatives &amp; Shortcomings</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Start by listing how people currently deal with this problem: the tools, workarounds,
              or habits they already use. Then, for each alternative, note its shortcomings: what it
              fails to do well, what it costs, or what friction it introduces. This step grounds the
              problem in reality and reveals the gap your solution would need to fill.
            </p>
          </div>

          <div>
            <h4 className="font-medium">Emotional Impact</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Capture how the problem makes people feel. Emotional weight is a strong signal of whether
              a problem is genuinely painful. Frustration, anxiety, embarrassment, or helplessness all
              indicate that people care enough to want a better solution. Add as many emotional impacts
              as apply; even one strong emotion is significant.
            </p>
          </div>

          <div>
            <h4 className="font-medium">Quantifiable Impact</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Document measurable evidence of the problem&apos;s cost. Choose a category, such as time
              lost, money wasted, error rates, or customer churn, and describe the scale of the impact
              in concrete terms. Numbers and specifics matter here: &quot;two hours per week per
              employee&quot; is more compelling than &quot;wastes a lot of time&quot;.
            </p>
          </div>

          <div>
            <h4 className="font-medium">Verdict</h4>
            <p className="text-sm text-muted-foreground mt-1">
              The verdict step asks you to rate three decision factors that determine whether
              the problem represents a real opportunity:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground mt-2">
              <li>
                <span className="font-medium text-foreground">How many people</span> how large is
                the audience experiencing this problem?
              </li>
              <li>
                <span className="font-medium text-foreground">How often</span> how frequently do
                they encounter the problem?
              </li>
              <li>
                <span className="font-medium text-foreground">How much is it worth</span> how much
                would they pay or benefit from a solution?
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Set each factor to Low, Medium, or High and optionally enter a numeric estimate. A
              validation signal is calculated from these factors to guide your thinking. Then record
              your verdict: <span className="font-medium text-foreground">Valid</span>,{" "}
              <span className="font-medium text-foreground">Unsure</span>, or{" "}
              <span className="font-medium text-foreground">Invalid</span>. There is no right answer;
              the verdict is your judgement call based on the evidence in front of you.
            </p>
          </div>

          <div>
            <h4 className="font-medium">Problem Statement</h4>
            <p className="text-sm text-muted-foreground mt-1">
              The final step produces a consolidated summary of everything you have discovered. Review
              the core problem definition, including customer segment, context, job to be done, and
              problem type, alongside all the evidence you collected. You can edit any field directly
              from this view. This statement becomes the artefact you carry forward if you decide to
              pursue the problem.
            </p>
          </div>

          <div>
            <h4 className="font-medium">Tips</h4>
            <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground mt-1">
              <li>Be honest about the evidence: weak validation data is a signal, not a failure</li>
              <li>Alternatives with many shortcomings suggest a genuine gap in the market</li>
              <li>If you struggle to name emotional or quantifiable impacts, the problem may not be painful enough</li>
              <li>You can validate multiple problems and compare verdicts before committing to one</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
]

export function GuidanceDialog({
  open,
  onOpenChange,
  initialTopic,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTopic?: string
}) {
  const [selectedItem, setSelectedItem] = useState(initialTopic ?? guidanceItems[0].id)
  const dispatch = useDispatch<AppDispatch>()
  const hideBrainstormGuidance = useSelector((state: RootState) => state.settings.hideBrainstormGuidance)

  useEffect(() => {
    if (open && initialTopic) {
      setSelectedItem(initialTopic)
    }
  }, [open, initialTopic])

  // Topics that support "don't show on page load"
  const topicHasAutoOpen: Record<string, { label: string; hidden: boolean; toggle: () => void }> = {
    "problem-discovery": {
      label: "Don't show this when I open the brainstorm page",
      hidden: hideBrainstormGuidance,
      toggle: () => dispatch.settings.setHideBrainstormGuidance(!hideBrainstormGuidance),
    },
  }
  const autoOpenConfig = topicHasAutoOpen[selectedItem]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Guidance</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar */}
          <div className="w-64 border-r p-4 flex flex-col">
            <h2 className="font-semibold mb-4 shrink-0">Guidance Topics</h2>
            <ScrollArea className="flex-1">
              <div className="space-y-1">
                {guidanceItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={selectedItem === item.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedItem(item.id)}
                  >
                    {item.title}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col min-h-0 p-6">
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                {guidanceItems.find((item) => item.id === selectedItem)?.content}
              </ScrollArea>
            </div>
            {autoOpenConfig && (
              <div className="flex items-center gap-2 pt-4 border-t mt-4 shrink-0">
                <Checkbox
                  id="hide-guidance"
                  checked={autoOpenConfig.hidden}
                  onCheckedChange={() => autoOpenConfig.toggle()}
                />
                <label htmlFor="hide-guidance" className="text-sm text-muted-foreground cursor-pointer select-none">
                  {autoOpenConfig.label}
                </label>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
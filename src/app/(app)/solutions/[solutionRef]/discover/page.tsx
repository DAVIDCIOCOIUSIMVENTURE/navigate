"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useSolution, getAdjacentSteps } from "../context"
import { SCAMPER_CASE_STUDIES } from "./case-studies"
import { IMPROVE_CASE_STUDIES } from "./improve-case-studies"
import { REVERSE_CASE_STUDIES } from "./reverse-case-studies"
import { ANALOGY_CASE_STUDIES } from "./analogy-case-studies"
import type { ImprovementResponses, SolutionCandidate } from "@/types/solution"
import {
  Shuffle, RotateCcw, Globe, TrendingUp, Plus, Trash2, Pencil, Check, X,
  ArrowLeft, ArrowRight, Wind, Tv, Armchair, Package, Smartphone, Coffee,
  Home, Pizza, ShoppingBag, Utensils, Flag, Leaf, Sparkles, ShieldCheck,
  Truck, Heart, Rows3, LayoutPanelTop, Wrench, type LucideIcon,
} from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/* ── SCAMPER Form ── */

const SCAMPER_LETTER_COLORS: Record<string, string> = {
  S: "bg-red-500",
  C: "bg-orange-500",
  A: "bg-amber-500",
  M: "bg-emerald-500",
  P: "bg-cyan-500",
  E: "bg-pink-500",
  R: "bg-fuchsia-500",
}

type ScamperKey = "substitute" | "combine" | "adapt" | "modify" | "putToOtherUse" | "eliminate" | "reverse"

type ScamperPrompt = {
  key: ScamperKey
  letter: string
  title: string
  prompt: string
  color: string
  sparkQuestions: string[]
  inputPlaceholder: string
  technique?: { name: string; description: string }
}

const SCAMPER_PROMPTS: ScamperPrompt[] = [
  {
    key: "substitute",
    letter: "S",
    title: "Substitute",
    prompt: "What components, materials, or processes could you swap out? What if you replaced part of the problem?",
    color: SCAMPER_LETTER_COLORS.S,
    sparkQuestions: [
      "What materials, components, or rules could you swap out?",
      "Who else could play the role of the customer or provider?",
      "Which step could be replaced by an entirely different one?",
    ],
    inputPlaceholder: "e.g. Replace email signup with passkey login...",
    technique: {
      name: "Challenge the assumptions",
      description: "Write down the unspoken assumptions behind this step: about who, what, or how. Negate each one in turn and ask what a world without it would look like.",
    },
  },
  {
    key: "combine",
    letter: "C",
    title: "Combine",
    prompt: "Can you combine this problem with another? What if you merged two existing solutions?",
    color: SCAMPER_LETTER_COLORS.C,
    sparkQuestions: [
      "Which two features, products, or workflows could be merged?",
      "What partner, audience, or platform would amplify this?",
      "What unrelated services could you bundle together?",
    ],
    inputPlaceholder: "e.g. Bundle onboarding with the first invoice...",
    technique: {
      name: "Attribute matrix",
      description: "Choose 2 or 3 attributes of the problem (channel, audience, format). Jot 3 variations under each, then pick unlikely pairs across the columns and see what mashups appear.",
    },
  },
  {
    key: "adapt",
    letter: "A",
    title: "Adapt",
    prompt: "What else is like this? What ideas from other industries or domains could you adapt?",
    color: SCAMPER_LETTER_COLORS.A,
    sparkQuestions: [
      "What other industry has solved a similar problem?",
      "What past trend or technique could you borrow?",
      "What metaphor from another domain fits this situation?",
    ],
    inputPlaceholder: "e.g. Apply Spotify-style playlists to lesson plans...",
    technique: {
      name: "Borrow an expert's lens",
      description: "Picture someone from an unrelated craft (a chef, a choreographer, a firefighter) approaching this problem. What would their first instinct be? Apply that move here.",
    },
  },
  {
    key: "modify",
    letter: "M",
    title: "Modify",
    prompt: "What if you enlarged, shrunk, or changed the shape of the problem? What can be modified?",
    color: SCAMPER_LETTER_COLORS.M,
    sparkQuestions: [
      "What if you made it 10x bigger or 10x smaller?",
      "What if you changed the frequency, format, or tone?",
      "Which feature could be exaggerated or stripped back?",
    ],
    inputPlaceholder: "e.g. Shrink sessions from 60 to 5 minutes...",
    technique: {
      name: "Attribute dialling",
      description: "List every attribute you can name: size, speed, price, sequence, colour, tone. Crank each one to an extreme, then walk back to the most useful setting.",
    },
  },
  {
    key: "putToOtherUse",
    letter: "P",
    title: "Put to Other Use",
    prompt: "Can this problem (or its elements) be used for something else? What new purposes could emerge?",
    color: SCAMPER_LETTER_COLORS.P,
    sparkQuestions: [
      "Who outside the current audience might value this?",
      "What context shifts the use case entirely?",
      "What byproduct or leftover could become the product?",
    ],
    inputPlaceholder: "e.g. Resell idle inventory as gift bundles...",
    technique: {
      name: "Random context swap",
      description: "Drop the thing into an unrelated setting (a library, a campsite, an emergency room). Ask how it would serve there without redesigning it.",
    },
  },
  {
    key: "eliminate",
    letter: "E",
    title: "Eliminate",
    prompt: "What can you remove or simplify? What would happen if you eliminated a step entirely?",
    color: SCAMPER_LETTER_COLORS.E,
    sparkQuestions: [
      "Which steps, fields, or features add no real value?",
      "What would happen if the user did less work, or none?",
      "What constraints could be lifted without losing the point?",
    ],
    inputPlaceholder: "e.g. Remove the email field from signup...",
  },
  {
    key: "reverse",
    letter: "R",
    title: "Reverse",
    prompt: "What if you reversed the process? What if you did the opposite of what's expected?",
    color: SCAMPER_LETTER_COLORS.R,
    sparkQuestions: [
      "What is the opposite of how this works today?",
      "What if the customer initiated the action instead of you?",
      "What if the order of steps ran backwards?",
    ],
    inputPlaceholder: "e.g. Let customers price the product themselves...",
    technique: {
      name: "Flip the script",
      description: "Write the opposite of every assumption you hold about this. Treat the inversions as serious proposals, not jokes, and see which ones you can defend.",
    },
  },
]

const SCAMPER_LETTER_BY_KEY: Record<ScamperKey, string> = SCAMPER_PROMPTS.reduce(
  (acc, { key, letter }) => ({ ...acc, [key]: letter }),
  {} as Record<ScamperKey, string>
)
const SCAMPER_COLOR_BY_KEY: Record<ScamperKey, string> = SCAMPER_PROMPTS.reduce(
  (acc, { key, color }) => ({ ...acc, [key]: color }),
  {} as Record<ScamperKey, string>
)

function ScamperDimensionContent({
  dimensionKey,
  placeholder = "Type an idea and press Enter...",
}: {
  dimensionKey: ScamperKey
  placeholder?: string
}) {
  const { candidates, setCandidates } = useSolution()

  const items = candidates.filter(
    (c) => c.inspirationSource === "scamper" && c.inspirationDetail === dimensionKey
  )
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const addItem = () => {
    const text = draft.trim()
    if (text) {
      const id = candidates.length > 0 ? Math.max(...candidates.map((c) => c.id)) + 1 : 1
      const newCandidate: SolutionCandidate = {
        id,
        title: text,
        description: "",
        inspirationSource: "scamper",
        inspirationDetail: dimensionKey,
        feasibility: null,
        impact: null,
        cost: null,
        timeToImplement: null,
        notes: "",
      }
      setCandidates([...candidates, newCandidate])
    }
    setDraft("")
    setAdding(false)
  }

  const removeItem = (id: number) => {
    setCandidates(candidates.filter((c) => c.id !== id))
  }

  const updateItem = (id: number, text: string) => {
    const next = candidates.map((c) => (c.id === id ? { ...c, title: text } : c))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setCandidates(next), 500)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addItem() }
    if (e.key === "Escape") { setDraft(""); setAdding(false) }
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <Input
            defaultValue={item.title}
            onChange={(e) => updateItem(item.id, e.target.value)}
            className="flex-1 text-sm bg-white border-white text-foreground"
          />
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      {adding ? (
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={addItem}
          className="text-sm bg-white border-white text-foreground"
        />
      ) : (
        <Button variant="on-primary" className="w-full" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      )}
    </div>
  )
}

function ScamperPromptBody({
  sparkQuestions,
  technique,
  dimensionKey,
  inputPlaceholder,
}: {
  sparkQuestions: string[]
  technique?: { name: string; description: string }
  dimensionKey: ScamperKey
  inputPlaceholder: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-white/20 bg-white/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <p className="text-xs font-semibold text-white uppercase tracking-wide">Spark questions</p>
        </div>
        <ul className="flex flex-col gap-1.5">
          {sparkQuestions.map((q) => (
            <li key={q} className="text-sm text-white flex items-start gap-2">
              <span className="text-white/40 mt-0.5">&bull;</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </div>
      {technique && (
        <div className="rounded-md border border-white/20 bg-white/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-3.5 w-3.5 text-white" />
            <p className="text-xs font-semibold text-white uppercase tracking-wide">
              Try this technique: {technique.name}
            </p>
          </div>
          <p className="text-sm text-white">{technique.description}</p>
        </div>
      )}
      <ScamperDimensionContent dimensionKey={dimensionKey} placeholder={inputPlaceholder} />
    </div>
  )
}

function ScamperForm() {
  const [viewMode, setViewMode] = useState<"accordion" | "tabs">("tabs")

  return (
    <div className="bg-primary rounded-xl p-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex flex-col gap-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">SCAMPER Prompts</h4>
          <p className="text-sm text-white">Switch between accordion and tab layouts to explore the prompts the way you prefer.</p>
        </div>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => { if (v) setViewMode(v as "accordion" | "tabs") }}
          size="sm"
          className="border-white/30 bg-white/10"
        >
          <ToggleGroupItem
            value="tabs"
            aria-label="Tabs view"
            className="text-white/80 hover:bg-white/10 hover:text-white data-[state=on]:bg-white data-[state=on]:text-primary"
          >
            <LayoutPanelTop className="h-4 w-4" />
            <span className="text-xs">Tabs</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="accordion"
            aria-label="Accordion view"
            className="text-white/80 hover:bg-white/10 hover:text-white data-[state=on]:bg-white data-[state=on]:text-primary"
          >
            <Rows3 className="h-4 w-4" />
            <span className="text-xs">Accordion</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === "accordion" ? (
        <Accordion type="multiple" className="flex flex-col divide-y divide-white/20">
          {SCAMPER_PROMPTS.map(({ key, letter, title, prompt, color, sparkQuestions, inputPlaceholder, technique }) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-white/80">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${color} text-white text-xs font-bold`}>
                    {letter}
                  </span>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-semibold text-white">{title}</span>
                    <p className="text-sm text-white font-normal">{prompt}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5 pl-10">
                <ScamperPromptBody
                  sparkQuestions={sparkQuestions}
                  technique={technique}
                  dimensionKey={key}
                  inputPlaceholder={inputPlaceholder}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Tabs defaultValue={SCAMPER_PROMPTS[0].key} className="flex flex-col gap-4">
          <TabsList className="h-auto flex-wrap justify-start bg-white/10 p-1">
            {SCAMPER_PROMPTS.map(({ key, letter, title, color }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="gap-2 text-white/80 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${color} text-white text-[10px] font-bold`}>
                  {letter}
                </span>
                <span className="text-sm font-medium">{title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {SCAMPER_PROMPTS.map(({ key, letter, title, prompt, color, sparkQuestions, inputPlaceholder, technique }) => (
            <TabsContent key={key} value={key} className="mt-0">
              <div className="flex items-start gap-3 mb-4">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${color} text-white text-xs font-bold`}>
                  {letter}
                </span>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-semibold text-white">{title}</span>
                  <p className="text-sm text-white">{prompt}</p>
                </div>
              </div>
              <div className="pl-10">
                <ScamperPromptBody
                  sparkQuestions={sparkQuestions}
                  technique={technique}
                  dimensionKey={key}
                  inputPlaceholder={inputPlaceholder}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

/* ── Reverse Brainstorming Form ── */

function ReverseItemList({
  items,
  setItems,
  label,
  description,
  placeholder,
}: {
  items: { id: number; text: string }[]
  setItems: (val: { id: number; text: string }[]) => void
  label: string
  description: string
  placeholder: string
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const addItem = () => {
    const text = draft.trim()
    if (text) {
      const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1
      setItems([...items, { id, text }])
    }
    setDraft("")
    setAdding(false)
  }

  const removeItem = (id: number) => {
    setItems(items.filter((i) => i.id !== id))
  }

  const updateItem = (id: number, text: string) => {
    const next = items.map((i) => (i.id === id ? { ...i, text } : i))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setItems(next), 500)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addItem() }
    if (e.key === "Escape") { setDraft(""); setAdding(false) }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-white">{label}</label>
      <p className="text-sm text-white/80">{description}</p>

      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <Input
            defaultValue={item.text}
            onChange={(e) => updateItem(item.id, e.target.value)}
            className="flex-1 text-sm bg-white border-white text-foreground"
          />
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      {adding ? (
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={addItem}
          className="text-sm bg-white border-white text-foreground"
        />
      ) : (
        <Button variant="on-primary" className="w-full" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      )}
    </div>
  )
}

function ReverseBrainstormForm() {
  const { reverseBrainstorm, setReverseBrainstorm, reverseInversion, setReverseInversion } = useSolution()

  const brainstormItems = Array.isArray(reverseBrainstorm) ? reverseBrainstorm : []
  const inversionItems = Array.isArray(reverseInversion) ? reverseInversion : []

  return (
    <div className="bg-primary rounded-xl p-8">
      <div className="flex flex-col divide-y divide-white/20">
        <div className="py-5 first:pt-0 last:pb-0">
          <ReverseItemList
            items={brainstormItems}
            setItems={setReverseBrainstorm}
            label="How could you make this problem worse?"
            description="Think of every way to aggravate the problem. Be creative, the more outlandish the better."
            placeholder="Type a way to make it worse and press Enter..."
          />
        </div>
        <div className="py-5 first:pt-0 last:pb-0">
          <ReverseItemList
            items={inversionItems}
            setItems={setReverseInversion}
            label="Now flip each idea"
            description={'Take each "make it worse" idea above and write its opposite. These inversions often reveal strong solution ideas.'}
            placeholder="Type the flipped idea and press Enter..."
          />
        </div>
      </div>
    </div>
  )
}

/* ── Analogy Form ── */

function AnalogyForm() {
  const { analogyDomain, setAnalogyDomain, analogyInsight, setAnalogyInsight, candidates, setCandidates } = useSolution()

  const addCandidate = () => {
    const text = analogyInsight.trim()
    if (!text) return
    const id = candidates.length > 0 ? Math.max(...candidates.map((c) => c.id)) + 1 : 1
    const newCandidate: SolutionCandidate = {
      id, title: `Analogy from ${analogyDomain || "another domain"}`, description: text,
      inspirationSource: "analogy", inspirationDetail: analogyDomain,
      feasibility: null, impact: null, cost: null, timeToImplement: null, notes: "",
    }
    setCandidates([...candidates, newCandidate])
  }

  return (
    <div className="bg-primary rounded-xl p-8">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Domain / Industry</label>
          <p className="text-sm text-white/80">
            What industry or field did you draw inspiration from?
          </p>
          <Input
            value={analogyDomain}
            onChange={(e) => setAnalogyDomain(e.target.value)}
            placeholder="e.g. Aviation, Healthcare, Hospitality..."
            className="text-sm bg-white border-white text-foreground"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Insight</label>
          <p className="text-sm text-white/80">
            How does that domain handle a similar challenge? What could you borrow or adapt?
          </p>
          <Textarea
            value={analogyInsight}
            onChange={(e) => setAnalogyInsight(e.target.value)}
            placeholder="Describe the analogy and how it could apply to your problem..."
            rows={5}
            className="text-sm bg-white border-white text-foreground"
          />
        </div>
        <Button
          variant="on-primary"
          className="self-end gap-1"
          disabled={!analogyInsight.trim()}
          onClick={addCandidate}
        >
          <Plus className="h-4 w-4" />Add as Candidate
        </Button>
      </div>
    </div>
  )
}

/* ── Improvement Form ── */

type ImprovementGroup = {
  group: string
  icon: LucideIcon
  color: string
  items: { key: keyof ImprovementResponses; title: string; prompt: string; example: string }[]
}

const IMPROVEMENT_GROUPS: ImprovementGroup[] = [
  {
    group: "Product & Experience",
    icon: Sparkles,
    color: "bg-violet-500",
    items: [
      { key: "coreFunctionality", title: "Core Functionality", prompt: "How could the product solve the problem better? Think about effectiveness, reliability, durability, performance speed, accuracy, and compatibility.", example: "A food delivery app improves delivery time accuracy from +/-15 min to +/-3 min." },
      { key: "easeOfUse", title: "Ease of Use", prompt: "How could the product be simpler? Consider setup, number of steps, onboarding, navigation, intuitiveness, learning time, and accessibility.", example: "One-click checkout instead of a 6-step checkout process." },
      { key: "speedConvenience", title: "Speed & Convenience", prompt: "How could customers get value faster? Think about delivery speed, response times, wait times, self-service options, and automation.", example: "Same-day delivery instead of 3-day standard delivery." },
      { key: "qualityPerception", title: "Quality Perception", prompt: "How could the product feel more premium? Consider materials, packaging, branding, design consistency, certifications, and guarantees.", example: "Apple-style packaging that improves perceived value dramatically." },
      { key: "customisation", title: "Customisation & Personalisation", prompt: "How could the product fit each customer specifically? Think about recommendations, adjustable settings, modular options, saved preferences, and tailored communication.", example: "Spotify recommending music based on listening history." },
    ],
  },
  {
    group: "Value & Trust",
    icon: ShieldCheck,
    color: "bg-emerald-500",
    items: [
      { key: "priceValue", title: "Price Value", prompt: "How could customers perceive better value? Consider pricing, bundling, flexible payment, subscriptions, loyalty rewards, and transparent pricing.", example: "Free returns included at no extra cost." },
      { key: "trustTransparency", title: "Trust & Transparency", prompt: "How could customers trust the product more? Think about honest marketing, clear policies, visible reviews, privacy protection, data security, and warranties.", example: "Showing verified customer reviews increases purchase confidence." },
      { key: "riskReduction", title: "Risk Reduction", prompt: "How could you reduce the risk customers feel? Consider free trials, money-back guarantees, easy cancellation, no long contracts, free returns, and product demos.", example: "30-day no-questions-asked returns." },
    ],
  },
  {
    group: "Service & Delivery",
    icon: Truck,
    color: "bg-sky-500",
    items: [
      { key: "customerSupport", title: "Customer Support", prompt: "How could the support experience improve? Think about response speed, 24/7 availability, live chat, knowledge bases, complaint handling, and follow-ups.", example: "Immediate chatbot support before human escalation." },
      { key: "deliveryFulfilment", title: "Delivery & Fulfilment", prompt: "How could delivery and fulfilment improve? Consider shipping speed, flexible delivery slots, real-time tracking, eco-friendly packaging, returns process, and click-and-collect.", example: "Next-day delivery with real-time tracking instead of standard shipping." },
      { key: "availabilityAccess", title: "Availability & Access", prompt: "How could customers access the product more easily? Think about purchase channels, international availability, payment methods, offline functionality, and cross-device syncing.", example: "Accepting Apple Pay, PayPal, Klarna, and cards." },
      { key: "communication", title: "Communication", prompt: "How could communication with customers improve? Consider onboarding emails, status updates, order confirmations, delivery alerts, timelines, and reminders.", example: "SMS updates during service progress." },
    ],
  },
  {
    group: "Emotional & Social",
    icon: Heart,
    color: "bg-rose-500",
    items: [
      { key: "emotionalExperience", title: "Emotional Experience", prompt: "How could the product make customers feel better? Think about delight moments, brand personality, community, loyalty recognition, and reducing frustration.", example: "Handwritten thank-you note inside packaging." },
      { key: "socialEthicalValue", title: "Social & Ethical Value", prompt: "How could the product better align with customer values? Consider sustainable materials, ethical sourcing, carbon-neutral options, inclusive branding, and charity partnerships.", example: "Plastic-free packaging option." },
      { key: "postPurchase", title: "Post-Purchase Experience", prompt: "How could the experience after purchase improve? Think about setup help, tutorials, loyalty rewards, maintenance reminders, upgrade paths, and customer success check-ins.", example: "Follow-up email explaining advanced features after purchase." },
    ],
  },
]

function ImprovementDimension({
  dimensionKey,
  title,
  prompt,
  example,
}: {
  dimensionKey: keyof ImprovementResponses
  title: string
  prompt: string
  example: string
}) {
  const { candidates, setCandidates } = useSolution()

  const items = candidates.filter(
    (c) => c.inspirationSource === "improve" && c.inspirationDetail === dimensionKey
  )
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const addItem = () => {
    const text = draft.trim()
    if (text) {
      const id = candidates.length > 0 ? Math.max(...candidates.map((c) => c.id)) + 1 : 1
      const newCandidate: SolutionCandidate = {
        id,
        title: text,
        description: "",
        inspirationSource: "improve",
        inspirationDetail: dimensionKey,
        feasibility: null,
        impact: null,
        cost: null,
        timeToImplement: null,
        notes: "",
      }
      setCandidates([...candidates, newCandidate])
    }
    setDraft("")
    setAdding(false)
  }

  const removeItem = (id: number) => {
    setCandidates(candidates.filter((c) => c.id !== id))
  }

  const updateItem = (id: number, text: string) => {
    const next = candidates.map((c) => (c.id === id ? { ...c, title: text } : c))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setCandidates(next), 500)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addItem() }
    if (e.key === "Escape") { setDraft(""); setAdding(false) }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-white">{title}</span>
      <p className="text-sm text-white/80">{prompt}</p>
      <p className="text-xs italic text-white/60">Example: {example}</p>

      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <Input
            defaultValue={item.title}
            onChange={(e) => updateItem(item.id, e.target.value)}
            className="flex-1 text-sm bg-white border-white text-foreground"
          />
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}

      {adding ? (
        <Input
          ref={inputRef}
          placeholder="Type an improvement and press Enter..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={addItem}
          className="text-sm bg-white border-white text-foreground"
        />
      ) : (
        <Button variant="on-primary" className="w-full" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      )}
    </div>
  )
}

function ImprovementForm() {
  const [viewMode, setViewMode] = useState<"accordion" | "tabs">("tabs")

  return (
    <div className="bg-primary rounded-xl p-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex flex-col gap-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">Improvement Dimensions</h4>
          <p className="text-sm text-white">Switch between accordion and tab layouts to explore the dimensions the way you prefer.</p>
        </div>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => { if (v) setViewMode(v as "accordion" | "tabs") }}
          size="sm"
          className="border-white/30 bg-white/10"
        >
          <ToggleGroupItem
            value="tabs"
            aria-label="Tabs view"
            className="text-white/80 hover:bg-white/10 hover:text-white data-[state=on]:bg-white data-[state=on]:text-primary"
          >
            <LayoutPanelTop className="h-4 w-4" />
            <span className="text-xs">Tabs</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="accordion"
            aria-label="Accordion view"
            className="text-white/80 hover:bg-white/10 hover:text-white data-[state=on]:bg-white data-[state=on]:text-primary"
          >
            <Rows3 className="h-4 w-4" />
            <span className="text-xs">Accordion</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === "accordion" ? (
        <Accordion type="multiple" className="flex flex-col divide-y divide-white/30">
          {IMPROVEMENT_GROUPS.map(({ group, icon: Icon, color, items }) => (
            <AccordionItem key={group} value={group}>
              <AccordionTrigger className="py-5 hover:no-underline [&>svg]:text-white/80">
                <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} text-white`}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-bold uppercase tracking-wide text-white/90">{group}</span>
                    <span className="text-xs text-white/60 font-normal">{items.length} dimensions</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="flex flex-col divide-y divide-white/20">
                  {items.map(({ key, title, prompt, example }) => (
                    <div key={key} className="py-5 first:pt-0 last:pb-0">
                      <ImprovementDimension
                        dimensionKey={key}
                        title={title}
                        prompt={prompt}
                        example={example}
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Tabs defaultValue={IMPROVEMENT_GROUPS[0].group} className="flex flex-col gap-4">
          <TabsList className="h-auto flex-wrap justify-start bg-white/10 p-1">
            {IMPROVEMENT_GROUPS.map(({ group, icon: Icon, color }) => (
              <TabsTrigger
                key={group}
                value={group}
                className="gap-2 text-white/80 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${color} text-white`}>
                  <Icon className="h-3 w-3" />
                </span>
                <span className="text-sm font-medium">{group}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {IMPROVEMENT_GROUPS.map(({ group, items }) => (
            <TabsContent key={group} value={group} className="mt-0">
              <div className="flex flex-col divide-y divide-white/20">
                {items.map(({ key, title, prompt, example }) => (
                  <div key={key} className="py-5 first:pt-0 last:pb-0">
                    <ImprovementDimension
                      dimensionKey={key}
                      title={title}
                      prompt={prompt}
                      example={example}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

/* ── Candidates Section ── */

const SOURCE_LABELS: Record<string, string> = {
  scamper: "SCAMPER",
  reverse: "Reverse",
  analogy: "Analogy",
  improve: "Improve",
  freeform: "Freeform",
}

function CandidatesSection() {
  const { candidates, setCandidates } = useSolution()

  const [addingNew, setAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draftTitle, setDraftTitle] = useState("")
  const [draftDesc, setDraftDesc] = useState("")

  const startAdd = () => {
    setAddingNew(true)
    setDraftTitle("")
    setDraftDesc("")
  }

  const confirmAdd = () => {
    if (!draftTitle.trim()) return
    const id = candidates.length > 0 ? Math.max(...candidates.map((c) => c.id)) + 1 : 1
    const newCandidate: SolutionCandidate = {
      id, title: draftTitle.trim(), description: draftDesc.trim(),
      inspirationSource: "freeform", inspirationDetail: "",
      feasibility: null, impact: null, cost: null, timeToImplement: null, notes: "",
    }
    setCandidates([...candidates, newCandidate])
    setAddingNew(false)
  }

  const startEdit = (c: SolutionCandidate) => {
    setEditingId(c.id)
    setDraftTitle(c.title)
    setDraftDesc(c.description)
  }

  const confirmEdit = () => {
    if (editingId === null) return
    setCandidates(
      candidates.map((c) =>
        c.id === editingId ? { ...c, title: draftTitle.trim(), description: draftDesc.trim() } : c
      )
    )
    setEditingId(null)
  }

  const removeCandidate = (id: number) => {
    setCandidates(candidates.filter((c) => c.id !== id))
  }

  return (
    <>
      <h3 className="text-lg font-semibold">Your Candidates</h3>

      {candidates.length === 0 && !addingNew && (
        <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">No candidates yet.</p>
          <p className="text-xs text-muted-foreground">Use the brainstorming tool above to generate ideas, or add one manually.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="rounded-lg border bg-card p-4 flex flex-col gap-2">
            {editingId === candidate.id ? (
              <>
                <Input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Title"
                  className="font-medium"
                  autoFocus
                />
                <Textarea
                  value={draftDesc}
                  onChange={(e) => setDraftDesc(e.target.value)}
                  placeholder="Description"
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5 mr-1" />Cancel
                  </Button>
                  <Button size="sm" onClick={confirmEdit} disabled={!draftTitle.trim()}>
                    <Check className="h-3.5 w-3.5 mr-1" />Save
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {candidate.inspirationSource === "scamper" && candidate.inspirationDetail in SCAMPER_LETTER_BY_KEY && (
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${SCAMPER_COLOR_BY_KEY[candidate.inspirationDetail as ScamperKey]} text-white text-[10px] font-bold`}
                        title={`SCAMPER: ${candidate.inspirationDetail}`}
                      >
                        {SCAMPER_LETTER_BY_KEY[candidate.inspirationDetail as ScamperKey]}
                      </span>
                    )}
                    <p className="text-sm font-semibold">{candidate.title}</p>
                    {candidate.inspirationSource && (
                      <Badge variant="outline" className="text-[10px]">
                        {SOURCE_LABELS[candidate.inspirationSource] ?? candidate.inspirationSource}
                      </Badge>
                    )}
                  </div>
                  {candidate.description && (
                    <p className="text-xs text-muted-foreground mt-1">{candidate.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(candidate)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => removeCandidate(candidate.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {addingNew && (
          <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 flex flex-col gap-2">
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Solution title"
              className="font-medium"
              autoFocus
            />
            <Textarea
              value={draftDesc}
              onChange={(e) => setDraftDesc(e.target.value)}
              placeholder="Describe the solution idea..."
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setAddingNew(false)}>
                <X className="h-3.5 w-3.5 mr-1" />Cancel
              </Button>
              <Button size="sm" onClick={confirmAdd} disabled={!draftTitle.trim()}>
                <Check className="h-3.5 w-3.5 mr-1" />Add
              </Button>
            </div>
          </div>
        )}
      </div>

      {!addingNew && (
        <Button variant="dashed" onClick={startAdd} className="gap-2 self-start">
          <Plus className="h-4 w-4" />Add Candidate
        </Button>
      )}
    </>
  )
}

/* ── SCAMPER Case Studies ── */

const CASE_STUDY_ICONS: Record<string, LucideIcon> = {
  "Dyson": Wind,
  "Netflix (DVD to Streaming)": Tv,
  "IKEA": Armchair,
}

function ScamperCaseStudies() {
  return (
    <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-8">
      <p className="text-md text-white">
        See how successful companies used SCAMPER thinking to reimagine existing products and create breakthrough solutions by looking at problems from multiple creative angles.
      </p>
      {SCAMPER_CASE_STUDIES.map((cs) => {
        const Icon = CASE_STUDY_ICONS[cs.company]
        return (
        <div
          key={cs.company}
          className="rounded-lg border border-white/10 bg-white/10 p-6 flex flex-col gap-5"
        >
          <div className="flex items-center gap-2">
            {Icon && (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                <Icon className="h-4 w-4" />
              </span>
            )}
            <p className="text-md font-semibold text-white">{cs.company}</p>
          </div>
          <div>
            <span className="text-md font-medium text-white uppercase tracking-wide">Problem</span>
            <p className="mt-2 text-md text-white">{cs.problem}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-md">
            {cs.dimensions.map((dim) => (
              <div key={dim.letter}>
                <div className="flex items-center gap-1.5">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${SCAMPER_LETTER_COLORS[dim.letter] ?? "bg-white/20"} text-white text-[10px] font-bold`}>
                    {dim.letter}
                  </span>
                  <span className="text-md font-medium text-white uppercase tracking-wide">{dim.title}</span>
                </div>
                <p className="mt-2 text-white">{dim.idea}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-5 mt-1">
            <span className="text-md font-medium text-white uppercase tracking-wide">Outcome</span>
            <p className="mt-2 text-md text-white">{cs.outcome}</p>
          </div>
        </div>
        )
      })}
    </div>
  )
}

/* ── Improve Case Studies ── */

const IMPROVE_CASE_STUDY_ICONS: Record<string, LucideIcon> = {
  "Amazon Prime": Package,
  "Apple iPhone": Smartphone,
  "Starbucks": Coffee,
}

function ImproveCaseStudies() {
  return (
    <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-5">
      <p className="text-md text-white">
        See how successful companies improved existing solutions along multiple dimensions at once, turning ordinary products into category-defining experiences.
      </p>
      {IMPROVE_CASE_STUDIES.map((cs) => {
        const Icon = IMPROVE_CASE_STUDY_ICONS[cs.company]
        return (
          <div
            key={cs.company}
            className="rounded-lg border border-white/10 bg-white/10 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              {Icon && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                  <Icon className="h-4 w-4" />
                </span>
              )}
              <p className="text-md font-semibold text-white">{cs.company}</p>
            </div>
            <div>
              <span className="text-md font-medium text-white uppercase tracking-wide">Problem</span>
              <p className="mt-0.5 text-md text-white">{cs.problem}</p>
            </div>
            <div className="flex flex-col gap-3">
              {cs.improvements.map((imp, i) => (
                <div key={i} className="rounded-md border border-white/10 bg-white/5 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-white/70">{imp.group}</span>
                    <span className="text-white/40">/</span>
                    <span className="text-sm font-semibold text-white">{imp.dimension}</span>
                  </div>
                  <p className="mt-1 text-md text-white">{imp.idea}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-3 mt-1">
              <span className="text-md font-medium text-white uppercase tracking-wide">Outcome</span>
              <p className="mt-0.5 text-md text-white">{cs.outcome}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Reverse Brainstorming Case Studies ── */

const REVERSE_CASE_STUDY_ICONS: Record<string, LucideIcon> = {
  "Airbnb": Home,
  "Domino's Pizza": Pizza,
  "Zappos": ShoppingBag,
}

function ReverseCaseStudies() {
  return (
    <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-5">
      <p className="text-md text-white">
        See how successful companies flipped every way they were making customers unhappy into a feature that won them loyalty, trust, and market share.
      </p>
      {REVERSE_CASE_STUDIES.map((cs) => {
        const Icon = REVERSE_CASE_STUDY_ICONS[cs.company]
        return (
          <div
            key={cs.company}
            className="rounded-lg border border-white/10 bg-white/10 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              {Icon && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                  <Icon className="h-4 w-4" />
                </span>
              )}
              <p className="text-md font-semibold text-white">{cs.company}</p>
            </div>
            <div>
              <span className="text-md font-medium text-white uppercase tracking-wide">Problem</span>
              <p className="mt-0.5 text-md text-white">{cs.problem}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/70">How to make it worse</span>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {cs.worseIdeas.map((idea, i) => (
                    <li key={i} className="text-md text-white flex gap-1.5">
                      <span className="text-white/50">•</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/70">Flipped into solutions</span>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {cs.flippedIdeas.map((idea, i) => (
                    <li key={i} className="text-md text-white flex gap-1.5">
                      <span className="text-white/50">→</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-3 mt-1">
              <span className="text-md font-medium text-white uppercase tracking-wide">Outcome</span>
              <p className="mt-0.5 text-md text-white">{cs.outcome}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Analogy Case Studies ── */

const ANALOGY_CASE_STUDY_ICONS: Record<string, LucideIcon> = {
  "McDonald's": Utensils,
  "Formula 1 Pit Stops → NHS Neonatal Transfers": Flag,
  "George de Mestral → Velcro": Leaf,
}

function AnalogyCaseStudies() {
  return (
    <div className="rounded-xl border border-surface/20 bg-surface p-8 flex flex-col gap-5">
      <p className="text-md text-white">
        See how breakthrough innovators borrowed ideas from unrelated fields: factories, racing, even nature. A good analogy reframes the problem and unlocks solutions you would never reach by thinking inside your own industry.
      </p>
      {ANALOGY_CASE_STUDIES.map((cs) => {
        const Icon = ANALOGY_CASE_STUDY_ICONS[cs.company]
        return (
          <div
            key={cs.company}
            className="rounded-lg border border-white/10 bg-white/10 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              {Icon && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                  <Icon className="h-4 w-4" />
                </span>
              )}
              <p className="text-md font-semibold text-white">{cs.company}</p>
            </div>
            <div>
              <span className="text-md font-medium text-white uppercase tracking-wide">Problem</span>
              <p className="mt-0.5 text-md text-white">{cs.problem}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/70">Source domain</span>
              <p className="mt-0.5 text-md font-semibold text-white">{cs.sourceDomain}</p>
              <p className="mt-1 text-md text-white">{cs.insight}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/70">How it was applied</span>
              <p className="mt-1 text-md text-white">{cs.application}</p>
            </div>
            <div className="border-t border-white/10 pt-3 mt-1">
              <span className="text-md font-medium text-white uppercase tracking-wide">Outcome</span>
              <p className="mt-0.5 text-md text-white">{cs.outcome}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Main Page ── */

type ToolHint = { icon: LucideIcon; title: string; subtitle: string; bg: string }

const TOOL_INFO: Record<string, { title: string; description: string; whatYouDo: string; hints: ToolHint[] }> = {
  scamper: {
    title: "SCAMPER Method",
    description: "SCAMPER is a creative thinking technique that prompts you to look at a problem from seven angles: Substitute, Combine, Adapt, Modify, Put to Other Use, Eliminate, and Reverse. Each prompt sparks ideas you wouldn't reach through normal brainstorming.",
    whatYouDo: "Work through each of the <strong>7 SCAMPER prompts</strong> below. You don't need to fill in every one, but try at least 3–4. When you find a promising idea, click <strong>Add as Candidate</strong> to save it.",
    hints: [
      { icon: Shuffle, title: "7 creative angles", subtitle: "Substitute, Combine, Adapt, Modify, Put to Other Use, Eliminate, Reverse", bg: "bg-blue-500" },
      { icon: Plus, title: "Save the best ideas", subtitle: "Click \"Add as Candidate\" to promote ideas for scoring later", bg: "bg-amber-500" },
      { icon: Shuffle, title: "Quantity over quality", subtitle: "Generate lots of ideas first. You'll refine them later", bg: "bg-emerald-500" },
    ],
  },
  reverse: {
    title: "Reverse Brainstorming",
    description: "Instead of solving the problem directly, first brainstorm how to make it worse. Then flip each \"make it worse\" idea to discover creative solutions you might not have considered. This counterintuitive approach breaks you out of conventional thinking patterns.",
    whatYouDo: "First, list every way to <strong>make the problem worse</strong>. Be creative, the more outlandish the better. Then <strong>flip each idea</strong> into its opposite to reveal solution ideas. Save the best flips as candidates.",
    hints: [
      { icon: RotateCcw, title: "Think backwards", subtitle: "How could you make the problem worse?", bg: "bg-rose-500" },
      { icon: RotateCcw, title: "Flip each idea", subtitle: "The opposite of a bad idea is often a great solution", bg: "bg-blue-500" },
      { icon: Plus, title: "Save your flips", subtitle: "Add the strongest inversions as solution candidates", bg: "bg-emerald-500" },
    ],
  },
  analogy: {
    title: "Analogy Thinking",
    description: "Look outside your domain for inspiration. How have other industries solved similar problems? Cross-pollinating ideas from different fields often leads to breakthrough solutions that feel fresh and unexpected.",
    whatYouDo: "Pick a <strong>different industry or domain</strong> that faces a similar challenge. Describe <strong>how they solved it</strong> and what you could borrow or adapt. Save the insight as a candidate if it inspires a concrete solution idea.",
    hints: [
      { icon: Globe, title: "Look outside your field", subtitle: "Aviation, healthcare, hospitality, logistics...", bg: "bg-blue-500" },
      { icon: Globe, title: "Borrow and adapt", subtitle: "What worked there that could work here?", bg: "bg-violet-500" },
      { icon: Plus, title: "Turn insights into candidates", subtitle: "Save analogies that inspire concrete solutions", bg: "bg-emerald-500" },
    ],
  },
  improve: {
    title: "Improve Existing Solutions",
    description: "Systematically improve an existing product or service from the customer's perspective. Work through 15 improvement dimensions covering the entire customer journey: before purchase, during purchase, and after purchase.",
    whatYouDo: "Work through the <strong>15 improvement dimensions</strong> below, organised into 4 groups. You don't need to fill in every one, just focus on the dimensions most relevant to your problem. Your progress is saved automatically as you type. Use <strong>Add Item</strong> to create your own custom dimensions.",
    hints: [
      { icon: TrendingUp, title: "15 improvement dimensions", subtitle: "Core functionality, ease of use, price value, trust, delivery, and more", bg: "bg-blue-500" },
      { icon: TrendingUp, title: "Customer journey focus", subtitle: "Think before, during, and after the purchase experience", bg: "bg-amber-500" },
      { icon: Plus, title: "Add your own", subtitle: "Use \"Add Item\" to create custom improvement dimensions", bg: "bg-emerald-500" },
    ],
  },
}

export default function DiscoverPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionRef, problem, discoveryToolType } = useSolution()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, solutionRef)

  const toolInfo = discoveryToolType ? TOOL_INFO[discoveryToolType] : null

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Shuffle}>Discover Your Solution: {toolInfo?.title ?? "-"}</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        {problem?.description && (
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Problem</p>
            <p className="text-sm font-medium">{problem.description}</p>
          </div>
        )}

        {toolInfo && (
          <div className="flex flex-col gap-3 text-md">
            <p>{toolInfo.description}</p>

            {discoveryToolType === "scamper" && (
              <>
                <h3 className="mt-4 text-xl font-bold text-foreground">The 7 SCAMPER Prompts</h3>
                <p>Each letter invites you to look at your problem from a different creative angle. Work through each prompt to surface ideas you would not reach through ordinary brainstorming.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 mb-4">
                  {SCAMPER_PROMPTS.map(({ key, letter, title, prompt, color }, i) => {
                    const isLastOdd = i === SCAMPER_PROMPTS.length - 1 && SCAMPER_PROMPTS.length % 2 === 1
                    return (
                      <div key={key} className={`flex items-start gap-3 rounded-lg border bg-muted/30 p-3 ${isLastOdd ? "md:col-span-2" : ""}`}>
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${color} text-white text-xs font-bold`}>
                          {letter}
                        </span>
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-sm font-semibold text-foreground">{title}</span>
                          <p className="text-sm text-muted-foreground">{prompt}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {discoveryToolType === "reverse" && (
              <>
                <h3 className="mt-4 text-xl font-bold text-foreground">The 2 Reverse Brainstorming Steps</h3>
                <p>Reverse brainstorming runs in two passes. First you deliberately generate the worst ideas possible, then you flip them to reveal strong solutions hiding in plain sight.</p>
                <div className="grid grid-cols-1 gap-5 mt-3 mb-6">
                  <div className="flex items-start gap-4 rounded-lg border bg-muted/30 p-6">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white text-sm font-bold">
                      1
                    </span>
                    <div className="flex flex-col gap-2 min-w-0">
                      <span className="text-base font-semibold text-foreground">Make it worse</span>
                      <p className="text-sm text-muted-foreground">Think of every way to aggravate the problem. Be creative, the more outlandish the better.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 rounded-lg border bg-muted/30 p-6">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold">
                      2
                    </span>
                    <div className="flex flex-col gap-2 min-w-0">
                      <span className="text-base font-semibold text-foreground">Flip each idea</span>
                      <p className="text-sm text-muted-foreground">Take each &quot;make it worse&quot; idea and write its opposite. These inversions often reveal strong solution ideas.</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <h3 className="mt-4 text-xl font-bold text-foreground">How to approach it</h3>
            <div className="flex flex-col gap-3">
              {toolInfo.hints.map(({ icon: Icon, title, subtitle, bg }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${bg} shrink-0 mt-0.5`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="text-md">{subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="mt-4 text-xl font-bold text-foreground">What will you do?</h3>
            <p dangerouslySetInnerHTML={{ __html: toolInfo.whatYouDo }} />
          </div>
        )}

        {discoveryToolType === "scamper" && (
          <>
            <hr className="border-border/40" />
            <div className="flex flex-col gap-2 items-center text-center">
              <h3 className="text-xl font-bold"><span className="text-primary">Your Turn:</span> Work through the SCAMPER prompts</h3>
              <p className="text-md text-muted-foreground max-w-xl">
                Run your problem through each of the seven angles. You don&apos;t need to answer every prompt: jot ideas where they spark, then promote the strongest ones to candidates.
              </p>
            </div>
            <Tabs defaultValue="strategy" className="flex flex-col gap-4">
              <TabsList className="self-center">
                <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
                <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
              </TabsList>
              <TabsContent value="strategy">
                <div className="flex flex-col gap-6">
                  <ScamperForm />
                  <hr className="border-border/40" />
                  <CandidatesSection />
                </div>
              </TabsContent>
              <TabsContent value="case-studies">
                <ScamperCaseStudies />
              </TabsContent>
            </Tabs>
          </>
        )}

        {discoveryToolType === "reverse" && (
          <>
            <hr className="border-border/40" />
            <Tabs defaultValue="strategy" className="flex flex-col gap-4">
              <TabsList className="self-center">
                <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
                <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
              </TabsList>
              <TabsContent value="strategy">
                <div className="flex flex-col gap-6">
                  <ReverseBrainstormForm />
                  <hr className="border-border/40" />
                  <CandidatesSection />
                </div>
              </TabsContent>
              <TabsContent value="case-studies">
                <ReverseCaseStudies />
              </TabsContent>
            </Tabs>
          </>
        )}
        {discoveryToolType === "analogy" && (
          <>
            <hr className="border-border/40" />
            <Tabs defaultValue="strategy" className="flex flex-col gap-4">
              <TabsList className="self-center">
                <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
                <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
              </TabsList>
              <TabsContent value="strategy">
                <div className="flex flex-col gap-6">
                  <AnalogyForm />
                  <hr className="border-border/40" />
                  <CandidatesSection />
                </div>
              </TabsContent>
              <TabsContent value="case-studies">
                <AnalogyCaseStudies />
              </TabsContent>
            </Tabs>
          </>
        )}
        {discoveryToolType === "improve" && (
          <>
            <hr className="border-border/40" />
            <Tabs defaultValue="strategy" className="flex flex-col gap-4">
              <TabsList className="self-center">
                <TabsTrigger value="strategy">Your Strategy</TabsTrigger>
                <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
              </TabsList>
              <TabsContent value="strategy">
                <div className="flex flex-col gap-6">
                  <ImprovementForm />
                  <hr className="border-border/40" />
                  <CandidatesSection />
                </div>
              </TabsContent>
              <TabsContent value="case-studies">
                <ImproveCaseStudies />
              </TabsContent>
            </Tabs>
          </>
        )}

        {!discoveryToolType && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">No discovery technique selected.</p>
            <Button variant="outline" onClick={() => router.push(`/solutions/${solutionRef}/choose-discovery`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Choose a Discovery Technique
            </Button>
          </div>
        )}

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          {nextPath && (
            <Button onClick={() => router.push(nextPath)}>
              Next<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

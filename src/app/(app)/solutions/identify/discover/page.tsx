"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useGuardedRouter } from "@/context/navigation-guard-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { useIdentifySolutions, getAdjacentSteps } from "../context"
import { SCAMPER_CASE_STUDIES } from "./case-studies"
import { IMPROVE_CASE_STUDIES } from "./improve-case-studies"
import { REVERSE_CASE_STUDIES } from "./reverse-case-studies"
import { ANALOGY_CASE_STUDIES } from "./analogy-case-studies"
import type { ImprovementItem, ImprovementResponses, DiscoveryToolType } from "@/types/solution"
import {
  Shuffle, RotateCcw, Globe, TrendingUp, Plus, Trash2, Save,
  ArrowLeft, ArrowRight, Wind, Tv, Armchair, Package, Smartphone, Coffee,
  Home, Pizza, ShoppingBag, Utensils, Flag, Leaf, Sparkles, ShieldCheck,
  Truck, Heart, Rows3, LayoutPanelTop, Wrench, Lightbulb, type LucideIcon,
} from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

type SaveDialogTool = Exclude<DiscoveryToolType, "">
type SaveDialogFields = {
  title: string
  description: string
  domain: string
  insight: string
  scamperItems: Record<string, string>
  improveItems: Record<string, string>
  reverseWorse: string[]
  reverseInversions: string[]
}

function emptyFields(): SaveDialogFields {
  return {
    title: "",
    description: "",
    domain: "",
    insight: "",
    scamperItems: {},
    improveItems: {},
    reverseWorse: [],
    reverseInversions: [],
  }
}

/* -- SCAMPER Form -- */

const SCAMPER_LETTER_COLORS: Record<string, string> = {
  S: "bg-red-800",
  C: "bg-orange-700",
  A: "bg-yellow-600",
  M: "bg-emerald-800",
  P: "bg-teal-700",
  E: "bg-rose-800",
  R: "bg-violet-800",
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
  example: { company: string; idea: string }
}

const SCAMPER_PROMPTS: ScamperPrompt[] = [
  {
    key: "substitute", letter: "S", title: "Substitute",
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
    example: {
      company: "Dyson",
      idea: "Replaced the vacuum dust bag with cyclonic air separation, using centrifugal force instead of filtration to capture dust.",
    },
  },
  {
    key: "combine", letter: "C", title: "Combine",
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
    example: {
      company: "IKEA",
      idea: "Combined a furniture store with a restaurant, play area, and lifestyle showroom to create a full-day destination experience.",
    },
  },
  {
    key: "adapt", letter: "A", title: "Adapt",
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
    example: {
      company: "Netflix",
      idea: "Adapted the subscription model from magazines and gyms, applying unlimited access for a flat monthly fee to movie rentals.",
    },
  },
  {
    key: "modify", letter: "M", title: "Modify",
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
    example: {
      company: "IKEA",
      idea: "Compressed furniture into flat-pack boxes that fit in a standard car, eliminating the need for delivery trucks.",
    },
  },
  {
    key: "putToOtherUse", letter: "P", title: "Put to Other Use",
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
    example: {
      company: "Netflix",
      idea: "Used viewing data (originally just logistics info) to power personalised recommendations and later to greenlight original content.",
    },
  },
  {
    key: "eliminate", letter: "E", title: "Eliminate",
    prompt: "What can you remove or simplify? What would happen if you eliminated a step entirely?",
    color: SCAMPER_LETTER_COLORS.E,
    sparkQuestions: [
      "Which steps, fields, or features add no real value?",
      "What would happen if the user did less work, or none?",
      "What constraints could be lifted without losing the point?",
    ],
    inputPlaceholder: "e.g. Remove the email field from signup...",
    example: {
      company: "Netflix",
      idea: "Eliminated late fees entirely, removing the most hated aspect of traditional video rental.",
    },
  },
  {
    key: "reverse", letter: "R", title: "Reverse",
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
    example: {
      company: "IKEA",
      idea: "Reversed the flow: instead of a shop assistant helping you, customers navigate a self-guided path and pick items from the warehouse themselves.",
    },
  },
]

function ScamperDimensionContent({
  dimensionKey,
  placeholder = "Type your idea here...",
}: {
  dimensionKey: ScamperKey
  placeholder?: string
}) {
  const { scamperIdeas, setScamperIdeas } = useIdentifySolutions()

  const items = scamperIdeas[dimensionKey] ?? []
  const externalText = items[0]?.text ?? ""
  const [text, setText] = useState(externalText)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setText(externalText)
  }, [externalText])

  const updateText = (newText: string) => {
    setText(newText)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const trimmed = newText.trim()
      const next: ImprovementItem[] = trimmed ? [{ id: 1, text: newText }] : []
      setScamperIdeas({ ...scamperIdeas, [dimensionKey]: next })
    }, 300)
  }

  return (
    <Input
      placeholder={placeholder}
      value={text}
      onChange={(e) => updateText(e.target.value)}
      className="text-sm bg-white border-white text-foreground"
    />
  )
}

function ScamperPromptBody({
  sparkQuestions,
  technique,
  example,
  dimensionKey,
  inputPlaceholder,
}: {
  sparkQuestions: string[]
  technique?: { name: string; description: string }
  example: { company: string; idea: string }
  dimensionKey: ScamperKey
  inputPlaceholder: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-white/20 bg-white/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-white" />
          <p className="text-sm font-semibold text-white uppercase tracking-wide">Spark questions</p>
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
            <p className="text-sm font-semibold text-white uppercase tracking-wide">
              Try this technique: {technique.name}
            </p>
          </div>
          <p className="text-sm text-white">{technique.description}</p>
        </div>
      )}
      <div className="rounded-md border border-white/20 bg-white/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-3.5 w-3.5 text-white" />
          <p className="text-sm font-semibold text-white uppercase tracking-wide">
            Example: {example.company}
          </p>
        </div>
        <p className="text-sm text-white">{example.idea}</p>
      </div>
      <ScamperDimensionContent dimensionKey={dimensionKey} placeholder={inputPlaceholder} />
    </div>
  )
}

function ScamperForm() {
  const [viewMode, setViewMode] = useState<"accordion" | "tabs">("tabs")

  return (
    <div className="bg-secondary-brand rounded-xl p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-white">SCAMPER Prompts</h4>
          <p className="text-sm text-white">Switch between accordion and tab layouts to explore the prompts the way you prefer.</p>
        </div>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => { if (v) setViewMode(v as "accordion" | "tabs") }}
          size="sm"
          className="shrink-0 border-white/30 bg-white/10"
        >
          <ToggleGroupItem
            value="tabs"
            aria-label="Tabs view"
            className="shrink-0 whitespace-nowrap text-white/80 hover:bg-white/10 hover:text-white data-[state=on]:bg-white data-[state=on]:text-secondary-brand"
          >
            <LayoutPanelTop className="h-4 w-4" />
            <span className="text-sm">Tabs</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="accordion"
            aria-label="Accordion view"
            className="shrink-0 whitespace-nowrap text-white/80 hover:bg-white/10 hover:text-white data-[state=on]:bg-white data-[state=on]:text-secondary-brand"
          >
            <Rows3 className="h-4 w-4" />
            <span className="text-sm">Accordion</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === "accordion" ? (
        <Accordion type="multiple" className="flex flex-col divide-y divide-white/20">
          {SCAMPER_PROMPTS.map(({ key, letter, title, prompt, color, sparkQuestions, inputPlaceholder, technique, example }) => (
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
                  example={example}
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
                className="gap-2 text-white/80 data-[state=active]:bg-white data-[state=active]:text-secondary-brand data-[state=active]:shadow"
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${color} text-white text-[10px] font-bold`}>
                  {letter}
                </span>
                <span className="text-sm font-medium">{title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {SCAMPER_PROMPTS.map(({ key, letter, title, prompt, color, sparkQuestions, inputPlaceholder, technique, example }) => (
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
                  example={example}
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

/* -- Reverse Ideation Form -- */

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

function ReverseIdeationForm() {
  const {
    reverseIdeation,
    setReverseIdeation,
    reverseInversion,
    setReverseInversion,
  } = useIdentifySolutions()

  const ideationItems = Array.isArray(reverseIdeation) ? reverseIdeation : []
  const inversionItems = Array.isArray(reverseInversion) ? reverseInversion : []

  return (
    <div className="bg-secondary-brand rounded-xl p-8">
      <div className="flex flex-col divide-y divide-white/20">
        <div className="py-5 first:pt-0 last:pb-0">
          <ReverseItemList
            items={ideationItems}
            setItems={setReverseIdeation}
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
            description={'Take each "make it worse" idea above and write its opposite. The strongest flips become the seed for your saved solution.'}
            placeholder="Type the flipped idea and press Enter..."
          />
        </div>
      </div>
    </div>
  )
}

/* -- Analogy Form -- */

function AnalogyForm() {
  const { analogyDomain, setAnalogyDomain, analogyInsight, setAnalogyInsight } = useIdentifySolutions()

  return (
    <div className="bg-secondary-brand rounded-xl p-8">
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
      </div>
    </div>
  )
}

/* -- Improvement Form -- */

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
  const { improvementResponses, setImprovementResponses } = useIdentifySolutions()

  const items = improvementResponses[dimensionKey] ?? []
  const externalText = items[0]?.text ?? ""
  const [text, setText] = useState(externalText)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setText(externalText)
  }, [externalText])

  const updateText = (newText: string) => {
    setText(newText)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const trimmed = newText.trim()
      const next: ImprovementItem[] = trimmed ? [{ id: 1, text: newText }] : []
      setImprovementResponses({ ...improvementResponses, [dimensionKey]: next })
    }, 300)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-white">{title}</span>
      <p className="text-sm text-white/80">{prompt}</p>
      <p className="text-sm italic text-white/80">Example: {example}</p>
      <Input
        placeholder="Type your improvement here..."
        value={text}
        onChange={(e) => updateText(e.target.value)}
        className="text-sm bg-white border-white text-foreground"
      />
    </div>
  )
}

function ImprovementForm() {
  const [viewMode, setViewMode] = useState<"accordion" | "tabs">("tabs")

  return (
    <div className="bg-secondary-brand rounded-xl p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-white">Improvement Dimensions</h4>
          <p className="text-sm text-white">Switch between accordion and tab layouts to explore the dimensions the way you prefer.</p>
        </div>
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => { if (v) setViewMode(v as "accordion" | "tabs") }}
          size="sm"
          className="shrink-0 border-white/30 bg-white/10"
        >
          <ToggleGroupItem
            value="tabs"
            aria-label="Tabs view"
            className="shrink-0 whitespace-nowrap text-white/80 hover:bg-white/10 hover:text-white data-[state=on]:bg-white data-[state=on]:text-secondary-brand"
          >
            <LayoutPanelTop className="h-4 w-4" />
            <span className="text-sm">Tabs</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="accordion"
            aria-label="Accordion view"
            className="shrink-0 whitespace-nowrap text-white/80 hover:bg-white/10 hover:text-white data-[state=on]:bg-white data-[state=on]:text-secondary-brand"
          >
            <Rows3 className="h-4 w-4" />
            <span className="text-sm">Accordion</span>
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
                    <span className="text-sm text-white/80 font-normal">{items.length} dimensions</span>
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
                className="gap-2 text-white/80 data-[state=active]:bg-white data-[state=active]:text-secondary-brand data-[state=active]:shadow"
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

/* -- SCAMPER Case Studies -- */

const CASE_STUDY_ICONS: Record<string, { icon: LucideIcon; bg: string }> = {
  "Dyson": { icon: Wind, bg: "bg-teal-700" },
  "Netflix (DVD to Streaming)": { icon: Tv, bg: "bg-red-800" },
  "IKEA": { icon: Armchair, bg: "bg-yellow-600" },
}

function ScamperCaseStudies() {
  const containerSize = useContainerSize()
  const isNarrow = containerSize === "narrow"
  return (
    <div className="rounded-xl border bg-muted p-8 flex flex-col gap-8">
      <p className="text-base text-foreground">
        See how successful companies used SCAMPER thinking to reimagine existing products and create breakthrough solutions by looking at problems from multiple creative angles.
      </p>
      {SCAMPER_CASE_STUDIES.map((cs) => {
        const meta = CASE_STUDY_ICONS[cs.company]
        const Icon = meta?.icon
        return (
        <div
          key={cs.company}
          className="rounded-lg border bg-card p-6 flex flex-col gap-5"
        >
          <div className="flex items-center gap-2">
            {Icon && (
              <span className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
                meta.bg,
              )}>
                <Icon className="h-4 w-4" />
              </span>
            )}
            <p className="text-base font-semibold text-foreground">{cs.company}</p>
          </div>
          <div>
            <span className="text-base font-semibold text-foreground">Problem</span>
            <p className="mt-1 text-base text-foreground">{cs.problem}</p>
          </div>
          <div className={cn(
            "grid gap-5 text-base",
            isNarrow ? "grid-cols-1" : containerSize === "medium" ? "grid-cols-2" : "grid-cols-3",
          )}>
            {cs.dimensions.map((dim) => (
              <div key={dim.letter}>
                <div className="flex items-center gap-1.5">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${SCAMPER_LETTER_COLORS[dim.letter] ?? "bg-muted"} text-white text-[10px] font-bold`}>
                    {dim.letter}
                  </span>
                  <span className="text-base font-semibold text-foreground">{dim.title}</span>
                </div>
                <p className="mt-1 text-base text-foreground">{dim.idea}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-5 mt-1">
            <span className="text-base font-semibold text-foreground">Outcome</span>
            <p className="mt-1 text-base text-foreground">{cs.outcome}</p>
          </div>
        </div>
        )
      })}
    </div>
  )
}

/* -- Improve Case Studies -- */

const IMPROVE_CASE_STUDY_ICONS: Record<string, { icon: LucideIcon; bg: string }> = {
  "Amazon Prime": { icon: Package, bg: "bg-orange-700" },
  "Apple iPhone": { icon: Smartphone, bg: "bg-violet-800" },
  "Starbucks": { icon: Coffee, bg: "bg-emerald-800" },
}

function ImproveCaseStudies() {
  return (
    <div className="rounded-xl border bg-muted p-8 flex flex-col gap-5">
      <p className="text-base text-foreground">
        See how successful companies improved existing solutions along multiple dimensions at once, turning ordinary products into category-defining experiences.
      </p>
      {IMPROVE_CASE_STUDIES.map((cs) => {
        const meta = IMPROVE_CASE_STUDY_ICONS[cs.company]
        const Icon = meta?.icon
        return (
          <div
            key={cs.company}
            className="rounded-lg border bg-card p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              {Icon && (
                <span className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
                  meta.bg,
                )}>
                  <Icon className="h-4 w-4" />
                </span>
              )}
              <p className="text-base font-semibold text-foreground">{cs.company}</p>
            </div>
            <div>
              <span className="text-base font-semibold text-foreground">Problem</span>
              <p className="mt-1 text-base text-foreground">{cs.problem}</p>
            </div>
            <div className="flex flex-col gap-3">
              {cs.improvements.map((imp, i) => (
                <div key={i} className="rounded-md border bg-muted p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-foreground">{imp.group}</span>
                    <span className="text-foreground">/</span>
                    <span className="text-base font-semibold text-foreground">{imp.dimension}</span>
                  </div>
                  <p className="mt-1 text-base text-foreground">{imp.idea}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-1">
              <span className="text-base font-semibold text-foreground">Outcome</span>
              <p className="mt-1 text-base text-foreground">{cs.outcome}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* -- Reverse Ideation Case Studies -- */

const REVERSE_CASE_STUDY_ICONS: Record<string, { icon: LucideIcon; bg: string }> = {
  "Airbnb": { icon: Home, bg: "bg-rose-800" },
  "Domino's Pizza": { icon: Pizza, bg: "bg-red-800" },
  "Zappos": { icon: ShoppingBag, bg: "bg-blue-900" },
}

function ReverseCaseStudies() {
  const isNarrow = useContainerSize() === "narrow"
  return (
    <div className="rounded-xl border bg-muted p-8 flex flex-col gap-5">
      <p className="text-base text-foreground">
        See how successful companies flipped every way they were making customers unhappy into a feature that won them loyalty, trust, and market share.
      </p>
      {REVERSE_CASE_STUDIES.map((cs) => {
        const meta = REVERSE_CASE_STUDY_ICONS[cs.company]
        const Icon = meta?.icon
        return (
          <div
            key={cs.company}
            className="rounded-lg border bg-card p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              {Icon && (
                <span className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
                  meta.bg,
                )}>
                  <Icon className="h-4 w-4" />
                </span>
              )}
              <p className="text-base font-semibold text-foreground">{cs.company}</p>
            </div>
            <div>
              <span className="text-base font-semibold text-foreground">Problem</span>
              <p className="mt-1 text-base text-foreground">{cs.problem}</p>
            </div>
            <div className={cn("grid gap-3", isNarrow ? "grid-cols-1" : "grid-cols-2")}>
              <div className="rounded-md border bg-muted p-3">
                <span className="text-base font-semibold text-foreground">How to make it worse</span>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {cs.worseIdeas.map((idea, i) => (
                    <li key={i} className="text-base text-foreground flex gap-1.5">
                      <span className="text-foreground">•</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border bg-muted p-3">
                <span className="text-base font-semibold text-foreground">Flipped into solutions</span>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {cs.flippedIdeas.map((idea, i) => (
                    <li key={i} className="text-base text-foreground flex gap-1.5">
                      <span className="text-foreground">&rarr;</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t pt-3 mt-1">
              <span className="text-base font-semibold text-foreground">Outcome</span>
              <p className="mt-1 text-base text-foreground">{cs.outcome}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* -- Analogy Case Studies -- */

const ANALOGY_CASE_STUDY_ICONS: Record<string, { icon: LucideIcon; bg: string }> = {
  "McDonald's": { icon: Utensils, bg: "bg-red-800" },
  "Formula 1 Pit Stops > NHS Neonatal Transfers": { icon: Flag, bg: "bg-blue-900" },
  "George de Mestral > Velcro": { icon: Leaf, bg: "bg-emerald-800" },
}

function AnalogyCaseStudies() {
  return (
    <div className="rounded-xl border bg-muted p-8 flex flex-col gap-5">
      <p className="text-base text-foreground">
        See how breakthrough innovators borrowed ideas from unrelated fields: factories, racing, even nature. A good analogy reframes the problem and unlocks solutions you would never reach by thinking inside your own industry.
      </p>
      {ANALOGY_CASE_STUDIES.map((cs) => {
        const meta = ANALOGY_CASE_STUDY_ICONS[cs.company]
        const Icon = meta?.icon
        return (
          <div
            key={cs.company}
            className="rounded-lg border bg-card p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              {Icon && (
                <span className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
                  meta.bg,
                )}>
                  <Icon className="h-4 w-4" />
                </span>
              )}
              <p className="text-base font-semibold text-foreground">{cs.company}</p>
            </div>
            <div>
              <span className="text-base font-semibold text-foreground">Problem</span>
              <p className="mt-1 text-base text-foreground">{cs.problem}</p>
            </div>
            <div className="rounded-md border bg-muted p-3">
              <span className="text-base font-semibold text-foreground">Source domain</span>
              <p className="mt-1 text-base font-semibold text-foreground">{cs.sourceDomain}</p>
              <p className="mt-1 text-base text-foreground">{cs.insight}</p>
            </div>
            <div className="rounded-md border bg-muted p-3">
              <span className="text-base font-semibold text-foreground">How it was applied</span>
              <p className="mt-1 text-base text-foreground">{cs.application}</p>
            </div>
            <div className="border-t pt-3 mt-1">
              <span className="text-base font-semibold text-foreground">Outcome</span>
              <p className="mt-1 text-base text-foreground">{cs.outcome}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* -- Save Solution Flow -- */

const TOOL_META: Record<SaveDialogTool, { label: string; titleHint: string }> = {
  scamper: { label: "SCAMPER", titleHint: "Name your SCAMPER solution" },
  reverse: { label: "Reverse Ideation", titleHint: "Name your reverse ideation solution" },
  analogy: { label: "Analogy Thinking", titleHint: "Name your analogy solution" },
  improve: { label: "Improve Existing Solutions", titleHint: "Name your improvement solution" },
}

const IMPROVE_DIMENSION_LABELS: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const group of IMPROVEMENT_GROUPS) {
    for (const item of group.items) map[item.key] = item.title
  }
  return map
})()

const SCAMPER_DIMENSION_LABELS: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const p of SCAMPER_PROMPTS) map[p.key] = p.title
  return map
})()

function ListField({
  label,
  helper,
  values,
  onChange,
  placeholder,
}: {
  label: string
  helper: string
  values: string[]
  onChange: (next: string[]) => void
  placeholder: string
}) {
  const setAt = (index: number, value: string) => {
    const next = [...values]
    next[index] = value
    onChange(next)
  }
  const remove = (index: number) => onChange(values.filter((_, i) => i !== index))
  const add = () => onChange([...values, ""])

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <p className="text-sm">{helper}</p>
      {values.length === 0 ? (
        <p className="text-sm italic">No items yet.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {values.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={v}
                onChange={(e) => setAt(i, e.target.value)}
                placeholder={placeholder}
                className="flex-1 text-sm"
              />
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => remove(i)}
                aria-label="Remove item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <Button variant="outline" size="sm" className="self-start gap-1.5" onClick={add}>
        <Plus className="h-3.5 w-3.5" />
        Add Item
      </Button>
    </div>
  )
}

function SaveSolutionDialog({
  open,
  onOpenChange,
  toolType,
  fields,
  setFields,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  toolType: SaveDialogTool
  fields: SaveDialogFields
  setFields: (next: SaveDialogFields) => void
  onSave: () => void
}) {
  const meta = TOOL_META[toolType]

  const setScamperEntry = (key: string, value: string) => {
    const next = { ...fields.scamperItems }
    if (value.trim()) next[key] = value
    else delete next[key]
    setFields({ ...fields, scamperItems: next })
  }

  const setImproveEntry = (key: string, value: string) => {
    const next = { ...fields.improveItems }
    if (value.trim()) next[key] = value
    else delete next[key]
    setFields({ ...fields, improveItems: next })
  }

  const scamperKeys = SCAMPER_PROMPTS.map((p) => p.key as string).filter(
    (k) => fields.scamperItems[k] !== undefined
  )
  const improveKeys = Object.keys(IMPROVE_DIMENSION_LABELS).filter(
    (k) => fields.improveItems[k] !== undefined
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Save Solution</DialogTitle>
          <DialogDescription>
            Refine the solution before adding it to your solutions. You can edit it again later from the Solutions page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="save-solution-title">Title</label>
            <Input
              id="save-solution-title"
              value={fields.title}
              onChange={(e) => setFields({ ...fields, title: e.target.value })}
              placeholder={meta.titleHint}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="save-solution-description">Solution Description</label>
            <Textarea
              id="save-solution-description"
              value={fields.description}
              onChange={(e) => setFields({ ...fields, description: e.target.value })}
              placeholder="Describe the solution in your own words..."
              rows={4}
            />
          </div>

          {toolType === "scamper" && scamperKeys.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Your SCAMPER ideas</p>
              <p className="text-sm">Tweak the entries you captured before saving.</p>
              {scamperKeys.map((key) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-sm font-semibold uppercase tracking-wide" htmlFor={`save-scamper-${key}`}>
                    {SCAMPER_DIMENSION_LABELS[key] ?? key}
                  </label>
                  <Input
                    id={`save-scamper-${key}`}
                    value={fields.scamperItems[key] ?? ""}
                    onChange={(e) => setScamperEntry(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {toolType === "improve" && improveKeys.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Your improvement ideas</p>
              <p className="text-sm">Tweak the entries you captured before saving.</p>
              {improveKeys.map((key) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-sm font-semibold uppercase tracking-wide" htmlFor={`save-improve-${key}`}>
                    {IMPROVE_DIMENSION_LABELS[key] ?? key}
                  </label>
                  <Input
                    id={`save-improve-${key}`}
                    value={fields.improveItems[key] ?? ""}
                    onChange={(e) => setImproveEntry(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {toolType === "reverse" && (
            <>
              <ListField
                label="Make it worse"
                helper="The aggravating ideas that seeded your flips."
                values={fields.reverseWorse}
                onChange={(next) => setFields({ ...fields, reverseWorse: next })}
                placeholder="A way to make the problem worse..."
              />
              <ListField
                label="Flipped ideas"
                helper="The inversions you want to keep with this solution."
                values={fields.reverseInversions}
                onChange={(next) => setFields({ ...fields, reverseInversions: next })}
                placeholder="A flipped solution idea..."
              />
            </>
          )}

          {toolType === "analogy" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="save-solution-domain">Domain / Industry</label>
                <Input
                  id="save-solution-domain"
                  value={fields.domain}
                  onChange={(e) => setFields({ ...fields, domain: e.target.value })}
                  placeholder="e.g. Aviation, Healthcare, Hospitality..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="save-solution-insight">Insight</label>
                <Textarea
                  id="save-solution-insight"
                  value={fields.insight}
                  onChange={(e) => setFields({ ...fields, insight: e.target.value })}
                  placeholder="What did that domain do that you can borrow?"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={!fields.title.trim()}>Save Solution</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SolutionSavedDialog({
  open,
  onOpenChange,
  onContinue,
  onKeepExploring,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: () => void
  onKeepExploring: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solution Saved</DialogTitle>
          <DialogDescription>
            Your solution has been added to your solutions. What would you like to do next?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={onContinue} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            Continue to Solution Validation
          </Button>
          <Button variant="outline" onClick={onKeepExploring}>
            Keep Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SaveSolutionPanel({ toolType }: { toolType: SaveDialogTool }) {
  const router = useRouter()
  const {
    addCandidate,
    wipeDiscoveryScratch,
    scamperIdeas,
    improvementResponses,
    analogyDomain,
    analogyInsight,
    reverseIdeation,
    reverseInversion,
  } = useIdentifySolutions()

  const [saveOpen, setSaveOpen] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)
  const [savedSolutionId, setSavedSolutionId] = useState<number | null>(null)
  const [fields, setFields] = useState<SaveDialogFields>(emptyFields())

  const openSaveDialog = () => {
    const seed = emptyFields()
    if (toolType === "analogy") {
      seed.title = analogyDomain ? `Analogy from ${analogyDomain}` : ""
      seed.domain = analogyDomain
      seed.insight = analogyInsight
    } else if (toolType === "scamper") {
      const items: Record<string, string> = {}
      for (const k of Object.keys(scamperIdeas)) {
        const value = scamperIdeas[k]?.[0]?.text?.trim()
        if (value) items[k] = value
      }
      seed.scamperItems = items
    } else if (toolType === "improve") {
      const items: Record<string, string> = {}
      const keys = Object.keys(improvementResponses) as (keyof ImprovementResponses)[]
      for (const k of keys) {
        const value = improvementResponses[k]?.[0]?.text?.trim()
        if (value) items[k as string] = value
      }
      seed.improveItems = items
    } else if (toolType === "reverse") {
      seed.reverseWorse = reverseIdeation
        .map((i) => i.text.trim())
        .filter((t): t is string => Boolean(t))
      seed.reverseInversions = reverseInversion
        .map((i) => i.text.trim())
        .filter((t): t is string => Boolean(t))
    }
    setFields(seed)
    setSaveOpen(true)
  }

  const handleSave = () => {
    const sanitiseMap = (map: Record<string, string>) => {
      const out: Record<string, string> = {}
      for (const [k, v] of Object.entries(map)) {
        const t = v.trim()
        if (t) out[k] = t
      }
      return out
    }
    const sanitiseList = (list: string[]) =>
      list.map((s) => s.trim()).filter((s): s is string => Boolean(s))

    const solution = addCandidate({
      title: fields.title,
      description: fields.description,
      inspirationSource: toolType,
      inspirationDetail: toolType === "analogy" ? fields.domain : "",
      analogyDomain: toolType === "analogy" ? fields.domain : undefined,
      analogyInsight: toolType === "analogy" ? fields.insight : undefined,
      scamperIdeas: toolType === "scamper" ? sanitiseMap(fields.scamperItems) : undefined,
      improveIdeas: toolType === "improve" ? sanitiseMap(fields.improveItems) : undefined,
      reverseWorseIdeas: toolType === "reverse" ? sanitiseList(fields.reverseWorse) : undefined,
      reverseInversions: toolType === "reverse" ? sanitiseList(fields.reverseInversions) : undefined,
    })

    if (solution) {
      setSavedSolutionId(solution.id)
      setSaveOpen(false)
      setSavedOpen(true)
      wipeDiscoveryScratch()
    }
  }

  const handleContinue = () => {
    setSavedOpen(false)
    if (savedSolutionId !== null) {
      router.push(`/solutions/${savedSolutionId}/validate/introduction`)
    }
  }

  const handleKeepExploring = () => {
    setSavedOpen(false)
  }

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={openSaveDialog}
          className="gap-2 bg-emerald-600 text-white shadow hover:bg-emerald-700 focus-visible:ring-emerald-600"
        >
          <Save className="h-4 w-4" />
          Save Solution
        </Button>
      </div>

      <SaveSolutionDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        toolType={toolType}
        fields={fields}
        setFields={setFields}
        onSave={handleSave}
      />

      <SolutionSavedDialog
        open={savedOpen}
        onOpenChange={setSavedOpen}
        onContinue={handleContinue}
        onKeepExploring={handleKeepExploring}
      />
    </>
  )
}

/* -- Main Page -- */

type ToolHint = { icon: LucideIcon; title: string; subtitle: string; bg: string }

const TOOL_INFO: Record<string, { title: string; description: string; whatYouDo: string; hints: ToolHint[] }> = {
  scamper: {
    title: "SCAMPER Method",
    description: "SCAMPER is a creative thinking technique that prompts you to look at a problem from seven angles: Substitute, Combine, Adapt, Modify, Put to Other Use, Eliminate, and Reverse. Each prompt sparks ideas you wouldn't reach through conventional ideation.",
    whatYouDo: "Work through each of the <strong>7 SCAMPER prompts</strong> below. You don't need to fill in every one, but try at least 3-4. When you find a promising idea, click <strong>Add as Candidate</strong> to save it.",
    hints: [
      { icon: Shuffle, title: "7 creative angles", subtitle: "Substitute, Combine, Adapt, Modify, Put to Other Use, Eliminate, Reverse", bg: "bg-blue-900" },
      { icon: Plus, title: "Save the best ideas", subtitle: "Click \"Add as Candidate\" to promote ideas to your Solutions", bg: "bg-yellow-600" },
      { icon: Shuffle, title: "Quantity over quality", subtitle: "Generate lots of ideas first. You'll refine them later", bg: "bg-green-800" },
    ],
  },
  reverse: {
    title: "Reverse Ideation",
    description: "Instead of solving the problem directly, first generate ways to make it worse. Then flip each \"make it worse\" idea to discover creative solutions you might not have considered. This counterintuitive approach breaks you out of conventional thinking patterns.",
    whatYouDo: "First, list every way to <strong>make the problem worse</strong>. Be creative, the more outlandish the better. Then <strong>flip each idea</strong> into its opposite to reveal solution ideas. Save the best flips as candidates.",
    hints: [
      { icon: RotateCcw, title: "Think backwards", subtitle: "How could you make the problem worse?", bg: "bg-red-800" },
      { icon: RotateCcw, title: "Flip each idea", subtitle: "The opposite of a bad idea is often a great solution", bg: "bg-blue-900" },
      { icon: Plus, title: "Save your flips", subtitle: "Add the strongest inversions as solution candidates", bg: "bg-green-800" },
    ],
  },
  analogy: {
    title: "Analogy Thinking",
    description: "Look outside your domain for inspiration. How have other industries solved similar problems? Cross-pollinating ideas from different fields often leads to breakthrough solutions that feel fresh and unexpected.",
    whatYouDo: "Pick a <strong>different industry or domain</strong> that faces a similar challenge. Describe <strong>how they solved it</strong> and what you could borrow or adapt. Save the insight as a candidate if it inspires a concrete solution idea.",
    hints: [
      { icon: Globe, title: "Look outside your field", subtitle: "Aviation, healthcare, hospitality, logistics...", bg: "bg-blue-900" },
      { icon: Globe, title: "Borrow and adapt", subtitle: "What worked there that could work here?", bg: "bg-violet-800" },
      { icon: Plus, title: "Turn insights into candidates", subtitle: "Save analogies that inspire concrete solutions", bg: "bg-green-800" },
    ],
  },
  improve: {
    title: "Improve Existing Solutions",
    description: "Systematically improve an existing product or service from the customer's perspective. Work through 15 improvement dimensions covering the entire customer journey: before purchase, during purchase, and after purchase.",
    whatYouDo: "Work through the <strong>15 improvement dimensions</strong> below, organised into 4 groups. You don't need to fill in every one, just focus on the dimensions most relevant to your problem. Your progress is saved automatically as you type. Use <strong>Add Item</strong> to create your own custom dimensions.",
    hints: [
      { icon: TrendingUp, title: "15 improvement dimensions", subtitle: "Core functionality, ease of use, price value, trust, delivery, and more", bg: "bg-blue-900" },
      { icon: TrendingUp, title: "Customer journey focus", subtitle: "Think before, during, and after the purchase experience", bg: "bg-yellow-600" },
      { icon: Plus, title: "Add your own", subtitle: "Use \"Add Item\" to create custom improvement dimensions", bg: "bg-green-800" },
    ],
  },
}

export default function DiscoverPage() {
  const router = useRouter()
  const guardedRouter = useGuardedRouter()
  const pathname = usePathname()
  const { problemId, discoveryToolType } = useIdentifySolutions()
  const { prevPath, nextPath } = getAdjacentSteps(pathname)
  const containerSize = useContainerSize()
  const isNarrow = containerSize === "narrow"

  useEffect(() => {
    if (problemId == null) {
      router.replace("/solutions/identify/select-problem")
    }
  }, [problemId, router])

  if (problemId == null) return null

  const toolInfo = discoveryToolType ? TOOL_INFO[discoveryToolType] : null

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Shuffle}>Discover Your Solution: {toolInfo?.title ?? "-"}</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        {toolInfo && (
          <div className="flex flex-col gap-3 text-base">
            <p>{toolInfo.description}</p>

            {discoveryToolType === "scamper" && (
              <>
                <h3 className="mt-4 text-xl font-bold text-foreground">The 7 SCAMPER Prompts</h3>
                <p>Each letter invites you to look at your problem from a different creative angle. Work through each prompt to surface ideas you would not reach through ordinary ideation.</p>
                <div className={cn("grid gap-3 mt-1 mb-4", isNarrow ? "grid-cols-1" : "grid-cols-2")}>
                  {SCAMPER_PROMPTS.map(({ key, letter, title, prompt, color }, i) => {
                    const isLastOdd = i === SCAMPER_PROMPTS.length - 1 && SCAMPER_PROMPTS.length % 2 === 1
                    return (
                      <div key={key} className={cn("flex items-start gap-3 rounded-lg border bg-muted/30 p-3", !isNarrow && isLastOdd && "col-span-2")}>
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${color} text-white text-xs font-bold`}>
                          {letter}
                        </span>
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-sm font-semibold text-foreground">{title}</span>
                          <p className="text-sm">{prompt}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {discoveryToolType === "reverse" && (
              <>
                <h3 className="mt-6 text-xl font-bold text-foreground">The 2 Reverse Ideation Steps</h3>
                <p className="mt-1">Reverse ideation runs in two passes. First you deliberately generate the worst ideas possible, then you flip them to reveal strong solutions hiding in plain sight.</p>
                <div className="flex flex-col gap-3 mt-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500 shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-white">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Make it worse</p>
                      <p className="text-base">Think of every way to aggravate the problem. Be creative, the more outlandish the better.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-white">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Flip each idea</p>
                      <p className="text-base">Take each &quot;make it worse&quot; idea and write its opposite. These inversions often reveal strong solution ideas.</p>
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
                    <p className="text-base">{subtitle}</p>
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
              <p className="text-base max-w-xl">
                Run your problem through each of the seven angles. You don&apos;t need to answer every prompt: jot ideas where they spark, then click <strong>Save Solution</strong> when you have one worth keeping.
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
                </div>
              </TabsContent>
              <TabsContent value="case-studies">
                <ScamperCaseStudies />
              </TabsContent>
            </Tabs>
            <SaveSolutionPanel toolType="scamper" />
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
                  <ReverseIdeationForm />
                </div>
              </TabsContent>
              <TabsContent value="case-studies">
                <ReverseCaseStudies />
              </TabsContent>
            </Tabs>
            <SaveSolutionPanel toolType="reverse" />
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
                </div>
              </TabsContent>
              <TabsContent value="case-studies">
                <AnalogyCaseStudies />
              </TabsContent>
            </Tabs>
            <SaveSolutionPanel toolType="analogy" />
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
                </div>
              </TabsContent>
              <TabsContent value="case-studies">
                <ImproveCaseStudies />
              </TabsContent>
            </Tabs>
            <SaveSolutionPanel toolType="improve" />
          </>
        )}

        {!discoveryToolType && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-lg border border-dashed">
            <p className="text-sm">No method selected.</p>
            <Button variant="outline" onClick={() => guardedRouter.push("/solutions/identify/pick-method")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Pick a method
            </Button>
          </div>
        )}

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => guardedRouter.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          {nextPath ? (
            <Button onClick={() => guardedRouter.push(nextPath)}>
              Next<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => guardedRouter.push("/solutions")}>
              Finish<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

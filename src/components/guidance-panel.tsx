"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Rocket, Compass, Search, ClipboardCheck,
  FileQuestion, Pencil, Package,
  Play, ToggleRight, Blocks, LayoutGrid, FileText, ArrowRight,
  GitFork, Heart, BarChart2, Target,
  Users, MapPin, AlertTriangle, Briefcase, Filter,
  Repeat, DollarSign, ArrowRightLeft, Wallet, PieChart,
  Lightbulb, HelpCircle,
  BookOpen, FlaskConical, Clock, Trophy, Sparkles,
  TrendingUp, Building2, Calculator, Scale, ShieldCheck,
  Glasses, HeartHandshake, Shuffle, Radar,
  X,
} from "lucide-react"

// ---------- Shared presentation helpers ----------

function IconTile({ icon: Icon, className, size = "md" }: { icon: React.ElementType; className: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-12 w-12" : "h-9 w-9"
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-4 w-4"
  return (
    <span className={`flex items-center justify-center rounded-lg shrink-0 ${dims} ${className}`} aria-hidden="true">
      <Icon className={`${iconSize} text-white`} />
    </span>
  )
}

function GuidanceHero({ icon, tone, title, subtitle }: { icon: React.ElementType; tone: string; title: string; subtitle: string }) {
  return (
    <header className="flex items-start gap-4">
      <IconTile icon={icon} className={tone} size="lg" />
      <div className="flex flex-col gap-1 min-w-0">
        <h3 className="text-xl font-bold leading-tight">{title}</h3>
        <p className="text-sm leading-relaxed">{subtitle}</p>
      </div>
    </header>
  )
}

function GuidanceSection({ icon, iconBg, title, children }: { icon: React.ElementType; iconBg: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-2">
      <h4 className="flex items-center gap-2.5 font-semibold">
        <IconTile icon={icon} className={iconBg} size="sm" />
        {title}
      </h4>
      <div className="text-sm leading-relaxed flex flex-col gap-2 pl-[38px]">
        {children}
      </div>
    </section>
  )
}

function NumberedStep({ n, title, accent = "bg-primary", children }: { n: number; title: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className={`flex items-center justify-center h-7 w-7 rounded-full shrink-0 ${accent} text-white text-sm font-semibold`} aria-hidden="true">
        {n}
      </span>
      <div className="flex flex-col gap-1 min-w-0">
        <h5 className="font-semibold text-foreground text-sm">{title}</h5>
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function ConceptCard({ icon: Icon, label, description, tile, border }: { icon: React.ElementType; label: string; description: string; tile: string; border: string }) {
  return (
    <div className={`rounded-lg border p-3 flex items-start gap-3 ${border}`}>
      <IconTile icon={Icon} className={tile} size="sm" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-semibold text-sm text-foreground">{label}</span>
        <span className="text-sm leading-relaxed">{description}</span>
      </div>
    </div>
  )
}

function TipCallout({ items }: { items: React.ReactNode[] }) {
  return (
    <aside className="rounded-lg border border-yellow-600/20 bg-yellow-600/5 p-4 flex gap-3">
      <IconTile icon={Lightbulb} className="bg-yellow-600" size="sm" />
      <div className="flex flex-col gap-1.5 min-w-0">
        <h5 className="font-semibold text-sm">Tips</h5>
        <ul className="flex flex-col gap-1 text-sm leading-relaxed list-disc pl-4">
          {items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </div>
    </aside>
  )
}

function Keyword({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>
}

// ---------- Topic content ----------

interface GuidanceItem {
  id: string
  title: string
  icon: React.ElementType
  iconBg: string
  content: React.ReactNode
}

const guidanceItems: GuidanceItem[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    iconBg: "bg-primary",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={Rocket}
          tone="bg-primary"
          title="Welcome to Navigate"
          subtitle="Navigate is your guide through the innovation journey, from surfacing areas of personal interest to validating problems worth solving."
        />
        <GuidanceSection icon={Compass} iconBg="bg-primary" title="The journey">
          <p>Navigate breaks the process into four connected stages. Work through them in order; later stages build on earlier ones. An optional <Keyword>Why It Matters</Keyword> section sits before everything else for those who want the grounding before they start.</p>
          <div className="flex flex-col gap-3 pt-1">
            <NumberedStep n={0} title="Why It Matters (optional)" accent="bg-violet-800">
              Short pages, videos, and case studies on why each stage exists and what happens when founders skip them.
            </NumberedStep>
            <NumberedStep n={1} title="Self Discovery" accent="bg-indigo-800">
              Explore your background, interests, and frustrations to surface <Keyword>problem triggers</Keyword>: seeds worth investigating.
            </NumberedStep>
            <NumberedStep n={2} title="Problem Discovery" accent="bg-orange-700">
              Turn those triggers into concrete, well-framed candidate problems using guided or freeform tools.
            </NumberedStep>
            <NumberedStep n={3} title="Problem Validation" accent="bg-green-800">
              Stress-test each candidate against alternatives, impact, and opportunity to decide if it is worth pursuing.
            </NumberedStep>
            <NumberedStep n={4} title="Solutions" accent="bg-blue-900">
              Once a problem is validated, generate and evaluate potential solutions.
            </NumberedStep>
          </div>
        </GuidanceSection>
        <TipCallout items={[
          "You can move between stages freely; earlier work is never locked",
          "The sidebar on the left is your map and all progress auto-saves",
          "Open this guidance at any time from the Guidance button in the header",
        ]} />
      </div>
    ),
  },
  {
    id: "foundations",
    title: "Why It Matters",
    icon: BookOpen,
    iconBg: "bg-violet-800",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={BookOpen}
          tone="bg-violet-800"
          title="Why It Matters"
          subtitle="An optional preamble to the rest of the app. Short pages, videos, and case studies on why finding the right idea, validating the problem, and validating the solution all matter, and what happens when founders skip these stages."
        />
        <GuidanceSection icon={Sparkles} iconBg="bg-violet-800" title="When to read this">
          <p>You don&apos;t have to go through this section. The rest of the app works fine without it. But if you&apos;re new to the problem-first approach, or you&apos;ve been tempted to skip straight to building, the reading here is designed to change that instinct before it costs you time.</p>
          <p>It covers the <Keyword>whys</Keyword> and the <Keyword>whats</Keyword> (what went wrong, what went well). It does <Keyword>not</Keyword> cover <Keyword>how</Keyword> to solve things; the Problems and Solutions sections have the tools for that.</p>
        </GuidanceSection>
        <GuidanceSection icon={LayoutGrid} iconBg="bg-violet-800" title="What&apos;s inside">
          <p>Five short sections, each with a tagline, key points, videos, and real case studies:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Compass} label="Why the right idea matters" description="Survivorship bias, passion as a false filter, and what actually separates ideas that work." tile="bg-yellow-600" border="border-yellow-600/20 bg-yellow-600/5" />
            <ConceptCard icon={Search} label="Why validate the problem" description="Polite enthusiasm is not validation. What a real problem looks like in user behaviour." tile="bg-teal-700" border="border-teal-700/20 bg-teal-700/5" />
            <ConceptCard icon={FlaskConical} label="Why validate the solution" description="A real problem doesn't mean your solution is the one people want. Landing pages, concierge tests, willingness to pay." tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
            <ConceptCard icon={Clock} label="The cost of skipping" description="Runway, team morale, sunk-cost bias, and opportunity cost: what it actually costs to build the wrong thing." tile="bg-red-800" border="border-red-800/20 bg-red-800/5" />
            <ConceptCard icon={Trophy} label="When it goes right" description="Airbnb, Dropbox, Buffer: founders who did the slow, unglamorous validation work before scaling." tile="bg-green-800" border="border-green-800/20 bg-green-800/5" />
          </div>
        </GuidanceSection>
        <GuidanceSection icon={ArrowRight} iconBg="bg-violet-800" title="What comes next">
          <p>Once you&apos;ve read as much as you want (or skipped straight past), move on to Self Discovery to start surfacing your own problem triggers.</p>
        </GuidanceSection>
        <TipCallout items={[
          "Pick the sections that match what you're unsure about; you don't have to read all five",
          "Case studies are grouped as 'what went wrong' or 'what went right'; both are worth reading",
          "You can return at any time from the sidebar",
        ]} />
      </div>
    ),
  },
  {
    id: "self-discovery",
    title: "Self Discovery",
    icon: Compass,
    iconBg: "bg-indigo-800",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={Compass}
          tone="bg-indigo-800"
          title="Self Discovery"
          subtitle="The starting point of the innovation journey. Surface areas of personal resonance, problems, or domains worth exploring before committing to a direction."
        />
        <GuidanceSection icon={FileQuestion} iconBg="bg-indigo-800" title="What you are presented with">
          <p>A series of guided questions organised into categories: your professional background, areas of daily frustration, causes you care about, or markets you are familiar with. Each category focuses on a different lens through which to view potential opportunities.</p>
        </GuidanceSection>
        <GuidanceSection icon={Pencil} iconBg="bg-indigo-800" title="What to do">
          <p>Work through each question at your own pace. For each one, enter short, honest answers. These become <Keyword>problem triggers</Keyword>: seeds of areas that might be worth investigating further. You can add multiple answers per question and return to update them as your thinking evolves.</p>
          <p>Some questions include suggestion exercises to help you generate ideas if you are unsure where to start. Use them as prompts, not constraints.</p>
        </GuidanceSection>
        <GuidanceSection icon={Package} iconBg="bg-indigo-800" title="The output">
          <p>At the end of Self Discovery you will have a collection of problem triggers visible in the left sidebar. These are not problems yet; they are areas of interest. You carry them into Problem Discovery, where dedicated tools sharpen them into concrete, well-framed problems worth validating.</p>
        </GuidanceSection>
        <TipCallout items={[
          <>Be specific: <Keyword>&ldquo;healthcare admin is slow&rdquo;</Keyword> is more useful than <Keyword>&ldquo;healthcare&rdquo;</Keyword></>,
          "Quantity matters at this stage; capture everything, filter later",
          "Return and update your answers as you learn more through the process",
        ]} />
      </div>
    ),
  },
  {
    id: "problem-discovery",
    title: "Problem Discovery",
    icon: Search,
    iconBg: "bg-orange-700",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={Search}
          tone="bg-orange-700"
          title="Problem Discovery"
          subtitle="Turn the rough areas identified in Self Discovery into concrete, well-framed problems worth investigating. Build a list of candidates before committing to validating any one of them."
        />
        <GuidanceSection icon={Play} iconBg="bg-orange-700" title="How it works">
          <p>Click <Keyword>Identify problems</Keyword> to open the tool selector. Use one of the discovery tools to surface a problem, or define one directly if you already know what you want to explore.</p>
        </GuidanceSection>
        <GuidanceSection icon={ToggleRight} iconBg="bg-orange-700" title="Two modes">
          <p>The Identify Problems tool offers two ways to work, switchable from the toggle in the top-right corner. Choose whichever suits your thinking style; you can switch at any time and your progress is preserved.</p>
        </GuidanceSection>
        <GuidanceSection icon={Blocks} iconBg="bg-orange-700" title="Problem Builder (guided mode)">
          <p>The builder walks you through four steps to construct a problem systematically:</p>
          <div className="flex flex-col gap-3 pt-1">
            <NumberedStep n={1} title="Pick an element" accent="bg-orange-700">
              Choose which dimension you want to start with: You, Customer, Context, or Problem.
            </NumberedStep>
            <NumberedStep n={2} title="Choose options" accent="bg-orange-700">
              Browse and tick the items that resonate with you within that dimension.
            </NumberedStep>
            <NumberedStep n={3} title="Add more elements" accent="bg-orange-700">
              Optionally pick another dimension to refine the problem, or skip straight to review. Dimensions you have already explored are shown with a checkmark.
            </NumberedStep>
            <NumberedStep n={4} title="Review & save" accent="bg-orange-700">
              See all selections at a glance, add an optional description, and save the problem.
            </NumberedStep>
          </div>
          <p className="pt-1">Your selections appear as coloured pills at the top of every step. Remove any selection with its <Keyword>×</Keyword> button. You do not need to fill in all three dimensions; a partial combination is still useful.</p>
        </GuidanceSection>
        <GuidanceSection icon={LayoutGrid} iconBg="bg-orange-700" title="Canvas (freeform mode)">
          <p>The canvas presents a multi-column framework for thinking systematically about who experiences a problem, in what situation, and what friction they face.</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Compass} label="You" description="Areas surfaced from your own self-discovery answers" tile="bg-yellow-600" border="border-yellow-600/20 bg-yellow-600/5" />
            <ConceptCard icon={Users} label="Customer" description="Who you are focusing on (e.g. early-career professionals, small business owners)" tile="bg-green-800" border="border-green-800/20 bg-green-800/5" />
            <ConceptCard icon={MapPin} label="Context" description="The situation or environment where the problem occurs (e.g. daily commute, remote team)" tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
            <ConceptCard icon={AlertTriangle} label="Problem" description="The category of friction (e.g. information gaps, coordination overhead)" tile="bg-red-800" border="border-red-800/20 bg-red-800/5" />
          </div>
          <p className="pt-1">Browse each column, tick items that resonate, and click <Keyword>Save Problem</Keyword> to record the combination. Each saved row is one candidate problem. Save as many as you like.</p>
        </GuidanceSection>
        <GuidanceSection icon={FileText} iconBg="bg-orange-700" title="Define a Problem Statement">
          <p>If you already have a clear problem in mind, skip the exploration tools and write it directly. Useful when you have prior knowledge of a domain or have already spoken to potential customers.</p>
        </GuidanceSection>
        <GuidanceSection icon={ArrowRight} iconBg="bg-orange-700" title="What comes next">
          <p>Once you have a list of candidate problems, move on to Problem Validation to choose one and analyse it in depth: alternatives, shortcomings, refinement (root causes, 5 whys, affected groups), emotional and quantifiable impact, and ultimately a validated problem statement.</p>
        </GuidanceSection>
      </div>
    ),
  },
  {
    id: "problem-validation",
    title: "Problem Validation",
    icon: ClipboardCheck,
    iconBg: "bg-green-800",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={ClipboardCheck}
          tone="bg-green-800"
          title="Problem Validation"
          subtitle="Stress-test a candidate problem before investing in a solution. The goal is not to prove the problem is valid; it is to gather enough evidence to make an honest, informed decision."
        />
        <GuidanceSection icon={Play} iconBg="bg-green-800" title="How it works">
          <p>Each problem goes through a structured sequence of steps. Work through them in order; each step builds on the last, but you can return and update any step as your thinking develops.</p>
        </GuidanceSection>
        <GuidanceSection icon={Users} iconBg="bg-indigo-800" title="Define your customer">
          <p>Pin down exactly who experiences the problem. Vague labels like <Keyword>&ldquo;everyone&rdquo;</Keyword> or <Keyword>&ldquo;businesses&rdquo;</Keyword> lead to vague problems and vague solutions; a sharp customer definition unlocks every later step. Narrow down by:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Briefcase} label="Role &amp; industry" description="What they do and which sector they work in (e.g. freelance designers, NHS nurses, SaaS founders)." tile="bg-indigo-800" border="border-indigo-800/20 bg-indigo-800/5" />
            <ConceptCard icon={MapPin} label="Demographics &amp; geography" description="Age range, location, income level, or company size." tile="bg-indigo-800" border="border-indigo-800/20 bg-indigo-800/5" />
            <ConceptCard icon={Target} label="Behaviour &amp; situation" description="What triggers the problem and when it tends to happen." tile="bg-indigo-800" border="border-indigo-800/20 bg-indigo-800/5" />
            <ConceptCard icon={Filter} label="Urgency &amp; willingness" description="How badly they need a solution and whether they already spend time or money fixing it." tile="bg-indigo-800" border="border-indigo-800/20 bg-indigo-800/5" />
          </div>
          <p className="pt-1">Capture a written description plus an order-of-magnitude estimate of the segment size. The size figure flows through to the market sizing step later.</p>
        </GuidanceSection>
        <GuidanceSection icon={Search} iconBg="bg-violet-800" title="Refine the problem">
          <p>Before exploring alternatives, dig into <Keyword>why</Keyword> the problem exists and <Keyword>who</Keyword> it affects. The <Keyword>Choose your refinement method</Keyword> step lets you pick one of three techniques; the next step is where you capture the actual analysis. The refinement output also surfaces later in solution discovery, so the work is reused.</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={GitFork} label="Root Causes" description="Map the underlying factors that give rise to the problem." tile="bg-violet-800" border="border-violet-800/20 bg-violet-800/5" />
            <ConceptCard icon={Repeat} label="5 Whys" description="Ask 'why' five times to drill from a surface symptom to the real cause." tile="bg-violet-800" border="border-violet-800/20 bg-violet-800/5" />
            <ConceptCard icon={Users} label="Affected Groups" description="Map who is impacted, how severely, and in what way." tile="bg-violet-800" border="border-violet-800/20 bg-violet-800/5" />
          </div>
        </GuidanceSection>
        <GuidanceSection icon={GitFork} iconBg="bg-blue-900" title="Existing solutions &amp; shortcomings">
          <p>List how customers handle the problem today: existing tools and software, manual workarounds, hiring or outsourcing, or simply tolerating the pain. For each one, capture its specific shortcomings: where it falls short, what it costs, or what friction it adds. This grounds the problem in reality and reveals the gap a future solution would need to fill.</p>
          <p>Each existing solution exposes an <Keyword>Impact examples</Keyword> panel listing common areas where shortcomings hurt (time lost, money wasted, errors, frustration, churn, and more). Use it to quantify how much each existing solution actually costs the customer; this is where the old <Keyword>quantifiable impact</Keyword> work now lives.</p>
        </GuidanceSection>
        <GuidanceSection icon={DollarSign} iconBg="bg-teal-700" title="How much is it worth">
          <p>Before counting customers or annualising frequencies, be honest about the value of solving the problem each time it happens. Two figures are captured on this step; both feed directly into the market sizing calculation that follows.</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Wallet} label="Money already spent" description="Subscriptions, contractors, late fines, or replacement parts. Revealed spend is the strongest evidence the problem is worth solving." tile="bg-teal-700" border="border-teal-700/20 bg-teal-700/5" />
            <ConceptCard icon={Scale} label="Time, risk, &amp; missed value" description="Translate the soft costs into money: an hour of professional time, a missed sale, a delayed launch, or the expected cost of a bad outcome." tile="bg-teal-700" border="border-teal-700/20 bg-teal-700/5" />
            <ConceptCard icon={DollarSign} label="Willingness to pay" description="What a customer would happily pay to make one occurrence go away, not what it would cost you to build a solution." tile="bg-teal-700" border="border-teal-700/20 bg-teal-700/5" />
            <ConceptCard icon={PieChart} label="Obtainable share" description="The slice of the full market you can realistically capture. Niche entrants typically reach 1 to 5 percent, differentiated plays 5 to 20 percent, category winners 20 to 40 percent." tile="bg-teal-700" border="border-teal-700/20 bg-teal-700/5" />
          </div>
          <p className="pt-1">A useful sense check: pick the lowest of the first three angles. The worth figure and the obtainable share both flow into the total addressable market calculation on the next step, so any change here will move that number directly.</p>
        </GuidanceSection>
        <GuidanceSection icon={TrendingUp} iconBg="bg-emerald-800" title="Size the market">
          <p>Layer the population on top of the worth figure you just captured. Two inputs do most of the work, captured directly on the page:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            <ConceptCard icon={Users} label="How many customers" description="The total population that fits your customer definition. Round generously; order of magnitude matters more than precision." tile="bg-emerald-800" border="border-emerald-800/20 bg-emerald-800/5" />
            <ConceptCard icon={Repeat} label="How often" description="The natural cadence of the problem, picked from per-hour through per-year. Daily problems compound value quickly; annual ones need unusual pain." tile="bg-emerald-800" border="border-emerald-800/20 bg-emerald-800/5" />
          </div>
          <p className="pt-1">Below the inputs a <Keyword>total addressable market</Keyword> calculation combines all four figures: <Keyword>customers × frequency × worth per occurrence × obtainable share</Keyword>. The result is in the same cadence you picked for frequency (so if you chose &ldquo;per year&rdquo;, the TAM is a yearly figure). Treat it as a sense check, not a forecast: an implausibly large or small number usually means one input is off, and the worth figure or share are usually the fastest to revisit.</p>
        </GuidanceSection>
        <GuidanceSection icon={Building2} iconBg="bg-yellow-600" title="Assess the competition">
          <p>A big market alone is not enough. The next question is whether you can realistically win in it. Three signals together tell you how hard the path will be:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            <ConceptCard icon={ArrowRightLeft} label="Cost of switching" description="The time, money, and habit-change a customer must give up to leave their current setup." tile="bg-yellow-600" border="border-yellow-600/20 bg-yellow-600/5" />
            <ConceptCard icon={Target} label="Existing solution effectiveness" description="How well current options actually work, from terrible through excellent." tile="bg-yellow-600" border="border-yellow-600/20 bg-yellow-600/5" />
            <ConceptCard icon={Building2} label="Competitor size" description="How well-funded the incumbents are, from micro players up to giants." tile="bg-yellow-600" border="border-yellow-600/20 bg-yellow-600/5" />
          </div>
          <p className="pt-1">Strong opportunities tend to combine low or moderate switching costs, average-or-worse alternatives, and competitors that are small or distracted. Capture supporting evidence in the <Keyword>notes</Keyword> field on this step: it carries through to the verdict and into the summary.</p>
        </GuidanceSection>
        <GuidanceSection icon={ShieldCheck} iconBg="bg-destructive" title="Record your verdict">
          <p>The verdict step pulls everything together. The summary card shows each captured factor (the three market signals and the three competition signals) with a colour-coded dot (green favourable, amber neutral, red unfavourable) and the total addressable market figure from the market step:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            <ConceptCard icon={Scale} label="Lean indicator" description="Once at least four of the six signals are captured, a banner shows whether the evidence leans toward Valid, Unsure, or Invalid." tile="bg-destructive" border="border-destructive/20 bg-destructive/5" />
            <ConceptCard icon={Calculator} label="Total addressable market is a sanity check" description="A large multiplied number is not the same as proven willingness to pay. Read the underlying signals before trusting the headline." tile="bg-destructive" border="border-destructive/20 bg-destructive/5" />
          </div>
          <p className="pt-1">Then commit to one of three verdicts: <Keyword>Valid</Keyword>, <Keyword>Unsure</Keyword>, or <Keyword>Invalid</Keyword>. The dot colours and lean banner are heuristics, not rules; if you disagree with how a signal is being read, override it in the notes and explain why. Use the notes to record the two or three signals that drove the call plus the strongest counter-argument you considered.</p>
        </GuidanceSection>
        <GuidanceSection icon={FileText} iconBg="bg-green-800" title="Summary &amp; next steps">
          <p>A read-only overview of everything you have captured: the customer definition, refinement work, existing solutions and their shortcomings, the worth and market figures, the competitive picture, and your verdict with notes. Use <Keyword>Open Problem to edit</Keyword> to jump back to the editable problem page if anything needs revising before you move on to solution discovery.</p>
        </GuidanceSection>
        <TipCallout items={[
          "Be honest about the evidence: weak validation data is a signal, not a failure",
          "Existing solutions with many shortcomings suggest a genuine gap in the market",
          "If you cannot justify the worth or obtainable share to a sceptical friend, slide them down",
          "Refinement work done here flows into solution discovery, so do not skip it",
          "You can validate multiple problems and compare verdicts before committing to one",
        ]} />
      </div>
    ),
  },
  {
    id: "solutions",
    title: "Solutions",
    icon: Lightbulb,
    iconBg: "bg-blue-900",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={Lightbulb}
          tone="bg-blue-900"
          title="Solutions"
          subtitle="Your Solution Bank collects candidate solutions for your validated problems. Discover new solutions through a guided wizard, then validate each one against feasibility, impact, cost, and time."
        />
        <GuidanceSection icon={Play} iconBg="bg-blue-900" title="How it works">
          <p>The Solutions workspace has two connected flows: a discovery wizard that generates candidates, and a validation wizard that evaluates each candidate on its own.</p>
          <div className="flex flex-col gap-3 pt-1">
            <NumberedStep n={1} title="Discover" accent="bg-blue-900">
              Pick a validated problem and use a creative technique to generate candidate solutions. Each candidate lands in your Solution Bank. Refinement work (root causes, 5 whys, affected groups) now happens earlier inside Problem Validation; the output flows through automatically.
            </NumberedStep>
            <NumberedStep n={2} title="Validate" accent="bg-green-800">
              For each candidate in the bank, work through the four validation metrics and reach a verdict: valid, unsure, or invalid.
            </NumberedStep>
          </div>
        </GuidanceSection>

        <GuidanceSection icon={Lightbulb} iconBg="bg-blue-900" title="Discover (inside Discover)">
          <p>Pick a creative method to generate solution ideas. Each candidate you capture is added to the Solution Bank so you can validate it later:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Blocks} label="SCAMPER" description="Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse. Generate ideas by transforming existing concepts." tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
            <ConceptCard icon={Repeat} label="Reverse Ideation" description="Instead of asking how to solve it, ask how to make it worse, then invert the answers." tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
            <ConceptCard icon={Compass} label="Analogy Thinking" description="Look at how other fields have solved similar problems and adapt their approach." tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
            <ConceptCard icon={ArrowRight} label="Improve Existing Solutions" description="Start from what already exists and sharpen it, removing shortcomings surfaced during validation." tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
          </div>
          <p className="pt-1">Each technique includes <Keyword>case studies</Keyword> to spark ideas. Use them as prompts, not templates. Capture as many candidates as you can think of; pruning comes later during validation.</p>
        </GuidanceSection>

        <GuidanceSection icon={BarChart2} iconBg="bg-green-800" title="Validate">
          <p>Open any solution in the bank and work through four one-at-a-time metric pages. Each page has guidance and case studies to help you score 1 to 5. At the end, you mark the solution valid, unsure, or invalid:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Target} label="Feasibility" description="Can you actually build it with the resources and skills available?" tile="bg-green-800" border="border-green-800/20 bg-green-800/5" />
            <ConceptCard icon={Heart} label="Impact" description="How much value does it deliver, to the customer and the business?" tile="bg-green-800" border="border-green-800/20 bg-green-800/5" />
            <ConceptCard icon={DollarSign} label="Cost" description="What will it take to build, run, and maintain?" tile="bg-green-800" border="border-green-800/20 bg-green-800/5" />
            <ConceptCard icon={Repeat} label="Time to Implement" description="How long from decision to delivery, including dependencies?" tile="bg-green-800" border="border-green-800/20 bg-green-800/5" />
          </div>
          <p className="pt-1">Validation runs per solution. You can mark some candidates valid and others invalid, or come back later as you learn more.</p>
        </GuidanceSection>

        <TipCallout items={[
          "Refinement now lives inside Problem Validation; the work you do there shapes everything in this section",
          "Quantity beats quality at the discover step; validation prunes later",
          "A weak candidate is still useful as a comparison baseline",
          "You can come back and add more candidates at any time",
        ]} />
      </div>
    ),
  },
  {
    id: "reflect-hub",
    title: "Reflect on Problems",
    icon: Glasses,
    iconBg: "bg-secondary-brand",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={Glasses}
          tone="bg-secondary-brand"
          title="Reflect on Problems"
          subtitle="A guided way to surface problems worth solving by answering short prompts about your work, life, the organizations you know, the people around you, and what you spot in the wider world."
        />
        <GuidanceSection icon={Compass} iconBg="bg-secondary-brand" title="When to use Reflect">
          <p>Reflect is its own tool, opened from the <Keyword>Identify problems</Keyword> selector and living at <Keyword>/problems/identify/reflect</Keyword>.</p>
          <div className="grid gap-3 pt-1 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-3">
              <h5 className="text-sm font-semibold mb-1">Use Reflect when</h5>
              <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1">
                <li>You want a prompt to react to, not a blank canvas.</li>
                <li>You&apos;d rather mine experience you already have than research the market.</li>
                <li>You&apos;re not sure where to start.</li>
              </ul>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <h5 className="text-sm font-semibold mb-1">Use Canvas or Builder instead when</h5>
              <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1">
                <li>You already have specific customers, contexts, or pain points in mind.</li>
                <li>You want to compose problems by combining columns on a canvas.</li>
                <li>You&apos;re iterating on an existing problem area.</li>
              </ul>
            </div>
          </div>
        </GuidanceSection>
        <GuidanceSection icon={LayoutGrid} iconBg="bg-secondary-brand" title="The six lenses">
          <p>Each lens is a short Q&A focused on one source of insight. Answers are saved as <Keyword>candidates</Keyword> you can review before promoting them into your problem library.</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Briefcase} label="Work friction" description="Repeated annoyances, expensive habits, and 'this should just exist' thoughts at your job." tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
            <ConceptCard icon={HeartHandshake} label="Life experiences" description="Productize what you have already lived through. The friction you remember is friction others are about to hit." tile="bg-yellow-600" border="border-yellow-600/20 bg-yellow-600/5" />
            <ConceptCard icon={Building2} label="Insider angle" description="Use what you know about organizations from the inside. Outsiders cannot see what you have seen." tile="bg-emerald-800" border="border-emerald-800/20 bg-emerald-800/5" />
            <ConceptCard icon={Shuffle} label="Cross-context patterns" description="Spot something that works in one industry, hobby, or country and is missing in another you know." tile="bg-violet-800" border="border-violet-800/20 bg-violet-800/5" />
            <ConceptCard icon={Users} label="People around you" description="Observation, not introspection. Validate by asking the person." tile="bg-rose-800" border="border-rose-800/20 bg-rose-800/5" />
            <ConceptCard icon={Radar} label="Market signals" description="A capture form for problems you spot by looking outward: reviews, trends, public data, research." tile="bg-orange-700" border="border-orange-700/20 bg-orange-700/5" />
          </div>
        </GuidanceSection>
        <GuidanceSection icon={Sparkles} iconBg="bg-secondary-brand" title="From your self-discovery">
          <p>Several lenses surface chips drawn from your saved self-discovery answers. Picking a chip drops the title into the textarea as a starting point so you can edit and expand. The panel only appears if you have items in the matching category and is suggestion-only: nothing is ever auto-filled.</p>
          <p>The hub also marks a few lenses as <Keyword>Recommended</Keyword> based on what you already answered in self-discovery. It is a nudge, not a gate.</p>
        </GuidanceSection>
        <GuidanceSection icon={ArrowRight} iconBg="bg-secondary-brand" title="The candidate flow">
          <div className="flex flex-col gap-3 pt-1">
            <NumberedStep n={1} title="Pick a lens" accent="bg-secondary-brand">
              From the hub, pick a lens and read the short introduction. Lenses take roughly 5 to 10 minutes.
            </NumberedStep>
            <NumberedStep n={2} title="Answer the prompts" accent="bg-secondary-brand">
              One prompt per screen. Multiple answers allowed where it helps. Skip anything that does not apply.
            </NumberedStep>
            <NumberedStep n={3} title="Review and save" accent="bg-secondary-brand">
              Edit or remove answers, capture optional context (who else has this, why has nobody done it yet), and save the rest as candidates.
            </NumberedStep>
            <NumberedStep n={4} title="Promote what is worth refining" accent="bg-secondary-brand">
              Candidates live on the hub. Promote the strongest ones into your problem library to validate them in the existing flow.
            </NumberedStep>
          </div>
        </GuidanceSection>
        <TipCallout items={[
          "Small, specific, and slightly weird answers tend to point at the most interesting problems",
          "If you are not sure between two answers, save both. Pruning happens later",
          "The Market signals lens is for capturing what you find when you look outward. The prompts do not tell you what to look at",
        ]} />
      </div>
    ),
  },
  {
    id: "reflect-candidates",
    title: "Candidates",
    icon: Lightbulb,
    iconBg: "bg-tertiary",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={Lightbulb}
          tone="bg-tertiary"
          title="Reflect candidates"
          subtitle="A staging area between lens answers and full Problems. Candidates let you collect more than you commit to, then promote only the ones worth refining."
        />
        <GuidanceSection icon={Filter} iconBg="bg-tertiary" title="Three tabs">
          <p><Keyword>Active</Keyword> is the default. It shows candidates you have not yet promoted or dismissed.</p>
          <p><Keyword>Promoted</Keyword> shows candidates that became Problems. Use the open-Problem icon to jump straight into the refinement flow.</p>
          <p><Keyword>Dismissed</Keyword> is soft-deleted. Candidates here can be restored at any time. Nothing is ever hard-deleted from the UI.</p>
        </GuidanceSection>
        <GuidanceSection icon={ArrowRight} iconBg="bg-tertiary" title="Promoting to a Problem">
          <p>Promotion creates a new, <Keyword>blank</Keyword> Problem with the candidate title as its description. You fill in the rest (customers, contexts, problem types, validation) in the existing problem refinement flow at <Keyword>/problems/&#x5b;id&#x5d;</Keyword>.</p>
          <p>You can edit the title before confirming. Captured context fields on the candidate stay on the candidate for reference; they do not auto-fill the Problem.</p>
        </GuidanceSection>
        <GuidanceSection icon={Repeat} iconBg="bg-tertiary" title="Bulk actions">
          <p>The Active tab has a select-all checkbox plus per-row checkboxes. When you have a selection, the row at the top of the list shows <Keyword>Promote selected</Keyword> and <Keyword>Dismiss selected</Keyword>. Both ask for confirmation before running.</p>
        </GuidanceSection>
        <TipCallout items={[
          "Candidates persist indefinitely. There is no auto-decay",
          "Two lenses can produce near-identical candidates; both stay. Pick the wording you prefer when you promote",
          "Dismissed candidates do not clutter the Active count but are kept for context",
        ]} />
      </div>
    ),
  },
]

export function GuidancePanel({
  onClose,
  initialTopic,
}: {
  onClose: () => void
  initialTopic?: string
}) {
  const [openItem, setOpenItem] = useState(initialTopic ?? guidanceItems[0].id)

  useEffect(() => {
    if (initialTopic) {
      setOpenItem(initialTopic)
    }
  }, [initialTopic])

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 shrink-0">
            <HelpCircle className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold truncate">Guidance</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onClose}
          aria-label="Close guidance"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-1 min-h-0 flex-col">
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <Accordion
              type="single"
              collapsible
              value={openItem}
              onValueChange={(v) => setOpenItem(v)}
              className="px-4"
            >
              {guidanceItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-b last:border-b-0"
                >
                  <AccordionTrigger className="gap-3 hover:no-underline">
                    <span className="flex items-center gap-3 min-w-0">
                      <IconTile icon={item.icon} className={item.iconBg} size="sm" />
                      <span className="font-semibold text-sm truncate">{item.title}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6">
                    {item.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

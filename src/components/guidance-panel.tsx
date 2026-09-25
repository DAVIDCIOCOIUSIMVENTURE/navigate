"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SHOW_REFINEMENT_STEPS } from "@/lib/feature-flags"
import {
  Rocket, Compass, Search, ClipboardCheck,
  FileQuestion, Pencil, Package,
  Play, ToggleRight, Blocks, LayoutGrid, FileText, ArrowRight,
  GitFork, Heart, BarChart2, Target,
  Users, MapPin, AlertTriangle, Briefcase, Filter, Eye,
  Repeat, PoundSterling, ArrowRightLeft, Wallet, PieChart,
  Lightbulb, HelpCircle,
  BookOpen, FlaskConical, Clock, Trophy, Sparkles,
  TrendingUp, Building2, Calculator, Scale, ShieldCheck,
  Glasses,
  Telescope,
  FolderOpen, Settings, Presentation, Route, Microscope, PenLine,
  X,
} from "lucide-react"
import { REFLECT_LENSES, startsFromProblem, type Lens } from "@/data/reflectLenses"
import { GUIDED_TOOL } from "@/data/guidedDiscovery"

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
        <p className="text-base leading-relaxed">{subtitle}</p>
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
      <div className="text-base leading-relaxed flex flex-col gap-2 pl-[38px]">
        {children}
      </div>
    </section>
  )
}

function NumberedStep({ n, title, accent = "bg-primary", children }: { n: number; title: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className={`flex items-center justify-center h-7 w-7 rounded-full shrink-0 ${accent} text-white text-base font-semibold`} aria-hidden="true">
        {n}
      </span>
      <div className="flex flex-col gap-1 min-w-0">
        <h5 className="font-semibold text-foreground text-base">{title}</h5>
        <div className="text-base leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function ConceptCard({ icon: Icon, label, description, tip, tile, border }: { icon: React.ElementType; label: string; description: string; tip?: string; tile: string; border: string }) {
  return (
    <div className={`rounded-lg border p-3 flex items-start gap-3 ${border}`}>
      <IconTile icon={Icon} className={tile} size="sm" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-semibold text-base text-foreground">{label}</span>
        <span className="text-base leading-relaxed">{description}</span>
        {tip && (
          <span className="text-base leading-relaxed pt-1">
            <span className="font-medium text-foreground">Tip: </span>
            {tip}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * The tile colours the guided prompt tools' cards cycle through, in catalogue
 * order, taken from the saturated tile palette so the cards read as one family.
 */
const TOOL_TILES: ReadonlyArray<{ tile: string; border: string }> = [
  { tile: "bg-yellow-600", border: "border-yellow-600/20 bg-yellow-600/5" },
  { tile: "bg-blue-900", border: "border-blue-900/20 bg-blue-900/5" },
  { tile: "bg-emerald-800", border: "border-emerald-800/20 bg-emerald-800/5" },
  { tile: "bg-rose-800", border: "border-rose-800/20 bg-rose-800/5" },
  { tile: "bg-violet-800", border: "border-violet-800/20 bg-violet-800/5" },
]

/** One card per guided prompt tool, drawn from the catalogue so the panel can never fall out of step with the hub. */
function GuidedToolCards({ lenses }: { lenses: Lens[] }) {
  return (
    <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
      {lenses.map((lens) => {
        const colours = TOOL_TILES[REFLECT_LENSES.indexOf(lens) % TOOL_TILES.length]
        return (
          <ConceptCard
            key={lens.id}
            icon={lens.icon}
            label={lens.title}
            description={lens.shortDescription}
            tip={lens.helperText}
            tile={colours.tile}
            border={colours.border}
          />
        )
      })}
    </div>
  )
}

function TipCallout({ items }: { items: React.ReactNode[] }) {
  return (
    <aside className="rounded-lg border border-yellow-600/20 bg-yellow-600/5 p-4 flex gap-3">
      <IconTile icon={Lightbulb} className="bg-yellow-600" size="sm" />
      <div className="flex flex-col gap-1.5 min-w-0">
        <h5 className="font-semibold text-base">Tips</h5>
        <ul className="flex flex-col gap-1 text-base leading-relaxed list-disc pl-4">
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
          subtitle="Navigate is your guide through the innovation journey, from surfacing areas of personal interest to testing problems worth solving."
        />
        <GuidanceSection icon={Compass} iconBg="bg-primary" title="The journey">
          <p>Navigate breaks the process into a sequence of connected stages. Work through them in order; later stages build on earlier ones. An optional <Keyword>Why It Matters</Keyword> section sits before everything else for those who want the grounding before they start. Everything from stage 2 onwards happens inside a <Keyword>project</Keyword>: one problem and the solutions found for it. <Keyword>Home</Keyword> keeps the whole journey in view: how far your Self Discovery has got, your projects, and quick links into the reading sections.</p>
          <div className="flex flex-col gap-3 pt-1">
            <NumberedStep n={0} title="Why It Matters (optional)" accent="bg-violet-800">
              Short pages, videos, and case studies on why each stage exists and what happens when founders skip them.
            </NumberedStep>
            <NumberedStep n={1} title="Self Discovery" accent="bg-indigo-800">
              Explore your background, interests, and frustrations to surface <Keyword>problem triggers</Keyword>: seeds worth investigating.
            </NumberedStep>
            <NumberedStep n={2} title="Identify a problem" accent="bg-orange-700">
              Start a project from the Projects page, then turn those triggers into one concrete, well-framed problem with one of the identify tools. The problem becomes the project&apos;s problem.
            </NumberedStep>
            <NumberedStep n={3} title="Explore the Problem" accent="bg-tertiary">
              Take your project&apos;s problem for a deeper dive: define the customer, map existing solutions, and capture what the customer is trying to achieve.
            </NumberedStep>
            <NumberedStep n={4} title="Test the Problem" accent="bg-green-800">
              Stress-test the explored problem against price, market size, and competition to decide if it is worth pursuing.
            </NumberedStep>
            <NumberedStep n={5} title="Solutions" accent="bg-blue-900">
              Once the problem has passed its test, identify candidate solutions, test each one on feasibility, impact, cost and time, then compare them and pick which to pursue.
            </NumberedStep>
            <NumberedStep n={6} title="Share the portfolio" accent="bg-teal-700">
              When a solution is worth pursuing, share the whole project as a read-only portfolio page that somebody with no account can read.
            </NumberedStep>
          </div>
        </GuidanceSection>
        <TipCallout items={[
          "You can move between stages freely; earlier work is never locked. Where the usual order matters, Navigate warns you and lets you carry on",
          "Everything auto-saves as you go; there is nothing to submit",
          "The journey rail down the left of every project page shows where you are; each milestone links into that work",
          "New to Navigate? Take the guided tour from the account menu in the header",
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
          subtitle="An optional preamble to the rest of the app. Short pages, videos, and case studies on why finding the right idea, testing the problem, and testing the solution all matter, and what happens when founders skip these stages."
        />
        <GuidanceSection icon={Sparkles} iconBg="bg-violet-800" title="When to read this">
          <p>You don&apos;t have to go through this section. The rest of the app works fine without it. But if you&apos;re new to the problem-first approach, or you&apos;ve been tempted to skip straight to building, the reading here is designed to change that instinct before it costs you time.</p>
          <p>It covers the <Keyword>whys</Keyword> and the <Keyword>whats</Keyword> (what went wrong, what went well). It does <Keyword>not</Keyword> cover <Keyword>how</Keyword> to solve things; your projects have the tools for that.</p>
        </GuidanceSection>
        <GuidanceSection icon={LayoutGrid} iconBg="bg-violet-800" title="What&apos;s inside">
          <p>Five short sections, each with a tagline, key points, videos, and real case studies:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Compass} label="Why the right idea matters" description="Survivorship bias, passion as a false filter, and what actually separates ideas that work." tile="bg-yellow-600" border="border-yellow-600/20 bg-yellow-600/5" />
            <ConceptCard icon={Search} label="Why test the problem" description="Polite enthusiasm is not evidence. What a real problem looks like in user behaviour." tile="bg-teal-700" border="border-teal-700/20 bg-teal-700/5" />
            <ConceptCard icon={FlaskConical} label="Why test the solution" description="A real problem doesn't mean your solution is the one people want. Landing pages, concierge tests, willingness to pay." tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
            <ConceptCard icon={Clock} label="The cost of skipping" description="Runway, team morale, sunk-cost bias, and opportunity cost: what it actually costs to build the wrong thing." tile="bg-red-800" border="border-red-800/20 bg-red-800/5" />
            <ConceptCard icon={Trophy} label="When it goes right" description="Airbnb, Dropbox, Buffer: founders who did the slow, unglamorous testing before scaling." tile="bg-green-800" border="border-green-800/20 bg-green-800/5" />
          </div>
        </GuidanceSection>
        <GuidanceSection icon={ArrowRight} iconBg="bg-violet-800" title="What comes next">
          <p>Once you&apos;ve read as much as you want (or skipped straight past), move on to Self Discovery to start surfacing your own problem triggers, or go straight to Projects and start one.</p>
        </GuidanceSection>
        <TipCallout items={[
          "Pick the sections that match what you're unsure about; you don't have to read all five",
          "Case studies are grouped as 'what went wrong' or 'what went right'; both are worth reading",
          "You can return at any time from Why It Matters in the left menu, or its row on Home",
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
          <p>At the end of Self Discovery you will have a collection of problem triggers. These are not problems yet; they are areas of interest. They resurface when you identify a problem for a project: in the <Keyword>You</Keyword> column of the Canvas Builder and in the pick lists of the guided prompt tools, where dedicated tools sharpen them into a concrete, well-framed problem worth exploring and testing.</p>
        </GuidanceSection>
        <TipCallout items={[
          <>Be specific: <Keyword>&ldquo;healthcare admin is slow&rdquo;</Keyword> is more useful than <Keyword>&ldquo;healthcare&rdquo;</Keyword></>,
          "Quantity matters at this stage; capture everything, filter later",
          "Return and update your answers as you learn more through the process",
          "Home shows how far you have got, with a button that picks up where you left off",
        ]} />
      </div>
    ),
  },
  {
    id: "projects",
    title: "Projects",
    icon: FolderOpen,
    iconBg: "bg-teal-700",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={FolderOpen}
          tone="bg-teal-700"
          title="Projects"
          subtitle="A project is the unit of work in Navigate: one problem and the solutions found for it. Everything from identifying a problem onwards happens inside one. The Projects page lists them, Home sums them up beside your Self Discovery, and everything about a project lives on its page."
        />
        <GuidanceSection icon={LayoutGrid} iconBg="bg-teal-700" title="Home and the Projects page">
          <p>Home is your overview: how far your Self Discovery has got, your projects, and quick links into Why It Matters and Next Steps. <Keyword>Projects</Keyword> in the left menu holds the same list on its own. Both list your projects newest first, with each project&apos;s problem and its status, how many solutions it has and its team. Click a row to open the project, or its settings button at the end of the row to change the project without opening it. <Keyword>New project</Keyword> starts one from either page (it also sits at the top of the projects menu in the header), and the menu beside it on the Projects page exports a project as a file or imports one somebody has sent you.</p>
        </GuidanceSection>
        <GuidanceSection icon={FolderOpen} iconBg="bg-teal-700" title="The project page">
          <p>The left column carries the project&apos;s name, its team, a <Keyword>Settings</Keyword> button and the journey rail. Beside it sits the problem canvas: its cards summarise the problem, every card title opens an edit dialog for that card, and the gear button beside the status pill holds the actions (<Keyword>Explore</Keyword>, <Keyword>Test</Keyword>, <Keyword>Edit</Keyword>, <Keyword>Full view</Keyword>, <Keyword>Download as text</Keyword> and <Keyword>Export project</Keyword>). Under the canvas, the solutions table lists what you have found, with <Keyword>Identify solutions</Keyword> and <Keyword>Compare solutions</Keyword> beside it.</p>
          <p>A project with no problem yet shows an <Keyword>Identify a problem</Keyword> button instead, which opens the project&apos;s hub of identify tools.</p>
        </GuidanceSection>
        <GuidanceSection icon={Settings} iconBg="bg-teal-700" title="Project settings">
          <p>One dialog holds everything about the project itself. Rename it, add or remove the people on its team (names and email addresses for now, since there are no accounts yet), switch on <Keyword>Share a public portfolio</Keyword>, open the portfolio, export the project as a file or import one, and delete the project. Deleting a project takes its problem and solutions with it and returns you to the Projects page; the notes in your journal that were linked to it are kept and simply unlinked.</p>
        </GuidanceSection>
        <GuidanceSection icon={Presentation} iconBg="bg-teal-700" title="The portfolio">
          <p>The portfolio is the project written out for somebody who has never used Navigate: the problem, who has it, what those people are trying to get done, how they cope today, what solving it could be worth, the competition, the verdict, and every solution with how it was found and how it scored. It is read only and needs no account or password.</p>
          <p>A project is private until you share it. <Keyword>Open portfolio</Keyword> works before then, so you can read it yourself and decide whether it is ready; a banner says nobody else can open it yet. Until projects are stored on a server, the link only opens on the device the project was made on.</p>
          <p>An admin reviewing your work sees the same portfolio from the <Keyword>Projects</Keyword> tab of the admin panel, with one addition: the notes in your journal that are linked to the project sit in a margin down the right, like comments on a document, each beside the part it is about. Notes linked to a solution sit beside that solution and notes linked to the problem sit beside the problem. They never appear on the public portfolio.</p>
        </GuidanceSection>
        <GuidanceSection icon={Route} iconBg="bg-teal-700" title="Finding your way">
          <p>Every flow inside a project is a focus page: the header and sidebar step aside, and two buttons take their place. <Keyword>Home</Keyword> returns to the home page from anywhere, however deep you are, and <Keyword>Menu</Keyword> reveals the top bar with the projects menu, journal and this guidance. The breadcrumb in the header reads Home, then Projects, then the project, so any part of it climbs back up a level.</p>
          <p>The journey rail shows the five milestones: Identify problem, Explore problem, Test problem, Identify solutions and Test solutions. The page&apos;s own step is highlighted, the steps this problem has reached are filled in, and each label leads into that work for this project, so <Keyword>Identify problem</Keyword> reopens the tool the problem came from and <Keyword>Test solutions</Keyword> opens the next solution waiting for a verdict.</p>
        </GuidanceSection>
        <TipCallout items={[
          "Each project holds exactly one problem. To work on a second problem, start a second project",
          "Export a project before trying something drastic; importing the file back gives you a fresh copy",
          "Notes in the journal are linked to Self Discovery, a project's problem or one of its solutions, and the panel can filter to just this project's notes. An admin reviewing the project can read the notes linked to it, so link a note to a solution when it is about that solution",
        ]} />
      </div>
    ),
  },
  {
    id: "problem-discovery",
    title: "Identify a Problem",
    icon: Search,
    iconBg: "bg-orange-700",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={Search}
          tone="bg-orange-700"
          title="Identify a Problem"
          subtitle="Turn the rough areas identified in Self Discovery into a concrete, well-framed problem worth investigating. Each project holds one problem, so the tools here give your project its problem."
        />
        <GuidanceSection icon={Play} iconBg="bg-orange-700" title="How it works">
          <p>On a project with no problem yet, click <Keyword>Identify a problem</Keyword> to open the hub. It lists every tool, each with a pill showing which dimension it starts from (You, Customer, Context or Problem), a one-line description, a <Keyword>Best for</Keyword> note to help you choose and a rough time. Whichever you pick, the problem lands in your project and a dialog offers to take you straight into Explore.</p>
          <p>Once the project has its problem the hub becomes <Keyword>Revisit the Problem</Keyword>: the same tools reopen it with what you captured, and saving updates the problem rather than adding another.</p>
        </GuidanceSection>
        <GuidanceSection icon={LayoutGrid} iconBg="bg-orange-700" title="The tools">
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={GUIDED_TOOL.icon} label={GUIDED_TOOL.title} description="A prototype of one tool for all of them. It first asks what you are starting from (your own experience, a group of people, an annoyance or a moment when things go wrong), then asks the same short set of questions worded for your answer." tile="bg-orange-700" border="border-orange-700/20 bg-orange-700/5" />
            <ConceptCard icon={Glasses} label="Guided prompt tools" description="Five tools that ask short questions about something you already know: what you have lived through, the work you do, what you have built, a group you know well, or something that annoys you. See the Guided Prompt Tools topic below." tile="bg-orange-700" border="border-orange-700/20 bg-orange-700/5" />
            <ConceptCard icon={Blocks} label="Canvas Builder" description="Combine customer segments, contexts and types of pain from a curated catalogue on a single canvas. Best when you already know how to ask the right questions or want to explore a wide space quickly." tile="bg-orange-700" border="border-orange-700/20 bg-orange-700/5" />
            <ConceptCard icon={Microscope} label="Research" description="Hunt for problems out in the world. Pick a research method, use its curated tools (review sites, forums, communities, conversations with strangers) and capture what you find in a guided form." tile="bg-orange-700" border="border-orange-700/20 bg-orange-700/5" />
            <ConceptCard icon={PenLine} label="Define a Problem Statement" description="Already know what you want to explore? Write it directly, with its customers, contexts and problem types, without working through a tool." tile="bg-orange-700" border="border-orange-700/20 bg-orange-700/5" />
          </div>
        </GuidanceSection>
        <GuidanceSection icon={ToggleRight} iconBg="bg-orange-700" title="The Canvas Builder's two modes">
          <p>The Canvas Builder offers two ways to work, switchable from the <Keyword>Canvas</Keyword> / <Keyword>Builder</Keyword> toggle in its toolbar. Choose whichever suits your thinking style; both work on the same selection, so you can switch at any time and your progress is preserved.</p>
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
          <p className="pt-1">Your selections appear as coloured pills at the top of every step. Remove any selection with its <Keyword>×</Keyword> button (you are asked to confirm first). You do not need to fill in every dimension; a partial combination is still useful.</p>
        </GuidanceSection>
        <GuidanceSection icon={LayoutGrid} iconBg="bg-orange-700" title="Canvas (freeform mode)">
          <p>The canvas presents a multi-column framework for thinking systematically about who experiences a problem, in what situation, and what friction they face.</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Compass} label="You" description="Areas surfaced from your own self-discovery answers" tile="bg-yellow-600" border="border-yellow-600/20 bg-yellow-600/5" />
            <ConceptCard icon={Users} label="Customer" description="Who you are focusing on (e.g. early-career professionals, small business owners)" tile="bg-green-800" border="border-green-800/20 bg-green-800/5" />
            <ConceptCard icon={MapPin} label="Context" description="The situation or environment where the problem occurs (e.g. daily commute, remote team)" tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
            <ConceptCard icon={AlertTriangle} label="Problem" description="The category of friction (e.g. information gaps, coordination overhead)" tile="bg-red-800" border="border-red-800/20 bg-red-800/5" />
          </div>
          <p className="pt-1">Browse each column, tick items that resonate, and click <Keyword>Save Problem</Keyword> to record the combination as your project&apos;s problem. Anything you add in your own words joins the catalogue for next time. Coming back to the canvas later reopens the problem&apos;s selections, and the button reads <Keyword>Update Problem</Keyword>.</p>
        </GuidanceSection>
        <GuidanceSection icon={ArrowRight} iconBg="bg-orange-700" title="What comes next">
          <p>Once your project has its problem, take it into <Keyword>Explore the Problem</Keyword>: a deeper dive that defines the customer, {SHOW_REFINEMENT_STEPS && <>refines the problem (root causes, 5 whys, affected groups), </>}maps existing solutions and their shortcomings, and captures what the customer is trying to achieve. That work then feeds Test the Problem, where you size the market and decide whether the problem is worth pursuing.</p>
        </GuidanceSection>
        <TipCallout items={[
          "Not sure which tool to pick? Open Best for under each one, or start with Guided discovery, which asks that question for you",
          "Identifying is done once the problem is saved. Change your mind by revisiting the tool or by editing the canvas cards on the project page, not by starting again",
        ]} />
      </div>
    ),
  },
  {
    id: "explore-problem",
    title: "Explore the Problem",
    icon: Telescope,
    iconBg: "bg-tertiary",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={Telescope}
          tone="bg-tertiary"
          title="Explore the Problem"
          subtitle="A deeper dive into your project&apos;s problem before you size any markets. Understand exactly who has the problem, why it really happens, how people cope today, and what they are trying to get done. Everything you capture here carries forward into Test the Problem."
        />
        <GuidanceSection icon={Play} iconBg="bg-tertiary" title="How it works">
          <p>Open <Keyword>Explore</Keyword> from the actions menu on your project page (the gear button beside the problem&apos;s status), or from the <Keyword>Explore problem</Keyword> milestone on the journey rail. You work through a sequence of steps: define the customer, {SHOW_REFINEMENT_STEPS && <>refine the problem, </>}map existing solutions, and capture what the customer is trying to achieve. Work through them in order; each builds on the last, but you can return and update any step as your thinking develops.</p>
        </GuidanceSection>
        <GuidanceSection icon={Users} iconBg="bg-indigo-800" title="Define your customer">
          <p>Pin down exactly who experiences the problem. Vague labels like <Keyword>&ldquo;everyone&rdquo;</Keyword> or <Keyword>&ldquo;businesses&rdquo;</Keyword> lead to vague problems and vague solutions; a sharp customer definition unlocks every later step. Narrow down by:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Briefcase} label="Role &amp; industry" description="What they do and which sector they work in (e.g. freelance designers, NHS nurses, SaaS founders)." tile="bg-indigo-800" border="border-indigo-800/20 bg-indigo-800/5" />
            <ConceptCard icon={MapPin} label="Demographics &amp; geography" description="Age range, location, income level, or company size." tile="bg-indigo-800" border="border-indigo-800/20 bg-indigo-800/5" />
            <ConceptCard icon={Target} label="Behaviour &amp; situation" description="What triggers the problem and when it tends to happen." tile="bg-indigo-800" border="border-indigo-800/20 bg-indigo-800/5" />
            <ConceptCard icon={Filter} label="Urgency &amp; willingness" description="How badly they need a solution and whether they already spend time or money fixing it." tile="bg-indigo-800" border="border-indigo-800/20 bg-indigo-800/5" />
          </div>
          <p className="pt-1">Capture a written description of who experiences the problem. The population figure is captured later, on the market sizing step.</p>
        </GuidanceSection>
        {SHOW_REFINEMENT_STEPS && (
          <GuidanceSection icon={Search} iconBg="bg-violet-800" title="Refine the problem">
            <p>Before exploring alternatives, dig into <Keyword>why</Keyword> the problem exists and <Keyword>who</Keyword> it affects. The <Keyword>Choose your refinement method</Keyword> step lets you pick one of three techniques; the next step is where you capture the actual analysis. The refinement output also surfaces later when you identify solutions, so the work is reused.</p>
            <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              <ConceptCard icon={GitFork} label="Root Causes" description="Map the underlying factors that give rise to the problem." tile="bg-violet-800" border="border-violet-800/20 bg-violet-800/5" />
              <ConceptCard icon={Repeat} label="5 Whys" description="Ask 'why' five times to drill from a surface symptom to the real cause." tile="bg-violet-800" border="border-violet-800/20 bg-violet-800/5" />
              <ConceptCard icon={Users} label="Affected Groups" description="Map who is impacted, how severely, and in what way." tile="bg-violet-800" border="border-violet-800/20 bg-violet-800/5" />
            </div>
          </GuidanceSection>
        )}
        <GuidanceSection icon={GitFork} iconBg="bg-blue-900" title="Existing solutions &amp; shortcomings">
          <p>List how customers handle the problem today: existing tools and software, manual workarounds, hiring or outsourcing, or simply tolerating the pain. For each one, capture its specific shortcomings: where it falls short, what it costs, or what friction it adds. This grounds the problem in reality and reveals the gap a future solution would need to fill.</p>
          <p>Each existing solution exposes an <Keyword>Impact examples</Keyword> panel listing common areas where shortcomings hurt (time lost, money wasted, errors, frustration, churn, and more). Use it to quantify how much each existing solution actually costs the customer; this is where the old <Keyword>quantifiable impact</Keyword> work now lives.</p>
        </GuidanceSection>
        <GuidanceSection icon={Sparkles} iconBg="bg-rose-800" title="What your customer is trying to achieve">
          <p>Before guessing a price, get a clear picture of what the customer is really trying to achieve. People do not buy products: they buy progress towards a goal. Split that goal into three layers, because the strongest emotional or social pull is usually what justifies the price, not the tangible task.</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Briefcase} label="What they need to get done" description="The tangible tasks, phrased as outcomes (e.g. complete the sale and the purchase on the same day, find a place inside budget)." tile="bg-emerald-800" border="border-emerald-800/20 bg-emerald-800/5" />
            <ConceptCard icon={Heart} label="How they want to feel" description="The emotional pulls, rated mild, strong, or unbearable from what real customers have said (e.g. stop lying awake worrying the chain will collapse)." tile="bg-red-800" border="border-red-800/20 bg-red-800/5" />
            <ConceptCard icon={Eye} label="How they want to be seen" description="The social pulls, rated the same way (e.g. not look disorganised in front of the estate agent)." tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
          </div>
          <p className="pt-1">On the price step you pick one of these goals to anchor the price on: usually the strongest emotional or social pull, but a functional goal can be the <Keyword>anchor</Keyword> when it is what drives the purchase.</p>
        </GuidanceSection>
        <GuidanceSection icon={FileText} iconBg="bg-tertiary" title="Review">
          <p>A read-only overview of everything Explore captured: the customer definition, {SHOW_REFINEMENT_STEPS && <>refinement work, </>}existing solutions and their shortcomings, and the three lists of customer goals. Review it, then continue to Test the Problem when you are ready.</p>
        </GuidanceSection>
        <TipCallout items={[
          "A sharp customer definition unlocks every later step; resist 'everyone'",
          ...(SHOW_REFINEMENT_STEPS ? ["Refinement work done here flows into identifying solutions later, so do not skip it"] : []),
          "Capture the strongest emotional or social goal: it usually justifies the price more than the tangible task",
        ]} />
      </div>
    ),
  },
  {
    id: "problem-validation",
    title: "Test the Problem",
    icon: ClipboardCheck,
    iconBg: "bg-green-800",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={ClipboardCheck}
          tone="bg-green-800"
          title="Test the Problem"
          subtitle="Stress-test an explored problem before investing in a solution. Building on the customer, their goals, and the existing solutions captured in Explore, you set a price, size the market, weigh up the competition, and reach a verdict. The goal is not to prove the problem is valid; it is to gather enough evidence to make an honest, informed decision."
        />
        <GuidanceSection icon={Play} iconBg="bg-green-800" title="How it works">
          <p>Open <Keyword>Test</Keyword> from the actions menu on your project page, or from the <Keyword>Test problem</Keyword> milestone on the journey rail. Testing picks up where Explore left off. You work through a short sequence of steps: price, market size, competition, and verdict. Work through them in order; each builds on the last, but you can return and update any step as your thinking develops.</p>
        </GuidanceSection>
        <GuidanceSection icon={PoundSterling} iconBg="bg-teal-700" title="What they would pay to solve it">
          <p>A customer buys a solution for one primary goal: the one that tips them into buying. The other goals are secondary, they nudge what someone will pay rather than each adding their own price. So you set one price, anchored on that one dominant goal. Pick whichever goal drives the purchase, functional, emotional, or social, not the cost of building a feature, then cross-check the number against three angles:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Heart} label="The one anchor goal" description="The single goal that drives the purchase. Often the strongest emotional or social pull, which can carry prices an order of magnitude above the tangible task, but a functional goal can anchor it too." tile="bg-teal-700" border="border-teal-700/20 bg-teal-700/5" />
            <ConceptCard icon={Wallet} label="Money already spent" description="Subscriptions, contractors, late fines, chain chasers, replacement parts. Revealed spend is the strongest sanity check on a number that came out of an emotional read." tile="bg-teal-700" border="border-teal-700/20 bg-teal-700/5" />
            <ConceptCard icon={Scale} label="Hypothesis, not fact" description="Ask real customers at different price points what they would pay; the captured number is a starting point for those conversations, not the final answer." tile="bg-teal-700" border="border-teal-700/20 bg-teal-700/5" />
          </div>
          <p className="pt-1">A single currency-and-amount input on the step captures the price. It feeds directly into the market sizing calculation that follows.</p>
        </GuidanceSection>
        <GuidanceSection icon={TrendingUp} iconBg="bg-emerald-800" title="Size the market">
          <p>Layer the population on top of the price. The step produces two figures: the <Keyword>total market</Keyword> for the whole pie (the total addressable market, or TAM, in the textbooks), and the <Keyword>reachable market</Keyword> for the slice you can actually serve in your launch (the serviceable addressable market, or SAM).</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            <ConceptCard icon={Users} label="How many customers" description="The total population that has the problem. Round generously; order of magnitude matters more than precision." tile="bg-emerald-800" border="border-emerald-800/20 bg-emerald-800/5" />
            <ConceptCard icon={Repeat} label="How often" description="How often each customer hits the problem. A one-off problem (like moving house) uses 1 per year; recurring problems use the natural cadence." tile="bg-emerald-800" border="border-emerald-800/20 bg-emerald-800/5" />
            <ConceptCard icon={PieChart} label="Reachable share" description="Of the global population, what share can you serve in your launch? Filter on geography, language, business size, distribution channel: not yet on competition. A focused launch usually reaches 10 to 40 percent." tile="bg-emerald-800" border="border-emerald-800/20 bg-emerald-800/5" />
          </div>
          <p className="pt-1">The total market is <Keyword>customers × frequency × price</Keyword>. The reachable market is <Keyword>total market × reachable share</Keyword>. The third figure, your realistic share of the market (the serviceable obtainable market, or SOM), comes from the competition step that follows. Treat all of these as sense checks, not forecasts.</p>
        </GuidanceSection>
        <GuidanceSection icon={Building2} iconBg="bg-yellow-600" title="Assess the competition">
          <p>A big market alone is not enough. The final question is what share of the reachable market you can realistically win. Three signals together tell you how hard the path will be, and they feed the realistic-share slider that produces the last figure:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            <ConceptCard icon={ArrowRightLeft} label="Cost of switching" description="The time, money, and habit-change a customer must give up to leave their current setup." tile="bg-yellow-600" border="border-yellow-600/20 bg-yellow-600/5" />
            <ConceptCard icon={Target} label="Existing solution effectiveness" description="How well current options actually work, from terrible through excellent." tile="bg-yellow-600" border="border-yellow-600/20 bg-yellow-600/5" />
            <ConceptCard icon={Building2} label="Competitor size" description="How well-funded the incumbents are, from micro players up to giants." tile="bg-yellow-600" border="border-yellow-600/20 bg-yellow-600/5" />
            <ConceptCard icon={PieChart} label="Realistic share" description="Out of the reachable market, what share you could plausibly win in the first one to three years. Most early ventures land between 5 and 15 percent." tile="bg-yellow-600" border="border-yellow-600/20 bg-yellow-600/5" />
          </div>
          <p className="pt-1">Strong opportunities combine low or moderate switching costs, average-or-worse alternatives, and competitors that are small or distracted. <Keyword>Realistic share of the market = reachable market × realistic share</Keyword>.</p>
        </GuidanceSection>
        <GuidanceSection icon={ShieldCheck} iconBg="bg-destructive" title="Record your verdict">
          <p>The verdict step pulls everything together. The summary shows each captured factor (how many customers, how often, what they would pay, the anchor goal, the two shares and the three competition signals) and the three market figures from the earlier steps: the total market, the reachable market and your realistic share of it. A callout lists the common pitfalls to check yourself against before you commit:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            <ConceptCard icon={Calculator} label="Market figures are sanity checks" description="A large total market is not the same as proven willingness to pay. Treat the price you captured as a hypothesis to test in real conversations." tile="bg-destructive" border="border-destructive/20 bg-destructive/5" />
            <ConceptCard icon={Users} label="Name a real customer" description="If you cannot name a specific customer who hit this problem in the last week, it is probably not as universal as it feels." tile="bg-destructive" border="border-destructive/20 bg-destructive/5" />
            <ConceptCard icon={Scale} label="Expect worse than your gut says" description="Switching costs and incumbent reactions are usually one level worse than your first estimate." tile="bg-destructive" border="border-destructive/20 bg-destructive/5" />
          </div>
          <p className="pt-1">Then commit to one of three verdicts: <Keyword>Valid: Worth Solving</Keyword>, <Keyword>Unsure: May Be Worth Solving</Keyword>, or <Keyword>Invalid: Not Worth Solving</Keyword>. Clicking the chosen verdict again clears it. The verdict sets the problem&apos;s status on the project page and decides what happens on the way into solutions: a problem with no verdict, or ruled out as Invalid, gets a warning before you identify solutions for it, though you can always carry on.</p>
        </GuidanceSection>
        <GuidanceSection icon={FileText} iconBg="bg-green-800" title="Review &amp; next steps">
          <p>A read-only overview of everything you have captured, laid out as the same cards as the problem canvas: the customer definition, existing solutions, the customer goals, the price, the market figures, the competitive picture, and your verdict. Below it, a next-steps section suggests what to do given the verdict. Use <Keyword>Open Problem to edit</Keyword> to jump back to the editable problem page if anything needs revising before you move on to identifying solutions.</p>
        </GuidanceSection>
        <TipCallout items={[
          "Be honest about the evidence: a weak result is a signal, not a failure",
          "Anchor the price on the one goal that drives the purchase, not on the cost of building a feature",
          "If you cannot justify the reachable share or realistic share to a sceptical friend, slide them down",
          "A large total market is not the same as proven willingness to pay; read the underlying signals",
          "Each project holds one problem, so start another project to test a second problem and compare the verdicts on the Projects page",
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
          subtitle="Each project collects candidate solutions for its tested problem. Identify new solutions through a guided flow, test each one against feasibility, impact, cost, and time, then compare them to decide which to pursue."
        />
        <GuidanceSection icon={Play} iconBg="bg-blue-900" title="How it works">
          <p>Solutions live on the project page, under the problem canvas. Three connected flows work on them: Identify Solutions generates candidates, the test flow scores each candidate on its own, and Compare solutions ranks them against each other.</p>
          <div className="flex flex-col gap-3 pt-1">
            <NumberedStep n={1} title="Identify" accent="bg-blue-900">
              From the project page, click <Keyword>Identify solutions</Keyword> and use a creative technique to generate candidate solutions. Each candidate lands in the project&apos;s solutions table.
            </NumberedStep>
            <NumberedStep n={2} title="Test" accent="bg-green-800">
              For each candidate in the project, work through the four test metrics and reach a verdict: valid, unsure, or invalid.
            </NumberedStep>
            <NumberedStep n={3} title="Compare" accent="bg-teal-700">
              Say how much each metric matters to you, read the ranking that produces, and give every solution a traffic light.
            </NumberedStep>
          </div>
          <p className="pt-1">None of these doors is ever locked. If the problem has no verdict yet, or the project has no solutions to test or compare, a dialog says why the usual order is the safer one and lets you carry on anyway.</p>
        </GuidanceSection>

        <GuidanceSection icon={Lightbulb} iconBg="bg-blue-900" title="Identify solutions">
          <p>Pick a method, generate solution ideas with it, then review what you captured. Each candidate is added to the project so you can test it later:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Blocks} label="SCAMPER" description="Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse. Start from a solution people use today, or a first idea, and transform it seven ways." tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
            <ConceptCard icon={Repeat} label="Reverse Ideation" description="Instead of asking how to solve it, ask how to make it worse, then invert the answers." tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
            <ConceptCard icon={Compass} label="Analogy Thinking" description="Look at how other fields have solved similar problems and adapt their approach." tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
            <ConceptCard icon={ArrowRight} label="Improve Existing Solutions" description="Start from what already exists and sharpen it, removing shortcomings surfaced while testing the problem." tile="bg-blue-900" border="border-blue-900/20 bg-blue-900/5" />
          </div>
          <p className="pt-1">Each technique includes <Keyword>case studies</Keyword> to spark ideas. Use them as prompts, not templates. Capture as many candidates as you can think of; pruning comes later when you test them.</p>
        </GuidanceSection>

        <GuidanceSection icon={BarChart2} iconBg="bg-green-800" title="Test">
          <p>Open any solution from the project&apos;s solutions table (or the <Keyword>Test solutions</Keyword> milestone on the journey rail, which opens the next solution waiting for a verdict) and work through four one-at-a-time metric pages. Each page has guidance and case studies to help you score 1 to 5. At the end, you mark the solution valid, unsure, or invalid:</p>
          <div className="grid gap-2 pt-1 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <ConceptCard icon={Target} label="Feasibility" description="Can you actually build it with the resources and skills available?" tile="bg-green-800" border="border-green-800/20 bg-green-800/5" />
            <ConceptCard icon={Heart} label="Impact" description="How much value does it deliver, to the customer and the business?" tile="bg-green-800" border="border-green-800/20 bg-green-800/5" />
            <ConceptCard icon={PoundSterling} label="Cost" description="What will it take to build, run, and maintain?" tile="bg-green-800" border="border-green-800/20 bg-green-800/5" />
            <ConceptCard icon={Repeat} label="Time to Implement" description="How long from decision to delivery, including dependencies?" tile="bg-green-800" border="border-green-800/20 bg-green-800/5" />
          </div>
          <p className="pt-1">Each solution is tested on its own. You can mark some candidates valid and others invalid, or come back later as you learn more. Once a solution is <Keyword>Valid: Worth Pursuing</Keyword>, its page offers the next steps: the guidance on delivering it, and the project&apos;s portfolio to share with somebody else.</p>
        </GuidanceSection>

        <GuidanceSection icon={Scale} iconBg="bg-teal-700" title="Compare solutions">
          <p>Once a few solutions are scored, <Keyword>Compare solutions</Keyword> on the project page ranks them against each other. A short strip asks how much each of the four metrics matters to you (<Keyword>Ignore</Keyword>, <Keyword>Nice to have</Keyword>, <Keyword>Important</Keyword> or <Keyword>Essential</Keyword>) and the table underneath re-orders live by the weighted score those choices produce. Cost and time to implement are turned round before weighting, so a higher score is always better.</p>
          <p>Against each solution you then pick a traffic light: <Keyword>Green</Keyword> to pursue it, <Keyword>Amber</Keyword> for worth considering with reservations, <Keyword>Red</Keyword> to park it for now. The review step lists the solutions grouped by light, and the lights show in the solutions table&apos;s Score column and beside each solution&apos;s status on its page.</p>
        </GuidanceSection>

        <TipCallout items={[
          "Quantity beats quality when identifying solutions; testing prunes later",
          "A weak candidate is still useful as a comparison baseline",
          "Weights are a matter of judgement. If a cheap idea ranks above the one you believe in, ask which weight is wrong before overruling the table",
          "You can come back and add more candidates at any time",
        ]} />
      </div>
    ),
  },
  {
    id: "guided-prompt-tools",
    title: "Guided Prompt Tools",
    icon: Glasses,
    iconBg: "bg-secondary-brand",
    content: (
      <div className="flex flex-col gap-5">
        <GuidanceHero
          icon={Glasses}
          tone="bg-secondary-brand"
          title="Guided Prompt Tools"
          subtitle="Five of the tools on the Identify a problem hub find a problem by asking short questions about something you already know. Four start from a situation and look for the problems in it; one starts from the problem and looks for its situation."
        />
        <GuidanceSection icon={Compass} iconBg="bg-secondary-brand" title="When to use one">
          <p>Each is a tool in its own right, opened straight from your project&apos;s <Keyword>Identify a problem</Keyword> hub. Every one anchors on a single thing per run and asks about it until a problem falls out.</p>
          <div className="grid gap-3 pt-1 sm:grid-cols-2">
            <div className="rounded-lg border bg-card p-3">
              <h5 className="text-base font-semibold mb-1">Use a guided tool when</h5>
              <ul className="text-base leading-relaxed list-disc pl-5 space-y-1">
                <li>You want a prompt to react to, not a blank canvas.</li>
                <li>You&apos;d rather mine experience you already have than research the market.</li>
                <li>You&apos;re not sure where to start.</li>
              </ul>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <h5 className="text-base font-semibold mb-1">Use the Canvas Builder instead when</h5>
              <ul className="text-base leading-relaxed list-disc pl-5 space-y-1">
                <li>You already have specific customers, contexts, or pain points in mind.</li>
                <li>You want to compose problems by combining columns on a canvas.</li>
                <li>You&apos;re iterating on an existing problem area.</li>
              </ul>
            </div>
          </div>
        </GuidanceSection>
        <GuidanceSection icon={LayoutGrid} iconBg="bg-secondary-brand" title="Two directions, five tools">
          <h5 className="text-base font-semibold text-foreground pt-1">Start from a situation</h5>
          <p>You know the experience, the role, the thing you built or the people. The prompts go looking for what goes wrong in it, then ask who else would feel it.</p>
          <GuidedToolCards lenses={REFLECT_LENSES.filter((lens) => !startsFromProblem(lens))} />
          <h5 className="text-base font-semibold text-foreground pt-2">Start from the problem</h5>
          <p>You know what makes you sigh but not yet the story around it. The prompts work backwards: the last time it happened, the job behind it, who else runs into it, when it bites and how people cope. It is the one tool that fills in the problem&apos;s context as well as its customers.</p>
          <GuidedToolCards lenses={REFLECT_LENSES.filter(startsFromProblem)} />
        </GuidanceSection>
        <GuidanceSection icon={Sparkles} iconBg="bg-secondary-brand" title="Where the lists come from">
          <p>The first prompt of every tool is a pick list rather than a blank box. <Keyword>Life experiences</Keyword>, <Keyword>Work friction</Keyword> and <Keyword>Problems you&apos;ve solved yourself</Keyword> draw on your self-discovery answers; <Keyword>Audience problems</Keyword> and <Keyword>Something that annoys you</Keyword> draw on the same customer and problem-type catalogues as the Canvas Builder. Anything you add in your own words is saved back to that source, so it is there next time and in the Canvas Builder too.</p>
        </GuidanceSection>
        <GuidanceSection icon={ArrowRight} iconBg="bg-secondary-brand" title="How one runs">
          <div className="flex flex-col gap-3 pt-1">
            <NumberedStep n={1} title="Pick a tool" accent="bg-secondary-brand">
              From the hub, pick the one that matches what you know best. Each takes about ten minutes.
            </NumberedStep>
            <NumberedStep n={2} title="Answer the prompts" accent="bg-secondary-brand">
              One prompt per screen. Multiple answers allowed where it helps. Skip anything that does not apply.
            </NumberedStep>
            <NumberedStep n={3} title="Review and save" accent="bg-secondary-brand">
              Remove anything that does not belong, then save. What you anchored on becomes the problem&apos;s title, the customers, contexts and problem types you picked become its dimensions, and the rest of your answers stay attached as its reflection.
            </NumberedStep>
            <NumberedStep n={4} title="Come back to it" accent="bg-secondary-brand">
              Once your project has its problem, the tool reopens it pre-filled and saving updates it, so you can change your mind without starting again.
            </NumberedStep>
          </div>
        </GuidanceSection>
        <TipCallout items={[
          "Small, specific, and slightly weird answers tend to point at the most interesting problems",
          "If you are not sure between two wordings, write both into the description and settle it while you explore",
          "Each tool anchors on one experience, role, project, audience or annoyance per run. To explore another, run it again and pick a different one",
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
          <h2 className="text-base font-semibold truncate">Guidance</h2>
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
                      <span className="font-semibold text-base truncate">{item.title}</span>
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

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
    id: "ideas",
    title: "Ideas",
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">How Ideas Work</h3>
        <p>
          The Ideas section is the core of Navigate. Each idea you create takes you through a structured innovation
          process from discovery through to a validated solution.
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium">1. Create an Idea</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Start by creating an idea — a space for exploring a specific domain or opportunity you want to investigate.
              You can have multiple ideas running in parallel.
            </p>
          </div>
          <div>
            <h4 className="font-medium">2. Define your Customer Segment</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Each idea has a target customer segment. This helps you focus on the right audience and understand
              who you are solving problems for.
            </p>
          </div>
          <div>
            <h4 className="font-medium">3. Identify Jobs to Be Done</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Within your customer segment, define the jobs — tasks or goals — your customers are trying to accomplish.
              Each idea can have multiple jobs to be done.
            </p>
          </div>
          <div>
            <h4 className="font-medium">4. Discover Problems</h4>
            <p className="text-sm text-muted-foreground mt-1">
              For each job to be done, identify the problems your customers encounter. Multiple problems can exist
              per job — capture them all during the discovery phase.
            </p>
          </div>
          <div>
            <h4 className="font-medium">5. Pick a Problem to Validate</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Once you have a list of problems, select the most promising one to validate. You will then analyse
              alternatives, shortcomings, and the emotional and quantifiable impact of that problem.
            </p>
          </div>
          <div>
            <h4 className="font-medium">6. Validate the Problem</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Work through the validation steps to build a strong understanding of the problem and produce a
              clear problem statement. This forms the foundation for designing your solution.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "self-discovery",
    title: "Self Discovery",
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Self Discovery Process</h3>
        <p>Use the self discovery section to explore your personal journey and identify key areas for growth.</p>
        <div className="space-y-2">
          <h4 className="font-medium">Tips:</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Be honest with your responses</li>
            <li>Take time to reflect on each question</li>
            <li>Review your answers periodically</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: "problem-discovery",
    title: "Problem Discovery",
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Problem Discovery Guide</h3>
        <p>Learn how to effectively identify and analyze problems in your journey.</p>
        <div className="space-y-2">
          <h4 className="font-medium">Best Practices:</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Break down complex problems into smaller parts</li>
            <li>Consider multiple perspectives</li>
            <li>Document your findings</li>
          </ul>
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

  useEffect(() => {
    if (open && initialTopic) {
      setSelectedItem(initialTopic)
    }
  }, [open, initialTopic])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-64 border-r p-4">
            <h2 className="font-semibold mb-4">Guidance Topics</h2>
            <ScrollArea className="h-[calc(80vh-5rem)]">
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
          <div className="flex-1 p-6">
            <ScrollArea className="h-[calc(80vh-3rem)]">
              {guidanceItems.find((item) => item.id === selectedItem)?.content}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
"use client"

import { useState } from "react"
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
            <li>Idea Triggers - Capture and organize your ideas</li>
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

export function GuidanceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [selectedItem, setSelectedItem] = useState(guidanceItems[0].id)

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
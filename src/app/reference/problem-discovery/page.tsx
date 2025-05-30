"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getNavigationItem } from "@/config/navigation"
import { ChevronRight, Users, Target, MessageSquare } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function ProblemDiscoveryPage() {
  const navItem = getNavigationItem("/problem-discovery")
  const Icon = navItem?.icon
  const [selectedFavorite, setSelectedFavorite] = useState<string>("")
  const [selectedTool, setSelectedTool] = useState<string>("")
  const [domain, setDomain] = useState<string>("")
  const [subdomain, setSubdomain] = useState<string>("")
  const [userPersona, setUserPersona] = useState<string>("")
  const [problemStatement, setProblemStatement] = useState({
    user: "",
    context: "",
    frustration: "",
    impact: ""
  })

  const tools = [
    {
      id: "jtbd",
      name: "Jobs to be Done",
      icon: Target,
      description: "Understand what users are trying to accomplish and why",
      questions: [
        "What job are users trying to get done?",
        "What are their motivations?",
        "What are the current solutions and their limitations?"
      ]
    },
    {
      id: "segment",
      name: "Segment Narrowing",
      icon: Users,
      description: "Define your target domain, subdomain, and user persona",
      domains: [
        "Technology",
        "Healthcare",
        "Education",
        "Finance",
        "Retail",
        "Manufacturing",
        "Transportation",
        "Energy"
      ],
      subdomains: {
        "Technology": ["Software", "Hardware", "AI/ML", "Cybersecurity", "Cloud Computing"],
        "Healthcare": ["Digital Health", "Medical Devices", "Pharmaceuticals", "Mental Health", "Preventive Care"],
        "Education": ["K-12", "Higher Education", "Professional Development", "EdTech", "Special Education"],
        "Finance": ["Personal Finance", "Business Finance", "Investment", "Insurance", "Cryptocurrency"],
        "Retail": ["E-commerce", "Physical Retail", "Supply Chain", "Customer Experience", "Inventory Management"],
        "Manufacturing": ["Process Automation", "Quality Control", "Supply Chain", "Equipment Maintenance", "Safety"],
        "Transportation": ["Personal Vehicles", "Public Transit", "Logistics", "Infrastructure", "Mobility Services"],
        "Energy": ["Renewable Energy", "Energy Storage", "Grid Management", "Energy Efficiency", "Smart Grid"]
      },
      personas: [
        "Individual Consumer",
        "Small Business Owner",
        "Enterprise Decision Maker",
        "Industry Professional",
        "Student",
        "Educator",
        "Healthcare Provider",
        "Government Official"
      ]
    },
    {
      id: "interview",
      name: "Day in the Life Interview",
      icon: MessageSquare,
      description: "Understand user behavior and pain points through scenario-based questions",
      scenarios: [
        "Morning Routine",
        "Work/Study Activities",
        "Leisure Time",
        "Problem-Solving Moments",
        "Decision-Making Points"
      ],
      questions: [
        "What's the first thing you do when you encounter this situation?",
        "What tools or resources do you currently use?",
        "What's the most frustrating part of this process?",
        "How do you know when you've successfully completed this task?",
        "What would make this process easier or more enjoyable?"
      ]
    }
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-700">Problem Discovery</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        {navItem && Icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <h2 className="text-xl font-bold">Problem Discovery</h2>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select a Favorite to Explore</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Choose one of your favorites from self-discovery to explore potential problems and opportunities in that area.
            </p>
            <Select onValueChange={setSelectedFavorite}>
              <SelectTrigger>
                <SelectValue placeholder="Select a favorite..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="hiking">Hiking</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                {/* Add more items from favorites */}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedFavorite && (
          <Card>
            <CardHeader>
              <CardTitle>Choose a Discovery Tool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      selectedTool === tool.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <tool.icon className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">{tool.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{tool.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTool === "segment" && (
          <Card>
            <CardHeader>
              <CardTitle>Segment Narrowing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                  <Select onValueChange={setDomain}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a domain..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tools.find(t => t.id === "segment")?.domains.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {domain && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                    <Select onValueChange={setSubdomain}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subdomain..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tools.find(t => t.id === "segment")?.subdomains[domain]?.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {subdomain && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User Persona</label>
                    <Select onValueChange={setUserPersona}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user persona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tools.find(t => t.id === "segment")?.personas.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {userPersona && (
                  <div className="space-y-4 mt-6">
                    <h3 className="font-medium text-gray-900">Problem Statement Canvas</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                        <Textarea
                          placeholder="Describe the user..."
                          value={problemStatement.user}
                          onChange={(e) => setProblemStatement(prev => ({ ...prev, user: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
                        <Textarea
                          placeholder="Describe the situation or context..."
                          value={problemStatement.context}
                          onChange={(e) => setProblemStatement(prev => ({ ...prev, context: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frustration</label>
                        <Textarea
                          placeholder="What is the main frustration or pain point?"
                          value={problemStatement.frustration}
                          onChange={(e) => setProblemStatement(prev => ({ ...prev, frustration: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
                        <Textarea
                          placeholder="What is the impact of solving this problem?"
                          value={problemStatement.impact}
                          onChange={(e) => setProblemStatement(prev => ({ ...prev, impact: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTool === "jtbd" && (
          <Card>
            <CardHeader>
              <CardTitle>Jobs to be Done</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tools.find(t => t.id === "jtbd")?.questions.map((question, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{question}</label>
                    <Textarea placeholder="Your answer..." />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedTool === "interview" && (
          <Card>
            <CardHeader>
              <CardTitle>Day in the Life Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tools.find(t => t.id === "interview")?.scenarios.map((scenario, index) => (
                  <div key={index} className="space-y-4">
                    <h3 className="font-medium text-gray-900">{scenario}</h3>
                    {tools.find(t => t.id === "interview")?.questions.map((question, qIndex) => (
                      <div key={qIndex}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{question}</label>
                        <Textarea placeholder="Your answer..." />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 
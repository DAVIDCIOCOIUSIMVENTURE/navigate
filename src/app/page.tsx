"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { navigationItems } from "@/config/navigation"
import { Brain, ChevronRight, Lightbulb, Target, Trophy, Award, Star, Crown, ClipboardCheck, Search, Check } from "lucide-react"
import { AchievementItem } from "@/components/achievement-item"
import Image from "next/image"

export default function DashboardPage() {
  const navItems = [...navigationItems.problemDiscovery, ...navigationItems.solution]

  return (
    <div className="space-y-6 w-full flex-1">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Dashboard</h1>
          {/* <p className="text-muted-foreground text-sm">Here&apos;s an overview of your innovation journey</p> */}
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          Continue Your Journey
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Quick Stats and Double Diamond */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Double Diamond Diagram */}
        <Card className="lg:flex-[4] flex items-center justify-center">
          <CardContent className="p-4 flex items-center justify-center">
            <div className="relative flex flex-col items-center justify-center w-full hidden" style={{ height: 300 }}>
              {/* Diamond Labels - 6 columns */}
              {/* <div className="absolute top-0 left-0 w-full grid grid-cols-6 gap-0 px-12" style={{ pointerEvents: 'none', zIndex: 10 }}>
                <div className="flex flex-col items-center text-center text-purple-600"><span className="font-semibold text-sm mb-1">Self<br />Discovery</span></div>
                <div className="flex flex-col items-center text-center text-purple-600"><span className="font-semibold text-sm mb-1">Idea<br />Triggers</span></div>
                <div className="flex flex-col items-center text-center text-purple-600"><span className="font-semibold text-sm mb-1">Problem<br />Discovery</span></div>
                <div className="flex flex-col items-center text-center text-purple-600"><span className="font-semibold text-sm mb-1">Problem<br />Validation</span></div>
                <div className="flex flex-col items-center text-center text-purple-600"><span className="font-semibold text-sm mb-1">Solution<br />Ideation</span></div>
                <div className="flex flex-col items-center text-center text-purple-600"><span className="font-semibold text-sm mb-1">Solution<br />Validation</span></div>
              </div> */}

              {/* <svg
                width="100%"
                height="100%"
                viewBox="0 0 1600 400"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 0', padding: '10px 10px', transform: 'translateX(-60px)' }}>
                <path d="M280,200 L500,-20 L720,200 L500,420 Z" fill="#D6BCFA" fillOpacity="0.9" stroke="#D6BCFA" strokeWidth="10" strokeLinejoin="round" />
                <path d="M720,200 L940,-20 L1160,200 L940,420 Z" fill="#D6BCFA" fillOpacity="0.9" stroke="#D6BCFA" strokeWidth="10" strokeLinejoin="round" />
                <path d="M1160,200 L1380,-20 L1600,200 L1380,420 Z" fill="#D6BCFA" fillOpacity="0.9" stroke="#D6BCFA" strokeWidth="10" strokeLinejoin="round" />
              </svg> */}
              {/* Arrow from left to right (now under the diamonds) */}
              {/* <svg
                className="absolute left-0 w-full"
                style={{ top: 290, zIndex: 20, pointerEvents: 'none' }}
                height="40"
                viewBox="0 0 1600 40"
              >
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#D1D5DB" />
                  </marker>
                </defs>
                <line
                  x1="80" y1="20"
                  x2="1520" y2="20"
                  stroke="#D1D5DB"
                  strokeWidth="4"
                  markerEnd="url(#arrowhead)"
                  opacity="0.7"
                  strokeDasharray="16,12"
                />
              </svg> */}
            </div>
            <Image src="/triple-diamond.png" alt="Double Diamond" width={1000} height={1000} />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="flex flex-col gap-4 lg:flex-[1]">
          {navItems.slice(0, 4).map((item) => (
            <Card key={item.url}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500">
                    {item.icon && <item.icon className="h-5 w-5 text-white" />}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-lg font-bold">
                      {item.url === "/self-discovery" ? "12" :
                        item.url === "/problem-trigger-buckets" ? "4" :
                          item.url === "/problem-discovery" ? "3" : "2"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.url === "/self-discovery" ? "Triggers added" :
                        item.url === "/problem-trigger-buckets" ? "Buckets created" :
                          item.url === "/problem-discovery" ? "Problems identified" : "Solutions validated"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Navigation */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {navItems.map((item) => {
        if (!item) return null
        const Icon = item.icon
        return (
          <Link key={item.url} href={item.url}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    {Icon && <Icon className="h-6 w-6 text-primary" />}
                  </div>
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>Navigate to {item.title.toLowerCase()}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        )
      })}
    </div> */}

      {/* Recent Activity and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions in the innovation process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Created new idea trigger container</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Added new self discovery triggers</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Identified new problem area</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              <AchievementItem
                icon={Trophy}
                title="First Trigger Added"
                description="You added your first self-discovery trigger!"
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
              />
              <AchievementItem
                icon={Target}
                title="3 Problems Identified"
                description="You have identified 3 unique problems."
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
              />
              <AchievementItem
                icon={Award}
                title="Solution Validated"
                description="You validated your first solution!"
                iconBgColor="bg-purple-100"
                iconColor="text-purple-600"
              />
              <AchievementItem
                icon={Star}
                title="Milestone Reached"
                description="Completed your first innovation cycle!"
                iconBgColor="bg-yellow-100"
                iconColor="text-yellow-600"
              />
              <AchievementItem
                icon={Crown}
                title="Top Innovator"
                description="Generated 10+ unique solutions!"
                iconBgColor="bg-red-100"
                iconColor="text-red-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

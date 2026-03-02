"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Lightbulb, Target, Trophy, Award, Star, Crown } from "lucide-react"
import { AchievementItem } from "@/components/achievement-item"
import Image from "next/image"
import Link from "next/link"
import { useIdeas } from "@/store/ideas-hooks"

export default function DashboardPage() {
  const { ideas } = useIdeas()

  const totalProblems = ideas.reduce((sum, idea) => sum + idea.problems.filter((p) => p.text.trim()).length, 0)
  const validatedProblems = ideas.reduce(
    (sum, idea) =>
      sum + idea.validations.filter((v) => v.status === "valid" || v.status === "invalid").length,
    0
  )

  const stats = [
    { label: "Ideas created", value: ideas.length, description: "Innovation ideas in progress" },
    { label: "Problems discovered", value: totalProblems, description: "Problems identified across ideas" },
    { label: "Problems validated", value: validatedProblems, description: "Problems given a verdict" },
  ]

  return (
    <div className="space-y-6 w-full flex-1">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
          <Link href="/ideas">
            Continue Your Journey
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Quick Stats and Triple Diamond */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Triple Diamond Diagram */}
        <Card className="lg:flex-[4] flex items-center justify-center">
          <CardContent className="p-4 flex items-center justify-center">
            <Image src="/triple-diamond.png" alt="Triple Diamond" width={1000} height={1000} />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="flex flex-col gap-4 lg:flex-[1]">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <div className="text-lg font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
              {ideas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activity yet.{" "}
                  <Link href="/ideas/new" className="font-medium text-foreground underline underline-offset-2">
                    Start your first idea
                  </Link>{" "}
                  to get going.
                </p>
              ) : (
                ideas.slice(-3).reverse().map((idea) => (
                  <div key={idea.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <Lightbulb className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{idea.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(idea.updatedAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
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

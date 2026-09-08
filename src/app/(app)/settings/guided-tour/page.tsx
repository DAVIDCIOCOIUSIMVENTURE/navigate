"use client"

import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { isTourEnabled } from "@/store/tour-model"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Play, RotateCcw } from "lucide-react"
import { toast } from "sonner"

export default function GuidedTourSettingsPage() {
  const router = useRouter()
  const phase = useSelector((state: RootState) => state.tour.phase)
  const dispatch = useDispatch<AppDispatch>()
  const enabled = isTourEnabled(phase)
  const paused = phase === "paused"

  const startNow = () => {
    dispatch.tour.start()
    router.push("/")
  }

  const resumeNow = () => {
    dispatch.tour.resume()
    router.push("/")
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guided tour</h1>
        <p className="text-muted-foreground mt-1">
          A walk through the application that explains the menu, the top bar and the journey from problem to solution.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <Label htmlFor="tour-enabled" className="text-base">Show the guided tour</Label>
              <p className="text-base">
                When switched on, the tour opens the next time you visit Navigate. It switches itself off once you finish or skip it.
              </p>
            </div>
            <Switch
              id="tour-enabled"
              checked={enabled}
              onCheckedChange={(checked) => {
                dispatch.tour.setEnabled(checked)
                toast.success(checked ? "The guided tour will show on your next visit" : "The guided tour is switched off")
              }}
            />
          </div>

          {paused && (
            <div className="flex items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <Label className="text-base">Carry on where you left off</Label>
                <p className="text-base">
                  You closed the tour part-way through. Pick it up again from the same step.
                </p>
              </div>
              <Button type="button" onClick={resumeNow} className="gap-2 shrink-0">
                <Play className="h-4 w-4" aria-hidden="true" />
                Resume the tour
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <Label className="text-base">{paused ? "Start again from the beginning" : "Start the tour now"}</Label>
              <p className="text-base">
                Run through the tour straight away, starting from the welcome screen.
              </p>
            </div>
            <Button type="button" variant={paused ? "outline" : "default"} onClick={startNow} className="gap-2 shrink-0">
              {paused ? <RotateCcw className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {paused ? "Restart the tour" : "Start the tour"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

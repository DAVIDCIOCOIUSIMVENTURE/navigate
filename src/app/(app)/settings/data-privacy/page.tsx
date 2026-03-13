"use client"

import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function DataPrivacySettingsPage() {
  const { analyticsEnabled, autoSave } = useSelector(
    (state: RootState) => state.accountSettings
  )
  const dispatch = useDispatch<AppDispatch>()
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  const handleClearData = () => {
    const keysToRemove = [
      "navigate-settings",
      "navigate-account-settings",
      "navigate-journal",
      "navigate-problem-triggers",
      "navigate-ideas",
      "navigate-problems",
      "navigate-standalone-validation",
    ]
    keysToRemove.forEach((key) => localStorage.removeItem(key))
    toast.success("All application data has been cleared. Refreshing...")
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data & Privacy</h1>
        <p className="text-muted-foreground mt-1">
          Control how your data is stored and used.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="autoSave">Auto-Save</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save your work as you type.
              </p>
            </div>
            <Switch
              id="autoSave"
              checked={autoSave}
              onCheckedChange={(checked) => {
                dispatch.accountSettings.update({ autoSave: checked })
                toast.success(checked ? "Auto-save enabled" : "Auto-save disabled")
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="analyticsEnabled">Usage Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Help improve Navigate by sharing anonymous usage data.
              </p>
            </div>
            <Switch
              id="analyticsEnabled"
              checked={analyticsEnabled}
              onCheckedChange={(checked) => {
                dispatch.accountSettings.update({ analyticsEnabled: checked })
                toast.success(checked ? "Analytics enabled" : "Analytics disabled")
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-destructive">Danger Zone</Label>
            <p className="text-sm text-muted-foreground">
              Permanently delete all locally stored data including ideas, problems, journal entries, and settings.
            </p>
          </div>
          <div>
            <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Clear All Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your ideas, problems, journal entries,
                    and settings. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData}>
                    Yes, clear everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

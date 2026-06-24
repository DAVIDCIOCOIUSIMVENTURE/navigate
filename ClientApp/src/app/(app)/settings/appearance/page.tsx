"use client"

import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function AppearanceSettingsPage() {
  const { theme, compactMode } = useSelector(
    (state: RootState) => state.accountSettings
  )
  const dispatch = useDispatch<AppDispatch>()

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
        <p className="text-muted-foreground mt-1">
          Customise how Navigate looks and feels.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="theme">Theme</Label>
              <p className="text-sm">
                Select a colour theme for the interface.
              </p>
            </div>
            <Select
              value={theme}
              onValueChange={(value: "light" | "dark" | "system") => {
                dispatch.accountSettings.update({ theme: value })
                toast.success("Theme updated")
              }}
            >
              <SelectTrigger className="w-36" id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="compactMode">Compact Mode</Label>
              <p className="text-sm">
                Reduce spacing and padding throughout the app.
              </p>
            </div>
            <Switch
              id="compactMode"
              checked={compactMode}
              onCheckedChange={(checked) => {
                dispatch.accountSettings.update({ compactMode: checked })
                toast.success(checked ? "Compact mode enabled" : "Compact mode disabled")
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

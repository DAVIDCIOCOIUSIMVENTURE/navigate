"use client"

import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export default function NotificationsSettingsPage() {
  const { enableNotifications, notifyOnStageComplete, notifyOnValidationVerdict } =
    useSelector((state: RootState) => state.accountSettings)
  const dispatch = useDispatch<AppDispatch>()

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Choose what notifications you receive.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="enableNotifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for all in-app notifications.
              </p>
            </div>
            <Switch
              id="enableNotifications"
              checked={enableNotifications}
              onCheckedChange={(checked) => {
                dispatch.accountSettings.update({ enableNotifications: checked })
                toast.success(checked ? "Notifications enabled" : "Notifications disabled")
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="notifyOnStageComplete">Stage Completion</Label>
              <p className="text-sm text-muted-foreground">
                Notify when an innovation stage is completed.
              </p>
            </div>
            <Switch
              id="notifyOnStageComplete"
              checked={notifyOnStageComplete}
              disabled={!enableNotifications}
              onCheckedChange={(checked) => {
                dispatch.accountSettings.update({ notifyOnStageComplete: checked })
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Label htmlFor="notifyOnValidationVerdict">Validation Verdict</Label>
              <p className="text-sm text-muted-foreground">
                Notify when a problem validation verdict is reached.
              </p>
            </div>
            <Switch
              id="notifyOnValidationVerdict"
              checked={notifyOnValidationVerdict}
              disabled={!enableNotifications}
              onCheckedChange={(checked) => {
                dispatch.accountSettings.update({ notifyOnValidationVerdict: checked })
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

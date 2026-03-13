"use client"

import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function AccountSettingsPage() {
  const { displayName: savedName, email: savedEmail } = useSelector(
    (state: RootState) => state.accountSettings
  )
  const dispatch = useDispatch<AppDispatch>()

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    setDisplayName(savedName)
    setEmail(savedEmail)
  }, [savedName, savedEmail])

  const handleSave = () => {
    dispatch.accountSettings.update({ displayName, email })
    toast.success("Account settings saved")
  }

  const isDirty = displayName !== savedName || email !== savedEmail

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile information.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!isDirty}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

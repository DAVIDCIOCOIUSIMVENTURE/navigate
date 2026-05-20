"use client"

import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { AvatarColor } from "@/store/settings-model"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const AVATAR_COLOR_OPTIONS: { id: AvatarColor; label: string; bgClass: string }[] = [
  { id: "teal", label: "Teal", bgClass: "bg-quaternary" },
  { id: "mustard", label: "Mustard", bgClass: "bg-yellow-600" },
  { id: "navy", label: "Navy", bgClass: "bg-blue-900" },
  { id: "forest", label: "Forest", bgClass: "bg-green-800" },
  { id: "crimson", label: "Crimson", bgClass: "bg-red-800" },
  { id: "indigo", label: "Indigo", bgClass: "bg-indigo-800" },
  { id: "violet", label: "Violet", bgClass: "bg-violet-800" },
  { id: "rose", label: "Rose", bgClass: "bg-rose-800" },
]

export default function AccountSettingsPage() {
  const { displayName: savedName, email: savedEmail } = useSelector(
    (state: RootState) => state.accountSettings
  )
  const savedNickname = useSelector((state: RootState) => state.settings.nickname)
  const savedBio = useSelector((state: RootState) => state.settings.bio)
  const avatarColor = useSelector((state: RootState) => state.settings.avatarColor)
  const dispatch = useDispatch<AppDispatch>()

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [nickname, setNickname] = useState("")
  const [bio, setBio] = useState("")

  useEffect(() => {
    setDisplayName(savedName)
    setEmail(savedEmail)
  }, [savedName, savedEmail])

  useEffect(() => {
    setNickname(savedNickname)
  }, [savedNickname])

  useEffect(() => {
    setBio(savedBio)
  }, [savedBio])

  const handleSave = () => {
    dispatch.accountSettings.update({ displayName, email })
    dispatch.settings.setNickname(nickname)
    dispatch.settings.setBio(bio)
    toast.success("Account settings saved")
  }

  const isDirty =
    displayName !== savedName ||
    email !== savedEmail ||
    nickname !== savedNickname ||
    bio !== savedBio

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
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              placeholder="What should we call you?"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="A short description about you"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!isDirty}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-6">
          <CardTitle>Avatar Color</CardTitle>
          <CardDescription>
            Pick the color used for your avatar in the top bar.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            {AVATAR_COLOR_OPTIONS.map((color) => {
              const isSelected = color.id === avatarColor
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => dispatch.settings.setAvatarColor(color.id)}
                  className={cn(
                    "h-10 w-10 rounded-full ring-offset-2 ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    color.bgClass,
                    isSelected ? "ring-2 ring-ring" : "ring-0 hover:ring-2 hover:ring-muted",
                  )}
                  aria-label={color.label}
                  aria-pressed={isSelected}
                  title={color.label}
                />
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

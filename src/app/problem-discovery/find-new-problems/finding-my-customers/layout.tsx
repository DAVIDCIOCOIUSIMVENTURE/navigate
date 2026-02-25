"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter, usePathname } from "next/navigation"
import { FindingMyCustomersStoreProvider } from "./store/provider"
import { useSelector } from "react-redux"
import type { RootState } from "./store"
import { Users, Eye } from "lucide-react"

const BASE = "/problem-discovery/find-new-problems/finding-my-customers"

const NAV_ITEMS = [
  { label: "Introduction", path: "introduction" },
  { label: "Your Customers", path: "your-customers" },
  { label: "Jobs to Be Done", path: "jobs-to-be-done" },
  { label: "Problems & Existing Solutions", path: "problems-and-existing-solutions" },
  { label: "Summary", path: "summary" },
]

function Field({ label, value, empty = "Not set" }: { label: string; value: string; empty?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      {value ? (
        <p className="text-sm">{value}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">{empty}</p>
      )}
    </div>
  )
}

function SegmentDialog() {
  const profile = useSelector((state: RootState) => state.findingMyCustomers.customerProfile)
  const ageMin = useSelector((state: RootState) => state.findingMyCustomers.ageMin)
  const ageMax = useSelector((state: RootState) => state.findingMyCustomers.ageMax)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-1 h-7 text-muted-foreground hover:text-foreground">
          <Eye className="h-3.5 w-3.5" />
          <span className="text-xs">View details</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {profile.name || "Customer Segment"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <Field label="Segment name" value={profile.name} />
          <Field label="Occupation / role" value={profile.occupation} />
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Age range</p>
            <p className="text-sm">{ageMin} – {ageMax}</p>
          </div>
          <Field label="Who they are" value={profile.whoTheyAre} />
          <Field label="Goals & motivations" value={profile.goals} />
          <Field label="Frustrations & challenges" value={profile.frustrations} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const segmentName = useSelector((state: RootState) => state.findingMyCustomers.customerProfile.name)

  return (
    <div className="flex gap-6 flex-1 w-full items-start">
      <div className="w-56 sticky top-4 flex flex-col gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === `${BASE}/${item.path}`
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start h-auto whitespace-normal text-left"
                    onClick={() => router.push(`${BASE}/${item.path}`)}
                  >
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex flex-col gap-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Segment</p>
            <div className="flex items-center gap-2 px-1 py-1">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              {segmentName ? (
                <span className="text-sm font-medium truncate">{segmentName}</span>
              ) : (
                <span className="text-sm text-muted-foreground italic">Not set</span>
              )}
            </div>
            <SegmentDialog />
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

export default function FindingMyCustomersLayout({ children }: { children: React.ReactNode }) {
  return (
    <FindingMyCustomersStoreProvider>
      <LayoutContent>{children}</LayoutContent>
    </FindingMyCustomersStoreProvider>
  )
}

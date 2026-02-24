"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { FindingMyCustomersStoreProvider } from "./store/provider"

const BASE = "/problem-discovery/find-new-problems/finding-my-customers"

const NAV_ITEMS = [
  { label: "Introduction", path: "introduction" },
  { label: "Your Customers", path: "your-customers" },
  { label: "Jobs to Be Done", path: "jobs-to-be-done" },
  { label: "Solutions", path: "solutions" },
  { label: "Problems", path: "problems" },
  { label: "Summary", path: "summary" },
]

export default function FindingMyCustomersLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="flex gap-6 flex-1 w-full">
        <Card className="w-56 h-fit">
          <CardContent className="p-3">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === `${BASE}/${item.path}`
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => router.push(`${BASE}/${item.path}`)}
                  >
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex-1">
          <FindingMyCustomersStoreProvider>
            {children}
          </FindingMyCustomersStoreProvider>
        </div>
    </div>
  )
}

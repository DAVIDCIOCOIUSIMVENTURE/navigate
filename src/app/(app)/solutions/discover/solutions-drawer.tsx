"use client"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { SolutionsTable } from "@/components/solutions-table"
import { useDiscovery } from "./context"

export function SolutionsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { candidates } = useDiscovery()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader>
          <DrawerTitle>All Solutions ({candidates.length})</DrawerTitle>
          <DrawerDescription className="sr-only">Solutions captured for this problem</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-auto px-4 pb-6">
          <SolutionsTable
            solutions={candidates}
            showStatus
            showEditDelete
            title="All Solutions"
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

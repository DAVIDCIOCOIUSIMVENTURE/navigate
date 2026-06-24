"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import type { AdminUserRecord } from "@/types/admin"
import { CURRENT_USER_ID, establishments } from "./adminMockData"

const FALLBACK_NAME = "Unnamed admin"
const FALLBACK_EMAIL = "No email set"

export function useCurrentAdminUser(): AdminUserRecord {
  const displayName = useSelector((state: RootState) => state.accountSettings.displayName)
  const email = useSelector((state: RootState) => state.accountSettings.email)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const selfDiscoveryItems = useSelector((state: RootState) => state.selfDiscoveryItems.items)

  const hostEstablishment = establishments[0]

  return {
    id: CURRENT_USER_ID,
    role: "admin",
    displayName: displayName.trim() || FALLBACK_NAME,
    email: email.trim() || FALLBACK_EMAIL,
    establishmentId: hostEstablishment.id,
    classIds: [],
    licenseId: hostEstablishment.license.id,
    joinedAt: "2026-05-21",
    lastActiveAt: "2026-05-21",
    stats: {
      problems: problems.length,
      solutions: solutions.length,
      selfDiscoveryItems: selfDiscoveryItems.length,
    },
  }
}

export function isCurrentUserId(id: string): boolean {
  return id === CURRENT_USER_ID
}

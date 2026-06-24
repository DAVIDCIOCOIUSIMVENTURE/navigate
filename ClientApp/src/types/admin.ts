export type AdminRole = "admin" | "educator" | "user"

export type LicenseStatus = "active" | "expired" | "pending"

export interface Establishment {
  id: string
  name: string
  shortName: string
  country: string
  createdAt: string
  primaryContactEmail: string
  license: License
}

export interface License {
  id: string
  establishmentId: string
  name: string
  seats: number
  consumed: number
  status: LicenseStatus
  startsAt: string
  expiresAt: string
}

export interface Classroom {
  id: string
  establishmentId: string
  name: string
  educatorIds: string[]
  userIds: string[]
  createdAt: string
}

export interface AdminUserRecord {
  id: string
  role: AdminRole
  displayName: string
  email: string
  establishmentId: string
  classIds: string[]
  licenseId: string | null
  joinedAt: string
  lastActiveAt: string | null
  stats: {
    problems: number
    solutions: number
    selfDiscoveryItems: number
  }
}

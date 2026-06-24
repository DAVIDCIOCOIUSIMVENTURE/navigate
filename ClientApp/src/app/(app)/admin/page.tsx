"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Building2, GraduationCap, ShieldCheck, Users, UserCog } from "lucide-react"
import Link from "@/components/link"
import { adminUsers, classes, establishments, getClassName, getEstablishmentName, getLicenseName } from "@/data/adminMockData"
import { useCurrentAdminUser } from "@/data/useCurrentAdminUser"

function LicenseUsageBar({ consumed, seats }: { consumed: number; seats: number }) {
  const pct = seats === 0 ? 0 : Math.min(100, Math.round((consumed / seats) * 100))
  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-secondary-brand" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-base tabular-nums whitespace-nowrap">{consumed}/{seats}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: "active" | "expired" | "pending" }) {
  const map = {
    active: "bg-green-100 text-green-800",
    expired: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  } as const
  return <Badge variant="outline" className={map[status]}>{status}</Badge>
}

function RoleBadge({ role }: { role: "admin" | "educator" | "user" }) {
  const map = {
    admin: "bg-blue-900 text-white",
    educator: "bg-teal-700 text-white",
    user: "bg-muted text-foreground",
  } as const
  return <Badge className={map[role]}>{role}</Badge>
}

export default function AdminPage() {
  const currentUser = useCurrentAdminUser()
  const allUsers = [currentUser, ...adminUsers]
  const admins = allUsers.filter((u) => u.role === "admin")
  const educators = allUsers.filter((u) => u.role === "educator")
  const users = allUsers.filter((u) => u.role === "user")

  return (
    <div className="flex flex-col gap-6">
      <Card className="opacity-60 pointer-events-none select-none">
        <CardHeader className="space-y-6">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage
          </CardTitle>
          <p className="text-base text-foreground">
            Aggregate platform usage will appear here. Sessions, time on task, active learners,
            and licence consumption trends across all establishments.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {["Active learners", "Sessions this week", "Avg. minutes / session", "Licences consumed"].map((label) => (
              <div key={label} className="rounded-md border bg-muted/30 p-4">
                <div className="text-base font-medium">{label}</div>
                <div className="mt-2 text-3xl font-semibold tabular-nums">--</div>
                <div className="mt-1 text-base text-foreground">coming soon</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="establishments" className="w-full">
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="establishments" className="gap-2">
                <Building2 className="h-4 w-4" />
                Establishments
              </TabsTrigger>
              <TabsTrigger value="classes" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Classes
              </TabsTrigger>
              <TabsTrigger value="admins" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Admins
              </TabsTrigger>
              <TabsTrigger value="educators" className="gap-2">
                <UserCog className="h-4 w-4" />
                Educators
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="establishments" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Licence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Seats consumed</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {establishments.map((est) => (
                    <TableRow key={est.id}>
                      <TableCell className="font-medium">{est.name}</TableCell>
                      <TableCell>{est.country}</TableCell>
                      <TableCell>{est.license.name}</TableCell>
                      <TableCell><StatusBadge status={est.license.status} /></TableCell>
                      <TableCell>
                        <LicenseUsageBar consumed={est.license.consumed} seats={est.license.seats} />
                      </TableCell>
                      <TableCell>{est.license.expiresAt}</TableCell>
                      <TableCell>{est.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="classes" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Establishment</TableHead>
                    <TableHead>Educators</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{getEstablishmentName(c.establishmentId)}</TableCell>
                      <TableCell className="tabular-nums">{c.educatorIds.length}</TableCell>
                      <TableCell className="tabular-nums">{c.userIds.length}</TableCell>
                      <TableCell>{c.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {[
              { value: "admins", rows: admins, showClasses: false },
              { value: "educators", rows: educators, showClasses: true },
              { value: "users", rows: users, showClasses: true },
            ].map(({ value, rows, showClasses }) => (
              <TabsContent key={value} value={value} className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Establishment</TableHead>
                      {showClasses && <TableHead>Classes</TableHead>}
                      <TableHead>Licence</TableHead>
                      <TableHead>Problems</TableHead>
                      <TableHead>Solutions</TableHead>
                      <TableHead>Self-discovery</TableHead>
                      <TableHead>Last active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((u) => (
                      <TableRow key={u.id} className="cursor-pointer">
                        <TableCell className="font-medium">
                          <Link href={`/admin/users/${u.id}`} className="hover:underline text-secondary-brand">
                            {u.displayName}
                          </Link>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell><RoleBadge role={u.role} /></TableCell>
                        <TableCell>{getEstablishmentName(u.establishmentId)}</TableCell>
                        {showClasses && (
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {u.classIds.map((cid) => (
                                <Badge key={cid} variant="outline">{getClassName(cid)}</Badge>
                              ))}
                              {u.classIds.length === 0 && <span className="text-foreground">None</span>}
                            </div>
                          </TableCell>
                        )}
                        <TableCell>{getLicenseName(u.licenseId)}</TableCell>
                        <TableCell className="tabular-nums">{u.stats.problems}</TableCell>
                        <TableCell className="tabular-nums">{u.stats.solutions}</TableCell>
                        <TableCell className="tabular-nums">{u.stats.selfDiscoveryItems}</TableCell>
                        <TableCell>{u.lastActiveAt ?? "Never"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

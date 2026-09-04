"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Lightbulb, Target, Compass } from "lucide-react"
import { adminUsers, getClassName, getEstablishmentName, getLicenseName } from "@/data/adminMockData"
import { isCurrentUserId, useCurrentAdminUser } from "@/data/useCurrentAdminUser"
import { getProblemLabel } from "@/store/problems-model"

export default function AdminUserPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const currentUser = useCurrentAdminUser()
  const isCurrentUser = isCurrentUserId(userId)
  const user = isCurrentUser ? currentUser : adminUsers.find((u) => u.id === userId)
  if (!user) notFound()

  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const selfDiscoveryItems = useSelector((state: RootState) => state.selfDiscoveryItems.items)
  const customByColumn = useSelector((state: RootState) => state.customDimensionItems.byColumn)

  const liveProblems = isCurrentUser ? problems : []
  const liveSolutions = isCurrentUser ? solutions : []
  const liveSelfDiscovery = isCurrentUser ? selfDiscoveryItems : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="outline" size="sm" asChild className="gap-2 bg-white">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
            Back to admin panel
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>{user.displayName}</CardTitle>
              <p className="mt-2 text-base text-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={user.role === "admin" ? "bg-blue-900 text-white" : user.role === "educator" ? "bg-teal-700 text-white" : "bg-muted text-foreground"}>
                {user.role}
              </Badge>
              {isCurrentUser && <Badge variant="outline">You</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-md border p-4">
              <div className="text-base font-medium">Establishment</div>
              <div className="mt-2 text-base">{getEstablishmentName(user.establishmentId)}</div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-base font-medium">Licence</div>
              <div className="mt-2 text-base">{getLicenseName(user.licenseId)}</div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-base font-medium">Joined</div>
              <div className="mt-2 text-base">{user.joinedAt}</div>
            </div>
            <div className="rounded-md border p-4">
              <div className="text-base font-medium">Last active</div>
              <div className="mt-2 text-base">{user.lastActiveAt ?? "Never"}</div>
            </div>
          </div>
          {user.classIds.length > 0 && (
            <div className="mt-4">
              <div className="text-base font-medium">Classes</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {user.classIds.map((cid) => (
                  <Badge key={cid} variant="outline">{getClassName(cid)}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isCurrentUser && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-base">No synced activity available for this user yet.</p>
            <p className="mt-2 text-base text-foreground">Only your own workspace is connected for now; other users will appear here once the backend is wired.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Problems ({liveProblems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveProblems.length === 0 ? (
            <p className="text-base text-foreground">No problems yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Problem</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Edited</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveProblems.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium max-w-md">
                      {getProblemLabel(p, customByColumn, liveSelfDiscovery)}
                    </TableCell>
                    <TableCell><Badge variant="outline">{p.source}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{p.validationStatus}</Badge></TableCell>
                    <TableCell>{p.createdAt.slice(0, 10)}</TableCell>
                    <TableCell>{p.editedAt.slice(0, 10)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Solutions ({liveSolutions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveSolutions.length === 0 ? (
            <p className="text-base text-foreground">No solutions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Inspiration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>For problem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveSolutions.map((s) => {
                  const parent = liveProblems.find((p) => p.id === s.problemId)
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.title || "Untitled"}</TableCell>
                      <TableCell><Badge variant="outline">{s.inspirationSource ?? "n/a"}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{s.validationStatus}</Badge></TableCell>
                      <TableCell className="max-w-sm truncate">
                        {parent ? getProblemLabel(parent, customByColumn, liveSelfDiscovery) : `#${s.problemId}`}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Self-discovery items ({liveSelfDiscovery.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {liveSelfDiscovery.length === 0 ? (
            <p className="text-base text-foreground">No self-discovery items yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>From question</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveSelfDiscovery.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="text-base">{item.questionUrl}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

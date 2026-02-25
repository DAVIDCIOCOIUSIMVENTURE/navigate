"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getNavigationItem } from "@/config/navigation"
import { CURRENT_USER_ID } from "@/lib/config"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { DISCOVERY_METHODS } from "@/lib/discoveryMethods"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, CheckCheck, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

type Problem = {
  id: string
  problems: string[]
  toolId: string
  status: "Draft" | "Exploring" | "Validated"
}

const PLACEHOLDER_PROBLEMS: Problem[] = [
  {
    id: "ph-1",
    problems: [
      "Customers struggle to track order status after purchase",
      "No proactive notifications when an order is delayed",
      "Returns process is confusing and hard to initiate",
    ],
    toolId: "finding-my-customers",
    status: "Exploring",
  },
  {
    id: "ph-2",
    problems: [
      "Onboarding process takes too long for new team members",
      "Documentation is outdated and hard to navigate",
    ],
    toolId: "finding-my-customers",
    status: "Draft",
  },
  {
    id: "ph-3",
    problems: [
      "Reporting dashboards are too complex for non-technical users",
    ],
    toolId: "finding-my-customers",
    status: "Validated",
  },
  {
    id: "ph-4",
    problems: [
      "Manual invoice reconciliation leads to frequent errors",
      "No audit trail for payment approvals",
    ],
    toolId: "environment-changes",
    status: "Draft",
  },
  {
    id: "ph-5",
    problems: [
      "Support tickets lack enough context to resolve on first contact",
    ],
    toolId: "already-know",
    status: "Exploring",
  },
]

const statusStyles: Record<Problem["status"], string> = {
  Draft: "bg-muted text-muted-foreground",
  Exploring: "bg-blue-100 text-blue-700",
  Validated: "bg-emerald-100 text-emerald-700",
}

function ProblemCell({ problems }: { problems: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = problems.length > 1

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {hasMore ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <span>{problems[0]}</span>
      </div>
      {expanded && (
        <ul className="flex flex-col gap-1 mt-0.5 pl-[1.375rem]">
          {problems.slice(1).map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function buildColumns(
  onDelete: (id: string) => void,
  onValidate: (id: string) => void,
): ColumnDef<Problem>[] {
  return [
    {
      accessorKey: "toolId",
      header: "Tool Used",
      cell: ({ row }) => {
        const toolId = row.getValue("toolId") as string
        const method = DISCOVERY_METHODS.find((m) => m.id === toolId)
        if (!method) return <span className="text-muted-foreground">—</span>
        const ToolIcon = method.icon
        if (method.href) {
          return (
            <a
              href={method.href}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline"
            >
              <ToolIcon className="h-3.5 w-3.5 shrink-0" />
              {method.title}
            </a>
          )
        }
        return (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <ToolIcon className="h-3.5 w-3.5 shrink-0" />
            {method.title}
          </span>
        )
      },
    },
    {
      accessorKey: "problems",
      header: "Problem",
      cell: ({ row }) => (
        <ProblemCell problems={row.getValue("problems")} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Problem["status"]
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
          >
            {status}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-emerald-600 gap-1.5"
            disabled={row.original.status === "Validated"}
            onClick={() => onValidate(row.original.id)}
          >
            <CheckCheck className="h-4 w-4" />
            Validate
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]
}

export default function ProblemDiscoveryPage() {
  const navItem = getNavigationItem("/problem-discovery")
  const Icon = navItem?.icon
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [problems, setProblems] = useState<Problem[]>([])
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProblems() {
      try {
        const response = await fetch(`/api/problemTriggers?userId=${CURRENT_USER_ID}`)
        if (!response.ok) throw new Error("Failed to fetch problems")
        const data = await response.json()
        if (data.length > 0) {
          setProblems(
            data.map((p: { id: string; title: string }) => ({
              id: p.id,
              problems: [p.title],
              toolId: "already-know",
              status: "Draft" as const,
            }))
          )
        } else {
          setProblems(PLACEHOLDER_PROBLEMS)
        }
      } catch (error) {
        console.error("Error fetching problems:", error)
        setProblems(PLACEHOLDER_PROBLEMS)
      } finally {
        setLoading(false)
      }
    }
    fetchProblems()
  }, [])

  const handleDelete = (id: string) => {
    setPendingDeleteId(id)
  }

  const confirmDelete = () => {
    if (pendingDeleteId) {
      setProblems((prev) => prev.filter((p) => p.id !== pendingDeleteId))
      setPendingDeleteId(null)
    }
  }

  const handleValidate = (id: string) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Validated" } : p))
    )
  }

  const columns = buildColumns(handleDelete, handleValidate)

  const table = useReactTable({
    data: problems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
    <Dialog open={pendingDeleteId !== null} onOpenChange={(open) => { if (!open) setPendingDeleteId(null) }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete item?</DialogTitle>
          <DialogDescription>
            This will permanently remove the item from your list. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPendingDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Card className="w-full flex-1">
      <CardContent className="flex p-10 w-full flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {navItem && Icon && (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500">
                <Icon className="h-5 w-5 text-white" />
              </div>
            )}
            <h1 className="text-xl font-bold">Problem Discovery</h1>
          </div>
          <p className="text-muted-foreground">
            Start your problem discovery journey here. Select a problem discovery bucket or generate a new one.
            Each bucket represents a unique problem space to explore and develop solutions for.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Discovered Problems</h2>
            <Button
              variant="primary-outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => router.push("/problem-discovery/find-new-problems")}
            >
              <Plus className="h-4 w-4" />
              Find New Problems
            </Button>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading problems...</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No problems found yet. Use &quot;Find New Problems&quot; to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  )
}

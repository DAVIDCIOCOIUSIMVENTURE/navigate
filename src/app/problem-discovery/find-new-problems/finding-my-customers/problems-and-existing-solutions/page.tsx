"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Trash2, Briefcase, ChevronDown } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../store"

export default function ExistingSolutionsAndProblemsPage() {
  const jobs = useSelector((state: RootState) => state.findingMyCustomers.jobs)
  const dispatch = useDispatch<AppDispatch>()
  const [addMenuOpen, setAddMenuOpen] = useState<number | null>(null)
  const addMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (addMenuOpen === null) return
    function handleClickOutside(e: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [addMenuOpen])

  const namedJobs = jobs.filter((j) => j.job.trim())

  return (
    <Card className="w-full flex-1 flex flex-col h-[calc(100svh-9rem)]">
      <CardContent className="p-8 flex flex-col gap-6 overflow-y-auto flex-1">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center w-5 h-5 rounded bg-yellow-400">
            <Search className="h-3 w-3 text-white" />
          </span>
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Finding My Customers</span>
        </div>
        <h2 className="text-xl font-semibold">Problems & Existing Solutions</h2>
        <p className="text-sm">
          For each job to be done, map out the existing solutions your customers currently use and the problems they face.
          Add each item and classify it as a solution or a problem — then add the other side: the problems a solution leaves unsolved, or the solutions being tried for a problem.
        </p>

        <hr className="border-border" />
        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-lg font-semibold text-primary">Your turn</h3>
          <p className="text-sm">For each job, add existing solutions and problems, then fill in the other side for each.</p>
        </div>

        {namedJobs.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 flex flex-col items-center gap-3 text-center text-muted-foreground">
            <Briefcase className="h-5 w-5" />
            <p className="text-sm">No jobs defined yet. Add jobs on the <span className="font-medium">Jobs to Be Done</span> page first.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-8">
            {namedJobs.map((job) => (
              <li key={job.id} className="rounded-lg bg-primary p-6 flex flex-col gap-6 text-primary-foreground">
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold text-primary-foreground/60 uppercase tracking-wide flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3" />
                    Job
                  </p>
                  <p className="text-sm font-semibold">{job.job}</p>
                </div>

                {job.items.length > 0 && (
                  <ul className="flex flex-col divide-y divide-primary-foreground/20">
                    {job.items.map((item) => {
                      const isSolution = item.type === "solution"
                      const childLabel = isSolution
                        ? "Problem with this solution"
                        : "Existing solution for this problem"
                      const addChildLabel = isSolution ? "Add Problem" : "Add Solution"
                      const childPlaceholder = isSolution
                        ? "Problem…"
                        : "Existing solution…"

                      return (
                        <li key={item.id} className="py-7 flex flex-col gap-5 text-primary-foreground first:pt-0">
                          {/* Type dropdown + text input + delete */}
                          <div className="flex items-center gap-3">
                            <Select
                              value={item.type}
                              onValueChange={(value) =>
                                dispatch.findingMyCustomers.updateItemType({
                                  jobId: job.id,
                                  itemId: item.id,
                                  type: value as "solution" | "problem",
                                })
                              }
                            >
                              <SelectTrigger className="w-28 shrink-0 bg-white border-white/20 text-foreground text-xs h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="solution">Solution</SelectItem>
                                <SelectItem value="problem">Problem</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder={isSolution ? "Existing solution…" : "Existing problem…"}
                              value={item.text}
                              onChange={(e) =>
                                dispatch.findingMyCustomers.updateItemText({
                                  jobId: job.id,
                                  itemId: item.id,
                                  text: e.target.value,
                                })
                              }
                              className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground flex-1"
                            />
                            <button
                              onClick={() =>
                                dispatch.findingMyCustomers.removeItem({
                                  jobId: job.id,
                                  itemId: item.id,
                                })
                              }
                              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors shrink-0"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Children section */}
                          <div className="flex flex-col gap-3 pl-4 border-l-2 border-primary-foreground/20">
                            <p className="text-xs font-semibold text-primary-foreground/60 uppercase tracking-wide">
                              {childLabel}
                            </p>

                            {item.children.length > 0 && (
                              <ul className="flex flex-col gap-3">
                                {item.children.map((child) => (
                                  <li key={child.id} className="flex items-center gap-3">
                                    <Input
                                      placeholder={childPlaceholder}
                                      value={child.text}
                                      onChange={(e) =>
                                        dispatch.findingMyCustomers.updateChild({
                                          jobId: job.id,
                                          itemId: item.id,
                                          childId: child.id,
                                          text: e.target.value,
                                        })
                                      }
                                      className="bg-white border-white/20 text-foreground placeholder:text-muted-foreground"
                                    />
                                    <button
                                      onClick={() =>
                                        dispatch.findingMyCustomers.removeChild({
                                          jobId: job.id,
                                          itemId: item.id,
                                          childId: child.id,
                                        })
                                      }
                                      className="text-primary-foreground/60 hover:text-primary-foreground transition-colors shrink-0"
                                      aria-label="Remove child"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}

                            <button
                              onClick={() =>
                                dispatch.findingMyCustomers.addChild({
                                  jobId: job.id,
                                  itemId: item.id,
                                })
                              }
                              className="text-xs text-primary-foreground/70 hover:text-primary-foreground flex items-center gap-1.5 transition-colors self-start"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              {addChildLabel}
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {/* Single dropdown add button */}
                <div
                  className="relative"
                  ref={addMenuOpen === job.id ? addMenuRef : null}
                >
                  <Button
                    variant="on-primary"
                    className="w-full gap-2"
                    onClick={() => setAddMenuOpen(addMenuOpen === job.id ? null : job.id)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Problem or Solution
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  {addMenuOpen === job.id && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover text-popover-foreground border rounded-md shadow-md z-10 py-1">
                      <button
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-accent flex items-center gap-2"
                        onClick={() => {
                          dispatch.findingMyCustomers.addItem({ jobId: job.id, type: "solution" })
                          setAddMenuOpen(null)
                        }}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        Solution
                      </button>
                      <button
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-accent flex items-center gap-2"
                        onClick={() => {
                          dispatch.findingMyCustomers.addItem({ jobId: job.id, type: "problem" })
                          setAddMenuOpen(null)
                        }}
                      >
                        <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                        Problem
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

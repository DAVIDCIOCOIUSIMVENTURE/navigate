import type { Job, JobAnchor, JobKind, JobsToBeDone } from "@/types/validation"
import { INTENSITY_RANK } from "@/types/validation"

// The next free id for a job list: one past the current highest id.
export function nextJobId(jobs: Job[]): number {
  return jobs.reduce((max, j) => Math.max(max, j.id), 0) + 1
}

// Flatten the three job lists into one, dropping blanks. Emotional and social
// come before functional so a tie on intensity resolves toward the
// emotional/social pull (the sort below is stable).
export function listAllJobs(jobs: JobsToBeDone): { kind: JobKind; job: Job }[] {
  return [
    ...jobs.emotional.map((j) => ({ kind: "emotional" as const, job: j })),
    ...jobs.social.map((j) => ({ kind: "social" as const, job: j })),
    ...jobs.functional.map((j) => ({ kind: "functional" as const, job: j })),
  ].filter(({ job }) => job.text.trim().length > 0)
}

// The sensible default anchor before the user picks one: the highest-intensity
// job across all three kinds. listAllJobs returns emotional and social before
// functional, and the sort is stable, so a tie resolves toward the
// emotional/social pull and falls back to a functional job only when that is
// all there is.
export function defaultAnchorJob(jobs: JobsToBeDone): { kind: JobKind; job: Job } | null {
  const ranked = [...listAllJobs(jobs)]
    .sort((a, b) => INTENSITY_RANK[b.job.intensity] - INTENSITY_RANK[a.job.intensity])
  return ranked[0] ?? null
}

// The job the price is anchored on: the user's explicit pick when it still
// exists, otherwise the default. Always returns the same shape so callers do
// not have to care which one it was.
export function resolveAnchorJob(jobs: JobsToBeDone, anchor: JobAnchor | null): { kind: JobKind; job: Job } | null {
  if (anchor) {
    const job = jobs[anchor.kind]?.find((j) => j.id === anchor.id)
    if (job && job.text.trim().length > 0) return { kind: anchor.kind, job }
  }
  return defaultAnchorJob(jobs)
}

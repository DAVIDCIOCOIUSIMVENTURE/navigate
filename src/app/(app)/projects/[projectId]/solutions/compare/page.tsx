import { redirect } from "next/navigation"
import { projectRoutes } from "@/lib/projects"

/** The flow has no landing page of its own; it opens on its first step. */
export default async function CompareIndexPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  redirect(projectRoutes.compare(Number(projectId)))
}

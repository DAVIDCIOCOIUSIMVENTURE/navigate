import { redirect } from "next/navigation"
import { projectRoutes } from "@/lib/projects"

/** The flow has no landing page of its own; it opens on its first step. */
export default async function IdentifySolutionsIndexPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  redirect(projectRoutes.identifySolutions(Number(projectId)))
}

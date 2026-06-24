import { Navigate, useParams } from "react-router-dom"

export default function ValidateIndexPage() {
  const { solutionId } = useParams<{ solutionId: string }>()
  return <Navigate to={`/solutions/${solutionId}/validate/introduction`} replace />
}

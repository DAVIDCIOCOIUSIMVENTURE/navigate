"use client"

/**
 * Catches errors thrown while rendering page content. A `NotFoundError`
 * (thrown by `notFound()` from "@/lib/router") renders the not-found page;
 * anything else renders a generic error fallback. This replaces Next's
 * `not-found.tsx` / `error.tsx` special files, which the App Router invoked
 * automatically but plain React Router does not.
 */

import React from "react"
import { NotFoundError } from "@/lib/router"
import NotFound from "@/app/(app)/not-found"

interface Props {
  /** Changes on navigation (the pathname); used to clear a stale error. */
  resetKey: string
  children: React.ReactNode
}

interface State {
  error: Error | null
}

export class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidUpdate(prevProps: Props) {
    // Clear the error once the user navigates to a different route.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  render() {
    const { error } = this.state
    if (error) {
      if (error instanceof NotFoundError) {
        return <NotFound />
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <h1 className="text-4xl font-bold">Something went wrong</h1>
          <p className="text-base">{error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}

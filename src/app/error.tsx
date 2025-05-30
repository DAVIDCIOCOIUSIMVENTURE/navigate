'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="mb-4">{error.message}</p>
      <button
        className="px-4 py-2 bg-black text-white rounded"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  )
} 
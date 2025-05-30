"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

type ProblemDiscoveryBucket = {
  id: string
  title: string
  selfDiscoveryBucketId: number
  items?: Array<{
    id: string
    title: string
  }>
}

export default function ProblemDiscoveryPage({ params }: { params: { id: string } }) {
  const [bucketData, setBucketData] = useState<ProblemDiscoveryBucket | null>(null)
  const [loading, setLoading] = useState(true)
  const bucketId = params.id

  useEffect(() => {
    let isMounted = true

    async function fetchBucketData() {
      try {
        const response = await fetch(`http://localhost:3001/problemDiscoveryBuckets/${bucketId}`)
        if (!response.ok) throw new Error('Failed to fetch bucket data')
        const data = await response.json()
        if (isMounted) {
          setBucketData(data)
        }
      } catch (error) {
        console.error('Error fetching bucket data:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchBucketData()

    return () => {
      isMounted = false
    }
  }, [bucketId])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (!bucketData) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No bucket data found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/problem-discovery" className="hover:text-gray-700">
          Problem Discovery
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-700">{bucketData.title}</span>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">{bucketData.title}</h2>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-gray-600">
                This is where you&apos;ll explore and validate the problems identified from your self-discovery buckets.
              </p>

              {bucketData.items && bucketData.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bucketData.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <h3 className="font-medium text-blue-700">{item.title}</h3>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No items in this bucket yet. Add items from your self-discovery buckets.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

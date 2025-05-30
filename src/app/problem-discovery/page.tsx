"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getNavigationItem } from "@/config/navigation"
import { ChevronRight, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ProblemDiscoveryBucket = {
  id: string
  title: string
  selfDiscoveryBucketId: number | null
  userId: string
}

type SelfDiscoveryBucket = {
  id: string
  title: string
  ideaTriggers: string[]
  userId: string
}

export default function ProblemDiscoveryPage() {
  const navItem = getNavigationItem("/problem-discovery")
  const Icon = navItem?.icon
  const [buckets, setBuckets] = useState<ProblemDiscoveryBucket[]>([])
  const [selfDiscoveryBuckets, setSelfDiscoveryBuckets] = useState<SelfDiscoveryBucket[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newBucketTitle, setNewBucketTitle] = useState("")
  const [selectedSelfDiscoveryBucket, setSelectedSelfDiscoveryBucket] = useState<string>("")
  const [bucketToDelete, setBucketToDelete] = useState<ProblemDiscoveryBucket | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [bucketsRes, selfDiscoveryRes] = await Promise.all([
          fetch('http://localhost:3001/problemDiscoveryBuckets'),
          fetch('http://localhost:3001/selfDiscoveryBuckets')
        ])
        
        if (!bucketsRes.ok || !selfDiscoveryRes.ok) throw new Error('Failed to fetch data')
        
        const [bucketsData, selfDiscoveryData] = await Promise.all([
          bucketsRes.json(),
          selfDiscoveryRes.json()
        ])
        
        setBuckets(bucketsData)
        setSelfDiscoveryBuckets(selfDiscoveryData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function handleCreateBucket() {
    if (!newBucketTitle.trim()) return

    const newBucket = {
      title: newBucketTitle.trim(),
      selfDiscoveryBucketId: selectedSelfDiscoveryBucket ? Number(selectedSelfDiscoveryBucket) : null,
      userId: "1" // Hardcoded for now, should come from auth context
    }

    try {
      const response = await fetch('http://localhost:3001/problemDiscoveryBuckets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBucket)
      })

      if (!response.ok) throw new Error('Failed to create bucket')
      
      const createdBucket = await response.json()
      setBuckets(prev => [...prev, createdBucket])
      setIsDialogOpen(false)
      setNewBucketTitle("")
      setSelectedSelfDiscoveryBucket("")
    } catch (error) {
      console.error('Error creating bucket:', error)
    }
  }

  async function handleDeleteBucket() {
    if (!bucketToDelete) return

    try {
      const response = await fetch(`http://localhost:3001/problemDiscoveryBuckets/${bucketToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete bucket')
      
      setBuckets(prev => prev.filter(bucket => bucket.id !== bucketToDelete.id))
      setBucketToDelete(null)
    } catch (error) {
      console.error('Error deleting bucket:', error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-700">Problem Discovery</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        {navItem && Icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <h2 className="text-xl font-bold">Problem Discovery</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Start your problem discovery journey here. Select a problem discovery bucket or generate a new one.
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Problem Discovery Buckets</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Problem Discovery Bucket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Bucket Title</Label>
                    <Input
                      id="title"
                      value={newBucketTitle}
                      onChange={(e) => setNewBucketTitle(e.target.value)}
                      placeholder="Enter bucket title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="selfDiscovery">Link to Self Discovery Bucket (Optional)</Label>
                    <Select
                      value={selectedSelfDiscoveryBucket}
                      onValueChange={setSelectedSelfDiscoveryBucket}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a self discovery bucket" />
                      </SelectTrigger>
                      <SelectContent>
                        {selfDiscoveryBuckets.map((bucket) => (
                          <SelectItem key={bucket.id} value={bucket.id}>
                            {bucket.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateBucket}
                      disabled={!newBucketTitle.trim()}
                    >
                      Create Bucket
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading buckets...</div>
            ) : buckets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buckets.map((bucket) => (
                  <div key={bucket.id} className="relative group">
                    <div className="p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{bucket.title}</h3>
                          {bucket.selfDiscoveryBucketId && (
                            <p className="text-sm text-gray-500 mt-1">
                              Linked to: {selfDiscoveryBuckets.find(b => b.id === String(bucket.selfDiscoveryBucketId))?.title}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="destructive-outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              setBucketToDelete(bucket)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Link href={`/problem-discovery/bucket/${bucket.id}`}>
                            <Button variant="default" size="sm">
                              Open
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No problem discovery buckets yet. Create one to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!bucketToDelete} onOpenChange={(open) => !open && setBucketToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bucket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{bucketToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBucketToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBucket}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
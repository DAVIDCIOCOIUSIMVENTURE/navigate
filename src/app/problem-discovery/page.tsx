"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { getNavigationItem } from "@/config/navigation"
import { ChevronRight, Plus, Trash2, Box } from "lucide-react"
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
    <div className="flex flex-col h-full w-full gap-6 flex-1">
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

      <Card>
        <CardHeader className="flex justify-between flex-row items-center">
          <CardTitle>Buckets</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex flex-row items-center gap-2"
                variant="primary-outline"
                size="sm">
                <Plus className="h-4 w-4" />
                New Bucket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Create New Problem Discovery Bucket</DialogTitle>
                <DialogDescription>
                  Create a new bucket to start exploring and developing solutions for specific problem spaces.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
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
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateBucket} disabled={!newBucketTitle.trim()}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading buckets...</div>
          ) : buckets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buckets.map((bucket) => (
                <Card key={bucket.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4" />
                      <CardTitle>{bucket.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setBucketToDelete(bucket)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {bucket.selfDiscoveryBucketId && (
                      <div className="text-sm text-muted-foreground">
                        Linked to: {selfDiscoveryBuckets.find(b => b.id === String(bucket.selfDiscoveryBucketId))?.title}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Link href={`/problem-discovery/bucket/${bucket.id}`}>
                      <Button
                        size="sm"
                        className="h-auto py-2 bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 whitespace-normal text-wrap">
                        Continue to Problem Discovery
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No problem discovery buckets yet. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!bucketToDelete} onOpenChange={() => setBucketToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bucket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bucket? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBucketToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteBucket}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
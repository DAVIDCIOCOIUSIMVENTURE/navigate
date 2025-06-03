"use client"

import { getNavigationItem } from "@/config/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Plus, Trash2, X, Heart, Globe, Brain, Book, ChevronRight, Box } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface IdeaTrigger {
  id: string
  title: string
  userId: string
  selfDiscoveryQuestionId: string
}

interface Container {
  id: string
  title: string
  ideaTriggerIds: string[]
  isEditing: boolean
}

interface ContainerResponse {
  id: string
  title: string
  ideaTriggerIds: string[]
}

interface Category {
  id: string
  title: string
  questions: Question[]
}

interface Question {
  id: string
  title: string
  selfDiscoveryQuestionCategoryId: string
}

export default function IdeaTriggersPage() {
  const navItem = getNavigationItem("/idea-triggers")
  const Icon = navItem?.icon
  const [containers, setContainers] = useState<Container[]>([])
  const [ideaTriggers, setIdeaTriggers] = useState<IdeaTrigger[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newContainerTitle, setNewContainerTitle] = useState("")
  const [containerToDelete, setContainerToDelete] = useState<Container | null>(null)
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editingContainer, setEditingContainer] = useState<Container | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories and questions
        const [categoriesRes, questionsRes] = await Promise.all([
          fetch('http://localhost:3001/selfDiscoveryQuestionCategories'),
          fetch('http://localhost:3001/selfDiscoveryQuestions')
        ])

        const categoriesData = await categoriesRes.json()
        const questionsData = await questionsRes.json()

        // Combine categories with their questions
        const categoriesWithQuestions = categoriesData.map((category: Category) => ({
          ...category,
          questions: questionsData.filter((question: Question) =>
            question.selfDiscoveryQuestionCategoryId === category.id
          )
        }))

        setCategories(categoriesWithQuestions)

        // Fetch idea triggers
        const triggersRes = await fetch('http://localhost:3001/ideaTriggers')
        const triggersData = await triggersRes.json()
        setIdeaTriggers(triggersData)

        // Fetch containers
        const containersRes = await fetch('http://localhost:3001/ideaTriggerBuckets')
        const containersData = await containersRes.json()
        setContainers(containersData.map((container: ContainerResponse) => ({
          ...container,
          isEditing: false
        })))
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  function toggleEdit(containerId: string) {
    const container = containers.find(c => c.id === containerId)
    if (container) {
      setEditingContainer(container)
      setNewContainerTitle(container.title)
      setSelectedTriggers(container.ideaTriggerIds)
      setIsDialogOpen(true)
    }
  }

  async function handleCreateContainer() {
    if (!newContainerTitle.trim()) return

    const containerData = {
      id: editingContainer?.id || String(Date.now()),
      title: newContainerTitle.trim(),
      ideaTriggerIds: selectedTriggers,
      userId: "1" // TODO: Replace with actual user ID
    }

    try {
      if (editingContainer) {
        // Update existing container
        const response = await fetch(`http://localhost:3001/ideaTriggerBuckets/${editingContainer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(containerData)
        })
        if (!response.ok) throw new Error('Failed to update container')
        setContainers(prev => prev.map(container =>
          container.id === editingContainer.id
            ? { ...containerData, isEditing: false }
            : container
        ))
      } else {
        // Create new container
        const response = await fetch('http://localhost:3001/ideaTriggerBuckets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(containerData)
        })
        if (!response.ok) throw new Error('Failed to add container')
        setContainers(prev => [
          ...prev,
          { ...containerData, isEditing: false }
        ])
      }
      setIsDialogOpen(false)
      setNewContainerTitle("")
      setSelectedTriggers([])
      setEditingContainer(null)
    } catch (error) {
      console.error('Error saving container:', error)
    }
  }

  function updateContainerName(containerId: string, newName: string) {
    if (newName.trim()) {
      setContainers(prev => prev.map(container => {
        if (container.id === containerId) {
          return { ...container, title: newName.trim() }
        }
        return container
      }))
    }
  }

  async function handleDeleteContainer() {
    if (!containerToDelete) return

    try {
      const response = await fetch(`http://localhost:3001/ideaTriggerBuckets/${containerToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete container')

      setContainers(prev => prev.filter(container => container.id !== containerToDelete.id))
      setContainerToDelete(null)
    } catch (error) {
      console.error('Error deleting container:', error)
    }
  }

  function toggleTrigger(triggerId: string) {
    setSelectedTriggers(prev =>
      prev.includes(triggerId)
        ? prev.filter(id => id !== triggerId)
        : [...prev, triggerId]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {navItem && Icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500">
              <Icon className="h-5 w-5 text-white" />
            </div>
          )}
          <h1 className="text-lg font-bold">Idea Triggers</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Combine different idea triggers to generate new business concepts. You can use the same idea trigger in multiple containers to explore different possibilities. We recommend you select ideas from different categories.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Containers</h3>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) {
                  setNewContainerTitle("New Container")
                  setSelectedTriggers([])
                  setEditingContainer(null)
                }
              }}>
                <DialogTrigger asChild>
                  <Button
                  className="flex flex-row items-center gap-2"
                  variant="primary-outline"
                  size="sm">
                    <Plus className="h-4 w-4" />
                    New Container
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>{editingContainer ? 'Edit Container' : 'Create New Container'}</DialogTitle>
                    <DialogDescription>
                      {editingContainer ? 'Edit your container and its idea triggers.' : 'Create a new container and select idea triggers to add to it.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Container Title</Label>
                        <Input
                          id="title"
                          value={newContainerTitle}
                          onChange={(e) => setNewContainerTitle(e.target.value)}
                          placeholder="Enter container title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Selected Triggers</Label>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                          {selectedTriggers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No triggers selected</p>
                          ) : (
                            selectedTriggers.map((triggerId) => {
                              const trigger = ideaTriggers.find(t => t.id === triggerId)
                              if (!trigger) return null

                              // Find the category for this trigger
                              const category = categories.find(cat =>
                                cat.questions.some(q => q.id === trigger.selfDiscoveryQuestionId)
                              )

                              return (
                                <div
                                  key={trigger.id}
                                  className="flex items-center gap-2 py-1 bg-secondary text-secondary-foreground rounded-md font-medium h-8 rounded-md px-3 text-xs"
                                // className="flex items-center gap-2 py-1 bg-primary 
                                // text-primary-foreground rounded-md font-medium h-8 rounded-md px-3 text-xs"

                                >
                                  {category?.id === "1" && <Heart className="h-3 w-3" />}
                                  {category?.id === "2" && <Book className="h-3 w-3" />}
                                  {category?.id === "3" && <Brain className="h-3 w-3" />}
                                  {category?.id === "4" && <Globe className="h-3 w-3" />}
                                  <span>{trigger.title}</span>
                                  <Button
                                    variant="destructive-ghost"
                                    size="icon"
                                    className="h-4 w-4"
                                    onClick={() => toggleTrigger(trigger.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Idea Triggers</Label>
                        <div className="space-y-4 p-2 border rounded-md">
                          {categories.map((category) => (
                            <div key={category.id} className="space-y-2">
                              <h4 className="font-medium text-sm flex items-center gap-2">
                                {category.id === "1" && <Heart className="h-4 w-4" />}
                                {category.id === "2" && <Book className="h-4 w-4" />}
                                {category.id === "3" && <Brain className="h-4 w-4" />}
                                {category.id === "4" && <Globe className="h-4 w-4" />}
                                {category.title}
                              </h4>
                              {category.questions.map((question) => (
                                <div key={question.id} className="space-y-2">
                                  <p className="text-sm text-muted-foreground">{question.title}</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {ideaTriggers
                                      .filter(trigger => trigger.selfDiscoveryQuestionId === question.id)
                                      .map((trigger) => (
                                        <Button
                                          size="sm"
                                          key={trigger.id}
                                          variant={selectedTriggers.includes(trigger.id) ? "primary-outline" : "secondary-primary"}
                                          className="text-start"
                                          onClick={() => toggleTrigger(trigger.id)}
                                        >
                                          {trigger.title}
                                        </Button>
                                      ))}
                                    {ideaTriggers.filter(trigger => trigger.selfDiscoveryQuestionId === question.id).length === 0 && (
                                      <p className="text-xs text-muted-foreground col-span-2">No triggers added yet</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateContainer}>{editingContainer ? 'Save' : 'Create'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {containers.map((container) => (
                <Card key={container.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      {container.isEditing ? (
                        <Input
                          value={container.title}
                          onChange={(e) => updateContainerName(container.id, e.target.value)}
                          onBlur={() => toggleEdit(container.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              toggleEdit(container.id)
                            }
                          }}
                          className="h-8"
                        />
                      ) : (
                        <>
                          <Box className="h-4 w-4" />
                          <CardTitle>{container.title}</CardTitle>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleEdit(container.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setContainerToDelete(container)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {container.ideaTriggerIds.map((triggerId) => {
                        const trigger = ideaTriggers.find(t => t.id === triggerId)
                        if (!trigger) return null

                        // Find the category for this trigger
                        const category = categories.find(cat =>
                          cat.questions.some(q => q.id === trigger.selfDiscoveryQuestionId)
                        )

                        return (
                          <div
                            key={trigger.id}
                            className="flex items-center gap-2 py-1 rounded-md font-medium h-8 rounded-md px-3 text-xs bg-secondary text-secondary-foreground"
                          >
                            {category?.id === "1" && <Heart className="h-3 w-3" />}
                            {category?.id === "2" && <Book className="h-3 w-3" />}
                            {category?.id === "3" && <Brain className="h-3 w-3" />}
                            {category?.id === "4" && <Globe className="h-3 w-3" />}
                            {trigger.title}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                    size="sm"
                    className="h-auto py-2 bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 whitespace-normal text-wrap">
                      Continue to Problem Discovery
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!containerToDelete} onOpenChange={() => setContainerToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Container</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this container? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContainerToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteContainer}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
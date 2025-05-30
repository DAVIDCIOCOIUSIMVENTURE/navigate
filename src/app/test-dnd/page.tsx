"use client"

import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core'
import { useState } from 'react'

export default function TestDndPage() {
  const [items, setItems] = useState([
    { id: '1', title: 'Item 1' },
    { id: '2', title: 'Item 2' },
    { id: '3', title: 'Item 3' }
  ])

  const [droppedItems, setDroppedItems] = useState<Array<{ id: string, title: string }>>([])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (over && over.id === 'drop-area') {
      const draggedItem = items.find(item => item.id === active.id)
      if (draggedItem) {
        setDroppedItems(prev => [...prev, draggedItem])
        setItems(prev => prev.filter(item => item.id !== active.id))
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Drag and Drop Test</h1>
      
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 gap-8">
          {/* Draggable Items */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Draggable Items</h2>
            <div className="space-y-2">
              {items.map(item => (
                <DraggableItem key={item.id} id={item.id} title={item.title} />
              ))}
            </div>
          </div>

          {/* Drop Area */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Drop Area</h2>
            <DroppableArea items={droppedItems} />
          </div>
        </div>
      </DndContext>
    </div>
  )
}

type DraggableItemProps = {
  id: string
  title: string
}

function DraggableItem({ id, title }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-4 bg-blue-100 rounded-lg cursor-move ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      {title}
    </div>
  )
}

type DroppableAreaProps = {
  items: Array<{ id: string, title: string }>
}

function DroppableArea({ items }: DroppableAreaProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'drop-area' })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] p-4 rounded-lg border-2 ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
      }`}
    >
      {items.length === 0 ? (
        <p className="text-gray-500 text-center">Drop items here</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              className="p-4 bg-green-100 rounded-lg"
            >
              {item.title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
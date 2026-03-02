import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { IdeasProvider, useIdeas } from './ideas-context'

// Wrapper that provides the IdeasProvider context to any hook under test.
// You'll reuse this pattern for any hook that depends on a context provider.
const wrapper = ({ children }: { children: ReactNode }) => (
  <IdeasProvider>{children}</IdeasProvider>
)

describe.skip('useIdeas hook', () => {
  it('throws when used outside IdeasProvider', () => {
    // Suppress the expected console.error from React
    expect(() => renderHook(() => useIdeas())).toThrow(
      'useIdeas must be used within IdeasProvider'
    )
  })

  it('starts with an empty ideas list', () => {
    const { result } = renderHook(() => useIdeas(), { wrapper })
    expect(result.current.ideas).toEqual([])
  })

  it('createIdea returns an idea with correct shape', () => {
    const { result } = renderHook(() => useIdeas(), { wrapper })

    let idea: ReturnType<typeof result.current.createIdea>
    act(() => {
      idea = result.current.createIdea('guided')
    })

    expect(idea!.mode).toBe('guided')
    expect(idea!.title).toBe('Idea 1')
    expect(typeof idea!.id).toBe('number')
    expect(typeof idea!.createdAt).toBe('string')
    expect(idea!.jobs).toEqual([])
    expect(idea!.problems).toEqual([])
    expect(idea!.problemDiscoveryComplete).toBe(false)
  })

  it('createIdea adds the idea to the list', () => {
    const { result } = renderHook(() => useIdeas(), { wrapper })

    act(() => {
      result.current.createIdea('quickstart')
    })

    expect(result.current.ideas).toHaveLength(1)
    expect(result.current.ideas[0].mode).toBe('quickstart')
  })

  it('createIdea auto-increments the title', () => {
    // Each createIdea call must be in its own act() so React re-renders
    // between calls and the hook sees the updated ideas.length.
    const { result } = renderHook(() => useIdeas(), { wrapper })

    act(() => { result.current.createIdea('guided') })
    act(() => { result.current.createIdea('guided') })

    expect(result.current.ideas[0].title).toBe('Idea 1')
    expect(result.current.ideas[1].title).toBe('Idea 2')
  })

  it('updateIdea patches only the target idea', () => {
    const { result } = renderHook(() => useIdeas(), { wrapper })

    let firstId: number
    act(() => { firstId = result.current.createIdea('guided').id })
    act(() => { result.current.createIdea('guided') })

    // Capture the second idea's original title before patching
    const secondIdea = result.current.ideas[1]

    act(() => {
      result.current.updateIdea(firstId!, { title: 'Renamed' })
    })

    expect(result.current.ideas).toHaveLength(2)
    const first = result.current.ideas.find((i) => i.id === firstId!)
    expect(first?.title).toBe('Renamed')
    // Second idea is a different object — title unchanged
    expect(result.current.ideas[1].title).toBe(secondIdea.title)
  })

  it('getIdea returns the correct idea by id', () => {
    const { result } = renderHook(() => useIdeas(), { wrapper })

    let id: number
    act(() => {
      const idea = result.current.createIdea('guided')
      id = idea.id
    })

    const found = result.current.getIdea(id!)
    expect(found).toBeDefined()
    expect(found!.id).toBe(id!)
  })

  it('getIdea returns undefined for unknown id', () => {
    const { result } = renderHook(() => useIdeas(), { wrapper })
    expect(result.current.getIdea(999999)).toBeUndefined()
  })
})

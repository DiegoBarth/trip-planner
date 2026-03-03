import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCustomIcon } from '../markers'
import type { MappableAttraction } from '@/types/MappableAttraction'

describe('createCustomIcon', () => {
  let LDivIconMock: any

  beforeEach(() => {
    LDivIconMock = vi.fn((options: any) => ({ options }))
    ;(window as any).L = {
      divIcon: LDivIconMock,
    }
  })

  it('returns undefined if window.L is not available', () => {
    delete (window as any).L
    const result = createCustomIcon('#ff0000', 'attraction')
    expect(result).toBeUndefined()
  })

  it('uses provided color for attraction marker', () => {
    const result = createCustomIcon('#00ff00', 'attraction')
    expect(LDivIconMock).toHaveBeenCalledWith({
      html: expect.stringContaining('fill="#00ff00"'),
      className: 'custom-marker-icon',
      iconSize: [42, 42],
      iconAnchor: [21, 42],
    })
    expect(result).toBeDefined()
  })

  it('uses accommodation color override (#111827)', () => {
    createCustomIcon('#00ff00', 'accommodation')
    expect(LDivIconMock).toHaveBeenCalledWith({
      html: expect.stringContaining('fill="#111827"'),
      className: 'custom-marker-icon',
      iconSize: [42, 42],
      iconAnchor: [21, 42],
    })
  })

  it('uses red color (#ef4444) for closed type', () => {
    createCustomIcon('#00ff00', 'closed')
    expect(LDivIconMock).toHaveBeenCalledWith({
      html: expect.stringContaining('fill="#ef4444"'),
      className: 'custom-marker-icon',
      iconSize: [42, 42],
      iconAnchor: [21, 42],
    })
  })

  it('renders circle icon for attraction type', () => {
    createCustomIcon('#ff0000', 'attraction')
    expect(LDivIconMock).toHaveBeenCalledWith({
      html: expect.stringContaining('<circle cx="12" cy="10" r="3" fill="white"></circle>'),
      className: 'custom-marker-icon',
      iconSize: [42, 42],
      iconAnchor: [21, 42],
    })
  })

  it('detects closed attraction based on closedDays and dayOfWeek', () => {
    const attraction: MappableAttraction = {
      id: 1,
      name: 'Test',
      lat: 0,
      lng: 0,
      day: 1,
      closedDays: 'Monday,Wednesday',
      dayOfWeek: 'Monday',
    } as MappableAttraction

    createCustomIcon('#00ff00', 'attraction', attraction)
    expect(LDivIconMock).toHaveBeenCalledWith({
      html: expect.stringContaining('fill="#ef4444"'),
      className: 'custom-marker-icon',
      iconSize: [42, 42],
      iconAnchor: [21, 42],
    })
  })

  it('does not mark as closed if closedDays or dayOfWeek is missing', () => {
    const attraction: MappableAttraction = {
      id: 1,
      name: 'Test',
      lat: 0,
      lng: 0,
      day: 1,
      dayOfWeek: 'Monday',
    } as MappableAttraction

    createCustomIcon('#00ff00', 'attraction', attraction)
    const call = LDivIconMock.mock.calls[0][0]
    expect(call.html).toContain('fill="#00ff00"')
  })

  it('uses provided color when attraction is not closed', () => {
    const attraction: MappableAttraction = {
      id: 1,
      name: 'Test',
      lat: 0,
      lng: 0,
      day: 1,
      closedDays: 'Monday',
      dayOfWeek: 'Tuesday',
    } as MappableAttraction

    createCustomIcon('#ffaa00', 'attraction', attraction)
    const call = LDivIconMock.mock.calls[0][0]
    expect(call.html).toContain('fill="#ffaa00"')
  })

  it('has correct icon dimensions and anchor', () => {
    createCustomIcon('#123456', 'attraction')
    expect(LDivIconMock).toHaveBeenCalledWith(expect.objectContaining({
      className: 'custom-marker-icon',
      iconSize: [42, 42],
      iconAnchor: [21, 42],
    }))
  })
})
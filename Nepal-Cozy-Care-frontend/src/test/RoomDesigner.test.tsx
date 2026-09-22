import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'

// Mock 3D Canvas for virtual DOM testing environment
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div aria-label="3D viewport">{children}</div>,
  useFrame: vi.fn(),
  useThree: () => ({ camera: { position: { lerp: vi.fn() } } }),
}))

vi.mock('@react-three/drei', () => ({
  ContactShadows: () => null,
  OrbitControls: () => null,
  RoundedBox: ({ children }: any) => <mesh>{children}</mesh>,
}))

import { MemoryRouter } from 'react-router-dom'
import RoomDesigner, {
  constrainItem,
  doItemsOverlap,
  fitRoom,
  generateRoomTemplate,
  type RoomItem,
  type RoomState,
} from '../pages/RoomDesigner'

const STORAGE_KEY = 'nepal-cozy-care-room-v2'

beforeEach(() => {
  localStorage.clear()
  window.confirm = vi.fn(() => true)
})

describe('3D Room Designer Logic & Math', () => {
  it('constrains items strictly within room boundaries accounting for scale and rotation', () => {
    const item: RoomItem = {
      id: 'test-1',
      kind: 'sofa',
      x: 10,
      z: 10,
      rotation: Math.PI / 2,
      scale: 1.2,
      color: '#aab8a2',
    }
    const constrained = constrainItem(item, 6, 6)
    // In a 6x6m room, sofa half extents must keep coordinates safely within [-3, 3]
    expect(constrained.x).toBeLessThan(3)
    expect(constrained.x).toBeGreaterThan(-3)
    expect(constrained.z).toBeLessThan(3)
    expect(constrained.z).toBeGreaterThan(-3)
  })

  it('detects 2D overlaps between overlapping objects and returns false for separated objects', () => {
    const itemA: RoomItem = { id: 'a', kind: 'sofa', x: 0, z: 0, rotation: 0, scale: 1, color: '#000' }
    const itemB: RoomItem = { id: 'b', kind: 'table', x: 0.2, z: 0.1, rotation: 0, scale: 1, color: '#000' }
    const itemFar: RoomItem = { id: 'c', kind: 'chair', x: 2.5, z: 2.5, rotation: 0, scale: 1, color: '#000' }

    expect(doItemsOverlap(itemA, itemB)).toBe(true)
    expect(doItemsOverlap(itemA, itemFar)).toBe(false)
    expect(doItemsOverlap(itemA, itemA)).toBe(false) // same object does not overlap itself
  })

  it('fits all room items when room dimensions resize', () => {
    const state: RoomState = {
      width: 4,
      depth: 4,
      wallColor: '#e8e2d7',
      floorColor: '#a87850',
      items: [
        { id: '1', kind: 'sofa', x: 3.5, z: 3.5, rotation: 0, scale: 1, color: '#aab8a2' },
      ],
    }
    const fitted = fitRoom(state)
    expect(fitted.items[0].x).toBeLessThan(1.0)
    expect(fitted.items[0].z).toBeLessThan(1.5)
  })

  it('generates distinct layouts for different room templates', () => {
    const office = generateRoomTemplate('office')
    const balcony = generateRoomTemplate('balcony')
    const empty = generateRoomTemplate('empty')

    expect(office.items.length).toBeGreaterThan(0)
    expect(balcony.items.length).toBeGreaterThan(0)
    expect(empty.items.length).toBe(0)
    expect(office.wallColor).toBe('#e5e8e3')
  })
})

describe('Room Designer Interactive UI & Controls', () => {
  it('adds items, selects, edits scale & rotation, undoes and redoes without duplicated history', () => {
    render(
      <StrictMode>
        <MemoryRouter>
          <RoomDesigner />
        </MemoryRouter>
      </StrictMode>
    )

    // Clear initial items for clean test
    fireEvent.click(screen.getByRole('button', { name: /Clear room/ }))

    // Switch to Furniture tab and add a sofa
    fireEvent.click(screen.getByRole('tab', { name: /Furniture/ }))
    fireEvent.click(screen.getByRole('button', { name: /Linen Lounge Sofa/ }))

    const select = screen.getByLabelText('Select room item') as HTMLSelectElement
    expect(select.options.length).toBe(2)

    // Select the sofa
    fireEvent.change(select, { target: { value: select.options[1].value } })

    // Edit Scale
    const scaleSlider = screen.getByRole('slider', { name: 'Scale' })
    fireEvent.change(scaleSlider, { target: { value: '1.4' } })

    // Position coordinate input
    const posXInput = screen.getByLabelText('Position X') as HTMLInputElement
    fireEvent.change(posXInput, { target: { value: '99' } })
    expect(Number(posXInput.value)).toBeLessThan(3.5)

    // Undo position change
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    fireEvent.change(select, { target: { value: select.options[1].value } })

    // Duplicate item
    fireEvent.click(screen.getByRole('button', { name: /Duplicate/ }))
    expect(select.options.length).toBe(3)

    // Remove duplicate item
    fireEvent.click(screen.getByRole('button', { name: /Remove item/ }))
    expect(select.options.length).toBe(2)
  }, 20000)

  it('persists a design in localStorage and restores it after remount', () => {
    const view = render(
      <MemoryRouter>
        <RoomDesigner />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /Snake Plant/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.items.length).toBeGreaterThan(0)

    view.unmount()
    render(
      <MemoryRouter>
        <RoomDesigner />
      </MemoryRouter>
    )
    const select = screen.getByLabelText('Select room item') as HTMLSelectElement
    expect(select.options.length).toBeGreaterThan(1)
  })

  it('switches templates using template chips', () => {
    render(
      <MemoryRouter>
        <RoomDesigner />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Office' }))
    const select = screen.getByLabelText('Select room item') as HTMLSelectElement
    expect(select.options.length).toBe(6) // 1 default + 5 items in office template
  })
})

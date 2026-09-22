import type { RoomKey, LightKey, ExperienceKey, LocationKey } from '../plant-finder/types'

export interface RoomDesignTransferState {
  templateKey: RoomKey | 'living-room'
  roomName: string
  width: number
  depth: number
  wallColor: string
  floorColor: string
  lightCondition: LightKey
  experienceLevel: ExperienceKey
  humidityLevel: LocationKey
  recommendedPlantIds: number[]
  recommendedPlantNames: string[]
  timestamp: number
}

export const TRANSFER_STORAGE_KEY = 'nepal-cozy-care-transfer-room'

export const defaultTemplateDimensions: Record<string, { width: number; depth: number; wallColor: string; floorColor: string }> = {
  'living-room': { width: 7, depth: 6, wallColor: '#e8e2d7', floorColor: '#a87850' },
  'bedroom': { width: 6, depth: 5, wallColor: '#ded8cf', floorColor: '#8a6548' },
  'office': { width: 5.5, depth: 4.5, wallColor: '#e5e8e3', floorColor: '#7a5a40' },
  'balcony': { width: 5, depth: 3.5, wallColor: '#ebe5db', floorColor: '#967352' },
  'kitchen': { width: 6, depth: 5, wallColor: '#f2eee6', floorColor: '#8f6f52' },
  'bathroom': { width: 5.5, depth: 4.5, wallColor: '#d6e2db', floorColor: '#e2ece8' },
}

/**
 * Creates a validated RoomDesignTransferState from Plant Finder selections and recommendation results.
 */
export function buildRoomTransferState(
  roomKey: RoomKey,
  lightKey: LightKey,
  experienceKey: ExperienceKey,
  locationKey: LocationKey,
  recommendedPlantIds: number[] = [],
  recommendedPlantNames: string[] = []
): RoomDesignTransferState {
  const key = roomKey && defaultTemplateDimensions[roomKey] ? roomKey : 'living-room'
  const defaults = defaultTemplateDimensions[key]

  const roomName = key.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    templateKey: key,
    roomName,
    width: defaults.width,
    depth: defaults.depth,
    wallColor: defaults.wallColor,
    floorColor: defaults.floorColor,
    lightCondition: lightKey,
    experienceLevel: experienceKey,
    humidityLevel: locationKey,
    recommendedPlantIds,
    recommendedPlantNames,
    timestamp: Date.now(),
  }
}

/**
 * Stores the transfer state in localStorage safely.
 */
export function saveRoomTransferState(state: RoomDesignTransferState): void {
  try {
    localStorage.setItem(TRANSFER_STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('Could not save room transfer state:', err)
  }
}

/**
 * Retrieves and validates transfer state from localStorage.
 */
export function loadRoomTransferState(): RoomDesignTransferState | null {
  try {
    const raw = localStorage.getItem(TRANSFER_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !parsed.templateKey ||
      !Number.isFinite(parsed.width) ||
      !Number.isFinite(parsed.depth)
    ) {
      return null
    }
    return parsed as RoomDesignTransferState
  } catch {
    return null
  }
}

/**
 * Clears the transfer state from localStorage.
 */
export function clearRoomTransferState(): void {
  try {
    localStorage.removeItem(TRANSFER_STORAGE_KEY)
  } catch {}
}

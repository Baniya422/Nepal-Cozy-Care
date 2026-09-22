import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, Grid, OrbitControls, RoundedBox } from '@react-three/drei'
import { Download, Move3D, Redo2, RotateCw, Save, Trash2, Undo2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import '../styles/roomDesigner.css'

type ItemKind = 'sofa' | 'table' | 'chair' | 'shelf' | 'monstera' | 'snake' | 'palm'
type RoomItem = { id: string; kind: ItemKind; x: number; z: number; rotation: number; color: string }
type RoomState = { width: number; depth: number; wallColor: string; floorColor: string; items: RoomItem[] }

const STORAGE_KEY = 'nepal-cozy-care-room-v1'
const initialState: RoomState = { width: 7, depth: 6, wallColor: '#e7efe7', floorColor: '#b98b62', items: [] }
const catalog: Array<{ kind: ItemKind; name: string; icon: string; color: string }> = [
  { kind: 'monstera', name: 'Monstera', icon: '🌿', color: '#276749' },
  { kind: 'snake', name: 'Snake Plant', icon: '🪴', color: '#477c3c' },
  { kind: 'palm', name: 'Areca Palm', icon: '🌴', color: '#3f7d4b' },
  { kind: 'sofa', name: 'Cozy Sofa', icon: '🛋️', color: '#aab8a2' },
  { kind: 'table', name: 'Coffee Table', icon: '▰', color: '#8b5e3c' },
  { kind: 'chair', name: 'Accent Chair', icon: '🪑', color: '#d7a86e' },
  { kind: 'shelf', name: 'Plant Shelf', icon: '▥', color: '#74533b' },
]

function Plant({ kind }: { kind: ItemKind }) {
  const leaves = kind === 'palm' ? 9 : kind === 'snake' ? 7 : 6
  const height = kind === 'palm' ? 1.7 : kind === 'snake' ? 1.05 : 1.25
  return <group>
    <mesh position={[0, .24, 0]} castShadow><cylinderGeometry args={[.3, .22, .48, 24]} /><meshStandardMaterial color="#b9784b" /></mesh>
    <mesh position={[0, .55, 0]} castShadow><cylinderGeometry args={[.045, .06, height, 10]} /><meshStandardMaterial color="#3d6b3f" /></mesh>
    {Array.from({ length: leaves }).map((_, index) => {
      const angle = (index / leaves) * Math.PI * 2
      const y = .75 + (index % 3) * .25
      const radius = kind === 'snake' ? .18 : .42
      return <mesh key={index} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]} rotation={[0, -angle, kind === 'snake' ? .05 : .55]} castShadow>
        <sphereGeometry args={[kind === 'snake' ? .1 : .22, 12, 8]} />
        <meshStandardMaterial color={index % 2 ? '#3f8150' : '#69a85d'} roughness={.7} />
      </mesh>
    })}
  </group>
}

function Furniture({ kind, color }: { kind: ItemKind; color: string }) {
  if (kind === 'sofa') return <group>
    <RoundedBox args={[2.2, .55, .85]} radius={.12} position={[0, .42, 0]} castShadow><meshStandardMaterial color={color} /></RoundedBox>
    <RoundedBox args={[2.2, .75, .22]} radius={.08} position={[0, .82, .32]} castShadow><meshStandardMaterial color={color} /></RoundedBox>
    {[-.95, .95].map(x => <RoundedBox key={x} args={[.22, .62, .92]} radius={.07} position={[x, .52, 0]} castShadow><meshStandardMaterial color={color} /></RoundedBox>)}
  </group>
  if (kind === 'table') return <group>
    <RoundedBox args={[1.5, .12, .8]} radius={.06} position={[0, .62, 0]} castShadow><meshStandardMaterial color={color} /></RoundedBox>
    {[-.58, .58].flatMap(x => [-.28, .28].map(z => <mesh key={`${x}${z}`} position={[x, .3, z]} castShadow><cylinderGeometry args={[.04, .04, .6, 10]} /><meshStandardMaterial color="#463529" /></mesh>))}
  </group>
  if (kind === 'shelf') return <group>
    {[-.65, .65].map(x => <mesh key={x} position={[x, 1, 0]} castShadow><boxGeometry args={[.1, 2, .42]} /><meshStandardMaterial color={color} /></mesh>)}
    {[.15, .75, 1.35, 1.95].map(y => <mesh key={y} position={[0, y, 0]} castShadow><boxGeometry args={[1.4, .1, .45]} /><meshStandardMaterial color={color} /></mesh>)}
  </group>
  return <group>
    <RoundedBox args={[.8, .2, .8]} radius={.08} position={[0, .62, 0]} castShadow><meshStandardMaterial color={color} /></RoundedBox>
    <RoundedBox args={[.8, .85, .16]} radius={.06} position={[0, 1.02, .32]} castShadow><meshStandardMaterial color={color} /></RoundedBox>
    {[-.3, .3].flatMap(x => [-.28, .28].map(z => <mesh key={`${x}${z}`} position={[x, .3, z]} castShadow><cylinderGeometry args={[.035, .045, .6, 8]} /><meshStandardMaterial color="#5d4635" /></mesh>))}
  </group>
}

function SceneItem({ item, selected, room, onSelect, onMove }: { item: RoomItem; selected: boolean; room: RoomState; onSelect: () => void; onMove: (x: number, z: number) => void }) {
  const dragging = useRef(false)
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const point = useMemo(() => new THREE.Vector3(), [])
  const move = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging.current || !event.ray.intersectPlane(plane, point)) return
    event.stopPropagation()
    onMove(THREE.MathUtils.clamp(point.x, -room.width / 2 + .4, room.width / 2 - .4), THREE.MathUtils.clamp(point.z, -room.depth / 2 + .4, room.depth / 2 - .4))
  }
  return <group position={[item.x, 0, item.z]} rotation={[0, item.rotation, 0]}
    onPointerDown={(event) => { event.stopPropagation(); dragging.current = true; onSelect(); (event.target as Element).setPointerCapture?.(event.pointerId) }}
    onPointerMove={move} onPointerUp={(event) => { dragging.current = false; (event.target as Element).releasePointerCapture?.(event.pointerId) }}>
    {(item.kind === 'monstera' || item.kind === 'snake' || item.kind === 'palm') ? <Plant kind={item.kind} /> : <Furniture kind={item.kind} color={item.color} />}
    {selected && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .015, 0]}><ringGeometry args={[.75, .82, 48]} /><meshBasicMaterial color="#f5b840" transparent opacity={.9} /></mesh>}
  </group>
}

function RoomScene({ room, selectedId, setSelectedId, moveItem }: { room: RoomState; selectedId: string | null; setSelectedId: (id: string | null) => void; moveItem: (id: string, x: number, z: number) => void }) {
  return <>
    <color attach="background" args={['#f2f6f0']} />
    <ambientLight intensity={1.6} />
    <directionalLight position={[5, 8, 4]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onPointerDown={() => setSelectedId(null)}>
      <planeGeometry args={[room.width, room.depth]} /><meshStandardMaterial color={room.floorColor} roughness={.85} />
    </mesh>
    <mesh position={[0, 1.5, -room.depth / 2]} receiveShadow><boxGeometry args={[room.width, 3, .12]} /><meshStandardMaterial color={room.wallColor} /></mesh>
    <mesh position={[-room.width / 2, 1.5, 0]} receiveShadow><boxGeometry args={[.12, 3, room.depth]} /><meshStandardMaterial color={room.wallColor} /></mesh>
    <Grid args={[room.width, room.depth]} position={[0, .012, 0]} cellColor="#ffffff" sectionColor="#ffffff" cellSize={.5} fadeDistance={18} infiniteGrid={false} />
    {room.items.map(item => <SceneItem key={item.id} item={item} room={room} selected={selectedId === item.id} onSelect={() => setSelectedId(item.id)} onMove={(x, z) => moveItem(item.id, x, z)} />)}
    <ContactShadows position={[0, .02, 0]} opacity={.28} scale={14} blur={2.5} far={5} />
    <OrbitControls makeDefault minPolarAngle={.45} maxPolarAngle={1.45} minDistance={5} maxDistance={14} target={[0, .7, 0]} />
  </>
}

export default function RoomDesigner() {
  const [room, setRoom] = useState<RoomState>(initialState)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [history, setHistory] = useState<RoomState[]>([])
  const [future, setFuture] = useState<RoomState[]>([])
  const [saved, setSaved] = useState(false)
  const canvasWrap = useRef<HTMLDivElement>(null)
  const cursor = useRef<HTMLDivElement>(null)

  useEffect(() => { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { try { setRoom(JSON.parse(raw)) } catch { /* use starter room */ } } }, [])
  useEffect(() => {
    const track = (event: PointerEvent) => cursor.current?.style.setProperty('transform', `translate3d(${event.clientX}px, ${event.clientY}px, 0)`)
    window.addEventListener('pointermove', track); return () => window.removeEventListener('pointermove', track)
  }, [])

  const commit = useCallback((change: (current: RoomState) => RoomState) => {
    setRoom(current => { setHistory(stack => [...stack.slice(-29), current]); setFuture([]); return change(current) })
  }, [])
  const add = (kind: ItemKind, color: string) => commit(current => ({ ...current, items: [...current.items, { id: crypto.randomUUID(), kind, x: 0, z: 0, rotation: 0, color }] }))
  const moveItem = (id: string, x: number, z: number) => setRoom(current => ({ ...current, items: current.items.map(item => item.id === id ? { ...item, x, z } : item) }))
  const updateSelected = (change: (item: RoomItem) => RoomItem) => commit(current => ({ ...current, items: current.items.map(item => item.id === selectedId ? change(item) : item) }))
  const undo = () => setHistory(stack => { const previous = stack.at(-1); if (!previous) return stack; setFuture(next => [room, ...next]); setRoom(previous); return stack.slice(0, -1) })
  const redo = () => setFuture(stack => { const next = stack[0]; if (!next) return stack; setHistory(previous => [...previous, room]); setRoom(next); return stack.slice(1) })
  const save = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(room)); setSaved(true); window.setTimeout(() => setSaved(false), 1800) }
  const screenshot = () => { const canvas = canvasWrap.current?.querySelector('canvas'); if (!canvas) return; const link = document.createElement('a'); link.download = 'my-green-room.png'; link.href = canvas.toDataURL('image/png'); link.click() }

  return <div className="room-designer-page">
    <div ref={cursor} className="room-cursor" aria-hidden="true"><span>✦</span></div>
    <section className="designer-intro">
      <p className="designer-eyebrow">NEPAL COZY CARE STUDIO</p><h1>Design your green space</h1>
      <p>Shape your room, try furniture and find the perfect place for every plant.</p>
      <div className="designer-hint"><Move3D size={16} /> Drag objects to move • drag the empty room to rotate the view</div>
    </section>
    <section className="designer-shell">
      <aside className="designer-panel catalog-panel">
        <div><span className="panel-step">01</span><h2>Add to your room</h2><p>Tap an item, then drag it into place.</p></div>
        <div className="catalog-grid">{catalog.map(item => <button type="button" key={item.kind} onClick={() => add(item.kind, item.color)}><span>{item.icon}</span><strong>{item.name}</strong><small>+ Add</small></button>)}</div>
      </aside>
      <div className="designer-stage" ref={canvasWrap}>
        <div className="stage-toolbar">
          <button type="button" onClick={undo} disabled={!history.length} title="Undo"><Undo2 size={18} /></button>
          <button type="button" onClick={redo} disabled={!future.length} title="Redo"><Redo2 size={18} /></button>
          <span />
          <button type="button" onClick={save}><Save size={17} /> {saved ? 'Saved!' : 'Save'}</button>
          <button type="button" onClick={screenshot}><Download size={17} /> Image</button>
        </div>
        <Canvas shadows dpr={[1, 1.6]} gl={{ preserveDrawingBuffer: true, antialias: true }} camera={{ position: [7, 6.5, 8], fov: 43 }}>
          <RoomScene room={room} selectedId={selectedId} setSelectedId={setSelectedId} moveItem={moveItem} />
        </Canvas>
        {!room.items.length && <div className="empty-room-note">Choose an item to begin your room</div>}
      </div>
      <aside className="designer-panel room-panel">
        <div><span className="panel-step">02</span><h2>Make it yours</h2><p>Adjust your space and selected item.</p></div>
        <label>Room width <strong>{room.width}m</strong><input type="range" min="4" max="10" step=".5" value={room.width} onChange={e => commit(current => ({ ...current, width: Number(e.target.value) }))} /></label>
        <label>Room depth <strong>{room.depth}m</strong><input type="range" min="4" max="10" step=".5" value={room.depth} onChange={e => commit(current => ({ ...current, depth: Number(e.target.value) }))} /></label>
        <div className="color-control"><label>Wall colour</label><input type="color" value={room.wallColor} onChange={e => commit(current => ({ ...current, wallColor: e.target.value }))} /><span>{room.wallColor}</span></div>
        <div className="color-control"><label>Floor colour</label><input type="color" value={room.floorColor} onChange={e => commit(current => ({ ...current, floorColor: e.target.value }))} /><span>{room.floorColor}</span></div>
        <div className={`selected-tools ${selectedId ? '' : 'is-empty'}`}>
          <h3>{selectedId ? 'Selected item' : 'Select an item in the room'}</h3>
          <button type="button" disabled={!selectedId} onClick={() => updateSelected(item => ({ ...item, rotation: item.rotation + Math.PI / 4 }))}><RotateCw size={17} /> Rotate 45°</button>
          <button type="button" className="danger" disabled={!selectedId} onClick={() => { commit(current => ({ ...current, items: current.items.filter(item => item.id !== selectedId) })); setSelectedId(null) }}><Trash2 size={17} /> Remove</button>
        </div>
        <button type="button" className="reset-room" onClick={() => { if (window.confirm('Clear your room design?')) { commit(() => initialState); setSelectedId(null) } }}>Reset room</button>
      </aside>
    </section>
  </div>
}

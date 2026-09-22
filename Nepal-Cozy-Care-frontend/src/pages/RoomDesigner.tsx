import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, OrbitControls, RoundedBox, SoftShadows } from '@react-three/drei'
import { Download, Move3D, Redo2, RotateCw, Save, Trash2, Undo2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import Botanical from '../components/room/Botanical'
import { surface } from '../components/room/materials'
import '../styles/roomDesigner.css'
import '../styles/roomDesignerRealistic.css'

type ItemKind = 'sofa' | 'table' | 'chair' | 'shelf' | 'monstera' | 'snake' | 'palm'
type RoomItem = { id: string; kind: ItemKind; x: number; z: number; rotation: number; color: string }
type RoomState = { width: number; depth: number; wallColor: string; floorColor: string; items: RoomItem[] }

const STORAGE_KEY = 'nepal-cozy-care-room-v1'
const initialState: RoomState = { width: 7, depth: 6, wallColor: '#e8e2d7', floorColor: '#b98b62', items: [] }
const catalog: Array<{ kind: ItemKind; name: string; icon: string; color: string }> = [
  { kind: 'monstera', name: 'Monstera', icon: '🌿', color: '#276749' },
  { kind: 'snake', name: 'Snake Plant', icon: '🪴', color: '#477c3c' },
  { kind: 'palm', name: 'Areca Palm', icon: '🌴', color: '#3f7d4b' },
  { kind: 'sofa', name: 'Cozy Sofa', icon: '🛋️', color: '#aab8a2' },
  { kind: 'table', name: 'Coffee Table', icon: '▰', color: '#8b5e3c' },
  { kind: 'chair', name: 'Accent Chair', icon: '🪑', color: '#d7a86e' },
  { kind: 'shelf', name: 'Plant Shelf', icon: '▥', color: '#74533b' },
]

function constrain(item:RoomItem, width:number, depth:number):RoomItem {
 const sizes:Record<ItemKind,[number,number]>={sofa:[2.45,1.05],table:[1.5,.8],chair:[.85,.85],shelf:[1.4,.5],monstera:[1.4,1.4],snake:[.65,.65],palm:[1.6,1.6]}
 const [w,d]=sizes[item.kind], c=Math.abs(Math.cos(item.rotation)), n=Math.abs(Math.sin(item.rotation))
 const ex=(w*c+d*n)/2+.08, ez=(w*n+d*c)/2+.08
 return {...item,x:THREE.MathUtils.clamp(item.x,-width/2+ex,width/2-ex),z:THREE.MathUtils.clamp(item.z,-depth/2+ez,depth/2-ez)}
}
function fit(room:RoomState):RoomState { return {...room,items:room.items.map(i=>constrain(i,room.width,room.depth))} }

function Furniture({ kind, color }: { kind: ItemKind; color: string }) {
  const map=useMemo(()=>surface(kind==='sofa'||kind==='chair'?'fabric':'wood'),[kind])
  useEffect(()=>()=>map.dispose(),[map])
  if (kind === 'sofa') return <group>
    <RoundedBox args={[2.25, .43, .9]} radius={.13} position={[0, .38, 0]} castShadow><meshStandardMaterial color="#5c5048" roughness={.9} /></RoundedBox>
    {[-.55,.55].map(x => <RoundedBox key={`seat${x}`} args={[1.02, .22, .72]} radius={.1} position={[x, .65, -.05]} castShadow><meshStandardMaterial map={map} bumpMap={map} bumpScale={.008} color={color} roughness={.96} /></RoundedBox>)}
    {[-.55,.55].map(x => <RoundedBox key={`back${x}`} args={[1.02, .72, .2]} radius={.1} position={[x, 1.02, .34]} rotation={[-.12,0,0]} castShadow><meshStandardMaterial map={map} bumpMap={map} bumpScale={.008} color={color} roughness={.96} /></RoundedBox>)}
    {[-1.05, 1.05].map(x => <RoundedBox key={x} args={[.2, .63, .94]} radius={.08} position={[x, .56, 0]} castShadow><meshStandardMaterial map={map} bumpMap={map} bumpScale={.008} color={color} roughness={.94} /></RoundedBox>)}
    {[-.82,.82].map(x => <mesh key={`leg${x}`} position={[x,.13,.27]} castShadow><cylinderGeometry args={[.035,.045,.26,16]} /><meshStandardMaterial color="#302c29" metalness={.65} roughness={.3}/></mesh>)}
  </group>
  if (kind === 'table') return <group>
    <RoundedBox args={[1.5, .12, .8]} radius={.06} position={[0, .62, 0]} castShadow><meshPhysicalMaterial map={map} bumpMap={map} bumpScale={.008} color={color} roughness={.32} clearcoat={.28} /></RoundedBox>
    {[-.58, .58].flatMap(x => [-.28, .28].map(z => <mesh key={`${x}${z}`} position={[x, .3, z]} castShadow><cylinderGeometry args={[.04, .04, .6, 10]} /><meshStandardMaterial color="#463529" /></mesh>))}
  </group>
  if (kind === 'shelf') return <group>
    {[-.65, .65].map(x => <mesh key={x} position={[x, 1, 0]} castShadow><boxGeometry args={[.1, 2, .42]} /><meshStandardMaterial map={map} bumpMap={map} bumpScale={.008} color={color} /></mesh>)}
    {[.15, .75, 1.35, 1.95].map(y => <mesh key={y} position={[0, y, 0]} castShadow><boxGeometry args={[1.4, .1, .45]} /><meshStandardMaterial map={map} bumpMap={map} bumpScale={.008} color={color} /></mesh>)}
  </group>
  return <group>
    <RoundedBox args={[.8, .2, .8]} radius={.08} position={[0, .62, 0]} castShadow><meshStandardMaterial map={map} bumpMap={map} bumpScale={.008} color={color} /></RoundedBox>
    <RoundedBox args={[.8, .85, .16]} radius={.06} position={[0, 1.02, .32]} castShadow><meshStandardMaterial map={map} bumpMap={map} bumpScale={.008} color={color} /></RoundedBox>
    {[-.3, .3].flatMap(x => [-.28, .28].map(z => <mesh key={`${x}${z}`} position={[x, .3, z]} castShadow><cylinderGeometry args={[.035, .045, .6, 8]} /><meshStandardMaterial color="#5d4635" /></mesh>))}
  </group>
}

function FloorBoards({ room }: { room: RoomState }) {
  const boards = Math.ceil(room.width / .3)
  const map=useMemo(()=>surface('wood'),[])
  useEffect(()=>()=>map.dispose(),[map])
  return <group position={[0,.012,0]}>
    {Array.from({length:boards}).map((_,index) => {
      const bw=room.width/boards
      const x = -room.width / 2 + bw/2 + index*bw
      return <mesh key={index} position={[x,0,0]} rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[room.width/boards-.008,room.depth]} />
        <meshStandardMaterial map={map} bumpMap={map} bumpScale={.006} color={room.floorColor} roughness={.72 + (index % 3) * .05} metalness={.01} />
      </mesh>
    })}
  </group>
}

function RoomArchitecture({ room }: { room: RoomState }) {
  return <group>
    <FloorBoards room={room} />
    <mesh position={[room.width * .18,1.65,-room.depth/2 + .075]}><planeGeometry args={[room.width*.45,1.65]} /><meshPhysicalMaterial color="#9fc4d2" roughness={.08} transmission={.16} transparent opacity={.78} /></mesh>
    {[-1,0,1].map(v => <mesh key={`wf${v}`} position={[room.width*.18 + v*room.width*.225,1.65,-room.depth/2 + .09]} castShadow><boxGeometry args={[.055,1.76,.08]} /><meshStandardMaterial color="#f5f0e7" roughness={.55}/></mesh>)}
    {[-.82,.82].map(v => <mesh key={`wh${v}`} position={[room.width*.18,1.65+v,-room.depth/2 + .09]} castShadow><boxGeometry args={[room.width*.45+.06,.055,.08]} /><meshStandardMaterial color="#f5f0e7" roughness={.55}/></mesh>)}
    <group position={[-room.width*.22,1.55,-room.depth/2+.11]}>
      <RoundedBox args={[1.25,.88,.07]} radius={.025} castShadow><meshStandardMaterial color="#d6c2a0" roughness={.8}/></RoundedBox>
      <mesh position={[0,0,.045]}><planeGeometry args={[1.08,.71]} /><meshStandardMaterial color="#6f8c70" roughness={.95}/></mesh>
      <mesh position={[-.2,.06,.051]}><circleGeometry args={[.22,32]} /><meshStandardMaterial color="#e6d8b5" /></mesh>
    </group>
    <mesh position={[0,2.65,0]} castShadow><cylinderGeometry args={[.025,.025,1.05,12]} /><meshStandardMaterial color="#2d332f" metalness={.8}/></mesh>
    <mesh position={[0,2.12,0]} rotation={[Math.PI,0,0]} castShadow><coneGeometry args={[.42,.35,32,1,true]} /><meshStandardMaterial color="#d8c39d" roughness={.55} side={THREE.DoubleSide}/></mesh>
    <pointLight position={[0,2.02,0]} intensity={1.8} distance={5} color="#ffdba5" castShadow />
    <mesh position={[0,.025,.55]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[3.1,2.1]} /><meshStandardMaterial color="#d8c8ad" roughness={1}/></mesh>
  </group>
}

function SceneItem({ item, selected, room, onSelect, onMove, onDrag }: { item: RoomItem; selected: boolean; room: RoomState; onSelect: () => void; onMove: (x: number, z: number) => void; onDrag: (active: boolean) => void }) {
  const dragging = useRef(false)
  const offset = useRef(new THREE.Vector3())
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const point = useMemo(() => new THREE.Vector3(), [])
  const move = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging.current || !event.ray.intersectPlane(plane, point)) return
    event.stopPropagation()
    onMove(THREE.MathUtils.clamp(point.x+offset.current.x, -room.width / 2 + .4, room.width / 2 - .4), THREE.MathUtils.clamp(point.z+offset.current.z, -room.depth / 2 + .4, room.depth / 2 - .4))
  }
  return <group position={[item.x, 0, item.z]} rotation={[0, item.rotation, 0]}
    onPointerDown={(event) => { event.stopPropagation(); if(event.ray.intersectPlane(plane,point))offset.current.set(item.x-point.x,0,item.z-point.z); dragging.current = true; onDrag(true); onSelect(); (event.target as Element).setPointerCapture?.(event.pointerId) }}
    onPointerCancel={() => { dragging.current=false; onDrag(false) }} onPointerMove={move} onPointerUp={(event) => { dragging.current = false; onDrag(false); (event.target as Element).releasePointerCapture?.(event.pointerId) }}>
    {(item.kind === 'monstera' || item.kind === 'snake' || item.kind === 'palm') ? <Botanical kind={item.kind} /> : <Furniture kind={item.kind} color={item.color} />}
    {selected && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .015, 0]}><ringGeometry args={[.75, .82, 48]} /><meshBasicMaterial color="#f5b840" transparent opacity={.9} /></mesh>}
  </group>
}

function RoomScene({ room, selectedId, setSelectedId, moveItem, onDrag, dragging, interior }: { room: RoomState; selectedId: string | null; setSelectedId: (id: string | null) => void; moveItem: (id: string, x: number, z: number) => void; onDrag: (active: boolean) => void; dragging: boolean; interior:boolean }) {
  return <>
    <color attach="background" args={['#dfe8e4']} />
    <fog attach="fog" args={['#dfe8e4',10,24]} />
    <SoftShadows size={18} samples={18} focus={.45} />
    <ambientLight intensity={.38} />
    <hemisphereLight args={['#dff1ff','#73614f',.7]} />
    <directionalLight position={[5, 8, 4]} intensity={1.8} color="#fff3dc" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-.0002} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onPointerDown={() => setSelectedId(null)}>
      <planeGeometry args={[room.width, room.depth]} /><meshStandardMaterial color="#57493e" roughness={.9} />
    </mesh>
    {[[-room.width*.2725,1.5,room.width*.455,3],[room.width*.4525,1.5,room.width*.095,3],[room.width*.18,.405,room.width*.45,.81],[room.width*.18,2.7375,room.width*.45,.525]].map(([x,y,w,h],i)=><mesh key={i} position={[x,y,-room.depth/2]} receiveShadow castShadow><boxGeometry args={[w,h,.12]}/><meshStandardMaterial color={room.wallColor} roughness={.95}/></mesh>)}
    <mesh position={[room.width*.18,1.65,-room.depth/2-.3]}><planeGeometry args={[room.width*.45,1.65]}/><meshBasicMaterial color="#c6d7d5"/></mesh>
    <mesh position={[-room.width / 2, 1.5, 0]} receiveShadow><boxGeometry args={[.12, 3, room.depth]} /><meshStandardMaterial color={room.wallColor} roughness={.92} /></mesh>
    <RoomArchitecture room={room} />
    {room.items.map(item => <SceneItem key={item.id} item={item} room={room} onDrag={onDrag} selected={selectedId === item.id} onSelect={() => setSelectedId(item.id)} onMove={(x, z) => moveItem(item.id, x, z)} />)}
    <ContactShadows position={[0, .025, 0]} opacity={.42} scale={14} blur={2.2} far={5} color="#253328" />
    <OrbitControls enabled={!dragging} makeDefault enableDamping dampingFactor={.055} minPolarAngle={.45} maxPolarAngle={1.43} minDistance={interior ? 1 : 4.8} maxDistance={13} target={interior ? [0,1,-1] : [0,.85,0]} />
  </>
}

export default function RoomDesigner() {
  const [room, setRoom] = useState<RoomState>(initialState)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [history, setHistory] = useState<RoomState[]>([])
  const [future, setFuture] = useState<RoomState[]>([])
  const [dragging,setDragging]=useState(false)
  const [interior,setInterior]=useState(false)
  const [notice,setNotice]=useState('')
  const [saved, setSaved] = useState(false)
  const canvasWrap = useRef<HTMLDivElement>(null)
  const cursor = useRef<HTMLDivElement>(null)
  const selected=room.items.find(i=>i.id===selectedId)

  useEffect(() => {
    try { const raw=localStorage.getItem(STORAGE_KEY); if(!raw)return; const v=JSON.parse(raw)
      if(!v || !Number.isFinite(v.width)||v.width<4||v.width>10||!Number.isFinite(v.depth)||v.depth<4||v.depth>10||!/^#[0-9a-f]{6}$/i.test(v.wallColor)||!/^#[0-9a-f]{6}$/i.test(v.floorColor)||!Array.isArray(v.items)||v.items.length>60) throw Error()
      if(v.items.some((i:RoomItem)=>!i||typeof i.id!=='string'||!catalog.some(c=>c.kind===i.kind)||![i.x,i.z,i.rotation].every(Number.isFinite)||!/^#[0-9a-f]{6}$/i.test(i.color)))throw Error()
      setRoom(fit(v))
    } catch { setNotice('Saved design could not be loaded. You can start a new room.') }
  }, [])
  useEffect(() => {
    const track = (event: PointerEvent) => cursor.current?.style.setProperty('transform', `translate3d(${event.clientX}px, ${event.clientY}px, 0)`)
    window.addEventListener('pointermove', track); return () => window.removeEventListener('pointermove', track)
  }, [])

  const commit = useCallback((change: (current: RoomState) => RoomState) => {
    setHistory(stack=>[...stack.slice(-29),room]); setFuture([]); setRoom(fit(change(room)))
  }, [room])
  const onDrag=(active:boolean)=>{ if(active){setHistory(stack=>[...stack.slice(-29),room]);setFuture([])} setDragging(active) }
  const add = (kind: ItemKind, color: string) => room.items.length>=60 ? setNotice('This room supports up to 60 items.') : commit(current => ({ ...current, items: [...current.items, { id: crypto.randomUUID(), kind, x: 0, z: 0, rotation: 0, color }] }))
  const moveItem = (id: string, x: number, z: number) => setRoom(current => ({ ...current, items: current.items.map(item => item.id === id ? constrain({ ...item, x, z }, current.width,current.depth) : item) }))
  const updateSelected = (change: (item: RoomItem) => RoomItem) => commit(current => ({ ...current, items: current.items.map(item => item.id === selectedId ? change(item) : item) }))
  const undo = () => { const previous=history.at(-1);if(previous){setHistory(history.slice(0,-1));setFuture([room,...future]);setRoom(previous);setSelectedId(null)} }
  const redo = () => { const next=future[0];if(next){setFuture(future.slice(1));setHistory([...history,room]);setRoom(next);setSelectedId(null)} }
  const save = () => { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(room));setSaved(true);setNotice('Design saved on this device.');window.setTimeout(()=>setSaved(false),1800) } catch {setNotice('Storage is unavailable. Keep this tab open to retain your design.')} }
  const screenshot = () => { try { const canvas = canvasWrap.current?.querySelector('canvas'); if (!canvas) return; const link = document.createElement('a'); link.download = 'my-green-room.png'; link.href = canvas.toDataURL('image/png'); link.click(); setNotice('Room image exported.') } catch { setNotice('Image export failed. Please try again.') } }

  return <div className="room-designer-page">
    <div ref={cursor} className="room-cursor" aria-hidden="true"><span>✦</span></div>
    <section className="designer-intro">
      <p className="designer-eyebrow">NEPAL COZY CARE STUDIO</p><h1>Design your green space</h1>
      <p>Shape your room, try furniture and find the perfect place for every plant.</p>
      <div className="designer-hint"><Move3D size={16} /> Drag objects to move • drag the empty room to rotate the view</div>
    </section>
    <p className="studio-notice" role="status">{notice}</p>
    <section className="designer-shell">
      <aside className="designer-panel catalog-panel">
        <div><span className="panel-step">01</span><h2>Add to your room</h2><p>Tap an item, then drag it into place.</p></div>
        <button className="reset-room" type="button" onClick={()=>{if(room.items.length && !window.confirm('Replace the room with a furnished layout?'))return;commit(current=>({...current,items:[{id:crypto.randomUUID(),kind:'sofa',x:-.7,z:-1.3,rotation:Math.PI,color:'#d1c4ae'},{id:crypto.randomUUID(),kind:'table',x:-.5,z:.2,rotation:0,color:'#8a6847'},{id:crypto.randomUUID(),kind:'chair',x:1.5,z:.4,rotation:-Math.PI/2,color:'#a3947b'},{id:crypto.randomUUID(),kind:'monstera',x:-2.3,z:-1.8,rotation:0,color:'#496b38'},{id:crypto.randomUUID(),kind:'palm',x:2.5,z:-1.8,rotation:0,color:'#496b38'}]}));setSelectedId(null)}}>Try furnished layout</button>
        <div className="catalog-grid">{catalog.map(item => <button type="button" key={item.kind} onClick={() => add(item.kind, item.color)}><span>{item.icon}</span><strong>{item.name}</strong><small>+ Add</small></button>)}</div>
      </aside>
      <div className="designer-stage" ref={canvasWrap}>
        <div className="stage-toolbar">
          <button type="button" onClick={undo} disabled={!history.length} title="Undo" aria-label="Undo"><Undo2 size={18} /></button>
          <button type="button" onClick={redo} disabled={!future.length} title="Redo" aria-label="Redo"><Redo2 size={18} /></button>
          <span />
          <button type="button" aria-pressed={interior} onClick={()=>setInterior(!interior)}>{interior ? "Room overview" : "Interior view"}</button>
          <button type="button" onClick={save}><Save size={17} /> {saved ? 'Saved!' : 'Save'}</button>
          <button type="button" onClick={screenshot}><Download size={17} /> Image</button>
        </div>
        <Canvas key={interior ? "interior" : "overview"} fallback={<p>3D requires WebGL. Try a browser with hardware acceleration enabled.</p>} shadows="soft" dpr={[1, 1.8]} gl={{ preserveDrawingBuffer: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} onCreated={({gl}) => { gl.toneMappingExposure = 1.08 }} camera={{ position: interior ? [room.width*.35,1.65,room.depth*.43] : [7,5.2,8], fov: interior ? 62 : 39 }}>
          <RoomScene room={room} selectedId={selectedId} setSelectedId={setSelectedId} moveItem={moveItem} onDrag={onDrag} dragging={dragging} interior={interior} />
        </Canvas>
        {!room.items.length && <div className="empty-room-note">Choose an item to begin your room</div>}
      </div>
      <aside className="designer-panel room-panel">
        <div><span className="panel-step">02</span><h2>Make it yours</h2><p>Adjust your space and selected item.</p></div>
        <label>Room width <strong>{room.width}m</strong><input type="range" min="4" max="10" step=".5" value={room.width} onChange={e => commit(current => ({ ...current, width: Number(e.target.value) }))} /></label>
        <label>Room depth <strong>{room.depth}m</strong><input type="range" min="4" max="10" step=".5" value={room.depth} onChange={e => commit(current => ({ ...current, depth: Number(e.target.value) }))} /></label>
        <div className="color-control"><label>Wall colour</label><input aria-label="Wall colour" type="color" value={room.wallColor} onChange={e => commit(current => ({ ...current, wallColor: e.target.value }))} /><span>{room.wallColor}</span></div>
        <div className="color-control"><label>Floor colour</label><input aria-label="Floor colour" type="color" value={room.floorColor} onChange={e => commit(current => ({ ...current, floorColor: e.target.value }))} /><span>{room.floorColor}</span></div>
        <label>Room items<select aria-label="Select room item" value={selectedId ?? ''} onChange={e=>setSelectedId(e.target.value||null)}><option value="">Select an item</option>{room.items.map((i,n)=><option key={i.id} value={i.id}>{catalog.find(c=>c.kind===i.kind)?.name} {n+1}</option>)}</select></label>
        {selected && <div className="position-controls"><label>Position X (m)<input aria-label="Position X" type="number" step=".1" value={Number(selected.x.toFixed(2))} onChange={e=>{if(Number.isFinite(e.target.valueAsNumber))updateSelected(i=>({...i,x:e.target.valueAsNumber}))}} /></label><label>Position Z (m)<input aria-label="Position Z" type="number" step=".1" value={Number(selected.z.toFixed(2))} onChange={e=>{if(Number.isFinite(e.target.valueAsNumber))updateSelected(i=>({...i,z:e.target.valueAsNumber}))}} /></label></div>}
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

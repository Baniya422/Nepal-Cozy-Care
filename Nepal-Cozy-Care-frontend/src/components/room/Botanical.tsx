import { useMemo, useEffect } from 'react'
import * as T from 'three'
function blade(width:number, length:number, split:boolean) {
 const vertices:number[]=[], indices:number[]=[]
 for(let i=0;i<=24;i++) {
  const t=i/24, w=Math.pow(Math.sin(Math.PI*t),.75)*width*(split ? 1-.32*Math.pow(Math.sin(t*31),8):1)
  for(const s of [-1,0,1]) vertices.push(s*w, t*length, Math.sin(t*Math.PI)*.12+Math.abs(s)*.055)
 }
 for(let i=0;i<24;i++) for(let j=0;j<2;j++){const a=i*3+j;indices.push(a,a+3,a+1,a+1,a+3,a+4)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g
}
export default function Botanical({kind}:{kind:string}) {
 const leaf=useMemo(()=>blade(kind==='snake'?.065:kind==='palm'?.04:.23,kind==='snake'?1.05:kind==='palm'?.4:.62,kind==='monstera'),[kind])
 useEffect(()=>()=>leaf.dispose(),[leaf])
 return <group>
  <mesh castShadow position={[0,.22,0]}><cylinderGeometry args={[.26,.19,.44,40]}/><meshStandardMaterial color="#b07755" roughness={.85}/></mesh>
  <mesh position={[0,.438,0]}><cylinderGeometry args={[.237,.237,.012,32]}/><meshStandardMaterial color="#30251a"/></mesh>
  <mesh rotation={[Math.PI/2,0,0]} position={[0,.44,0]}><torusGeometry args={[.25,.016,8,40]}/><meshStandardMaterial color="#c08c69"/></mesh>
  {Array.from({length:kind==='palm'?7:9},(_,i)=>{
   const a=i*2.399, h=.65+(i%4)*.22
   if(kind==='snake')return <mesh key={i} geometry={leaf} position={[Math.sin(a)*.15,.44,Math.cos(a)*.15]} rotation={[Math.sin(a)*.15,a,Math.cos(a)*.12]} scale={[1,.65+i*.05,1]} castShadow><meshStandardMaterial color={i%2?'#577443':'#304f2c'} side={T.DoubleSide} roughness={.55}/></mesh>
   return <group key={i} rotation={[0,a,0]}>
    <mesh position={[.11,h/2+.3,0]} rotation={[0,0,-.2]} castShadow><cylinderGeometry args={[.009,.014,h,8]}/><meshStandardMaterial color="#536c36"/></mesh>
    {kind==='palm'?Array.from({length:12},(_,j)=><mesh key={j} geometry={leaf} position={[.15+j*.035,h+j*.027,0]} rotation={[j%2?-.9:.9,0,-.6-j*.06]} castShadow><meshStandardMaterial color={j%2?'#446735':'#688048'} side={T.DoubleSide} roughness={.7}/></mesh>):<mesh geometry={leaf} position={[.2,h,0]} rotation={[.45,0,-1.15]} castShadow><meshStandardMaterial color={i%2?'#3f6236':'#567541'} side={T.DoubleSide} roughness={.48}/></mesh>}
   </group>
  })}
 </group>
}

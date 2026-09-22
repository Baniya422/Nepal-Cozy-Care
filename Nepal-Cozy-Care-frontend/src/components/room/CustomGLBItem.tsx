import { useGLTF } from '@react-three/drei'
import { Suspense } from 'react'

interface CustomGLBItemProps {
  modelUrl: string
  color?: string
  scale?: number
}

function GLBModel({ modelUrl, scale = 1 }: { modelUrl: string; scale?: number }) {
  const { scene } = useGLTF(modelUrl)
  const cloned = scene.clone()

  return <primitive object={cloned} scale={[scale, scale, scale]} />
}

function FallbackBox({ scale = 1, color = '#2d6a4f' }: { scale?: number; color?: string }) {
  return (
    <mesh position={[0, 0.4 * scale, 0]}>
      <boxGeometry args={[0.8 * scale, 0.8 * scale, 0.8 * scale]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  )
}

export default function CustomGLBItem({ modelUrl, color = '#2d6a4f', scale = 1 }: CustomGLBItemProps) {
  if (!modelUrl) {
    return <FallbackBox scale={scale} color={color} />
  }

  return (
    <Suspense fallback={<FallbackBox scale={scale} color={color} />}>
      <GLBModel modelUrl={modelUrl} scale={scale} />
    </Suspense>
  )
}

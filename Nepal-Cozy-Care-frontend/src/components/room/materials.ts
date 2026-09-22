import * as T from 'three'
// Deterministic, original surface maps; no runtime asset host dependency.
export function surface(kind: 'wood' | 'fabric' | 'plaster') {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')!
  const pixels = ctx.createImageData(512, 512)
  let seed = 31
  for (let y=0;y<512;y++) for(let x=0;x<512;x++) {
    seed=(seed*1664525+1013904223)>>>0
    const noise=seed/4294967296
    const grain = kind==='wood' ? 180+25*Math.sin(x*.33+Math.sin(y*.022)*2)+12*Math.sin(x*1.8+y*.02)+noise*15 : kind==='fabric' ? 200+18*Math.sin(x*Math.PI/2)*Math.sin(y*Math.PI/2)+noise*20 : 220+noise*25
    const i=(y*512+x)*4; pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=grain; pixels.data[i+3]=255
  }
  ctx.putImageData(pixels,0,0)
  const texture=new T.CanvasTexture(canvas); texture.wrapS=texture.wrapT=T.RepeatWrapping
  texture.repeat.set(kind==='wood'?2:6,kind==='wood'?1:6); texture.colorSpace=T.SRGBColorSpace; texture.anisotropy=8
  return texture
}

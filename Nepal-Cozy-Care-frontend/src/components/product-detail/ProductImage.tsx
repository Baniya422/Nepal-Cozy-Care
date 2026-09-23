import { useRef } from "react";
import { Heart, Maximize2, X, Leaf } from "lucide-react";
import { resolveImageUrl, handleImageError, DEFAULT_PLANT_IMAGE } from "../../utils/imageUrl";
interface ProductImageProps {
  image?: string; name: string; saved?: boolean; busy?: boolean; onWishlist: () => void;
}
export default function ProductImage({ image, name, saved, busy, onWishlist }: ProductImageProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const src = resolveImageUrl(image, DEFAULT_PLANT_IMAGE);
  return <div className="product-image-section">
    <div className="main-image-wrapper">
      <span className="pd-image-badge"><Leaf size={14} /> A little more green</span>
      <img src={src} alt={name} className="main-image" onError={e => handleImageError(e, DEFAULT_PLANT_IMAGE)} />
      <button className="wishlist-btn" aria-label={saved ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={saved} disabled={busy} onClick={onWishlist}><Heart size={20} fill={saved ? "currentColor" : "none"} /></button>
      <button className="pd-zoom" onClick={() => dialog.current?.showModal()}><Maximize2 size={16} /> View larger</button>
    </div>
    <p className="pd-image-note">Every plant grows its own way. Shape and foliage may differ from the photograph.</p>
    <dialog ref={dialog} className="pd-image-dialog" aria-label={`${name} enlarged image`} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <button autoFocus aria-label="Close enlarged image" onClick={() => dialog.current?.close()}><X /></button>
      <img src={src} alt={name} onError={e => handleImageError(e, DEFAULT_PLANT_IMAGE)} />
    </dialog>
  </div>;
}

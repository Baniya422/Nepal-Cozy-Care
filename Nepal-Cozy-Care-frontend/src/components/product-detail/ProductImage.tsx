import { Heart } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

interface ProductImageProps {
  image?: string;
  name: string;
}

export default function ProductImage({ image, name }: ProductImageProps) {
  return (
    <div className="product-image-section">
      <div className="main-image-wrapper">
        <img 
          src={image ? `${API}/storage/${image}` : '/images/placeholder-plant.jpg'} 
          alt={name}
          className="main-image"
        />
        <button className="wishlist-btn">
          <Heart size={20} />
        </button>
      </div>
    </div>
  );
}

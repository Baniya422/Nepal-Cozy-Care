import { Heart } from "lucide-react";
import { resolveImageUrl, handleImageError, DEFAULT_PLANT_IMAGE } from "../../utils/imageUrl";

interface ProductImageProps {
  image?: string;
  name: string;
}
export default function ProductImage({ image, name }: ProductImageProps) {
  return (
    <div className="product-image-section">
      <div className="main-image-wrapper">
        <img
          src={resolveImageUrl(image, DEFAULT_PLANT_IMAGE)}
          alt={name}
          className="main-image"
          onError={(e) => handleImageError(e, DEFAULT_PLANT_IMAGE)}
        />
        <button className="wishlist-btn">
          <Heart size={20} />
        </button>
      </div>
    </div>
  );
}

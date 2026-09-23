import ProductCarousel from "./ProductCarousel";
import { shopFallbackPlants, type ProductSectionContent } from "../../features/homepage/content";

export default function ShopPlants({ content }: { content: ProductSectionContent }) {
  return (
    <ProductCarousel
      content={content}
      apiEndpoint="/api/homepage/shop-plants?per_page=8"
      cacheKey="cozycare_cache_shop_plants"
      fallbackPlants={shopFallbackPlants}
      defaultBadge="POPULAR"
    />
  );
}

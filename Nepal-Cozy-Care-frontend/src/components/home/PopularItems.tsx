import ProductCarousel from "./ProductCarousel";
import { popularFallbackPlants, type ProductSectionContent } from "../../features/homepage/content";

export default function PopularItems({ content }: { content: ProductSectionContent }) {
  return (
    <ProductCarousel
      content={content}
      apiEndpoint="/api/homepage/popular-items?per_page=8"
      cacheKey="cozycare_cache_popular_items"
      fallbackPlants={popularFallbackPlants}
      defaultBadge="BESTSELLER"
    />
  );
}

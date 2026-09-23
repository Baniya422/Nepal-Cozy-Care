import ProductCarousel from "./ProductCarousel";
import { bestSellersFallbackPlants, type ProductSectionContent } from "../../features/homepage/content";

export default function BestSellers({ content }: { content: ProductSectionContent }) {
  return (
    <ProductCarousel
      content={content}
      apiEndpoint="/api/homepage/best-sellers?per_page=8"
      cacheKey="cozycare_cache_best_sellers"
      fallbackPlants={bestSellersFallbackPlants}
      defaultBadge="BESTSELLER"
    />
  );
}

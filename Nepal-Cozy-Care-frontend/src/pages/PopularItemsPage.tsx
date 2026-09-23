import Layout from "../components/layout/Layout";
import CuratedCatalogPage from "../features/catalog/components/CuratedCatalogPage";
import { popularFallbackPlants } from "../features/homepage/content";

export default function PopularItemsPage() {
  return (
    <Layout>
      <CuratedCatalogPage
        endpoint="/api/popular-items"
        title="Popular Items"
        subtitle="Explore the plants customers are viewing and loving most right now."
        initialSort="relevant"
        emptyMessage="No popular plants match your selected filters."
        fallbackPlants={popularFallbackPlants}
      />
    </Layout>
  );
}

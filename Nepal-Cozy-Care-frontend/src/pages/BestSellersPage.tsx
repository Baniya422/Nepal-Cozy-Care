import Layout from "../components/layout/Layout";
import CuratedCatalogPage from "../features/catalog/components/CuratedCatalogPage";

export default function BestSellersPage() {
  return (
    <Layout>
      <CuratedCatalogPage
        endpoint="/api/best-sellers"
        title="Best Sellers"
        subtitle="Shop the most-purchased plants trusted by Cozy Care customers."
        initialSort="best_selling"
        emptyMessage="No best-selling plants match your selected filters."
        showSalesRanking
      />
    </Layout>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import CatalogGrid from "../features/catalog/components/CatalogGrid";
import CatalogHeader from "../features/catalog/components/CatalogHeader";
import CatalogSidebar from "../features/catalog/components/CatalogSidebar";
import { bestSellerSortOptions } from "../features/catalog/data";
import {
  extractCatalogPlants,
  filterCatalogPlants,
  sortCatalogPlants,
  toggleNumberValue,
  toggleStringValue,
} from "../features/catalog/utils";
import type { CatalogPlant, PriceFilterKey } from "../features/catalog/types";
import "../styles/popular-items.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function BestSellersPage() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<CatalogPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<"sales" | "price-asc" | "price-desc" | "name-asc">(
    "sales"
  );
  const [priceFilters, setPriceFilters] = useState<PriceFilterKey[]>([]);
  const [ratingFilters, setRatingFilters] = useState<number[]>([]);

  useEffect(() => {
    fetch(`${API}/api/homepage/best-sellers?per_page=100`)
      .then((response) => response.json())
      .then((json) => {
        setPlants(extractCatalogPlants(json));
      })
      .catch(() => setPlants([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredPlants = useMemo(() => {
    const filtered = filterCatalogPlants({
      plants,
      searchTerm,
      priceFilters,
      ratingFilters,
    });

    return sortCatalogPlants(filtered, sort);
  }, [plants, searchTerm, priceFilters, ratingFilters, sort]);

  return (
    <Layout>
      <div className="popular-page">
        <CatalogSidebar
          priceFilters={priceFilters}
          ratingFilters={ratingFilters}
          onTogglePrice={(value) =>
            setPriceFilters((current) => toggleStringValue(current, value))
          }
          onToggleRating={(value) =>
            setRatingFilters((current) => toggleNumberValue(current, value))
          }
        />

        <section className="popular-main">
          <CatalogHeader
            title="Best Sellers"
            subtitle="Most wanted and loved plants by our customers."
            searchPlaceholder="Search best sellers..."
            searchTerm={searchTerm}
            sortValue={sort}
            sortOptions={bestSellerSortOptions}
            onSearchChange={setSearchTerm}
            onSortChange={(value) => setSort(value as typeof sort)}
          />

          <CatalogGrid
            apiBaseUrl={API}
            plants={filteredPlants}
            loading={loading}
            emptyMessage="No plants found in this selection."
            onPlantClick={(id) => navigate(`/plants/${id}`)}
            showSalesBadge
            salesBadgeLabel={(index) => `${index + 1}. Bestseller`}
          />
        </section>
      </div>
    </Layout>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import CatalogCategoryChips from "../features/catalog/components/CatalogCategoryChips";
import CatalogGrid from "../features/catalog/components/CatalogGrid";
import CatalogHeader from "../features/catalog/components/CatalogHeader";
import CatalogSidebar from "../features/catalog/components/CatalogSidebar";
import { popularSortOptions } from "../features/catalog/data";
import {
  extractCatalogPlants,
  filterCatalogPlants,
  sortCatalogPlants,
  toggleNumberValue,
  toggleStringValue,
} from "../features/catalog/utils";
import type {
  CatalogPlant,
  CategoryFilter,
  PriceFilterKey,
} from "../features/catalog/types";
import "../styles/popular-items.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function PopularItemsPage() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<CatalogPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<"popular" | "price-asc" | "price-desc" | "name-asc">(
    "popular"
  );
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [priceFilters, setPriceFilters] = useState<PriceFilterKey[]>([]);
  const [ratingFilters, setRatingFilters] = useState<number[]>([]);

  useEffect(() => {
    fetch(`${API}/api/homepage/popular-items?per_page=100`)
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
      category,
    });

    return sortCatalogPlants(filtered, sort);
  }, [plants, searchTerm, priceFilters, ratingFilters, category, sort]);

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
            title="Popular Items"
            subtitle="Discover our most loved plants and accessories."
            searchPlaceholder="Search products..."
            searchTerm={searchTerm}
            sortValue={sort}
            sortOptions={popularSortOptions}
            onSearchChange={setSearchTerm}
            onSortChange={(value) => setSort(value as typeof sort)}
          />

          <CatalogCategoryChips category={category} onChange={setCategory} />

          <CatalogGrid
            apiBaseUrl={API}
            plants={filteredPlants}
            loading={loading}
            emptyMessage="No products match your filters."
            onPlantClick={(id) => navigate(`/plants/${id}`)}
            showWishlistButton
          />
        </section>
      </div>
    </Layout>
  );
}

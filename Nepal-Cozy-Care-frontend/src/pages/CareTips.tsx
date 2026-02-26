import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Hero from "../components/care-tips/Hero";
import Filters from "../components/care-tips/Filters";
import TipsGrid from "../components/care-tips/TipsGrid";
import type { CareTip, CareTipCategories, CareTipResponse } from "../types/careTip";
import "../styles/careTips.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function CareTips() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [careTips, setCareTips] = useState<CareTip[]>([]);
  const [categories, setCategories] = useState<CareTipCategories>({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get("difficulty") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "newest");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCareTips();
  }, [selectedCategory, selectedDifficulty, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API}/api/care-tips/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || {});
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCareTips = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedDifficulty) params.append("difficulty", selectedDifficulty);
      if (sortBy) params.append("sort_by", sortBy);
      params.append("page", currentPage.toString());

      const response = await fetch(`${API}/api/care-tips?${params.toString()}`);
      if (response.ok) {
        const data: CareTipResponse = await response.json();
        setCareTips(data.data.data || []);
        setTotal(data.data.total || 0);
        setCurrentPage(data.data.current_page || 1);
        setLastPage(data.data.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching care tips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateURLParams();
    fetchCareTips();
  };

  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedDifficulty) params.append("difficulty", selectedDifficulty);
    if (sortBy) params.append("sort_by", sortBy);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedDifficulty("");
    setSortBy("newest");
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = !!(selectedCategory || selectedDifficulty || searchQuery);

  return (
    <Layout>
      <div className="care-tips-page">
        <Hero 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
        />
        <Filters
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={(val) => { setSelectedCategory(val); setCurrentPage(1); }}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={(val) => { setSelectedDifficulty(val); setCurrentPage(1); }}
          sortBy={sortBy}
          setSortBy={(val) => { setSortBy(val); setCurrentPage(1); }}
          clearFilters={clearFilters}
          total={total}
          hasActiveFilters={hasActiveFilters}
        />
        <TipsGrid
          careTips={careTips}
          loading={loading}
          clearFilters={clearFilters}
          currentPage={currentPage}
          lastPage={lastPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </Layout>
  );
}

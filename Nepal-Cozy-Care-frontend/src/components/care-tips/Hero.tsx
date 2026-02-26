import { Search } from "lucide-react";

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export default function Hero({ searchQuery, setSearchQuery, handleSearch }: HeroProps) {
  return (
    <section className="care-tips-hero">
      <div className="care-tips-hero-content">
        <h1 className="care-tips-hero-title">Plant Care Tips</h1>
        <p className="care-tips-hero-subtitle">
          Expert advice to help your plants thrive. Search by keyword or browse by category.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="care-tips-search">
          <div className="care-tips-search-input-wrapper">
            <Search size={20} className="care-tips-search-icon" />
            <input
              type="text"
              placeholder='Search tips: "watering cactus", "yellow leaves"...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="care-tips-search-input"
            />
          </div>
          <button type="submit" className="care-tips-search-btn">
            Search
          </button>
        </form>

        <p className="care-tips-search-hint">
          <strong>Popular:</strong> Watering schedule, Fertilizing guide, Pest control, Indoor care
        </p>
      </div>
    </section>
  );
}

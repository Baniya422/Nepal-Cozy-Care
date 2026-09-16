import { Sparkles, Sun, ShieldCheck, ArrowRight } from "lucide-react";
import { resolveImageUrl, handleImageError, DEFAULT_PLANT_IMAGE } from "../../../utils/imageUrl";
import type { Plant } from "../types";

type PlantFinderPlantCardProps = {
  plant: Plant;
  apiBaseUrl?: string;
  onClick: (id: number) => void;
};

export default function PlantFinderPlantCard({
  plant,
  onClick,
}: PlantFinderPlantCardProps) {
  const imageUrl = resolveImageUrl(plant.image, DEFAULT_PLANT_IMAGE);

  const formatBadge = (text?: string) => {
    if (!text) return null;
    return text.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div
      className="pf-plant-card"
      onClick={() => onClick(plant.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick(plant.id);
        }
      }}
    >
      <div className="pf-plant-card-media">
        <img
          src={imageUrl}
          alt={plant.name}
          className="pf-plant-card-img"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="pf-card-overlay-badge">
          <Sparkles size={13} />
          <span>Recommended Match</span>
        </div>
      </div>

      <div className="pf-plant-card-body">
        <div className="pf-card-chips">
          {plant.difficulty && (
            <span className="pf-card-chip pf-chip-diff">
              <ShieldCheck size={12} />
              {formatBadge(plant.difficulty)}
            </span>
          )}
          {plant.light && (
            <span className="pf-card-chip pf-chip-light">
              <Sun size={12} />
              {formatBadge(plant.light)}
            </span>
          )}
        </div>

        <h3 className="pf-plant-card-title">{plant.name}</h3>

        {plant.category && (
          <p className="pf-plant-card-category">{plant.category}</p>
        )}

        <div className="pf-plant-card-footer">
          <div className="pf-card-price">
            <span className="pf-price-currency">Rs.</span>
            <span className="pf-price-val">{Number(plant.price).toLocaleString()}</span>
          </div>

          <span className="pf-card-action-btn">
            View Details
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
}

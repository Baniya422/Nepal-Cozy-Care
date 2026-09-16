import { Sparkles, ArrowDown, RotateCcw } from "lucide-react";
import PlantFinderPlantCard from "./PlantFinderPlantCard";
import type { Plant } from "../types";

type PlantFinderResultsProps = {
  apiBaseUrl: string;
  recommendedPlants: Plant[];
  morePlants: Plant[];
  onPlantClick: (id: number) => void;
  onStartOver?: () => void;
};

export default function PlantFinderResults({
  apiBaseUrl,
  recommendedPlants,
  morePlants,
  onPlantClick,
  onStartOver,
}: PlantFinderResultsProps) {
  return (
    <div id="plantfinder-results-section" className="pf-results-wrapper">
      <section className="plantfinder-results">
        <div className="pf-results-header">
          <div className="pf-results-badge">
            <Sparkles size={16} />
            <span>AI Matchmaker Recommendations</span>
          </div>
          <h2 className="plantfinder-results-title">
            Your Perfect Botanical Matches
          </h2>
          <p className="pf-results-desc">
            Smart botanical suggestions tailored specifically to your room, light, and routine.
          </p>
          {onStartOver && (
            <button
              type="button"
              className="pf-btn-reset pf-results-reset-btn"
              onClick={onStartOver}
            >
              <RotateCcw size={14} />
              <span>Tweak My Answers</span>
            </button>
          )}
        </div>

        {recommendedPlants.length > 0 ? (
          <div className="plantfinder-grid">
            {recommendedPlants.map((plant) => (
              <PlantFinderPlantCard
                key={plant.id}
                plant={plant}
                apiBaseUrl={apiBaseUrl}
                onClick={onPlantClick}
              />
            ))}
          </div>
        ) : null}
      </section>

      {morePlants.length > 0 ? (
        <section className="plantfinder-more">
          <div className="pf-more-header">
            <div className="pf-more-divider">
              <span className="pf-more-icon-wrap">
                <ArrowDown size={14} />
              </span>
            </div>
            <h3 className="plantfinder-more-title">
              More Versatile Houseplants You'll Love
            </h3>
            <p className="pf-more-subtitle">
              Resilient indoor favorites that also grow beautifully with minimal fuss.
            </p>
          </div>
          <div className="plantfinder-grid">
            {morePlants.map((plant) => (
              <PlantFinderPlantCard
                key={plant.id}
                plant={plant}
                apiBaseUrl={apiBaseUrl}
                onClick={onPlantClick}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

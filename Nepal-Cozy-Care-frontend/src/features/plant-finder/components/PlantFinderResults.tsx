import { Sparkles, ArrowDown, RotateCcw, Box, ArrowRight } from "lucide-react";
import PlantFinderPlantCard from "./PlantFinderPlantCard";
import type { Plant } from "../types";

type PlantFinderResultsProps = {
  apiBaseUrl: string;
  recommendedPlants: Plant[];
  morePlants: Plant[];
  onPlantClick: (id: number) => void;
  onStartOver?: () => void;
  onContinueToStudio?: () => void;
  roomTitle?: string;
};

export default function PlantFinderResults({
  apiBaseUrl,
  recommendedPlants,
  morePlants,
  onPlantClick,
  onStartOver,
  onContinueToStudio,
  roomTitle = "Custom Room",
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

          {/* 3D Room Studio Action Banner */}
          {onContinueToStudio && (
            <div className="pf-studio-cta-banner">
              <div className="pf-studio-cta-content">
                <div className="pf-studio-cta-badge">
                  <Box size={16} />
                  <span>3D Architectural Studio</span>
                </div>
                <h3>Experience Your {roomTitle} in 3D</h3>
                <p>
                  Place these recommended plants into a real 3D room, rearrange furniture, and see how daylight illuminates your space.
                </p>
              </div>
              <button
                type="button"
                className="pf-studio-cta-button"
                onClick={onContinueToStudio}
                title="Continue designing this room in the 3D Studio"
              >
                <span>Continue Designing in 3D Studio</span>
                <ArrowRight size={17} />
              </button>
            </div>
          )}

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

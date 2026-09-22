import { useState } from "react";
import { Sparkles, Sun, Home, Compass, Droplets, Box, Image as ImageIcon } from "lucide-react";
import { getCurrentPreview } from "../utils";
import type { ActiveField, PlantFinderSelections } from "../types";
import PlantFinderInteractiveRoom from "./PlantFinderInteractiveRoom";

type PlantFinderPreviewProps = {
  activeField: ActiveField;
  selections: PlantFinderSelections;
  recommendedPlantsCount?: number;
  onContinueToStudio?: () => void;
};

export default function PlantFinderPreview({
  activeField,
  selections,
  recommendedPlantsCount = 0,
  onContinueToStudio,
}: PlantFinderPreviewProps) {
  const [viewMode, setViewMode] = useState<"3d" | "photo">("3d");
  const currentPreview = getCurrentPreview(activeField, selections);

  // Determine appropriate room image from public assets
  const knownRoomImages = [
    "living-room",
    "bedroom",
    "office",
    "balcony",
    "kitchen",
    "bathroom",
  ];

  const roomImageName = selections.room && knownRoomImages.includes(selections.room)
    ? `${selections.room}.png`
    : "living-room.png";

  const formatTag = (val?: string) => {
    if (!val) return "Not set";
    return val.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="plantfinder-quiz-image">
      <div className="pf-preview-glass-card">
        <div className="pf-preview-header">
          <div className="pf-preview-top-row">
            <div className="pf-preview-kicker">
              <Sparkles size={14} />
              <span>{currentPreview.eyebrow || "Space Visualization"}</span>
            </div>
            
            {/* 3D vs Photo View Toggle */}
            <div className="pf-view-toggle" role="group" aria-label="Preview View Mode">
              <button
                type="button"
                className={`pf-view-toggle-btn ${viewMode === "3d" ? "active" : ""}`}
                onClick={() => setViewMode("3d")}
                title="Live 3D Room Studio View"
              >
                <Box size={13} />
                <span>3D Studio</span>
              </button>
              <button
                type="button"
                className={`pf-view-toggle-btn ${viewMode === "photo" ? "active" : ""}`}
                onClick={() => setViewMode("photo")}
                title="Realistic Photo Scene"
              >
                <ImageIcon size={13} />
                <span>Photo</span>
              </button>
            </div>
          </div>

          <h2 className="pf-preview-heading">
            {currentPreview.title || "Your Ideal Setup"}
          </h2>
          <p className="pf-preview-text">
            {currentPreview.description ||
              "Select your preferences to see personalized plant matches."}
          </p>
        </div>

        {viewMode === "3d" ? (
          <PlantFinderInteractiveRoom
            selections={selections}
            activeField={activeField}
            recommendedPlantsCount={recommendedPlantsCount}
            onContinueToStudio={onContinueToStudio}
          />
        ) : (
          <div className="pf-preview-viewport">
            <div className="pf-preview-scene-glow" />
            <img
              src={`/images/plantfinder/${roomImageName}`}
              alt={currentPreview.title}
              className="pf-preview-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/mos.jpg";
              }}
            />

            <div className="pf-preview-floating-tags">
              <div className={`pf-floating-tag ${selections.room ? "active" : ""}`}>
                <Home size={13} />
                <span>{formatTag(selections.room)}</span>
              </div>
              <div className={`pf-floating-tag ${selections.light ? "active" : ""}`}>
                <Sun size={13} />
                <span>{formatTag(selections.light)}</span>
              </div>
              <div className={`pf-floating-tag ${selections.experience ? "active" : ""}`}>
                <Compass size={13} />
                <span>{formatTag(selections.experience)}</span>
              </div>
              <div className={`pf-floating-tag ${selections.location ? "active" : ""}`}>
                <Droplets size={13} />
                <span>{formatTag(selections.location)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

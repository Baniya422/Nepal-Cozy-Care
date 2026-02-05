import { getCurrentPreview } from "../utils";
import type { ActiveField, PlantFinderSelections } from "../types";

type PlantFinderPreviewProps = {
  activeField: ActiveField;
  selections: PlantFinderSelections;
};

export default function PlantFinderPreview({
  activeField,
  selections,
}: PlantFinderPreviewProps) {
  const currentPreview = getCurrentPreview(activeField, selections);
  const currentSelection =
    activeField === "room"
      ? selections.room
      : activeField === "light"
        ? selections.light
        : activeField === "experience"
          ? selections.experience
          : selections.location;

  return (
    <div className="plantfinder-quiz-image">
      <div
        className={`plantfinder-room-preview plantfinder-room-preview--${
          currentSelection || "default"
        }`}
      >
        <div className="plantfinder-room-preview-copy">
          <p className="plantfinder-room-preview-eyebrow">
            {currentPreview.eyebrow}
          </p>
          <h2 className="plantfinder-room-preview-title">{currentPreview.title}</h2>
          <p className="plantfinder-room-preview-description">
            {currentPreview.description}
          </p>
        </div>

        <div
          key={currentPreview.image}
          className="plantfinder-room-scene plantfinder-room-scene--image-based"
        >
          <div className="plantfinder-room-scene-glow" />

          <div className="plantfinder-3d-wrapper">
            <img
              src={`/images/plantfinder/${currentPreview.image}`}
              alt={currentPreview.title}
              className="plantfinder-3d-asset"
              onError={(event) => {
                (event.target as HTMLImageElement).src =
                  "/images/placeholder-plant.jpg";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

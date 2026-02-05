import PlantFinderPlantCard from "./PlantFinderPlantCard";
import type { Plant } from "../types";

type PlantFinderResultsProps = {
  apiBaseUrl: string;
  recommendedPlants: Plant[];
  morePlants: Plant[];
  onPlantClick: (id: number) => void;
};

export default function PlantFinderResults({
  apiBaseUrl,
  recommendedPlants,
  morePlants,
  onPlantClick,
}: PlantFinderResultsProps) {
  return (
    <>
      <section className="plantfinder-results">
        <h2 className="plantfinder-results-title">And the winners are..</h2>
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
        ) : (
          <p
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#666",
              fontSize: "1.1rem",
            }}
          >
            No plants perfectly match those specific criteria. Try adjusting your
            preferences!
          </p>
        )}
      </section>

      {morePlants.length > 0 ? (
        <section className="plantfinder-more">
          <h2 className="plantfinder-more-title">
            But we have a lot more in store for you:
          </h2>
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
    </>
  );
}

import type { Plant } from "../types";

type PlantFinderPlantCardProps = {
  plant: Plant;
  apiBaseUrl: string;
  onClick: (id: number) => void;
};

export default function PlantFinderPlantCard({
  plant,
  apiBaseUrl,
  onClick,
}: PlantFinderPlantCardProps) {
  return (
    <div
      className="plantfinder-card"
      onClick={() => onClick(plant.id)}
      style={{ cursor: "pointer" }}
    >
      <img
        src={
          plant.image
            ? `${apiBaseUrl}/storage/${plant.image}`
            : "/images/placeholder-plant.jpg"
        }
        alt={plant.name}
        className="plantfinder-card-image"
      />
      <div className="plantfinder-card-info">
        <h3>{plant.name}</h3>
        <p>Rs {Number(plant.price).toFixed(2)}</p>
      </div>
    </div>
  );
}

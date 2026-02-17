import { CalendarHeart, Droplets, Home, Leaf } from "lucide-react";
import {
  environmentOptions,
  plantTypeOptions,
  seasonOptions,
  soilOptions,
} from "../data";

type PlantHealthSnapshotFormProps = {
  plantType: string;
  environment: string;
  season: string;
  soilState: string;
  onPlantTypeChange: (value: string) => void;
  onEnvironmentChange: (value: string) => void;
  onSeasonChange: (value: string) => void;
  onSoilStateChange: (value: string) => void;
};

export default function PlantHealthSnapshotForm({
  plantType,
  environment,
  season,
  soilState,
  onPlantTypeChange,
  onEnvironmentChange,
  onSeasonChange,
  onSoilStateChange,
}: PlantHealthSnapshotFormProps) {
  return (
    <div className="plant-health-profile-panel">
      <div className="plant-health-profile-head">
        <h2>Plant Snapshot</h2>
        <p>Give a little context first so the diagnosis can be more realistic.</p>
      </div>

      <div className="plant-health-profile-grid">
        <label className="plant-health-profile-field">
          <span>
            <Leaf size={16} />
            Plant Type
          </span>
          <select value={plantType} onChange={(event) => onPlantTypeChange(event.target.value)}>
            {plantTypeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="plant-health-profile-field">
          <span>
            <Home size={16} />
            Room / Placement
          </span>
          <select
            value={environment}
            onChange={(event) => onEnvironmentChange(event.target.value)}
          >
            {environmentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="plant-health-profile-field">
          <span>
            <CalendarHeart size={16} />
            Season
          </span>
          <select value={season} onChange={(event) => onSeasonChange(event.target.value)}>
            {seasonOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="plant-health-profile-field">
          <span>
            <Droplets size={16} />
            Soil Right Now
          </span>
          <select value={soilState} onChange={(event) => onSoilStateChange(event.target.value)}>
            {soilOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

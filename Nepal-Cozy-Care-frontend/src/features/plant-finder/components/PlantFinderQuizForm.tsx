import type { FormEvent } from "react";
import {
  experienceOptions,
  lightOptions,
  locationOptions,
  roomOptions,
} from "../data";
import type {
  ActiveField,
  ExperienceKey,
  LightKey,
  LocationKey,
  PlantFinderSelections,
  RoomKey,
} from "../types";

type PlantFinderQuizFormProps = {
  selections: PlantFinderSelections;
  activeField: ActiveField;
  showResults: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onStartOver: () => void;
  onRoomChange: (value: RoomKey) => void;
  onLightChange: (value: LightKey) => void;
  onExperienceChange: (value: ExperienceKey) => void;
  onLocationChange: (value: LocationKey) => void;
  onFieldFocus: (field: ActiveField) => void;
};

export default function PlantFinderQuizForm({
  selections,
  activeField,
  showResults,
  onSubmit,
  onStartOver,
  onRoomChange,
  onLightChange,
  onExperienceChange,
  onLocationChange,
  onFieldFocus,
}: PlantFinderQuizFormProps) {
  return (
    <div className="plantfinder-quiz-content">
      <h1 className="plantfinder-title">Find your perfect match!</h1>

      <form onSubmit={onSubmit} className="plantfinder-form">
        <div className="plantfinder-question">
          <span>My chosen plant will live in: </span>
          <select
            value={selections.room}
            onChange={(event) => {
              onRoomChange(event.target.value as RoomKey);
              onFieldFocus("room");
            }}
            onFocus={() => onFieldFocus("room")}
            required
            className="plantfinder-select"
            aria-label={`Room selection ${activeField === "room" ? "active" : ""}`}
          >
            <option value="">_______</option>
            {roomOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span>. In that room, there is </span>
          <select
            value={selections.light}
            onChange={(event) => {
              onLightChange(event.target.value as LightKey);
              onFieldFocus("light");
            }}
            onFocus={() => onFieldFocus("light")}
            required
            className="plantfinder-select"
            aria-label={`Light selection ${activeField === "light" ? "active" : ""}`}
          >
            <option value="">_______</option>
            {lightOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span>. My experience level: </span>
          <select
            value={selections.experience}
            onChange={(event) => {
              onExperienceChange(event.target.value as ExperienceKey);
              onFieldFocus("experience");
            }}
            onFocus={() => onFieldFocus("experience")}
            required
            className="plantfinder-select"
            aria-label={`Experience selection ${
              activeField === "experience" ? "active" : ""
            }`}
          >
            <option value="">_______</option>
            {experienceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span>. In my home </span>
          <select
            value={selections.location}
            onChange={(event) => {
              onLocationChange(event.target.value as LocationKey);
              onFieldFocus("location");
            }}
            onFocus={() => onFieldFocus("location")}
            required
            className="plantfinder-select"
            aria-label={`Humidity selection ${activeField === "location" ? "active" : ""}`}
          >
            <option value="">_______</option>
            {locationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span>.</span>
        </div>

        <div className="plantfinder-actions">
          <button type="submit" className="plantfinder-submit-btn">
            MEET YOUR MATCHES
          </button>

          {showResults ? (
            <button
              type="button"
              onClick={onStartOver}
              className="plantfinder-startover"
            >
              Start over
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

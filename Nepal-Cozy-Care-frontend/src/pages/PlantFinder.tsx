import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PlantFinderPreview from "../features/plant-finder/components/PlantFinderPreview";
import PlantFinderQuizForm from "../features/plant-finder/components/PlantFinderQuizForm";
import PlantFinderResults from "../features/plant-finder/components/PlantFinderResults";
import { extractPlantsFromResponse, getPlantFinderResults } from "../features/plant-finder/utils";
import type {
  ActiveField,
  ExperienceKey,
  LightKey,
  LocationKey,
  Plant,
  PlantFinderSelections,
  RoomKey,
} from "../features/plant-finder/types";
import "../styles/plantfinder.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export function PlantFinder() {
  const navigate = useNavigate();
  const [selections, setSelections] = useState<PlantFinderSelections>({
    room: "",
    light: "",
    experience: "",
    location: "",
  });
  const [activeField, setActiveField] = useState<ActiveField>("room");
  const [showResults, setShowResults] = useState(false);
  const [recommendedPlants, setRecommendedPlants] = useState<Plant[]>([]);
  const [morePlants, setMorePlants] = useState<Plant[]>([]);

  const updateSelection = <K extends keyof PlantFinderSelections>(
    field: K,
    value: PlantFinderSelections[K]
  ) => {
    setSelections((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API}/api/plants?per_page=100`);
      const data = await response.json();
      const allPlants = extractPlantsFromResponse(data);
      const results = getPlantFinderResults(allPlants, selections);

      setRecommendedPlants(results.recommendedPlants);
      setMorePlants(results.morePlants);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching plants:", error);
      setRecommendedPlants([]);
      setMorePlants([]);
      setShowResults(true);
    }
  };

  const handleStartOver = () => {
    setSelections({
      room: "",
      light: "",
      experience: "",
      location: "",
    });
    setActiveField("room");
    setShowResults(false);
    setRecommendedPlants([]);
    setMorePlants([]);
  };

  return (
    <Layout>
      <div className="plantfinder-page">
        <section className="plantfinder-quiz">
          <div className="plantfinder-quiz-container">
            <PlantFinderPreview activeField={activeField} selections={selections} />

            <PlantFinderQuizForm
              selections={selections}
              activeField={activeField}
              showResults={showResults}
              onSubmit={handleSubmit}
              onStartOver={handleStartOver}
              onRoomChange={(value: RoomKey) => updateSelection("room", value)}
              onLightChange={(value: LightKey) => updateSelection("light", value)}
              onExperienceChange={(value: ExperienceKey) =>
                updateSelection("experience", value)
              }
              onLocationChange={(value: LocationKey) =>
                updateSelection("location", value)
              }
              onFieldFocus={setActiveField}
            />
          </div>
        </section>

        {showResults ? (
          <PlantFinderResults
            apiBaseUrl={API}
            recommendedPlants={recommendedPlants}
            morePlants={morePlants}
            onPlantClick={(id) => navigate(`/plants/${id}`)}
          />
        ) : null}
      </div>
    </Layout>
  );
}

export default PlantFinder;

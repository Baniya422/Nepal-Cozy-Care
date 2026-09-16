import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PlantFinderPreview from "../features/plant-finder/components/PlantFinderPreview";
import PlantFinderQuizForm from "../features/plant-finder/components/PlantFinderQuizForm";
import PlantFinderResults from "../features/plant-finder/components/PlantFinderResults";
import { applyPlantFinderTemplate } from "../features/plant-finder/data";
import { extractPlantsFromResponse } from "../features/plant-finder/utils";
import { getAIPlantRecommendations } from "../features/plant-finder/aiMatchmaker";
import type {
  ActiveField,
  ExperienceKey,
  LightKey,
  LocationKey,
  Plant,
  PlantFinderTemplatePayload,
  PlantFinderSelections,
  RoomKey,
} from "../features/plant-finder/types";
import "../styles/plantfinder.css";
const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const TEMPLATE_CACHE_KEY = "plant_finder_template_v1";
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT ?? "5000");
export function PlantFinder() {
  const navigate = useNavigate();
  const [templateLoading, setTemplateLoading] = useState(true);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [, setTemplateRevision] = useState(0);
  const [cachedPlants, setCachedPlants] = useState<Plant[]>([]);
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
  useEffect(() => {
    let isMounted = true;
    let hasCachedTemplate = false;
    const readCachedTemplate = (): PlantFinderTemplatePayload | null => {
      try {
        const cached = localStorage.getItem(TEMPLATE_CACHE_KEY);
        if (!cached) return null;
        return JSON.parse(cached) as PlantFinderTemplatePayload;
      } catch {
        return null;
      }
    };
    const cachedTemplate = readCachedTemplate();
    if (cachedTemplate) {
      applyPlantFinderTemplate(cachedTemplate);
      hasCachedTemplate = true;
      setTemplateRevision((current) => current + 1);
      setTemplateLoading(false);
    }

    // Pre-fetch plants quietly in background so recommendations are instant
    fetch(`${API}/api/plants?per_page=100`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          const plants = extractPlantsFromResponse(data);
          setCachedPlants(plants);
        }
      })
      .catch((err) => {
        console.warn("Background plants pre-fetch notice:", err);
      });

    const loadTemplate = async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      try {
        const response = await fetch(`${API}/api/plant-finder/template`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Could not load plant finder template.");
        }
        const payload = await response.json().catch(() => ({}));
        const template = (payload?.data ?? null) as PlantFinderTemplatePayload | null;
        applyPlantFinderTemplate(template);
        localStorage.setItem(TEMPLATE_CACHE_KEY, JSON.stringify(template ?? {}));
        if (isMounted) {
          setTemplateError(null);
          setTemplateRevision((current) => current + 1);
          setTemplateLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          if (!hasCachedTemplate) {
            setTemplateError(
              error instanceof DOMException && error.name === "AbortError"
                ? "Plant finder template request timed out. Check backend server."
                : error instanceof Error
                  ? error.message
                  : "Could not load plant finder template."
            );
            setTemplateLoading(false);
          }
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    };
    void loadTemplate();
    return () => {
      isMounted = false;
    };
  }, []);
  const updateSelection = <K extends keyof PlantFinderSelections>(
    field: K,
    value: PlantFinderSelections[K]
  ) => {
    const updated = {
      ...selections,
      [field]: value,
    };
    setSelections(updated);

    // If results are already showing, live update AI recommendations
    if (showResults && cachedPlants.length > 0) {
      const aiResults = getAIPlantRecommendations(cachedPlants, updated);
      setRecommendedPlants(aiResults.recommendedPlants);
      setMorePlants(aiResults.morePlants);
    }
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      let plants = cachedPlants;
      if (plants.length === 0) {
        const response = await fetch(`${API}/api/plants?per_page=100`);
        const data = await response.json();
        plants = extractPlantsFromResponse(data);
        setCachedPlants(plants);
      }
      const results = getAIPlantRecommendations(plants, selections);
      setRecommendedPlants(results.recommendedPlants);
      setMorePlants(results.morePlants);
      setShowResults(true);
      setTimeout(() => {
        const resultsEl = document.getElementById("plantfinder-results-section");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
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
        {templateLoading ? (
          <section className="plantfinder-quiz">
            <div className="plantfinder-quiz-container">
              <div className="plantfinder-quiz-content">
                <h1 className="plantfinder-title">Loading plant finder template...</h1>
              </div>
            </div>
          </section>
        ) : templateError ? (
          <section className="plantfinder-quiz">
            <div className="plantfinder-quiz-container">
              <div className="plantfinder-quiz-content">
                <h1 className="plantfinder-title">Plant Finder unavailable</h1>
                <p>{templateError}</p>
              </div>
            </div>
          </section>
        ) : (
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
        )}
        {showResults ? (
          <PlantFinderResults
            apiBaseUrl={API}
            recommendedPlants={recommendedPlants}
            morePlants={morePlants}
            onPlantClick={(id) => navigate(`/plants/${id}`)}
            onStartOver={handleStartOver}
          />
        ) : null}
      </div>
    </Layout>
  );
}
export default PlantFinder;

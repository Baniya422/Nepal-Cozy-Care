import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlantFinderPreview from "../features/plant-finder/components/PlantFinderPreview";
import PlantFinderQuizForm from "../features/plant-finder/components/PlantFinderQuizForm";
import PlantFinderResults from "../features/plant-finder/components/PlantFinderResults";
import { applyPlantFinderTemplate } from "../features/plant-finder/data";
import { fetchPlantFinderCatalog } from "../features/plant-finder/catalog";
import { getAIPlantRecommendations } from "../features/plant-finder/aiMatchmaker";
import { buildRoomTransferState, saveRoomTransferState } from "../features/room-designer/roomTransferState";
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
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT ?? "3000");

export function PlantFinder() {
  const navigate = useNavigate();
  const [, setTemplateRevision] = useState(0);
  const [cachedPlants, setCachedPlants] = useState<Plant[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [selections, setSelections] = useState<PlantFinderSelections>({
    room: "living-room",
    light: "bright-light",
    experience: "beginner",
    location: "normal",
  });
  const [activeField, setActiveField] = useState<ActiveField>("room");
  const [showResults, setShowResults] = useState(false);
  const [recommendedPlants, setRecommendedPlants] = useState<Plant[]>([]);
  const [morePlants, setMorePlants] = useState<Plant[]>([]);

  useEffect(() => {
    let isMounted = true;
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
      setTemplateRevision((current) => current + 1);
    } else {
      applyPlantFinderTemplate(null);
    }

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
          throw new Error("Template endpoint returned error status");
        }
        const payload = await response.json().catch(() => ({}));
        const template = (payload?.data ?? null) as PlantFinderTemplatePayload | null;
        if (template) {
          applyPlantFinderTemplate(template);
          localStorage.setItem(TEMPLATE_CACHE_KEY, JSON.stringify(template));
          if (isMounted) {
            setTemplateRevision((current) => current + 1);
          }
        }
      } catch (error) {
        // Graceful fallback to default template without blocking UI
        applyPlantFinderTemplate(null);
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
    if (loadingCatalog) return;
    setLoadingCatalog(true);
    setCatalogError("");
    try {
      const plants = await fetchPlantFinderCatalog(API);
      setCachedPlants(plants);
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
      setCatalogError("We couldn't load the plant catalog. Please try Find Plants again.");
      setShowResults(false);
    } finally {
      setLoadingCatalog(false);
    }
  };

  const handleStartOver = () => {
    setSelections({
      room: "living-room",
      light: "bright-light",
      experience: "beginner",
      location: "normal",
    });
    setActiveField("room");
    setShowResults(false);
    setRecommendedPlants([]);
    setMorePlants([]);
  };

  const handleContinueToStudio = () => {
    const recommendedIds = recommendedPlants.map((p) => p.id);
    const recommendedNames = recommendedPlants.map((p) => p.name);
    const transferState = buildRoomTransferState(
      selections.room,
      selections.light,
      selections.experience,
      selections.location,
      recommendedIds,
      recommendedNames
    );
    saveRoomTransferState(transferState);
    navigate("/room-designer", { state: transferState });
  };

  const roomTitle = selections.room
    ? selections.room.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Living Room";

  return (
    <div className="plantfinder-page">
      <section className="plantfinder-quiz">
        <div className="plantfinder-quiz-container">
          <PlantFinderPreview
            activeField={activeField}
            selections={selections}
            recommendedPlantsCount={recommendedPlants.length}
            onContinueToStudio={handleContinueToStudio}
          />
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

      {loadingCatalog && <p role="status" style={{ textAlign: "center" }}>Finding matches in the current plant catalog…</p>}
      {catalogError && <p role="alert" style={{ textAlign: "center", color: "#b91c1c" }}>{catalogError}</p>}
      {showResults && (
        <PlantFinderResults
          apiBaseUrl={API}
          recommendedPlants={recommendedPlants}
          morePlants={morePlants}
          onPlantClick={(id) => navigate(`/plants/${id}`)}
          onStartOver={handleStartOver}
          onContinueToStudio={handleContinueToStudio}
          roomTitle={roomTitle}
        />
      )}
    </div>
  );
}

export default PlantFinder;

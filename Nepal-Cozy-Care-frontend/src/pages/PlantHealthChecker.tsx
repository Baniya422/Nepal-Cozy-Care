import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PlantHealthHero from "../features/plant-health/components/PlantHealthHero";
import PlantHealthResults from "../features/plant-health/components/PlantHealthResults";
import PlantHealthSnapshotForm from "../features/plant-health/components/PlantHealthSnapshotForm";
import PlantHealthSymptomSelector from "../features/plant-health/components/PlantHealthSymptomSelector";
import PlantHealthTips from "../features/plant-health/components/PlantHealthTips";
import {
  applyPlantHealthTemplate,
  diagnosisProfiles,
  environmentOptions,
  getCurrentSeason,
  plantTypeOptions,
  seasonOptions,
  soilOptions,
  symptomCategories,
} from "../features/plant-health/data";
import type { HealthAnalysis, PlantHealthTemplatePayload } from "../features/plant-health/types";
import {
  analyzePlantHealth,
  getProgressValue,
} from "../features/plant-health/utils";
import "../styles/plantHealthChecker.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function PlantHealthChecker() {
  const navigate = useNavigate();
  const [templateLoading, setTemplateLoading] = useState(true);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [plantType, setPlantType] = useState("");
  const [environment, setEnvironment] = useState("");
  const [season, setSeason] = useState(getCurrentSeason());
  const [soilState, setSoilState] = useState("");
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTemplate = async () => {
      try {
        const response = await fetch(`${API}/api/plant-health/template`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) return;

        const payload = await response.json().catch(() => ({}));
        const template = (payload?.data ?? null) as PlantHealthTemplatePayload | null;

        applyPlantHealthTemplate(template);

        if (isMounted) {
          setActiveCategory(symptomCategories[0]?.id ?? "");
          setPlantType(plantTypeOptions[0]?.id ?? "");
          setEnvironment(environmentOptions[0]?.id ?? "");
          setSoilState(soilOptions[0]?.id ?? "");
          const currentSeason = getCurrentSeason();
          const selectedSeason = seasonOptions.some((option) => option.id === currentSeason)
            ? currentSeason
            : (seasonOptions[0]?.id ?? "");
          setSeason(selectedSeason);
          setTemplateError(null);
        }
      } catch (error) {
        if (isMounted) {
          setTemplateError("Could not load checker template from database.");
        }
      } finally {
        if (isMounted) {
          setTemplateLoading(false);
        }
      }
    };

    void loadTemplate();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((previous) =>
      previous.includes(symptomId)
        ? previous.filter((symptom) => symptom !== symptomId)
        : [...previous, symptomId]
    );
  };

  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0 || diagnosisProfiles.length === 0) return;

    setAnalysis(
      analyzePlantHealth({
        selectedSymptoms,
        plantType,
        environment,
        season,
        soilState,
      })
    );
  };

  const resetChecker = () => {
    setSelectedSymptoms([]);
    setAnalysis(null);
    setActiveCategory(symptomCategories[0]?.id ?? "");
    setPlantType(plantTypeOptions[0]?.id ?? "");
    setEnvironment(environmentOptions[0]?.id ?? "");
    setSoilState(soilOptions[0]?.id ?? "");
    const currentSeason = getCurrentSeason();
    const selectedSeason = seasonOptions.some((option) => option.id === currentSeason)
      ? currentSeason
      : (seasonOptions[0]?.id ?? "");
    setSeason(selectedSeason);
  };

  const progressValue = getProgressValue(selectedSymptoms, soilState);

  return (
    <Layout>
      <div className="plant-health-page">
        <PlantHealthHero />

        {templateLoading ? (
          <section className="plant-health-checker">
            <div className="plant-health-container">
              <div className="plant-health-empty-state">
                <h3>Loading template...</h3>
                <p>Fetching plant health template from database.</p>
              </div>
            </div>
          </section>
        ) : templateError ? (
          <section className="plant-health-checker">
            <div className="plant-health-container">
              <div className="plant-health-empty-state">
                <h3>Template unavailable</h3>
                <p>{templateError}</p>
              </div>
            </div>
          </section>
        ) : analysis === null ? (
          <section className="plant-health-checker">
            <div className="plant-health-container">
              <PlantHealthSnapshotForm
                plantType={plantType}
                environment={environment}
                season={season}
                soilState={soilState}
                onPlantTypeChange={setPlantType}
                onEnvironmentChange={setEnvironment}
                onSeasonChange={setSeason}
                onSoilStateChange={setSoilState}
              />

              <PlantHealthSymptomSelector
                selectedSymptoms={selectedSymptoms}
                activeCategory={activeCategory}
                progressValue={progressValue}
                onSetActiveCategory={setActiveCategory}
                onToggleSymptom={toggleSymptom}
                onReset={resetChecker}
                onAnalyze={handleAnalyze}
              />
            </div>
          </section>
        ) : (
          <PlantHealthResults
            analysis={analysis}
            plantType={plantType}
            environment={environment}
            season={season}
            soilState={soilState}
            onBack={() => setAnalysis(null)}
            onReset={resetChecker}
            onOpenMyGarden={() => navigate("/my-garden")}
            onOpenCareTip={(tip) => navigate(`/care-tips?category=${tip}`)}
          />
        )}

        {!templateLoading && !templateError ? <PlantHealthTips /> : null}
      </div>
    </Layout>
  );
}

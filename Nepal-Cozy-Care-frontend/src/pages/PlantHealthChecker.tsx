import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PlantHealthHero from "../features/plant-health/components/PlantHealthHero";
import PlantHealthResults from "../features/plant-health/components/PlantHealthResults";
import PlantHealthSnapshotForm from "../features/plant-health/components/PlantHealthSnapshotForm";
import PlantHealthSymptomSelector from "../features/plant-health/components/PlantHealthSymptomSelector";
import PlantHealthTips from "../features/plant-health/components/PlantHealthTips";
import { getCurrentSeason } from "../features/plant-health/data";
import type { HealthAnalysis } from "../features/plant-health/types";
import {
  analyzePlantHealth,
  getProgressValue,
} from "../features/plant-health/utils";
import "../styles/plantHealthChecker.css";

export default function PlantHealthChecker() {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("leaves");
  const [plantType, setPlantType] = useState("general");
  const [environment, setEnvironment] = useState("living_room");
  const [season, setSeason] = useState(getCurrentSeason());
  const [soilState, setSoilState] = useState("unknown");
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((previous) =>
      previous.includes(symptomId)
        ? previous.filter((symptom) => symptom !== symptomId)
        : [...previous, symptomId]
    );
  };

  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0) return;

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
    setActiveCategory("leaves");
    setPlantType("general");
    setEnvironment("living_room");
    setSeason(getCurrentSeason());
    setSoilState("unknown");
  };

  const progressValue = getProgressValue(selectedSymptoms, soilState);

  return (
    <Layout>
      <div className="plant-health-page">
        <PlantHealthHero />

        {analysis === null ? (
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

        <PlantHealthTips />
      </div>
    </Layout>
  );
}

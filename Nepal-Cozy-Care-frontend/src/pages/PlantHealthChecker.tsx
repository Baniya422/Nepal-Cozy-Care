import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PlantHealthHero from "../features/plant-health/components/PlantHealthHero";
import PlantHealthSnapshotForm from "../features/plant-health/components/PlantHealthSnapshotForm";
import PlantHealthSymptomSelector from "../features/plant-health/components/PlantHealthSymptomSelector";
import PlantHealthTips from "../features/plant-health/components/PlantHealthTips";
import PlantHealthAIResults from "../features/plant-health/components/PlantHealthAIResults";
import AIPlantHealthScanner from "../components/care-tips/AIPlantHealthScanner";
import {
  applyPlantHealthTemplate,
  environmentOptions,
  getCurrentSeason,
  plantTypeOptions,
  seasonOptions,
  soilOptions,
  symptomCategories,
} from "../features/plant-health/data";
import type { PlantHealthTemplatePayload } from "../features/plant-health/types";
import { getProgressValue } from "../features/plant-health/utils";
import { diagnosePlantWithAI, type AIDiagnosisResult } from "../features/plant-health/aiEngine";
import { Sparkles, Camera, ClipboardList, Cpu, Loader2 } from "lucide-react";
import "../styles/plantHealthChecker.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function PlantHealthChecker() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<"questionnaire" | "vision">("questionnaire");
  const [templateLoading, setTemplateLoading] = useState(true);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [plantType, setPlantType] = useState("");
  const [environment, setEnvironment] = useState("");
  const [season, setSeason] = useState(getCurrentSeason());
  const [soilState, setSoilState] = useState("");

  // AI Diagnostic States
  const [aiDiagnosis, setAiDiagnosis] = useState<AIDiagnosisResult | null>(null);
  const [aiScanning, setAiScanning] = useState(false);
  const [aiScanStep, setAiScanStep] = useState("Initializing neural weights...");

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
      } catch {
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

  const handleAnalyzeWithAI = async () => {
    if (selectedSymptoms.length === 0) return;

    setAiScanning(true);
    setAiScanStep("Initializing CozyCare Bio-Neural engine...");

    const step1 = setTimeout(() => {
      setAiScanStep("Extracting morphological symptom patterns...");
    }, 350);

    const step2 = setTimeout(() => {
      setAiScanStep("Correlating Himalayan climate, humidity & soil moisture...");
    }, 750);

    const step3 = setTimeout(() => {
      setAiScanStep("Formulating emergency first aid & recovery protocol...");
    }, 1150);

    try {
      const result = await diagnosePlantWithAI({
        plantType,
        environment,
        season,
        soilState,
        selectedSymptoms,
      });

      setTimeout(() => {
        setAiDiagnosis(result);
        setAiScanning(false);
      }, 1550);
    } catch {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      setAiScanning(false);
    }
  };

  const resetChecker = () => {
    setSelectedSymptoms([]);
    setAiDiagnosis(null);
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

        {/* AI Mode Selector Tabs */}
        {!aiDiagnosis && !aiScanning && (
          <div className="ai-mode-selector-container">
            <div className="ai-mode-switcher">
              <button
                type="button"
                className={`ai-mode-btn ${activeMode === "questionnaire" ? "active" : ""}`}
                onClick={() => setActiveMode("questionnaire")}
              >
                <ClipboardList size={18} />
                <span>AI Clinical Questionnaire</span>
                <span className="ai-mode-badge">Detailed</span>
              </button>
              <button
                type="button"
                className={`ai-mode-btn ${activeMode === "vision" ? "active" : ""}`}
                onClick={() => setActiveMode("vision")}
              >
                <Camera size={18} />
                <span>Vision AI Photo Scanner</span>
                <span className="ai-mode-badge ai-mode-badge--camera">Instant Cam</span>
              </button>
            </div>
          </div>
        )}

        {/* Vision AI Mode */}
        {activeMode === "vision" && !aiDiagnosis && !aiScanning && (
          <div className="ai-vision-wrapper" style={{ padding: "0 1.5rem 3rem", maxWidth: "1200px", margin: "0 auto" }}>
            <AIPlantHealthScanner />
          </div>
        )}

        {/* Questionnaire AI Mode */}
        {activeMode === "questionnaire" && (
          <>
            {templateLoading ? (
              <section className="plant-health-checker">
                <div className="plant-health-container">
                  <div className="plant-health-empty-state">
                    <Loader2 size={32} className="spin-anim" />
                    <h3>Loading diagnostic template...</h3>
                    <p>Fetching botanical categories and parameters.</p>
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
            ) : aiScanning ? (
              /* AI Scanning Progress Screen */
              <section className="plant-health-checker ai-scanning-section">
                <div className="plant-health-container">
                  <div className="ai-scanning-card">
                    <div className="ai-scanning-neural-orb">
                      <Cpu size={48} className="ai-pulse-icon" />
                      <div className="ai-pulse-ring" />
                      <div className="ai-pulse-ring delay-1" />
                    </div>
                    <h2>Running AI Biological Diagnosis</h2>
                    <p className="ai-scanning-step-text">{aiScanStep}</p>
                    <div className="ai-scanning-progress-bar">
                      <div className="ai-scanning-progress-fill" />
                    </div>
                    <div className="ai-scanning-tags">
                      <span>✓ Specimen: {plantType || "Houseplant"}</span>
                      <span>✓ Room: {environment || "Indoor"}</span>
                      <span>✓ Soil: {soilState || "Standard"}</span>
                      <span>✓ Symptoms: {selectedSymptoms.length} selected</span>
                    </div>
                  </div>
                </div>
              </section>
            ) : aiDiagnosis === null ? (
              /* Symptom Selection & Snapshot Form */
              <section className="plant-health-checker">
                <div className="plant-health-container">
                  <div className="ai-checker-intro-strip">
                    <div className="ai-intro-badge">
                      <Sparkles size={16} />
                      <span>AI-Powered Medical Diagnosis</span>
                    </div>
                    <p>
                      Answer the environmental questions below and select all observed symptoms. Our AI model will detect the underlying condition, calculate confidence, and generate a customized prescription.
                    </p>
                  </div>

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
                    onAnalyze={handleAnalyzeWithAI}
                  />
                </div>
              </section>
            ) : (
              /* AI Diagnostic Report Results */
              <PlantHealthAIResults
                diagnosis={aiDiagnosis}
                inputSnapshot={{
                  plantType,
                  environment,
                  season,
                  soilState,
                }}
                onBack={() => setAiDiagnosis(null)}
                onReset={resetChecker}
                onOpenMyGarden={() => navigate("/my-garden")}
                onOpenCareTips={() => navigate("/care-tips")}
              />
            )}
          </>
        )}

        {!templateLoading && !templateError ? <PlantHealthTips /> : null}
      </div>
    </Layout>
  );
}

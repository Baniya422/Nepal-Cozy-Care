import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Leaf,
  Droplets,
  Sun,
  Bug,
  Thermometer,
  Wind,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Sprout,
  Shield,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import "../styles/plantHealthChecker.css";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

// Symptom categories and options
const symptomCategories = [
  {
    id: "leaves",
    name: "Leaf Problems",
    icon: <Leaf size={24} />,
    symptoms: [
      { id: "yellow_leaves", name: "Yellow Leaves", description: "Leaves turning yellow" },
      { id: "brown_tips", name: "Brown Leaf Tips", description: "Brown or crispy leaf edges" },
      { id: "drooping", name: "Drooping Leaves", description: "Leaves hanging down" },
      { id: "spots", name: "Brown/Black Spots", description: "Discolored spots on leaves" },
      { id: "curling", name: "Curling Leaves", description: "Leaves curling up or down" },
      { id: "falling", name: "Falling Leaves", description: "Leaves dropping prematurely" },
      { id: "holes", name: "Holes in Leaves", description: "Chewed or damaged leaves" },
      { id: "mold", name: "White/Powdery Coating", description: "Fuzzy or powdery substance" },
    ],
  },
  {
    id: "water",
    name: "Watering Issues",
    icon: <Droplets size={24} />,
    symptoms: [
      { id: "overwatering", name: "Overwatering", description: "Soil constantly wet, soggy" },
      { id: "underwatering", name: "Underwatering", description: "Dry soil, wilting" },
      { id: "root_rot", name: "Root Rot Signs", description: "Foul smell, mushy stems" },
      { id: "water_quality", name: "Water Quality", description: "Brown tips from tap water" },
    ],
  },
  {
    id: "light",
    name: "Light & Environment",
    icon: <Sun size={24} />,
    symptoms: [
      { id: "leggy", name: "Leggy Growth", description: "Stretched, sparse stems" },
      { id: "sunburn", name: "Sunburn", description: "Brown, crispy patches" },
      { id: "pale", name: "Pale/Light Green", description: "Loss of vibrant color" },
      { id: "no_growth", name: "No New Growth", description: "Stagnant plant" },
    ],
  },
  {
    id: "pests",
    name: "Pests & Diseases",
    icon: <Bug size={24} />,
    symptoms: [
      { id: "aphids", name: "Tiny Bugs", description: "Small insects on leaves/stems" },
      { id: "spider_mites", name: "Spider Webs", description: "Fine webbing on plant" },
      { id: "fungus_gnats", name: "Flying Insects", description: "Small flies around soil" },
      { id: "scale", name: "Sticky Spots", description: "Sticky residue on leaves" },
      { id: "mealybugs", name: "White Cottony", description: "White fuzzy patches" },
    ],
  },
  {
    id: "environment",
    name: "Temperature & Humidity",
    icon: <Thermometer size={24} />,
    symptoms: [
      { id: "cold_damage", name: "Cold Damage", description: "Blackened, mushy areas" },
      { id: "heat_stress", name: "Heat Stress", description: "Wilting in hot conditions" },
      { id: "low_humidity", name: "Low Humidity", description: "Crispy edges, browning" },
      { id: "draft", name: "Draft Sensitivity", description: "Damage near vents/AC" },
    ],
  },
];

// Diagnosis database
const diagnoses: Record<string, {
  title: string;
  severity: "low" | "medium" | "high";
  causes: string[];
  solutions: string[];
  prevention: string[];
  relatedCareTips: string[];
}> = {
  yellow_leaves: {
    title: "Yellowing Leaves",
    severity: "medium",
    causes: [
      "Overwatering - most common cause",
      "Nutrient deficiency (nitrogen)",
      "Poor drainage",
      "Natural aging (lower leaves only)",
    ],
    solutions: [
      "Check soil moisture - let top inch dry before watering",
      "Ensure pot has drainage holes",
      "Apply balanced fertilizer monthly",
      "Remove severely yellowed leaves",
    ],
    prevention: [
      "Water only when soil is dry",
      "Use well-draining potting mix",
      "Feed regularly during growing season",
    ],
    relatedCareTips: ["watering", "fertilizing"],
  },
  brown_tips: {
    title: "Brown Leaf Tips",
    severity: "low",
    causes: [
      "Low humidity",
      "Fluoride/chlorine in tap water",
      "Over-fertilization",
      "Salt buildup",
    ],
    solutions: [
      "Increase humidity with a humidifier or pebble tray",
      "Use filtered or distilled water",
      "Flush soil with water monthly",
      "Trim brown tips with clean scissors",
    ],
    prevention: [
      "Group plants to increase humidity",
      "Let tap water sit 24 hours before using",
      "Follow fertilizer instructions carefully",
    ],
    relatedCareTips: ["watering", "indoor"],
  },
  drooping: {
    title: "Drooping/Wilting",
    severity: "medium",
    causes: [
      "Underwatering",
      "Overwatering (root rot)",
      "Heat stress",
      "Transplant shock",
    ],
    solutions: [
      "Check soil - water if dry, hold if wet",
      "Move to cooler location if hot",
      "Check roots for rot if soil is wet",
      "Be patient with recently moved plants",
    ],
    prevention: [
      "Maintain consistent watering schedule",
      "Avoid extreme temperature changes",
      "Handle roots carefully when repotting",
    ],
    relatedCareTips: ["watering"],
  },
  spots: {
    title: "Leaf Spots",
    severity: "high",
    causes: [
      "Fungal infection",
      "Bacterial disease",
      "Pest damage",
      "Water on leaves",
    ],
    solutions: [
      "Remove affected leaves immediately",
      "Improve air circulation",
      "Avoid wetting leaves when watering",
      "Apply fungicide if widespread",
    ],
    prevention: [
      "Water at soil level only",
      "Space plants for airflow",
      "Clean leaves regularly",
    ],
    relatedCareTips: ["pest_control"],
  },
  overwatering: {
    title: "Overwatering",
    severity: "high",
    causes: [
      "Watering too frequently",
      "Pot without drainage",
      "Heavy soil mix",
      "Large pot for plant size",
    ],
    solutions: [
      "Stop watering immediately",
      "Check roots - trim any black/mushy ones",
      "Repot in fresh, dry soil",
      "Ensure pot has drainage holes",
    ],
    prevention: [
      "Use 'soak and dry' method",
      "Always check soil moisture first",
      "Choose appropriate pot size",
    ],
    relatedCareTips: ["watering"],
  },
  underwatering: {
    title: "Underwatering",
    severity: "medium",
    causes: [
      "Infrequent watering",
      "Small pot (dries quickly)",
      "High temperatures",
      "Low humidity",
    ],
    solutions: [
      "Water thoroughly until it drains",
      "Set watering reminders",
      "Consider self-watering pot",
      "Move away from heat sources",
    ],
    prevention: [
      "Check soil weekly",
      "Use moisture meter for accuracy",
      "Adjust schedule seasonally",
    ],
    relatedCareTips: ["watering"],
  },
  leggy: {
    title: "Leggy Growth",
    severity: "low",
    causes: [
      "Insufficient light",
      "Light source too far",
      "Excessive nitrogen",
    ],
    solutions: [
      "Move to brighter location",
      "Rotate plant regularly",
      "Prune leggy stems to encourage bushiness",
      "Consider grow lights",
    ],
    prevention: [
      "Research light needs before buying",
      "Place near brightest window",
      "Supplement with grow lights in winter",
    ],
    relatedCareTips: ["indoor", "outdoor"],
  },
  aphids: {
    title: "Aphid Infestation",
    severity: "medium",
    causes: [
      "New plants brought in",
      "Open windows/doors",
      "Over-fertilization",
    ],
    solutions: [
      "Spray with water to dislodge",
      "Apply insecticidal soap",
      "Use neem oil spray",
      "Introduce beneficial insects",
    ],
    prevention: [
      "Inspect new plants before bringing home",
      "Keep plants healthy",
      "Avoid over-fertilizing",
    ],
    relatedCareTips: ["pest_control"],
  },
  spider_mites: {
    title: "Spider Mites",
    severity: "high",
    causes: [
      "Low humidity",
      "Dry conditions",
      "Hot temperatures",
    ],
    solutions: [
      "Increase humidity immediately",
      "Spray leaves with water daily",
      "Apply miticide or neem oil",
      "Isolate affected plant",
    ],
    prevention: [
      "Mist plants regularly",
      "Keep humidity above 50%",
      "Inspect plants weekly",
    ],
    relatedCareTips: ["pest_control", "indoor"],
  },
  fungus_gnats: {
    title: "Fungus Gnats",
    severity: "low",
    causes: [
      "Overwatering",
      "Organic matter in soil",
      "Poor drainage",
    ],
    solutions: [
      "Let soil dry between waterings",
      "Use yellow sticky traps",
      "Apply hydrogen peroxide drench",
      "Top dress with sand",
    ],
    prevention: [
      "Avoid overwatering",
      "Use well-draining soil",
      "Remove dead plant material",
    ],
    relatedCareTips: ["pest_control", "watering"],
  },
  low_humidity: {
    title: "Low Humidity Stress",
    severity: "medium",
    causes: [
      "Dry indoor air",
      "Heating/AC systems",
      "Winter conditions",
    ],
    solutions: [
      "Use a humidifier",
      "Group plants together",
      "Place on pebble tray with water",
      "Mist leaves regularly",
    ],
    prevention: [
      "Choose humidity-loving plants",
      "Monitor humidity levels",
      "Keep away from vents",
    ],
    relatedCareTips: ["indoor"],
  },
  root_rot: {
    title: "Root Rot",
    severity: "high",
    causes: [
      "Prolonged overwatering",
      "Poor drainage",
      "Fungal infection",
    ],
    solutions: [
      "Remove plant from pot immediately",
      "Trim all black/mushy roots",
      "Repot in fresh, dry soil",
      "Water sparingly until recovered",
    ],
    prevention: [
      "Never let pot sit in water",
      "Ensure drainage holes",
      "Use appropriate soil mix",
    ],
    relatedCareTips: ["watering"],
  },
};

// Default diagnosis for unmapped symptoms
const defaultDiagnosis: {
  title: string;
  severity: "low" | "medium" | "high";
  causes: string[];
  solutions: string[];
  prevention: string[];
  relatedCareTips: string[];
} = {
  title: "General Plant Stress",
  severity: "medium",
  causes: [
    "Environmental stress",
    "Cultural issues",
    "Possible pest/disease",
  ],
  solutions: [
    "Inspect plant thoroughly",
    "Check watering schedule",
    "Evaluate light conditions",
    "Consider repotting if needed",
  ],
  prevention: [
    "Maintain consistent care",
    "Monitor plant regularly",
    "Research specific plant needs",
  ],
  relatedCareTips: ["indoor", "watering"],
};

export default function PlantHealthChecker() {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("leaves");
  const [showResults, setShowResults] = useState(false);
  const [diagnosis, setDiagnosis] = useState<typeof defaultDiagnosis | null>(null);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) return;

    // Find the most relevant diagnosis based on selected symptoms
    let bestMatch = defaultDiagnosis;
    let maxMatches = 0;

    for (const [key, value] of Object.entries(diagnoses)) {
      if (selectedSymptoms.includes(key)) {
        const matches = selectedSymptoms.filter((s) => s === key).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          bestMatch = value;
        }
      }
    }

    setDiagnosis(bestMatch);
    setShowResults(true);
  };

  const resetChecker = () => {
    setSelectedSymptoms([]);
    setShowResults(false);
    setDiagnosis(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "severity-low";
      case "medium":
        return "severity-medium";
      case "high":
        return "severity-high";
      default:
        return "severity-medium";
    }
  };

  const activeCategoryData = symptomCategories.find((c) => c.id === activeCategory);

  return (
    <Layout>
      <div className="plant-health-page">
        {/* Hero Section */}
        <section className="plant-health-hero">
          <div className="plant-health-hero-content">
            <div className="plant-health-hero-icon">
              <Sparkles size={48} />
            </div>
            <h1 className="plant-health-hero-title">Plant Health Checker</h1>
            <p className="plant-health-hero-subtitle">
              Select the symptoms your plant is showing, and we'll help you diagnose the problem
              and find solutions.
            </p>
          </div>
        </section>

        {!showResults ? (
          /* Symptom Selection */
          <section className="plant-health-checker">
            <div className="plant-health-container">
              {/* Progress */}
              <div className="plant-health-progress">
                <div className="plant-health-progress-bar">
                  <div
                    className="plant-health-progress-fill"
                    style={{
                      width: `${Math.min(
                        (selectedSymptoms.length / 3) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <span className="plant-health-progress-text">
                  {selectedSymptoms.length} symptom
                  {selectedSymptoms.length !== 1 ? "s" : ""} selected
                </span>
              </div>

              <div className="plant-health-layout">
                {/* Category Sidebar */}
                <aside className="plant-health-categories">
                  <h3 className="plant-health-categories-title">
                    <Search size={18} />
                    Select Category
                  </h3>
                  <div className="plant-health-category-list">
                    {symptomCategories.map((category) => (
                      <button
                        key={category.id}
                        className={`plant-health-category-btn ${
                          activeCategory === category.id ? "active" : ""
                        }`}
                        onClick={() => setActiveCategory(category.id)}
                      >
                        {category.icon}
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </aside>

                {/* Symptoms Grid */}
                <div className="plant-health-symptoms">
                  <h3 className="plant-health-symptoms-title">
                    {activeCategoryData?.icon}
                    {activeCategoryData?.name}
                  </h3>
                  <p className="plant-health-symptoms-subtitle">
                    Click on all symptoms that apply to your plant
                  </p>

                  <div className="plant-health-symptoms-grid">
                    {activeCategoryData?.symptoms.map((symptom) => (
                      <button
                        key={symptom.id}
                        className={`plant-health-symptom-card ${
                          selectedSymptoms.includes(symptom.id) ? "selected" : ""
                        }`}
                        onClick={() => toggleSymptom(symptom.id)}
                      >
                        <div className="plant-health-symptom-checkbox">
                          {selectedSymptoms.includes(symptom.id) && (
                            <CheckCircle size={20} />
                          )}
                        </div>
                        <h4 className="plant-health-symptom-name">
                          {symptom.name}
                        </h4>
                        <p className="plant-health-symptom-desc">
                          {symptom.description}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Selected Symptoms Summary */}
                  {selectedSymptoms.length > 0 && (
                    <div className="plant-health-selected">
                      <h4 className="plant-health-selected-title">
                        Selected Symptoms:
                      </h4>
                      <div className="plant-health-selected-list">
                        {selectedSymptoms.map((symptomId) => {
                          const symptom = symptomCategories
                            .flatMap((c) => c.symptoms)
                            .find((s) => s.id === symptomId);
                          return (
                            <span
                              key={symptomId}
                              className="plant-health-selected-tag"
                              onClick={() => toggleSymptom(symptomId)}
                            >
                              {symptom?.name}
                              <span className="remove">×</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="plant-health-actions">
                    <button
                      className="plant-health-btn plant-health-btn-secondary"
                      onClick={resetChecker}
                    >
                      <RefreshCw size={16} />
                      Reset
                    </button>
                    <button
                      className="plant-health-btn plant-health-btn-primary"
                      onClick={analyzeSymptoms}
                      disabled={selectedSymptoms.length === 0}
                    >
                      Analyze Symptoms
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* Results Section */
          <section className="plant-health-results">
            <div className="plant-health-container">
              {/* Back Button */}
              <button
                className="plant-health-back-btn"
                onClick={() => setShowResults(false)}
              >
                ← Back to Symptom Selection
              </button>

              {/* Diagnosis Card */}
              <div className="plant-health-diagnosis-card">
                <div className="plant-health-diagnosis-header">
                  <div>
                    <h2 className="plant-health-diagnosis-title">
                      <Shield size={28} />
                      Diagnosis: {diagnosis?.title}
                    </h2>
                    <span
                      className={`plant-health-severity ${getSeverityColor(
                        diagnosis?.severity || "medium"
                      )}`}
                    >
                      Severity: {diagnosis?.severity}
                    </span>
                  </div>
                </div>

                {/* Causes */}
                <div className="plant-health-section">
                  <h3 className="plant-health-section-title">
                    <AlertCircle size={20} />
                    Likely Causes
                  </h3>
                  <ul className="plant-health-list">
                    {diagnosis?.causes.map((cause, index) => (
                      <li key={index}>{cause}</li>
                    ))}
                  </ul>
                </div>

                {/* Solutions */}
                <div className="plant-health-section">
                  <h3 className="plant-health-section-title">
                    <Sprout size={20} />
                    Recommended Solutions
                  </h3>
                  <ul className="plant-health-list plant-health-list-solutions">
                    {diagnosis?.solutions.map((solution, index) => (
                      <li key={index}>{solution}</li>
                    ))}
                  </ul>
                </div>

                {/* Prevention */}
                <div className="plant-health-section">
                  <h3 className="plant-health-section-title">
                    <Shield size={20} />
                    Prevention Tips
                  </h3>
                  <ul className="plant-health-list">
                    {diagnosis?.prevention.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Related Care Tips */}
                <div className="plant-health-related">
                  <h3 className="plant-health-section-title">
                    <HelpCircle size={20} />
                    Learn More
                  </h3>
                  <div className="plant-health-related-links">
                    {diagnosis?.relatedCareTips.map((tip) => (
                      <button
                        key={tip}
                        className="plant-health-related-link"
                        onClick={() => navigate(`/care-tips?category=${tip}`)}
                      >
                        View {tip.replace("_", " ")} tips
                        <ArrowRight size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Over */}
              <div className="plant-health-start-over">
                <p>Not quite right? Try selecting different symptoms.</p>
                <button
                  className="plant-health-btn plant-health-btn-secondary"
                  onClick={resetChecker}
                >
                  <RefreshCw size={16} />
                  Start Over
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tips Section */}
        <section className="plant-health-tips">
          <div className="plant-health-container">
            <h2 className="plant-health-tips-title">General Plant Care Tips</h2>
            <div className="plant-health-tips-grid">
              <div className="plant-health-tip-card">
                <div className="plant-health-tip-icon">
                  <Droplets size={24} />
                </div>
                <h3>Water Wisely</h3>
                <p>Most plants die from overwatering. Check soil moisture before watering.</p>
              </div>
              <div className="plant-health-tip-card">
                <div className="plant-health-tip-icon">
                  <Sun size={24} />
                </div>
                <h3>Right Light</h3>
                <p>Match your plant to the available light. When in doubt, go brighter.</p>
              </div>
              <div className="plant-health-tip-card">
                <div className="plant-health-tip-icon">
                  <Wind size={24} />
                </div>
                <h3>Airflow Matters</h3>
                <p>Good air circulation prevents fungal diseases and pests.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

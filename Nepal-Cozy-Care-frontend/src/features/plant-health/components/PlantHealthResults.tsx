import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock3,
  HelpCircle,
  RefreshCw,
  Shield,
  Sprout,
} from "lucide-react";
import {
  environmentOptions,
  plantTypeOptions,
  seasonOptions,
  soilOptions,
} from "../data";
import type { HealthAnalysis } from "../types";
import {
  getActionWindow,
  getOptionLabel,
  getSeverityColor,
  getSymptomName,
  titleCase,
} from "../utils";

type PlantHealthResultsProps = {
  analysis: HealthAnalysis;
  plantType: string;
  environment: string;
  season: string;
  soilState: string;
  onBack: () => void;
  onReset: () => void;
  onOpenMyGarden: () => void;
  onOpenCareTip: (tip: string) => void;
};

export default function PlantHealthResults({
  analysis,
  plantType,
  environment,
  season,
  soilState,
  onBack,
  onReset,
  onOpenMyGarden,
  onOpenCareTip,
}: PlantHealthResultsProps) {
  const primaryDiagnosis = analysis.primary;

  return (
    <section className="plant-health-results">
      <div className="plant-health-container">
        <button type="button" className="plant-health-back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to Symptom Selection
        </button>

        <div className="plant-health-results-grid">
          <div className="plant-health-diagnosis-card">
            <div className="plant-health-diagnosis-header">
              <div>
                <h2 className="plant-health-diagnosis-title">
                  <Shield size={28} />
                  {primaryDiagnosis.title}
                </h2>
                <p className="plant-health-diagnosis-summary">{primaryDiagnosis.summary}</p>
                <div className="plant-health-diagnosis-badges">
                  <span
                    className={`plant-health-severity ${getSeverityColor(
                      primaryDiagnosis.severity
                    )}`}
                  >
                    Severity: {primaryDiagnosis.severity}
                  </span>
                  <span className="plant-health-confidence">
                    Confidence: {primaryDiagnosis.confidence}%
                  </span>
                </div>
              </div>

              <div className="plant-health-meta-grid">
                <div className="plant-health-meta-card">
                  <span>Time To Act</span>
                  <strong>{getActionWindow(primaryDiagnosis.severity)}</strong>
                </div>
                <div className="plant-health-meta-card">
                  <span>Matched Symptoms</span>
                  <strong>{primaryDiagnosis.matchedSymptoms.length}</strong>
                </div>
              </div>
            </div>

            <div className="plant-health-urgent-actions">
              <h3 className="plant-health-section-title">
                <Clock3 size={20} />
                Immediate Actions
              </h3>
              <div className="plant-health-action-grid">
                {primaryDiagnosis.immediateActions.map((action, index) => (
                  <div key={index} className="plant-health-action-card">
                    <span>0{index + 1}</span>
                    <p>{action}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="plant-health-section">
              <h3 className="plant-health-section-title">
                <HelpCircle size={20} />
                Matched Symptoms
              </h3>
              <div className="plant-health-matched-tags">
                {primaryDiagnosis.matchedSymptoms.map((symptomId) => (
                  <span key={symptomId} className="plant-health-matched-tag">
                    {getSymptomName(symptomId)}
                  </span>
                ))}
              </div>
            </div>

            <div className="plant-health-section">
              <h3 className="plant-health-section-title">
                <AlertCircle size={20} />
                Likely Causes
              </h3>
              <ul className="plant-health-list">
                {primaryDiagnosis.causes.map((cause, index) => (
                  <li key={index}>{cause}</li>
                ))}
              </ul>
            </div>

            <div className="plant-health-section">
              <h3 className="plant-health-section-title">
                <Sprout size={20} />
                Recommended Solutions
              </h3>
              <ul className="plant-health-list plant-health-list-solutions">
                {primaryDiagnosis.solutions.map((solution, index) => (
                  <li key={index}>{solution}</li>
                ))}
              </ul>
            </div>

            <div className="plant-health-section">
              <h3 className="plant-health-section-title">
                <Shield size={20} />
                Prevention Tips
              </h3>
              <ul className="plant-health-list">
                {primaryDiagnosis.prevention.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="plant-health-related">
              <h3 className="plant-health-section-title">
                <HelpCircle size={20} />
                Learn More
              </h3>
              <div className="plant-health-related-links">
                {primaryDiagnosis.relatedCareTips.map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    className="plant-health-related-link"
                    onClick={() => onOpenCareTip(tip)}
                  >
                    View {titleCase(tip)} Tips
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="plant-health-sidebar">
            <div className="plant-health-sidebar-card">
              <h3>Plant Snapshot</h3>
              <ul className="plant-health-sidebar-list">
                <li>
                  <span>Plant Type</span>
                  <strong>{getOptionLabel(plantTypeOptions, plantType)}</strong>
                </li>
                <li>
                  <span>Room</span>
                  <strong>{getOptionLabel(environmentOptions, environment)}</strong>
                </li>
                <li>
                  <span>Season</span>
                  <strong>{getOptionLabel(seasonOptions, season)}</strong>
                </li>
                <li>
                  <span>Soil</span>
                  <strong>{getOptionLabel(soilOptions, soilState)}</strong>
                </li>
              </ul>
            </div>

            {analysis.alternatives.length > 0 ? (
              <div className="plant-health-sidebar-card">
                <h3>Also Consider</h3>
                <div className="plant-health-alternatives">
                  {analysis.alternatives.map((alternative) => (
                    <div key={alternative.id} className="plant-health-alternative-card">
                      <strong>{alternative.title}</strong>
                      <p>{alternative.summary}</p>
                      <span>{alternative.confidence}% confidence</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="plant-health-sidebar-card">
              <h3>Next Step</h3>
              <p>
                If you want to keep tracking the plant after diagnosis, continue into My Garden
                and build a real care routine.
              </p>
              <div className="plant-health-sidebar-actions">
                <button
                  type="button"
                  className="plant-health-btn plant-health-btn-primary"
                  onClick={onOpenMyGarden}
                >
                  Open My Garden
                </button>
                <button
                  type="button"
                  className="plant-health-btn plant-health-btn-secondary"
                  onClick={onReset}
                >
                  <RefreshCw size={16} />
                  Start Over
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

import { ArrowRight, CheckCircle2, RefreshCw, Search } from "lucide-react";
import { symptomCategories } from "../data";
import { getSymptomName } from "../utils";

type PlantHealthSymptomSelectorProps = {
  selectedSymptoms: string[];
  activeCategory: string;
  progressValue: number;
  onSetActiveCategory: (categoryId: string) => void;
  onToggleSymptom: (symptomId: string) => void;
  onReset: () => void;
  onAnalyze: () => void;
};

export default function PlantHealthSymptomSelector({
  selectedSymptoms,
  activeCategory,
  progressValue,
  onSetActiveCategory,
  onToggleSymptom,
  onReset,
  onAnalyze,
}: PlantHealthSymptomSelectorProps) {
  const activeCategoryData = symptomCategories.find((category) => category.id === activeCategory);
  const ActiveCategoryIcon = activeCategoryData?.icon ?? null;

  return (
    <>
      <div className="plant-health-progress">
        <div className="plant-health-progress-bar">
          <div className="plant-health-progress-fill" style={{ width: `${progressValue}%` }} />
        </div>
        <span className="plant-health-progress-text">
          {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? "s" : ""} selected
          with context-aware analysis ready
        </span>
      </div>

      <div className="plant-health-layout">
        <aside className="plant-health-categories">
          <h3 className="plant-health-categories-title">
            <Search size={18} />
            Symptom Categories
          </h3>
          <div className="plant-health-category-list">
            {symptomCategories.map((category) => {
              const CategoryIcon = category.icon;
              const selectedCount = category.symptoms.filter((symptom) =>
                selectedSymptoms.includes(symptom.id)
              ).length;

              return (
                <button
                  key={category.id}
                  type="button"
                  className={`plant-health-category-btn ${
                    activeCategory === category.id ? "active" : ""
                  }`}
                  onClick={() => onSetActiveCategory(category.id)}
                >
                  <div className="plant-health-category-btn-copy">
                    <CategoryIcon size={18} />
                    <span>{category.name}</span>
                  </div>
                  {selectedCount > 0 ? (
                    <span className="plant-health-category-count">{selectedCount}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="plant-health-symptoms">
          <h3 className="plant-health-symptoms-title">
            {ActiveCategoryIcon ? <ActiveCategoryIcon size={22} /> : null}
            {activeCategoryData?.name}
          </h3>
          <p className="plant-health-symptoms-subtitle">
            Choose every symptom that matches what you can actually see on the plant.
          </p>

          <div className="plant-health-symptoms-grid">
            {activeCategoryData?.symptoms.map((symptom) => (
              <button
                key={symptom.id}
                type="button"
                className={`plant-health-symptom-card ${
                  selectedSymptoms.includes(symptom.id) ? "selected" : ""
                }`}
                onClick={() => onToggleSymptom(symptom.id)}
              >
                <div className="plant-health-symptom-checkbox">
                  {selectedSymptoms.includes(symptom.id) ? <CheckCircle2 size={20} /> : null}
                </div>
                <h4 className="plant-health-symptom-name">{symptom.name}</h4>
                <p className="plant-health-symptom-desc">{symptom.description}</p>
              </button>
            ))}
          </div>

          {selectedSymptoms.length > 0 ? (
            <div className="plant-health-selected">
              <h4 className="plant-health-selected-title">Selected Symptoms</h4>
              <div className="plant-health-selected-list">
                {selectedSymptoms.map((symptomId) => (
                  <button
                    key={symptomId}
                    type="button"
                    className="plant-health-selected-tag"
                    onClick={() => onToggleSymptom(symptomId)}
                  >
                    {getSymptomName(symptomId)}
                    <span className="remove">x</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="plant-health-actions">
            <button
              type="button"
              className="plant-health-btn plant-health-btn-secondary"
              onClick={onReset}
            >
              <RefreshCw size={16} />
              Reset
            </button>
            <button
              type="button"
              className="plant-health-btn plant-health-btn-primary"
              onClick={onAnalyze}
              disabled={selectedSymptoms.length === 0}
            >
              Analyze Symptoms
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState, type FormEvent } from "react";
import {
  Home,
  Sun,
  Compass,
  Droplets,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Check,
} from "lucide-react";
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
  showResults,
  onSubmit,
  onStartOver,
  onRoomChange,
  onLightChange,
  onExperienceChange,
  onLocationChange,
  onFieldFocus,
}: PlantFinderQuizFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Room choices
  const roomCards: { value: RoomKey; label: string; desc: string; icon: string }[] = [
    { value: "living-room", label: "Living Room", desc: "Statement foliage & social space", icon: "🛋️" },
    { value: "bedroom", label: "Bedroom", desc: "Calm vibes & nighttime air purification", icon: "🛏️" },
    { value: "office", label: "Home Office", desc: "Desk companions that reduce stress", icon: "💻" },
    { value: "balcony", label: "Balcony / Terrace", desc: "Sun-loving greens & fresh air", icon: "🌿" },
    { value: "kitchen", label: "Kitchen", desc: "Compact plants that love warm ambient air", icon: "🍳" },
    { value: "bathroom", label: "Bathroom", desc: "Lush tropicals that adore shower humidity", icon: "🚿" },
  ];

  // Step 2: Light choices
  const lightCards: { value: LightKey; label: string; desc: string; icon: string }[] = [
    { value: "bright-light", label: "Bright Indirect", desc: "Close to a sunny window without harsh burning rays", icon: "☀️" },
    { value: "medium-light", label: "Medium Light", desc: "A few feet away from a window; soft ambient light", icon: "⛅" },
    { value: "low-light", label: "Low Light", desc: "Dim inner room, corridor, or north-facing window", icon: "🌙" },
    { value: "indirect-light", label: "Direct Sunlight", desc: "Unobstructed rays on a sunny sill or open terrace", icon: "🌤️" },
  ];

  // Step 3: Experience choices
  const expCards: { value: ExperienceKey; label: string; desc: string; icon: string }[] = [
    { value: "beginner", label: "Beginner Friendly", desc: "Nearly indestructible; forgives occasional neglect", icon: "🌱" },
    { value: "intermediate", label: "Moderate Care", desc: "Enjoys regular weekly watering and feeding", icon: "🪴" },
    { value: "expert", label: "Green Thumb Enthusiast", desc: "Excited to prune, train, and calibrate humidity", icon: "🌿" },
  ];

  // Step 4: Location / Humidity choices
  const humidityCards: { value: LocationKey; label: string; desc: string; icon: string }[] = [
    { value: "normal", label: "Normal Humidity", desc: "Typical Kathmandu room moisture levels", icon: "🍃" },
    { value: "humid", label: "High Humidity", desc: "Bathrooms, monsoon-heavy rooms, misted corners", icon: "💧" },
    { value: "dry", label: "Drier Air", desc: "Air-conditioned rooms or winter heaters", icon: "🌵" },
  ];

  const handleStepSelect = <T extends string>(
    setter: (v: T) => void,
    val: T,
    field: ActiveField,
    nextStep?: number
  ) => {
    setter(val);
    onFieldFocus(field);
    if (nextStep && nextStep <= 4) {
      setCurrentStep(nextStep);
    }
  };

  return (
    <div className="plantfinder-quiz-content pf-stepper-shell">
      <div className="pf-quiz-header">
        <div className="pf-kicker-pill">
          <Sparkles size={14} />
          <span>Interactive Plant Matchmaker</span>
        </div>
        <h1 className="plantfinder-title">Find Your Perfect Green Match</h1>
        <p className="pf-quiz-subtitle">
          Answer 4 quick lifestyle questions and our smart algorithm will curate the exact houseplants that will thrive in your home.
        </p>

        {/* Step Indicator Tabs */}
        <div className="pf-step-tabs">
          <button
            type="button"
            className={`pf-step-tab ${currentStep === 1 ? "active" : ""} ${selections.room ? "completed" : ""}`}
            onClick={() => {
              setCurrentStep(1);
              onFieldFocus("room");
            }}
          >
            <span className="pf-tab-num">{selections.room ? <Check size={12} /> : "1"}</span>
            <span className="pf-tab-label"><Home size={13} /> Room</span>
          </button>
          <button
            type="button"
            className={`pf-step-tab ${currentStep === 2 ? "active" : ""} ${selections.light ? "completed" : ""}`}
            onClick={() => {
              setCurrentStep(2);
              onFieldFocus("light");
            }}
          >
            <span className="pf-tab-num">{selections.light ? <Check size={12} /> : "2"}</span>
            <span className="pf-tab-label"><Sun size={13} /> Light</span>
          </button>
          <button
            type="button"
            className={`pf-step-tab ${currentStep === 3 ? "active" : ""} ${selections.experience ? "completed" : ""}`}
            onClick={() => {
              setCurrentStep(3);
              onFieldFocus("experience");
            }}
          >
            <span className="pf-tab-num">{selections.experience ? <Check size={12} /> : "3"}</span>
            <span className="pf-tab-label"><Compass size={13} /> Routine</span>
          </button>
          <button
            type="button"
            className={`pf-step-tab ${currentStep === 4 ? "active" : ""} ${selections.location ? "completed" : ""}`}
            onClick={() => {
              setCurrentStep(4);
              onFieldFocus("location");
            }}
          >
            <span className="pf-tab-num">{selections.location ? <Check size={12} /> : "4"}</span>
            <span className="pf-tab-label"><Droplets size={13} /> Moisture</span>
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="pf-stepper-form">
        {/* STEP 1: ROOM */}
        {currentStep === 1 && (
          <div className="pf-step-panel">
            <div className="pf-step-heading">
              <span className="pf-step-badge">Step 1 of 4</span>
              <h2>Where will your plant live?</h2>
              <p>Pick the room so we match proper growth habit and air flow.</p>
            </div>
            <div className="pf-cards-grid pf-grid-3">
              {roomCards.map((c) => (
                <div
                  key={c.value}
                  className={`pf-choice-card ${selections.room === c.value ? "selected" : ""}`}
                  onClick={() => handleStepSelect(onRoomChange, c.value, "room", 2)}
                >
                  <span className="pf-choice-icon">{c.icon}</span>
                  <h4>{c.label}</h4>
                  <p>{c.desc}</p>
                  {selections.room === c.value && (
                    <span className="pf-choice-checked"><Check size={14} /></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: LIGHT */}
        {currentStep === 2 && (
          <div className="pf-step-panel">
            <div className="pf-step-heading">
              <span className="pf-step-badge">Step 2 of 4</span>
              <h2>How much natural sunlight does that spot receive?</h2>
              <p>Light is plant food. Matching photons is key to vibrant leaves.</p>
            </div>
            <div className="pf-cards-grid pf-grid-2">
              {lightCards.map((c) => (
                <div
                  key={c.value}
                  className={`pf-choice-card ${selections.light === c.value ? "selected" : ""}`}
                  onClick={() => handleStepSelect(onLightChange, c.value, "light", 3)}
                >
                  <span className="pf-choice-icon">{c.icon}</span>
                  <h4>{c.label}</h4>
                  <p>{c.desc}</p>
                  {selections.light === c.value && (
                    <span className="pf-choice-checked"><Check size={14} /></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: EXPERIENCE */}
        {currentStep === 3 && (
          <div className="pf-step-panel">
            <div className="pf-step-heading">
              <span className="pf-step-badge">Step 3 of 4</span>
              <h2>What is your care experience & schedule?</h2>
              <p>Be honest—we have plants that thrive even if you forget to water!</p>
            </div>
            <div className="pf-cards-grid pf-grid-3">
              {expCards.map((c) => (
                <div
                  key={c.value}
                  className={`pf-choice-card ${selections.experience === c.value ? "selected" : ""}`}
                  onClick={() => handleStepSelect(onExperienceChange, c.value, "experience", 4)}
                >
                  <span className="pf-choice-icon">{c.icon}</span>
                  <h4>{c.label}</h4>
                  <p>{c.desc}</p>
                  {selections.experience === c.value && (
                    <span className="pf-choice-checked"><Check size={14} /></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: HUMIDITY */}
        {currentStep === 4 && (
          <div className="pf-step-panel">
            <div className="pf-step-heading">
              <span className="pf-step-badge">Step 4 of 4</span>
              <h2>What is the room's moisture & atmosphere?</h2>
              <p>Helps us pick between tropical mist lovers and desert succulents.</p>
            </div>
            <div className="pf-cards-grid pf-grid-3">
              {humidityCards.map((c) => (
                <div
                  key={c.value}
                  className={`pf-choice-card ${selections.location === c.value ? "selected" : ""}`}
                  onClick={() => handleStepSelect(onLocationChange, c.value, "location")}
                >
                  <span className="pf-choice-icon">{c.icon}</span>
                  <h4>{c.label}</h4>
                  <p>{c.desc}</p>
                  {selections.location === c.value && (
                    <span className="pf-choice-checked"><Check size={14} /></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation & Submit Bar */}
        <div className="pf-stepper-footer">
          <div className="pf-nav-left">
            {currentStep > 1 && (
              <button
                type="button"
                className="pf-btn-secondary"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            {showResults && (
              <button
                type="button"
                className="pf-btn-reset"
                onClick={() => {
                  setCurrentStep(1);
                  onStartOver();
                }}
              >
                <RotateCcw size={14} /> Start Over
              </button>
            )}
          </div>

          <div className="pf-nav-right">
            {currentStep < 4 ? (
              <button
                type="button"
                className="pf-btn-next"
                onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
              >
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" className="pf-btn-submit">
                <Sparkles size={16} />
                Meet Your Perfect Matches
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

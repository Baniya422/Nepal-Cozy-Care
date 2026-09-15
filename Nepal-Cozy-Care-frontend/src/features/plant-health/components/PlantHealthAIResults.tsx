import { useState, useRef, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Activity,
  ArrowLeft,
  Sparkles,
  Bot,
  Send,
  Calendar,
  AlertTriangle,
  FileText,
  Stethoscope,
  Share2,
  BookmarkCheck,
  CheckCircle2,
} from "lucide-react";
import type { AIDiagnosisResult } from "../aiEngine";
import { askAIPlantDoctor } from "../aiEngine";

interface PlantHealthAIResultsProps {
  diagnosis: AIDiagnosisResult;
  inputSnapshot: {
    plantType: string;
    environment: string;
    season: string;
    soilState: string;
  };
  onBack: () => void;
  onReset: () => void;
  onOpenMyGarden: () => void;
  onOpenCareTips: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function PlantHealthAIResults({
  diagnosis,
  inputSnapshot,
  onBack,
  onReset,
  onOpenMyGarden,
  onOpenCareTips,
}: PlantHealthAIResultsProps) {
  const [copied, setCopied] = useState(false);
  const [savedToGarden, setSavedToGarden] = useState(false);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "initial-msg",
      sender: "ai",
      text: `Hello! I have analyzed your plant case (**${diagnosis.conditionTitle}**). You can ask me any follow-up questions about pruning, watering frequency, organic remedies, or repotting steps.`,
      time: "Just now",
    },
  ]);
  const [userQuery, setUserQuery] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAsking]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || userQuery).trim();
    if (!textToSend || isAsking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setUserQuery("");
    setIsAsking(true);

    try {
      const response = await askAIPlantDoctor(textToSend, diagnosis);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: "I recommend closely following the Emergency Protocol outlined above. If symptoms persist for more than 5 days, please upload a direct photo using our AI Photo Scanner.",
        time: "Just now",
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveToGarden = () => {
    setSavedToGarden(true);
    setTimeout(() => {
      onOpenMyGarden();
    }, 1200);
  };

  const formatWord = (str: string) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "high":
        return "ai-badge-high";
      case "medium":
        return "ai-badge-medium";
      default:
        return "ai-badge-low";
    }
  };

  return (
    <section className="plant-health-results ai-results-wrapper">
      <div className="plant-health-container">
        {/* Navigation & Action Bar */}
        <div className="ai-results-nav-bar">
          <button type="button" className="plant-health-back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            Back to Symptom Questionnaire
          </button>
          <div className="ai-results-quick-actions">
            <button
              type="button"
              className="ai-action-chip-btn"
              onClick={handleShare}
              title="Copy diagnosis link"
            >
              <Share2 size={16} />
              <span>{copied ? "Link Copied!" : "Share Case"}</span>
            </button>
            <button
              type="button"
              className="ai-action-chip-btn ai-action-chip-btn--primary"
              onClick={handleSaveToGarden}
              disabled={savedToGarden}
            >
              {savedToGarden ? <CheckCircle2 size={16} /> : <BookmarkCheck size={16} />}
              <span>{savedToGarden ? "Saved to Garden!" : "Save Case to My Garden"}</span>
            </button>
          </div>
        </div>

        {/* AI Medical Diagnosis Header Card */}
        <div className="ai-diagnosis-card">
          <div className="ai-diagnosis-card-top">
            <div className="ai-diagnosis-header-left">
              <div className="ai-engine-chip">
                <Sparkles size={16} />
                <span>CozyCare Bio-Neural ML Engine • Clinical Case Report</span>
              </div>
              <h1 className="ai-condition-title">{diagnosis.conditionTitle}</h1>
              <div className="ai-taxonomy-row">
                <span className="ai-scientific-pill">
                  <Stethoscope size={14} />
                  <em>{diagnosis.scientificPathogen}</em>
                </span>
                <span className="ai-category-pill">{diagnosis.category}</span>
                <span className={`ai-severity-badge ${getSeverityBadgeClass(diagnosis.severity)}`}>
                  {diagnosis.severity === "high" ? (
                    <ShieldAlert size={14} />
                  ) : diagnosis.severity === "medium" ? (
                    <AlertTriangle size={14} />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  Severity: {diagnosis.severity.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="ai-diagnosis-header-metrics">
              <div className="ai-metric-gauge">
                <div className="ai-gauge-circle">
                  <span className="ai-gauge-number">{diagnosis.confidence}%</span>
                  <span className="ai-gauge-label">AI Confidence</span>
                </div>
              </div>
              <div className="ai-time-to-act-card">
                <Clock size={16} />
                <div>
                  <small>Intervention Window</small>
                  <strong>{diagnosis.timeToAct}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Plant Snapshot Context Strip */}
          <div className="ai-snapshot-context-strip">
            <div className="ai-context-item">
              <span className="ai-context-label">Plant Specimen:</span>
              <strong className="ai-context-val">{formatWord(inputSnapshot.plantType)}</strong>
            </div>
            <div className="ai-context-item">
              <span className="ai-context-label">Micro-Environment:</span>
              <strong className="ai-context-val">{formatWord(inputSnapshot.environment)}</strong>
            </div>
            <div className="ai-context-item">
              <span className="ai-context-label">Active Season:</span>
              <strong className="ai-context-val">{formatWord(inputSnapshot.season)}</strong>
            </div>
            <div className="ai-context-item">
              <span className="ai-context-label">Soil Condition:</span>
              <strong className="ai-context-val">{formatWord(inputSnapshot.soilState)}</strong>
            </div>
            <div className="ai-context-item">
              <span className="ai-context-label">Symptoms Analyzed:</span>
              <strong className="ai-context-val">{diagnosis.matchedSymptoms.length} indicators</strong>
            </div>
          </div>

          {/* Clinical Case Study Breakdown */}
          <div className="ai-case-study-section">
            <div className="ai-section-heading">
              <Activity size={20} />
              <h3>AI Pathophysiological Case Study</h3>
            </div>
            <p className="ai-case-study-body">{diagnosis.caseStudy}</p>
          </div>
        </div>

        {/* Emergency First Aid Actions */}
        <div className="ai-protocol-section">
          <div className="ai-protocol-header">
            <div className="ai-section-heading">
              <AlertTriangle size={22} className="ai-alert-icon" />
              <div>
                <h3>Emergency First Aid Protocol</h3>
                <p>Execute these 4 priority steps immediately to prevent irreversible tissue necrosis.</p>
              </div>
            </div>
          </div>
          <div className="ai-actions-grid">
            {diagnosis.emergencyActions.map((action, idx) => (
              <div key={idx} className="ai-action-step-card">
                <div className="ai-step-badge">Step 0{idx + 1}</div>
                <p className="ai-step-text">{action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Medicinal & Organic Prescriptions */}
        {diagnosis.medicinalRemedies.length > 0 && (
          <div className="ai-protocol-section">
            <div className="ai-protocol-header">
              <div className="ai-section-heading">
                <Stethoscope size={22} className="ai-med-icon" />
                <div>
                  <h3>Targeted Medicinal & Organic Prescriptions</h3>
                  <p>Recommended botanical treatments, organic emulsions, and exact application ratios.</p>
                </div>
              </div>
            </div>
            <div className="ai-remedies-grid">
              {diagnosis.medicinalRemedies.map((med, idx) => (
                <div key={idx} className="ai-remedy-card">
                  <div className="ai-remedy-header">
                    <h4>{med.name}</h4>
                  </div>
                  <div className="ai-remedy-details">
                    <div className="ai-remedy-row">
                      <span>Dosage / Mix:</span>
                      <strong>{med.dosage}</strong>
                    </div>
                    <div className="ai-remedy-row">
                      <span>Frequency:</span>
                      <strong>{med.frequency}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 14-Day Recovery Roadmap */}
        <div className="ai-protocol-section">
          <div className="ai-protocol-header">
            <div className="ai-section-heading">
              <Calendar size={22} className="ai-cal-icon" />
              <div>
                <h3>14-Day Botanical Recovery Timeline</h3>
                <p>Phase-by-phase cellular healing milestones and moisture adjustment schedule.</p>
              </div>
            </div>
          </div>
          <div className="ai-timeline-grid">
            {diagnosis.recoveryTimeline.map((item, idx) => (
              <div key={idx} className="ai-timeline-card">
                <div className="ai-timeline-phase-title">{item.phase}</div>
                <p className="ai-timeline-instruction">{item.instruction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive "Ask Cozy AI Plant Doctor" Chat Widget */}
        <div className="ai-doctor-chat-card">
          <div className="ai-doctor-chat-header">
            <div className="ai-doctor-avatar">
              <Bot size={24} />
            </div>
            <div>
              <h3>Ask Cozy AI Plant Doctor</h3>
              <p>Ask follow-up questions about this specific diagnosis, pruning, or custom care.</p>
            </div>
          </div>

          <div className="ai-chat-quick-suggestions">
            <button
              type="button"
              className="ai-suggestion-chip"
              onClick={() => handleSendMessage("Should I prune the yellow leaves right now?")}
            >
              ✂️ Can I prune the yellow leaves?
            </button>
            <button
              type="button"
              className="ai-suggestion-chip"
              onClick={() => handleSendMessage("How should I adjust my watering schedule now?")}
            >
              💧 How often to water during recovery?
            </button>
            <button
              type="button"
              className="ai-suggestion-chip"
              onClick={() => handleSendMessage("Is repotting urgently required?")}
            >
              🪴 Is repotting urgent?
            </button>
            <button
              type="button"
              className="ai-suggestion-chip"
              onClick={() => handleSendMessage("Can I apply fertilizer now?")}
            >
              🌱 Can I apply fertilizer?
            </button>
          </div>

          <div className="ai-chat-messages-box">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`ai-chat-bubble-row ${msg.sender}`}>
                <div className={`ai-chat-bubble ${msg.sender}`}>
                  <p>{msg.text}</p>
                  <span className="ai-chat-time">{msg.time}</span>
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="ai-chat-bubble-row ai">
                <div className="ai-chat-bubble ai ai-chat-typing">
                  <span>AI Botanist is reviewing clinical profile...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            className="ai-chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendMessage();
            }}
          >
            <input
              type="text"
              placeholder="Ask a question about this diagnosis (e.g. 'Can I keep it on my balcony?')..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              disabled={isAsking}
            />
            <button type="submit" disabled={!userQuery.trim() || isAsking} aria-label="Send query">
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Bottom Navigation */}
        <div className="ai-bottom-action-strip">
          <button
            type="button"
            className="ai-action-chip-btn"
            onClick={onReset}
            style={{ padding: "0.75rem 1.4rem", fontSize: "0.92rem" }}
          >
            Start New Diagnosis
          </button>
          <button
            type="button"
            className="ai-action-chip-btn ai-action-chip-btn--primary"
            onClick={onOpenCareTips}
            style={{ padding: "0.75rem 1.5rem", fontSize: "0.92rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            <FileText size={18} />
            Explore Full Care Guides & Remedies
          </button>
        </div>
      </div>
    </section>
  );
}

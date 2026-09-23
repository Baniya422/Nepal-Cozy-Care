import { Stethoscope, Plus, Trash2 } from "lucide-react";
import {
  EditorCard,
  FormInput,
  PageEditorShell,
  usePageContentEditor,
} from "../page-editors/EditorShared";

export default function ManagePlantHealthAdmin() {
  const {
    payload,
    loading,
    saving,
    statusMessage,
    handleFieldChange,
    handleArrayItemChange,
    handleAddArrayItem,
    handleRemoveArrayItem,
    handleSave,
  } = usePageContentEditor({
    pageKey: "plant_health",
    pageName: "Plant Health Doctor",
    pageUrl: "/plant-health-checker",
  });

  const categories = Array.isArray(payload.symptom_categories) ? payload.symptom_categories : [];
  const healthyHabits = Array.isArray(payload.healthy_plant_habits) ? payload.healthy_plant_habits : [];

  return (
    <PageEditorShell
      title="Plant Health Doctor Configuration"
      subtitle="Configure plant diagnosis symptoms, leaf issue categories, healthy habits, and default triage advice."
      icon={Stethoscope}
      pageUrl="/plant-health-checker"
      saving={saving}
      loading={loading}
      statusMessage={statusMessage}
      onSave={handleSave}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Symptom Categories */}
        <EditorCard title="Diagnostic Symptom Categories" description="Symptom groups like Yellow Leaves, Drooping, Pests, and Browning." badge={`${categories.length} Categories`}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {categories.map((cat: any, cIdx: number) => {
              const symptoms = Array.isArray(cat.symptoms) ? cat.symptoms : [];
              return (
                <div
                  key={cIdx}
                  style={{
                    background: "#f8fafc",
                    padding: "1.25rem",
                    borderRadius: "10px",
                    position: "relative",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem(["symptom_categories"], cIdx)}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={18} />
                  </button>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <FormInput
                      label="Category Identifier"
                      value={cat.id}
                      onChange={(val) => handleArrayItemChange(["symptom_categories"], cIdx, "id", val)}
                    />
                    <FormInput
                      label="Category Display Name"
                      value={cat.name}
                      onChange={(val) => handleArrayItemChange(["symptom_categories"], cIdx, "name", val)}
                    />
                    <FormInput
                      label="Icon (Leaf, Droplets, Sun, Bug)"
                      value={cat.icon}
                      onChange={(val) => handleArrayItemChange(["symptom_categories"], cIdx, "icon", val)}
                    />
                  </div>

                  {/* Symptoms in this category */}
                  <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", color: "#102e23" }}>
                      Symptoms in {cat.name || cat.id} ({symptoms.length})
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.75rem" }}>
                      {symptoms.map((sym: any, sIdx: number) => (
                        <div
                          key={sIdx}
                          style={{
                            background: "#f8fafc",
                            padding: "0.85rem",
                            borderRadius: "8px",
                            position: "relative",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem(["symptom_categories", cIdx, "symptoms"], sIdx)}
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                          <FormInput
                            label="Symptom Name"
                            value={sym.name}
                            onChange={(val) => handleArrayItemChange(["symptom_categories", cIdx, "symptoms"], sIdx, "name", val)}
                          />
                          <FormInput
                            label="Short Description"
                            value={sym.description}
                            onChange={(val) => handleArrayItemChange(["symptom_categories", cIdx, "symptoms"], sIdx, "description", val)}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() =>
                        handleAddArrayItem(["symptom_categories", cIdx, "symptoms"], {
                          name: "New Specific Symptom",
                          description: "Description of plant appearance.",
                        })
                      }
                      style={{ marginTop: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
                    >
                      <Plus size={14} /> Add Symptom
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() =>
              handleAddArrayItem(["symptom_categories"], {
                id: `cat_${Date.now()}`,
                name: "New Symptom Group",
                icon: "Leaf",
                symptoms: [],
              })
            }
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Symptom Category
          </button>
        </EditorCard>

        {/* Healthy Plant Habits */}
        <EditorCard title="Healthy Plant Habits & Advice" description="General care tips displayed in the health checker." badge={`${healthyHabits.length} Habits`}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {healthyHabits.map((habit: any, index: number) => (
              <div key={index} style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={typeof habit === "string" ? habit : habit.title || habit.description || ""}
                  onChange={(e) => handleArrayItemChange(["healthy_plant_habits"], index, "", e.target.value)}
                  style={{ flex: 1, padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["healthy_plant_habits"], index)}
                  style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#ef4444", padding: "0.55rem", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["healthy_plant_habits"], "Check moisture before watering to prevent root rot.")}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Healthy Habit
          </button>
        </EditorCard>

        {/* Default Diagnosis Guidance */}
        <EditorCard title="Default Diagnosis Fallback Guidance" description="Shown when symptoms do not match a specific condition.">
          <FormInput
            label="Default Diagnosis Title"
            value={payload.default_diagnosis?.title}
            onChange={(val) => handleFieldChange(["default_diagnosis", "title"], val)}
          />
          <FormInput
            label="Default Diagnosis Summary"
            multiline
            rows={3}
            value={payload.default_diagnosis?.description}
            onChange={(val) => handleFieldChange(["default_diagnosis", "description"], val)}
          />
        </EditorCard>
      </div>
    </PageEditorShell>
  );
}

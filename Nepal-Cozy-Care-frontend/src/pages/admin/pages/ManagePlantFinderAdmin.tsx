import { Sparkles, Plus, Trash2 } from "lucide-react";
import {
  EditorCard,
  FormInput,
  PageEditorShell,
  usePageContentEditor,
} from "../page-editors/EditorShared";

export default function ManagePlantFinderAdmin() {
  const {
    payload,
    loading,
    saving,
    statusMessage,
    handleArrayItemChange,
    handleAddArrayItem,
    handleRemoveArrayItem,
    handleSave,
  } = usePageContentEditor({
    pageKey: "plant_finder",
    pageName: "Plant Finder Tool",
    pageUrl: "/plant-finder",
  });

  const roomOptions = Array.isArray(payload.room_options) ? payload.room_options : [];
  const lightOptions = Array.isArray(payload.light_options) ? payload.light_options : [];
  const experienceOptions = Array.isArray(payload.experience_options) ? payload.experience_options : [];
  const locationOptions = Array.isArray(payload.location_options) ? payload.location_options : [];
  const nonPlantCategories = Array.isArray(payload.non_plant_categories) ? payload.non_plant_categories : [];

  const FINDER_SECTIONS = [
    { id: "sec-rooms", label: "Room Options" },
    { id: "sec-light", label: "Light Conditions" },
    { id: "sec-experience", label: "Care Experience" },
    { id: "sec-humidity", label: "Atmosphere" },
    { id: "sec-exclusions", label: "Excluded Categories" },
  ];

  return (
    <PageEditorShell
      title="Plant Finder Tool Configuration"
      subtitle="Configure lifestyle quiz questions, lighting conditions, care experience levels, and filtering exclusions."
      icon={Sparkles}
      pageUrl="/plant-finder"
      saving={saving}
      loading={loading}
      statusMessage={statusMessage}
      onSave={handleSave}
      sections={FINDER_SECTIONS}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Room Options */}
        <EditorCard id="sec-rooms" title="Room Quiz Options" description="Rooms available in the plant matching quiz." badge={`${roomOptions.length} Rooms`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {roomOptions.map((opt: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["room_options"], index)}
                  style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Value / Key"
                  value={opt.value}
                  onChange={(val) => handleArrayItemChange(["room_options"], index, "value", val)}
                />
                <FormInput
                  label="Display Label"
                  value={opt.label}
                  onChange={(val) => handleArrayItemChange(["room_options"], index, "label", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() =>
              handleAddArrayItem(["room_options"], {
                value: `room_${Date.now()}`,
                label: "New Room",
              })
            }
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Room Option
          </button>
        </EditorCard>

        {/* Light Options */}
        <EditorCard id="sec-light" title="Light Conditions" description="Lighting levels selectable by quiz users." badge={`${lightOptions.length} Conditions`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {lightOptions.map((opt: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["light_options"], index)}
                  style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Value / Key"
                  value={opt.value}
                  onChange={(val) => handleArrayItemChange(["light_options"], index, "value", val)}
                />
                <FormInput
                  label="Display Label"
                  value={opt.label}
                  onChange={(val) => handleArrayItemChange(["light_options"], index, "label", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() =>
              handleAddArrayItem(["light_options"], {
                value: `light_${Date.now()}`,
                label: "New Light Condition",
              })
            }
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Light Option
          </button>
        </EditorCard>

        {/* Experience Levels */}
        <EditorCard id="sec-experience" title="Care Experience Levels" description="Skill levels to match plant maintenance requirements." badge={`${experienceOptions.length} Levels`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {experienceOptions.map((opt: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["experience_options"], index)}
                  style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Value / Key"
                  value={opt.value}
                  onChange={(val) => handleArrayItemChange(["experience_options"], index, "value", val)}
                />
                <FormInput
                  label="Display Label"
                  value={opt.label}
                  onChange={(val) => handleArrayItemChange(["experience_options"], index, "label", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() =>
              handleAddArrayItem(["experience_options"], {
                value: `exp_${Date.now()}`,
                label: "New Level",
              })
            }
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Experience Level
          </button>
        </EditorCard>

        {/* Location / Humidity */}
        <EditorCard id="sec-humidity" title="Humidity / Atmosphere Conditions" description="Atmospheric environment options." badge={`${locationOptions.length} Conditions`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {locationOptions.map((opt: any, index: number) => (
              <div key={index} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["location_options"], index)}
                  style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Value / Key"
                  value={opt.value}
                  onChange={(val) => handleArrayItemChange(["location_options"], index, "value", val)}
                />
                <FormInput
                  label="Display Label"
                  value={opt.label}
                  onChange={(val) => handleArrayItemChange(["location_options"], index, "label", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() =>
              handleAddArrayItem(["location_options"], {
                value: `loc_${Date.now()}`,
                label: "New Atmosphere Option",
              })
            }
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Atmosphere Option
          </button>
        </EditorCard>

        {/* Excluded Non-Plant Categories */}
        <EditorCard id="sec-exclusions" title="Excluded Non-Plant Categories" description="Product categories to exclude from Plant Finder recommendations.">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {nonPlantCategories.map((cat: string, index: number) => (
              <div
                key={index}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["non_plant_categories"], index)}
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", padding: 0 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["non_plant_categories"], "pots")}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}
          >
            <Plus size={14} /> Add Excluded Category
          </button>
        </EditorCard>
      </div>
    </PageEditorShell>
  );
}

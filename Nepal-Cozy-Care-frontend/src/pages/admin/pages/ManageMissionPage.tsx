import { Sparkles, Plus, Trash2 } from "lucide-react";
import {
  EditorCard,
  FormInput,
  ImageUploader,
  PageEditorShell,
  usePageContentEditor,
} from "../page-editors/EditorShared";

export default function ManageMissionPage() {
  const {
    payload,
    loading,
    saving,
    statusMessage,
    handleFieldChange,
    handleArrayItemChange,
    handleAddArrayItem,
    handleRemoveArrayItem,
    uploadImage,
    handleSave,
  } = usePageContentEditor({
    pageKey: "our_mission",
    pageName: "Our Mission",
    pageUrl: "/mission",
  });

  const hero = payload.hero || {};
  const highlights = Array.isArray(hero.highlights) ? hero.highlights : [];
  const story = payload.story || {};
  const bullets = Array.isArray(story.bullets) ? story.bullets : [];
  const pillarsSection = payload.pillars_section || {};
  const pillars = Array.isArray(pillarsSection.pillars) ? pillarsSection.pillars : [];
  const supportSection = payload.support_section || {};
  const supportSteps = Array.isArray(supportSection.steps) ? supportSection.steps : [];
  const vision = payload.vision || {};
  const impact = payload.impact || {};
  const impactGoals = Array.isArray(impact.goals) ? impact.goals : [];

  const MISSION_SECTIONS = [
    { id: "sec-hero", label: "Hero Header" },
    { id: "sec-narrative", label: "Botanical Narrative" },
    { id: "sec-pillars", label: "Four Pillars" },
    { id: "sec-steps", label: "Lifetime Guarantee" },
    { id: "sec-vision", label: "Vision & Impact" },
  ];

  return (
    <PageEditorShell
      title="Our Mission Page Editor"
      subtitle="Update the core purpose statement, four pillars of care, roadmap, and sustainability goals."
      icon={Sparkles}
      pageUrl="/mission"
      saving={saving}
      loading={loading}
      statusMessage={statusMessage}
      onSave={handleSave}
      sections={MISSION_SECTIONS}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Hero */}
        <EditorCard id="sec-hero" title="Mission Hero Header" description="The core purpose statement and showcase banner.">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
            <FormInput label="Eyebrow Kicker" value={hero.eyebrow} onChange={(val) => handleFieldChange(["hero", "eyebrow"], val)} />
            <FormInput label="Main Hero Title" value={hero.title} onChange={(val) => handleFieldChange(["hero", "title"], val)} />
          </div>
          <FormInput
            label="Lead Purpose Paragraph"
            multiline
            rows={3}
            value={hero.lead}
            onChange={(val) => handleFieldChange(["hero", "lead"], val)}
          />
          <ImageUploader
            label="Hero Main Visual"
            value={hero.image}
            onChange={(val) => handleFieldChange(["hero", "image"], val)}
            uploadImage={uploadImage}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FormInput
              label="Top Floating Glass Note"
              value={hero.floating_note_top}
              onChange={(val) => handleFieldChange(["hero", "floating_note_top"], val)}
            />
            <FormInput
              label="Bottom Floating Glass Note"
              value={hero.floating_note_bottom}
              onChange={(val) => handleFieldChange(["hero", "floating_note_bottom"], val)}
            />
          </div>
          <h4 style={{ margin: "1rem 0 0.5rem", fontSize: "0.92rem", color: "#102e23" }}>Quick Stat Badges</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
            {highlights.map((hl: any, hIdx: number) => (
              <div key={hIdx} style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <FormInput
                  label="Stat Value"
                  value={hl.value}
                  onChange={(val) => handleArrayItemChange(["hero", "highlights"], hIdx, "value", val)}
                />
                <FormInput
                  label="Stat Label"
                  value={hl.label}
                  onChange={(val) => handleArrayItemChange(["hero", "highlights"], hIdx, "label", val)}
                />
              </div>
            ))}
          </div>
        </EditorCard>

        {/* Narrative Story */}
        <EditorCard id="sec-narrative" title="Botanical Journey Narrative" description="Deep storytelling behind Cozy Care's founding.">
          <FormInput label="Kicker Eyebrow" value={story.eyebrow} onChange={(val) => handleFieldChange(["story", "eyebrow"], val)} />
          <FormInput label="Story Headline" value={story.title} onChange={(val) => handleFieldChange(["story", "title"], val)} />
          <FormInput
            label="Opening Paragraph"
            multiline
            rows={3}
            value={story.paragraph_1}
            onChange={(val) => handleFieldChange(["story", "paragraph_1"], val)}
          />
          <FormInput
            label="Concluding Paragraph"
            multiline
            rows={3}
            value={story.paragraph_2}
            onChange={(val) => handleFieldChange(["story", "paragraph_2"], val)}
          />
          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.4rem" }}>
            Key Highlight Bullets
          </label>
          {bullets.map((b: string, bIdx: number) => (
            <div key={bIdx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                value={b || ""}
                onChange={(e) => handleArrayItemChange(["story", "bullets"], bIdx, "", e.target.value)}
                style={{ flex: 1, padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem(["story", "bullets"], bIdx)}
                style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#ef4444", padding: "0.55rem", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["story", "bullets"], "New strategic principle")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
          >
            <Plus size={14} /> Add Bullet
          </button>
        </EditorCard>

        {/* 4 Pillars of Care */}
        <EditorCard id="sec-pillars" title="Four Pillars of Cozy Care" description="Detailed roadmap pillars." badge={`${pillars.length} Pillars`}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1rem" }}>
            <FormInput
              label="Pillars Section Eyebrow"
              value={pillarsSection.eyebrow}
              onChange={(val) => handleFieldChange(["pillars_section", "eyebrow"], val)}
            />
            <FormInput
              label="Pillars Section Title"
              value={pillarsSection.title}
              onChange={(val) => handleFieldChange(["pillars_section", "title"], val)}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {pillars.map((pil: any, pIdx: number) => (
              <div key={pIdx} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["pillars_section", "pillars"], pIdx)}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Pillar Number / Tag"
                  value={pil.number}
                  onChange={(val) => handleArrayItemChange(["pillars_section", "pillars"], pIdx, "number", val)}
                />
                <FormInput
                  label="Pillar Title"
                  value={pil.title}
                  onChange={(val) => handleArrayItemChange(["pillars_section", "pillars"], pIdx, "title", val)}
                />
                <FormInput
                  label="Description"
                  multiline
                  rows={3}
                  value={pil.description}
                  onChange={(val) => handleArrayItemChange(["pillars_section", "pillars"], pIdx, "description", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["pillars_section", "pillars"], { number: "05", title: "New Pillar", description: "Details..." })}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Pillar
          </button>
        </EditorCard>

        {/* Support Steps */}
        <EditorCard id="sec-steps" title="Lifetime Care Guarantee Steps" description="The step-by-step customer care journey.">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", marginBottom: "1rem" }}>
            <FormInput
              label="Support Section Eyebrow"
              value={supportSection.eyebrow}
              onChange={(val) => handleFieldChange(["support_section", "eyebrow"], val)}
            />
            <FormInput
              label="Support Section Title"
              value={supportSection.title}
              onChange={(val) => handleFieldChange(["support_section", "title"], val)}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {supportSteps.map((step: any, sIdx: number) => (
              <div key={sIdx} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", position: "relative", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["support_section", "steps"], sIdx)}
                  style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Step Index / Label"
                  value={step.step}
                  onChange={(val) => handleArrayItemChange(["support_section", "steps"], sIdx, "step", val)}
                />
                <FormInput
                  label="Step Headline"
                  value={step.title}
                  onChange={(val) => handleArrayItemChange(["support_section", "steps"], sIdx, "title", val)}
                />
                <FormInput
                  label="Description"
                  multiline
                  rows={2}
                  value={step.description}
                  onChange={(val) => handleArrayItemChange(["support_section", "steps"], sIdx, "description", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["support_section", "steps"], { step: "Step 4", title: "New Step", description: "Details..." })}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Step
          </button>
        </EditorCard>

        {/* Vision & Impact Goals */}
        <EditorCard id="sec-vision" title="Vision Quote & Measurable Impact Goals" description="Target metrics and founders vision statement.">
          <FormInput label="Vision Quote" multiline rows={2} value={vision.quote} onChange={(val) => handleFieldChange(["vision", "quote"], val)} />
          <FormInput label="Vision Author / Attrib" value={vision.author} onChange={(val) => handleFieldChange(["vision", "author"], val)} />
          <FormInput label="Impact Section Eyebrow" value={impact.eyebrow} onChange={(val) => handleFieldChange(["impact", "eyebrow"], val)} />
          <FormInput label="Impact Section Title" value={impact.title} onChange={(val) => handleFieldChange(["impact", "title"], val)} />
          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.4rem" }}>
            Measurable Impact Goals
          </label>
          {impactGoals.map((goalText: string, gIdx: number) => (
            <div key={gIdx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                value={goalText || ""}
                onChange={(e) => handleArrayItemChange(["impact", "goals"], gIdx, "", e.target.value)}
                style={{ flex: 1, padding: "0.55rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem(["impact", "goals"], gIdx)}
                style={{ background: "#fee2e2", border: "none", borderRadius: "6px", color: "#ef4444", padding: "0.55rem", cursor: "pointer" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["impact", "goals"], "New measurable impact goal")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
          >
            <Plus size={14} /> Add Impact Goal
          </button>
        </EditorCard>
      </div>
    </PageEditorShell>
  );
}

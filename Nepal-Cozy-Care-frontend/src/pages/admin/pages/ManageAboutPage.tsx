import { Info, Plus, Trash2 } from "lucide-react";
import {
  EditorCard,
  FormInput,
  ImageUploader,
  PageEditorShell,
  usePageContentEditor,
} from "../page-editors/EditorShared";

export default function ManageAboutPage() {
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
    pageKey: "about_page",
    pageName: "About Us",
    pageUrl: "/about",
  });

  const hero = payload.hero || {};
  const stats = Array.isArray(payload.stats) ? payload.stats : [];
  const story = payload.story || {};
  const paragraphs = Array.isArray(story.paragraphs) ? story.paragraphs : [];
  const mission = payload.mission || {};
  const missionCards = Array.isArray(mission.cards) ? mission.cards : [];
  const values = payload.values || {};
  const valueItems = Array.isArray(values.items) ? values.items : [];
  const whyChooseUs = payload.why_choose_us || {};
  const whyItems = Array.isArray(whyChooseUs.items) ? whyChooseUs.items : [];
  const team = payload.team || {};
  const teamMembers = Array.isArray(team.members) ? team.members : [];
  const cta = payload.cta || {};

  const ABOUT_SECTIONS = [
    { id: "sec-hero", label: "Hero Banner" },
    { id: "sec-stats", label: "Growth Metrics" },
    { id: "sec-story", label: "Our Story" },
    { id: "sec-mission", label: "Mission & Vision" },
    { id: "sec-values", label: "Company Values" },
    { id: "sec-why", label: "Why Choose Us" },
    { id: "sec-team", label: "Team Members" },
    { id: "sec-cta", label: "Call to Action" },
  ];

  return (
    <PageEditorShell
      title="About Us Page Editor"
      subtitle="Customize founder story, growth milestones, team members, and company values."
      icon={Info}
      pageUrl="/about"
      saving={saving}
      loading={loading}
      statusMessage={statusMessage}
      onSave={handleSave}
      sections={ABOUT_SECTIONS}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Hero */}
        <EditorCard id="sec-hero" title="Hero Banner" description="Top visual introduction of the About Us page." badge="Hero">
          <FormInput label="Main Title" value={hero.title} onChange={(val) => handleFieldChange(["hero", "title"], val)} />
          <FormInput
            label="Subtitle / Lead Narrative"
            multiline
            rows={3}
            value={hero.subtitle}
            onChange={(val) => handleFieldChange(["hero", "subtitle"], val)}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            <FormInput
              label="Primary Button Label"
              value={hero.primary_cta?.label}
              onChange={(val) => handleFieldChange(["hero", "primary_cta", "label"], val)}
            />
            <FormInput
              label="Primary Button Link Path"
              value={hero.primary_cta?.path}
              onChange={(val) => handleFieldChange(["hero", "primary_cta", "path"], val)}
            />
            <FormInput
              label="Secondary Button Label"
              value={hero.secondary_cta?.label}
              onChange={(val) => handleFieldChange(["hero", "secondary_cta", "label"], val)}
            />
            <FormInput
              label="Secondary Button Link Path"
              value={hero.secondary_cta?.path}
              onChange={(val) => handleFieldChange(["hero", "secondary_cta", "path"], val)}
            />
          </div>
          <ImageUploader
            label="Hero Background / Accent Image"
            value={hero.image}
            onChange={(val) => handleFieldChange(["hero", "image"], val)}
            uploadImage={uploadImage}
          />
        </EditorCard>

        {/* Stats */}
        <EditorCard id="sec-stats" title="Key Growth Metrics" description="Counters showing community scale." badge={`${stats.length} Metrics`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {stats.map((stat: any, index: number) => (
              <div
                key={index}
                style={{
                  background: "#f8fafc",
                  padding: "1rem",
                  borderRadius: "10px",
                  position: "relative",
                  border: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["stats"], index)}
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
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Metric Value (e.g. 15,000+)"
                  value={stat.value}
                  onChange={(val) => handleArrayItemChange(["stats"], index, "value", val)}
                />
                <FormInput
                  label="Label Title"
                  value={stat.label}
                  onChange={(val) => handleArrayItemChange(["stats"], index, "label", val)}
                />
                <FormInput
                  label="Supporting Caption"
                  value={stat.caption}
                  onChange={(val) => handleArrayItemChange(["stats"], index, "caption", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["stats"], { value: "100+", label: "New Metric", caption: "Description" })}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Growth Metric
          </button>
        </EditorCard>

        {/* Our Story */}
        <EditorCard id="sec-story" title="Our Story & Greenhouse Heritage" description="Detailed narrative paragraphs.">
          <FormInput label="Section Title" value={story.title} onChange={(val) => handleFieldChange(["story", "title"], val)} />
          <FormInput label="Subtitle" value={story.subtitle} onChange={(val) => handleFieldChange(["story", "subtitle"], val)} />
          <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, color: "#334155", marginBottom: "0.4rem" }}>
            Narrative Paragraphs
          </label>
          {paragraphs.map((para: string, pIdx: number) => (
            <div key={pIdx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <textarea
                rows={2}
                value={para || ""}
                onChange={(e) => handleArrayItemChange(["story", "paragraphs"], pIdx, "", e.target.value)}
                style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem(["story", "paragraphs"], pIdx)}
                style={{
                  background: "#fee2e2",
                  border: "none",
                  borderRadius: "6px",
                  color: "#ef4444",
                  padding: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["story", "paragraphs"], "New paragraph describing our botanical heritage.")}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", marginBottom: "1rem" }}
          >
            <Plus size={14} /> Add Paragraph
          </button>
          <ImageUploader
            label="Story Visual Photograph"
            value={story.image}
            onChange={(val) => handleFieldChange(["story", "image"], val)}
            uploadImage={uploadImage}
          />
        </EditorCard>

        {/* Mission Statement */}
        <EditorCard id="sec-mission" title="Mission & Vision Pillars" description="Core commitments.">
          <FormInput label="Pillar Title" value={mission.title} onChange={(val) => handleFieldChange(["mission", "title"], val)} />
          <FormInput
            label="Core Vision Statement"
            multiline
            rows={2}
            value={mission.description}
            onChange={(val) => handleFieldChange(["mission", "description"], val)}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {missionCards.map((card: any, index: number) => (
              <div
                key={index}
                style={{
                  background: "#f8fafc",
                  padding: "1rem",
                  borderRadius: "10px",
                  position: "relative",
                  border: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["mission", "cards"], index)}
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
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Pillar Title"
                  value={card.title}
                  onChange={(val) => handleArrayItemChange(["mission", "cards"], index, "title", val)}
                />
                <FormInput
                  label="Summary"
                  multiline
                  rows={2}
                  value={card.description}
                  onChange={(val) => handleArrayItemChange(["mission", "cards"], index, "description", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => handleAddArrayItem(["mission", "cards"], { title: "New Commitment", description: "Details..." })}
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Pillar Card
          </button>
        </EditorCard>

        {/* Core Values */}
        <EditorCard id="sec-values" title="Company Values" description="Guiding principles of Cozy Care.">
          <FormInput label="Section Title" value={values.title} onChange={(val) => handleFieldChange(["values", "title"], val)} />
          <FormInput label="Subtitle" value={values.subtitle} onChange={(val) => handleFieldChange(["values", "subtitle"], val)} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            {valueItems.map((valItem: any, index: number) => (
              <div
                key={index}
                style={{
                  background: "#f8fafc",
                  padding: "1rem",
                  borderRadius: "10px",
                  position: "relative",
                  border: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["values", "items"], index)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Value Title"
                  value={valItem.title}
                  onChange={(val) => handleArrayItemChange(["values", "items"], index, "title", val)}
                />
                <FormInput
                  label="Icon (e.g. Leaf, Heart, Users, Award)"
                  value={valItem.icon}
                  onChange={(val) => handleArrayItemChange(["values", "items"], index, "icon", val)}
                />
                <FormInput
                  label="Description"
                  multiline
                  rows={3}
                  value={valItem.description}
                  onChange={(val) => handleArrayItemChange(["values", "items"], index, "description", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() =>
              handleAddArrayItem(["values", "items"], {
                icon: "Heart",
                title: "New Value",
                description: "Value description.",
              })
            }
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Core Value
          </button>
        </EditorCard>

        {/* Why Choose Us */}
        <EditorCard id="sec-why" title="Why Choose Cozy Care" description="Differentiators and customer guarantees.">
          <FormInput
            label="Section Title"
            value={whyChooseUs.title}
            onChange={(val) => handleFieldChange(["why_choose_us", "title"], val)}
          />
          <FormInput
            label="Subtitle"
            value={whyChooseUs.subtitle}
            onChange={(val) => handleFieldChange(["why_choose_us", "subtitle"], val)}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            {whyItems.map((item: any, index: number) => (
              <div
                key={index}
                style={{
                  background: "#f8fafc",
                  padding: "1rem",
                  borderRadius: "10px",
                  position: "relative",
                  border: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["why_choose_us", "items"], index)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Feature Title"
                  value={item.title}
                  onChange={(val) => handleArrayItemChange(["why_choose_us", "items"], index, "title", val)}
                />
                <FormInput
                  label="Icon (e.g. ShieldCheck, Sparkles, Truck, Sun)"
                  value={item.icon}
                  onChange={(val) => handleArrayItemChange(["why_choose_us", "items"], index, "icon", val)}
                />
                <FormInput
                  label="Description"
                  multiline
                  rows={2}
                  value={item.description}
                  onChange={(val) => handleArrayItemChange(["why_choose_us", "items"], index, "description", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() =>
              handleAddArrayItem(["why_choose_us", "items"], {
                icon: "ShieldCheck",
                title: "Guaranteed Health",
                description: "Description of guarantee.",
              })
            }
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Feature
          </button>
        </EditorCard>

        {/* Team Section */}
        <EditorCard id="sec-team" title="Greenhouse & Horticulture Team" description="Profiles of the plant experts.">
          <FormInput label="Section Title" value={team.title} onChange={(val) => handleFieldChange(["team", "title"], val)} />
          <FormInput label="Subtitle" value={team.subtitle} onChange={(val) => handleFieldChange(["team", "subtitle"], val)} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {teamMembers.map((member: any, index: number) => (
              <div
                key={index}
                style={{
                  background: "#f8fafc",
                  padding: "1rem",
                  borderRadius: "10px",
                  position: "relative",
                  border: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(["team", "members"], index)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} />
                </button>
                <FormInput
                  label="Full Name"
                  value={member.name}
                  onChange={(val) => handleArrayItemChange(["team", "members"], index, "name", val)}
                />
                <FormInput
                  label="Role / Title"
                  value={member.role}
                  onChange={(val) => handleArrayItemChange(["team", "members"], index, "role", val)}
                />
                <ImageUploader
                  label="Profile Photo"
                  value={member.image}
                  onChange={(val) => handleArrayItemChange(["team", "members"], index, "image", val)}
                  uploadImage={uploadImage}
                />
                <FormInput
                  label="Bio / Description"
                  multiline
                  rows={2}
                  value={member.bio}
                  onChange={(val) => handleArrayItemChange(["team", "members"], index, "bio", val)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() =>
              handleAddArrayItem(["team", "members"], {
                name: "New Member",
                role: "Horticulture Specialist",
                bio: "Passionate about plants.",
                image: "/images/team-sarah.jpg",
              })
            }
            style={{ marginTop: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> Add Team Member
          </button>
        </EditorCard>

        {/* Bottom CTA */}
        <EditorCard id="sec-cta" title="Bottom Call to Action Banner" description="Final encouragement banner at page end.">
          <FormInput label="Banner Title" value={cta.title} onChange={(val) => handleFieldChange(["cta", "title"], val)} />
          <FormInput
            label="Banner Subtitle"
            multiline
            rows={2}
            value={cta.subtitle}
            onChange={(val) => handleFieldChange(["cta", "subtitle"], val)}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FormInput
              label="Primary Button Label"
              value={cta.primary_cta?.label}
              onChange={(val) => handleFieldChange(["cta", "primary_cta", "label"], val)}
            />
            <FormInput
              label="Primary Button Link Path"
              value={cta.primary_cta?.path}
              onChange={(val) => handleFieldChange(["cta", "primary_cta", "path"], val)}
            />
            <FormInput
              label="Secondary Button Label"
              value={cta.secondary_cta?.label}
              onChange={(val) => handleFieldChange(["cta", "secondary_cta", "label"], val)}
            />
            <FormInput
              label="Secondary Button Link Path"
              value={cta.secondary_cta?.path}
              onChange={(val) => handleFieldChange(["cta", "secondary_cta", "path"], val)}
            />
          </div>
        </EditorCard>
      </div>
    </PageEditorShell>
  );
}

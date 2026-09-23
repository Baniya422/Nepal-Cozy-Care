import { Compass, Plus, Trash2, Palette, CircleDot } from "lucide-react";
import { Link } from "react-router-dom";
import {
  EditorCard,
  PageEditorShell,
  usePageContentEditor,
} from "../page-editors/EditorShared";
import { defaultNavMenuConfig } from "../../../components/layout/Navbar";

export default function ManageNavigationPage() {
  const {
    payload,
    loading,
    saving,
    statusMessage,
    handleFieldChange,
    handleSave,
  } = usePageContentEditor({
    pageKey: "navigation_menu",
    pageName: "Navbar & Dropdown Menus",
    pageUrl: "/",
  });

  const plantsDropdown: any[] = payload.plants_dropdown || defaultNavMenuConfig.plants_dropdown;
  const locationDropdown: any[] = payload.location_dropdown || defaultNavMenuConfig.location_dropdown;
  const careTipsDropdown: any[] = payload.care_tips_dropdown || defaultNavMenuConfig.care_tips_dropdown;
  const accessoriesDropdown: any[] = payload.accessories_dropdown || defaultNavMenuConfig.accessories_dropdown;

  const updateItem = (group: string, index: number, field: string, val: any) => {
    const list = [...(payload[group] || (defaultNavMenuConfig as any)[group] || [])];
    list[index] = { ...list[index], [field]: val };
    handleFieldChange([group], list);
  };

  const addItem = (group: string, defaultItem: any) => {
    const list = [...(payload[group] || (defaultNavMenuConfig as any)[group] || [])];
    list.push(defaultItem);
    handleFieldChange([group], list);
  };

  const removeItem = (group: string, index: number) => {
    const list = [...(payload[group] || (defaultNavMenuConfig as any)[group] || [])];
    list.splice(index, 1);
    handleFieldChange([group], list);
  };

  const renderDropdownList = (
    groupKey: string,
    items: any[],
    defaultNewItem: { label: string; path: string; is_active: boolean }
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {items.map((item, index) => (
        <div
          key={item.id || index}
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1.6fr auto auto",
            gap: "0.75rem",
            alignItems: "center",
            padding: "0.85rem 1rem",
            background: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div>
            <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
              Menu Label
            </label>
            <input
              type="text"
              value={item.label || ""}
              onChange={(e) => updateItem(groupKey, index, "label", e.target.value)}
              placeholder="e.g. Indoor Plants"
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
              Filter / Target Link
            </label>
            <input
              type="text"
              value={item.path || ""}
              onChange={(e) => updateItem(groupKey, index, "path", e.target.value)}
              placeholder="e.g. /plants?type=indoor"
              style={{
                width: "100%",
                padding: "0.55rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", paddingTop: "1.2rem" }}>
            <label style={{ fontSize: "0.82rem", color: item.is_active !== false ? "#166534" : "#94a3b8", fontWeight: 600, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={item.is_active !== false}
                onChange={(e) => updateItem(groupKey, index, "is_active", e.target.checked)}
                style={{ marginRight: "0.35rem", accentColor: "#0d4e3a" }}
              />
              {item.is_active !== false ? "Active" : "Hidden"}
            </label>
          </div>
          <div style={{ paddingTop: "1.2rem" }}>
            <button
              type="button"
              onClick={() => removeItem(groupKey, index)}
              style={{
                background: "#fee2e2",
                border: "none",
                borderRadius: "6px",
                color: "#ef4444",
                padding: "0.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="admin-btn admin-btn-secondary"
        onClick={() => addItem(groupKey, defaultNewItem)}
        style={{ marginTop: "0.5rem", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}
      >
        <Plus size={15} /> Add Menu Item
      </button>
    </div>
  );

  const NAV_SECTIONS = [
    { id: "sec-plants", label: "Plants Menu" },
    { id: "sec-location", label: "Shop by Room" },
    { id: "sec-care", label: "Care Tips" },
    { id: "sec-accessories", label: "Accessories" },
  ];

  return (
    <PageEditorShell
      title="Navbar & Dropdown Menus Editor"
      subtitle="Configure plant category links, shop-by-room archetypes (living room, bedroom, balcony), and accessories dropdowns."
      icon={Compass}
      pageUrl="/"
      saving={saving}
      loading={loading}
      statusMessage={statusMessage}
      onSave={handleSave}
      sections={NAV_SECTIONS}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Quick Links Banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ fontSize: "0.9rem", color: "#065f46", fontWeight: 600 }}>
            Looking to configure your <strong>Website Logo & Store Name</strong> or <strong>Catalog Category Circles</strong>?
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link
              to="/admin/pages/branding"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.85rem",
                background: "#065f46",
                color: "#ffffff",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Palette size={14} /> Website Logo & Name
            </Link>
            <Link
              to="/admin/pages/category-bubbles"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.85rem",
                background: "#ffffff",
                color: "#065f46",
                border: "1px solid #a7f3d0",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <CircleDot size={14} /> Category Circles (Bubbles)
            </Link>
          </div>
        </div>

        {/* Plants Mega Menu */}
        <EditorCard
          id="sec-plants"
          title="Plants Dropdown Menu Links"
          description="Categories shown when hovering over the main 'Plants' navigation link."
          badge={`${plantsDropdown.length} Links`}
        >
          {renderDropdownList("plants_dropdown", plantsDropdown, {
            label: "New Category",
            path: "/plants",
            is_active: true,
          })}
        </EditorCard>

        {/* Location / Room Dropdowns */}
        <EditorCard
          id="sec-location"
          title="Shop by Room / Location Dropdown"
          description="Location archetypes like Living Room, Bedroom, Balcony, Office, and Terrace."
          badge={`${locationDropdown.length} Rooms`}
        >
          {renderDropdownList("location_dropdown", locationDropdown, {
            label: "New Room",
            path: "/plants?room=living_room",
            is_active: true,
          })}
        </EditorCard>

        {/* Care Tips Dropdown */}
        <EditorCard
          id="sec-care"
          title="Care Tips Dropdown Categories"
          description="Guides and advice categories shown under 'Care Tips'."
          badge={`${careTipsDropdown.length} Guides`}
        >
          {renderDropdownList("care_tips_dropdown", careTipsDropdown, {
            label: "New Care Topic",
            path: "/care-tips",
            is_active: true,
          })}
        </EditorCard>

        {/* Accessories Dropdown */}
        <EditorCard
          id="sec-accessories"
          title="Accessories Dropdown Items"
          description="Tools, soils, and planters shown under 'Accessories'."
          badge={`${accessoriesDropdown.length} Items`}
        >
          {renderDropdownList("accessories_dropdown", accessoriesDropdown, {
            label: "New Accessory Category",
            path: "/pots",
            is_active: true,
          })}
        </EditorCard>
      </div>
    </PageEditorShell>
  );
}

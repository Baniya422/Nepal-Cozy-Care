import { ChevronRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { AccountSection, AccountUser, SectionConfig } from "./types";

type AccountSidebarProps = {
  user: AccountUser | null;
  sections: SectionConfig[];
  activeSection: AccountSection;
  onNavigateToSection: (section: AccountSection) => void;
};

export default function AccountSidebar({
  user,
  sections,
  activeSection,
  onNavigateToSection,
}: AccountSidebarProps) {
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller" || isAdmin;

  return (
    <aside className="account-sidebar">
      <div className="account-sidebar-head">
        <div className="account-avatar">{(user?.name || "A").charAt(0).toUpperCase()}</div>
        <div>
          <strong>{user?.name || "Account User"}</strong>
          <span>{user?.email || "No email available"}</span>
        </div>
      </div>
      <div className="account-nav">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.key}
              type="button"
              className={`account-nav-btn ${activeSection === section.key ? "active" : ""}`}
              onClick={() => onNavigateToSection(section.key)}
            >
              <span className="account-nav-btn-main">
                <Icon size={16} />
                {section.label}
              </span>
              <ChevronRight size={16} />
            </button>
          );
        })}

        {(isAdmin || isSeller) && (
          <div style={{ marginTop: "1rem", paddingTop: "0.85rem", borderTop: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", padding: "0 0.75rem 0.5rem" }}>
              Portals
            </div>
            {isAdmin && (
              <Link
                to="/admin"
                className="account-nav-btn"
                style={{ textDecoration: "none", color: "#065f46", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <span className="account-nav-btn-main">
                  <ShieldCheck size={16} />
                  Super Admin
                </span>
                <ChevronRight size={16} />
              </Link>
            )}
            {/* Seller Dashboard link hidden for now - code preserved for later */}
            {/* {isSeller && (
              <Link
                to="/seller/dashboard"
                className="account-nav-btn"
                style={{ textDecoration: "none", color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.35rem" }}
              >
                <span className="account-nav-btn-main">
                  <Store size={16} />
                  Seller Dashboard
                </span>
                <ChevronRight size={16} />
              </Link>
            )} */}
          </div>
        )}
      </div>
    </aside>
  );
}

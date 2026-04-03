import { ChevronRight } from "lucide-react";
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
      </div>
    </aside>
  );
}

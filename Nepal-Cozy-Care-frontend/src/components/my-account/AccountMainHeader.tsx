import type { SectionConfig } from "./types";

type AccountMainHeaderProps = {
  section: SectionConfig;
};

export default function AccountMainHeader({ section }: AccountMainHeaderProps) {
  return (
    <header className="account-main-header">
      <div>
        <p className="account-main-kicker">{section.label}</p>
        <h2>{section.label}</h2>
        <p>{section.description}</p>
      </div>
    </header>
  );
}

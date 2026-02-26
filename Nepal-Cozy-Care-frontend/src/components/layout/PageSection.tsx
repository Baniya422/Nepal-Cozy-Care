import type { ReactNode } from "react";
import "./pageSection.css";

interface PageSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: "white" | "cream" | "green" | "dark";
  padding?: "small" | "medium" | "large";
}

export default function PageSection({
  children,
  className = "",
  id,
  background = "white",
  padding = "medium",
}: PageSectionProps) {
  const backgroundClass = `section-bg-${background}`;
  const paddingClass = `section-padding-${padding}`;

  return (
    <section id={id} className={`page-section ${backgroundClass} ${paddingClass} ${className}`}>
      <div className="section-container">
        {children}
      </div>
    </section>
  );
}

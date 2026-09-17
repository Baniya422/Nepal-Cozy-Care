import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type UgaooSortOption =
  | "featured"
  | "relevant"
  | "best_selling"
  | "alpha_asc"
  | "alpha_desc"
  | "price_asc"
  | "price_desc"
  | "date_asc"
  | "date_desc";

interface SortMeta {
  key: UgaooSortOption;
  label: string;
}

const SORT_OPTIONS: SortMeta[] = [
  { key: "featured", label: "Featured" },
  { key: "relevant", label: "Most relevant" },
  { key: "best_selling", label: "Best selling" },
  { key: "alpha_asc", label: "Alphabetically, A-Z" },
  { key: "alpha_desc", label: "Alphabetically, Z-A" },
  { key: "price_asc", label: "Price, low to high" },
  { key: "price_desc", label: "Price, high to low" },
  { key: "date_asc", label: "Date, old to new" },
  { key: "date_desc", label: "Date, new to old" },
];

type UgaooSortDropdownProps = {
  value: UgaooSortOption;
  onChange: (sort: UgaooSortOption) => void;
};

export default function UgaooSortDropdown({
  value,
  onChange,
}: UgaooSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedMeta =
    SORT_OPTIONS.find((s) => s.key === value) || SORT_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="ugaoo-sort-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="ugaoo-sort-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Sort by: currently ${selectedMeta.label}`}
      >
        <span className="ugaoo-sort-label">Sort by</span>
        <ChevronDown
          size={16}
          className={`ugaoo-sort-chevron ${isOpen ? "rotate" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="ugaoo-sort-menu" role="listbox">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = opt.key === value;
            return (
              <button
                key={opt.key}
                type="button"
                className={`ugaoo-sort-item ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt.key);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                {isSelected ? `— ${opt.label}` : opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

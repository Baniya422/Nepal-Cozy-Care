import "./pagination.css";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number; // default 16 = 4 rows of 4
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize = 16,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  // If there's only 1 page or fewer, do not show pagination (page 2 only appears when page 1 is completely full)
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Middle pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handleSelectPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav className="catalog-pagination" aria-label="Catalog pagination">
      {currentPage > 1 && (
        <button
          type="button"
          className="pagination-nav-btn"
          onClick={() => handleSelectPage(currentPage - 1)}
          aria-label="Previous page"
        >
          ‹ Prev
        </button>
      )}

      {getPageNumbers().map((item, idx) => {
        if (typeof item === "string") {
          return (
            <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
              {item}
            </span>
          );
        }

        const isCurrent = item === currentPage;
        return (
          <button
            key={item}
            type="button"
            className={`pagination-btn ${isCurrent ? "active" : ""}`}
            onClick={() => handleSelectPage(item)}
            aria-current={isCurrent ? "page" : undefined}
            aria-label={`Page ${item}`}
          >
            {item}
          </button>
        );
      })}

      {currentPage < totalPages && (
        <button
          type="button"
          className="pagination-nav-btn"
          onClick={() => handleSelectPage(currentPage + 1)}
          aria-label="Next page"
        >
          Next ›
        </button>
      )}
    </nav>
  );
}

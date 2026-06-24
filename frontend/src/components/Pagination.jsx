import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  // Generate pages list (simple list for now, since we have 1000 items, page size is 20, max pages is 50)
  // Let's render page numbers: current, 2 before, 2 after.
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12 py-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-[#EEF2FF] bg-white text-textprimary hover:bg-surface disabled:opacity-50 disabled:hover:bg-white transition-all"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Page Numbers */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-10 h-10 rounded-lg text-sm font-semibold border border-[#EEF2FF] bg-white text-textprimary hover:bg-surface transition-all"
          >
            1
          </button>
          {startPage > 2 && <span className="text-textmuted px-1">...</span>}
        </>
      )}

      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all border ${
              isActive
                ? 'bg-[#5B4FE8] text-white border-[#5B4FE8] shadow-md shadow-primary/20'
                : 'bg-white text-textprimary border-[#EEF2FF] hover:bg-surface'
            }`}
          >
            {page}
          </button>
        );
      })}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-textmuted px-1">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-10 h-10 rounded-lg text-sm font-semibold border border-[#EEF2FF] bg-white text-textprimary hover:bg-surface transition-all"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-[#EEF2FF] bg-white text-textprimary hover:bg-surface disabled:opacity-50 disabled:hover:bg-white transition-all"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;

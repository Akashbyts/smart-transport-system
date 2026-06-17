export default function Pagination({ page, pages, total, limit, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600
            disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700
            text-gray-700 dark:text-gray-300 transition-colors"
        >
          ← Prev
        </button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors
                ${page === pageNum
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600
            disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700
            text-gray-700 dark:text-gray-300 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
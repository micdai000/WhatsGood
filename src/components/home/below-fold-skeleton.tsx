export function BelowFoldSkeleton() {
  return (
    <div className="page-x mt-10 space-y-10 pb-6">
      {[1, 2, 3].map((section) => (
        <div key={section}>
          <div className="skeleton mb-4 h-6 w-40" />
          <div className="skeleton mb-2 h-4 w-56" />
          <div className="flex gap-4 overflow-hidden pt-2">
            {[1, 2, 3].map((card) => (
              <div key={card} className="skeleton h-72 w-[220px] shrink-0 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

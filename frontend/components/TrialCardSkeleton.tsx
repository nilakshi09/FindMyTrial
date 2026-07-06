export function TrialCardSkeleton() {
  return (
    <div className="rounded-xl border border-warm-gray bg-white p-6 space-y-4">
      <div className="flex justify-between">
        <div className="skeleton-shimmer h-5 w-24 rounded-full" />
        <div className="skeleton-shimmer h-5 w-32 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton-shimmer h-6 w-full rounded" />
        <div className="skeleton-shimmer h-6 w-3/4 rounded" />
      </div>
      <div className="space-y-2">
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-2/3 rounded" />
      </div>
      <div className="flex gap-4">
        <div className="skeleton-shimmer h-4 w-28 rounded" />
        <div className="skeleton-shimmer h-4 w-24 rounded" />
        <div className="skeleton-shimmer h-4 w-20 rounded" />
      </div>
      <div className="flex gap-3 pt-2">
        <div className="skeleton-shimmer h-9 w-28 rounded-lg" />
        <div className="skeleton-shimmer h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

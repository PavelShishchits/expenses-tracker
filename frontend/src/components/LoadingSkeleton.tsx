type Variant = 'category-grid' | 'chart' | 'list'

export default function LoadingSkeleton({ variant }: { variant: Variant }) {
  if (variant === 'category-grid') {
    return (
      <div role="status" className="space-y-2">
        <span className="sr-only">Loading…</span>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm"
          >
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <div role="status" className="space-y-3 rounded-xl border border-gray-200 bg-white p-5">
        <span className="sr-only">Loading…</span>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200 shrink-0" />
            <div
              className="h-6 animate-pulse rounded bg-gray-200"
              style={{ width: `${60 - i * 8}%` }}
            />
          </div>
        ))}
      </div>
    )
  }

  // variant === 'list'
  return (
    <div role="status" className="space-y-2">
      <span className="sr-only">Loading…</span>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm"
        >
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-4 w-12 animate-pulse rounded bg-gray-200 shrink-0" />
        </div>
      ))}
    </div>
  )
}

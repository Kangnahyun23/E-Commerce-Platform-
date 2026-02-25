export default function SkeletonLoader() {
  return (
    <div className="flex items-center gap-4 p-4 glass rounded-2xl" aria-hidden>
      <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 bg-primary/10 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-primary/10 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function GlassesSkeleton() {
  return (
    <div className="flex justify-center items-center py-10 px-4 glass rounded-2xl" aria-hidden>
      <svg
        className="w-28 h-16 text-primary/25"
        viewBox="0 0 90 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="23" cy="22" rx="15" ry="11" stroke="currentColor" strokeWidth="2" fill="none" />
        <ellipse cx="67" cy="22" rx="15" ry="11" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M38 22 L52 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 18 L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M81 18 L87 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="8" y="10" width="74" height="24" rx="12" className="animate-shimmer" opacity="0.45" />
      </svg>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="aspect-4/3 rounded-2xl bg-[#e8e2db] animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-primary/10 rounded animate-pulse" />
      </div>
    </div>
  );
}

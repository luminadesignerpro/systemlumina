import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "card" | "line" | "circle" | "kpi";
  count?: number;
}

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

export function SkeletonLoader({ variant = "line", count = 1, className }: SkeletonLoaderProps) {
  if (variant === "kpi") {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-card space-y-3">
            <div className="flex justify-between">
              <SkeletonPulse className="h-9 w-9" />
              <SkeletonPulse className="h-4 w-12" />
            </div>
            <SkeletonPulse className="h-7 w-20" />
            <SkeletonPulse className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-card space-y-3">
            <div className="flex items-start gap-3">
              <SkeletonPulse className="h-10 w-10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonPulse className="h-4 w-3/4" />
                <SkeletonPulse className="h-3 w-1/2" />
              </div>
            </div>
            <div className="flex gap-4 pt-2 border-t border-border/50">
              <SkeletonPulse className="h-8 w-16" />
              <SkeletonPulse className="h-8 w-16" />
              <SkeletonPulse className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPulse key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
